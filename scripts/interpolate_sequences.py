#!/usr/bin/env python3
"""
Interpolate PNG sequences to 2x frame count using Google FILM
(Frame Interpolation for Large Motion) via TensorFlow Hub.

For each pair of consecutive frames, FILM generates a smooth intermediate frame,
doubling the total frame count and halving the effective frame interval.
"""

import os
import sys
import time
import numpy as np
from PIL import Image

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # Suppress TF info/warnings

import tensorflow as tf
import tensorflow_hub as hub

CLEAN_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_clean"
INTERP_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_interpolated"

FILM_MODEL_URL = "https://tfhub.dev/google/film/1"


def load_model():
    """Load FILM model from TensorFlow Hub."""
    print("Loading FILM model from TF Hub...")
    t0 = time.time()
    model = hub.load(FILM_MODEL_URL)
    print(f"  Model loaded in {time.time() - t0:.1f}s")
    return model


def load_frame(path):
    """Load a PNG frame as a float32 tensor [1, H, W, 3]."""
    img = Image.open(path).convert("RGBA")
    # Composite onto white background for FILM (it expects RGB)
    bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
    composite = Image.alpha_composite(bg, img)
    rgb = composite.convert("RGB")
    arr = np.array(rgb).astype(np.float32) / 255.0
    return tf.constant(arr[np.newaxis, ...])


def load_frame_with_alpha(path):
    """Load a PNG frame, returning (rgb_tensor, alpha_channel)."""
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    alpha = arr[:, :, 3]  # Keep original alpha

    # Composite onto black for RGB input to FILM
    bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
    composite = Image.alpha_composite(bg, img)
    rgb = np.array(composite.convert("RGB")).astype(np.float32) / 255.0
    rgb_tensor = tf.constant(rgb[np.newaxis, ...])

    return rgb_tensor, alpha


def interpolate_alpha(alpha1, alpha2):
    """Simple linear interpolation of alpha channels."""
    return ((alpha1.astype(np.float32) + alpha2.astype(np.float32)) / 2.0).astype(np.uint8)


def film_interpolate(model, frame1, frame2):
    """Run FILM to generate intermediate frame between frame1 and frame2."""
    # Ensure frames have same dimensions
    h1, w1 = frame1.shape[1], frame1.shape[2]
    h2, w2 = frame2.shape[1], frame2.shape[2]
    if h1 != h2 or w1 != w2:
        # Resize frame2 to match frame1
        frame2 = tf.image.resize(frame2, [h1, w1])

    # Pad to multiple of 32 for model compatibility
    h, w = frame1.shape[1], frame1.shape[2]
    pad_h = (32 - h % 32) % 32
    pad_w = (32 - w % 32) % 32

    if pad_h > 0 or pad_w > 0:
        frame1 = tf.pad(frame1, [[0, 0], [0, pad_h], [0, pad_w], [0, 0]])
        frame2 = tf.pad(frame2, [[0, 0], [0, pad_h], [0, pad_w], [0, 0]])

    inputs = {
        "time": tf.constant([[0.5]], dtype=tf.float32),
        "x0": frame1,
        "x1": frame2,
    }
    result = model(inputs)
    mid_frame = result["image"][0]  # [H, W, 3]

    # Remove padding
    if pad_h > 0 or pad_w > 0:
        mid_frame = mid_frame[:h, :w, :]

    return mid_frame.numpy()


def save_frame_rgba(rgb_array, alpha_channel, path):
    """Save an RGB array + alpha channel as RGBA PNG."""
    rgb_uint8 = np.clip(rgb_array * 255, 0, 255).astype(np.uint8)
    h, w = alpha_channel.shape
    # Ensure rgb matches alpha dimensions
    if rgb_uint8.shape[0] != h or rgb_uint8.shape[1] != w:
        rgb_img = Image.fromarray(rgb_uint8).resize((w, h), Image.LANCZOS)
        rgb_uint8 = np.array(rgb_img)
    rgba = np.dstack([rgb_uint8, alpha_channel])
    Image.fromarray(rgba, "RGBA").save(path, "PNG", optimize=True)


def process_sequence(model, seq_name, input_dir, output_dir):
    """Process a single sequence: interpolate between each consecutive pair."""
    frames = sorted(f for f in os.listdir(input_dir) if f.endswith(".png"))
    n = len(frames)
    print(f"\n{'='*50}")
    print(f"  {seq_name}: {n} frames -> {2*n - 1} frames")
    print(f"{'='*50}")

    if n < 2:
        print("  Skipping (need at least 2 frames)")
        return 0

    os.makedirs(output_dir, exist_ok=True)

    # Load all frames with alpha
    print("  Loading frames...")
    loaded = []
    for f in frames:
        rgb, alpha = load_frame_with_alpha(os.path.join(input_dir, f))
        loaded.append((rgb, alpha))

    output_idx = 1
    total_interp = n - 1
    t0 = time.time()

    for i in range(n):
        # Save original frame
        rgb_arr = loaded[i][0][0].numpy()
        alpha_arr = loaded[i][1]
        out_path = os.path.join(output_dir, f"frame_{output_idx:04d}.png")
        save_frame_rgba(rgb_arr, alpha_arr, out_path)
        output_idx += 1

        # Interpolate between this frame and next
        if i < n - 1:
            mid_rgb = film_interpolate(model, loaded[i][0], loaded[i + 1][0])
            mid_alpha = interpolate_alpha(loaded[i][1], loaded[i + 1][1])
            out_path = os.path.join(output_dir, f"frame_{output_idx:04d}.png")
            save_frame_rgba(mid_rgb, mid_alpha, out_path)
            output_idx += 1

            elapsed = time.time() - t0
            done = i + 1
            eta = (elapsed / done) * (total_interp - done) if done > 0 else 0
            print(f"  Interpolated {done}/{total_interp} pairs ({elapsed:.1f}s, ETA {eta:.0f}s)")

    final_count = output_idx - 1
    elapsed = time.time() - t0
    print(f"  Done: {final_count} frames in {elapsed:.1f}s")
    return final_count


def main():
    # Load model once
    model = load_model()

    # Sequences to process
    sequences = ["books", "embrace", "fish", "gramophone", "ladder", "teddy", "whale"]

    if os.path.exists(INTERP_DIR):
        import shutil
        shutil.rmtree(INTERP_DIR)
    os.makedirs(INTERP_DIR)

    results = {}
    for seq in sequences:
        input_dir = os.path.join(CLEAN_DIR, seq)
        output_dir = os.path.join(INTERP_DIR, seq)
        if not os.path.isdir(input_dir):
            print(f"\n  WARNING: {input_dir} not found, skipping")
            continue
        count = process_sequence(model, seq, input_dir, output_dir)
        results[seq] = count

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    for name, count in results.items():
        dur = count / 12
        print(f"  {name:12s}: {count:4d} frames ({dur:.1f}s at 12fps)")
    print(f"\nOutput: {INTERP_DIR}")


if __name__ == "__main__":
    main()
