#!/usr/bin/env python3
"""Quick test: interpolate just the ladder sequence (8 frames) to verify FILM works."""

import os
import sys
import time
import numpy as np
from PIL import Image

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

print("Importing TensorFlow...")
import tensorflow as tf
import tensorflow_hub as hub

FILM_MODEL_URL = "https://tfhub.dev/google/film/1"
TEST_INPUT = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_clean/ladder"
TEST_OUTPUT = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_interpolated/ladder_test"

print("Loading FILM model...")
t0 = time.time()
model = hub.load(FILM_MODEL_URL)
print(f"Model loaded in {time.time() - t0:.1f}s")

# Load first 2 frames
frames = sorted(f for f in os.listdir(TEST_INPUT) if f.endswith(".png"))
print(f"Found {len(frames)} frames, testing with first 2...")

def load_rgb(path):
    img = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
    composite = Image.alpha_composite(bg, img)
    rgb = np.array(composite.convert("RGB")).astype(np.float32) / 255.0
    return tf.constant(rgb[np.newaxis, ...])

f1 = load_rgb(os.path.join(TEST_INPUT, frames[0]))
f2 = load_rgb(os.path.join(TEST_INPUT, frames[1]))

print(f"Frame shapes: {f1.shape}, {f2.shape}")

# Pad to multiple of 32
h, w = f1.shape[1], f1.shape[2]
pad_h = (32 - h % 32) % 32
pad_w = (32 - w % 32) % 32
print(f"Padding: h={pad_h}, w={pad_w}")

if pad_h > 0 or pad_w > 0:
    f1 = tf.pad(f1, [[0, 0], [0, pad_h], [0, pad_w], [0, 0]])
    f2 = tf.pad(f2, [[0, 0], [0, pad_h], [0, pad_w], [0, 0]])

print(f"Padded shapes: {f1.shape}, {f2.shape}")

print("Running FILM interpolation...")
t1 = time.time()
inputs = {
    "time": tf.constant([[0.5]], dtype=tf.float32),
    "x0": f1,
    "x1": f2,
}
result = model(inputs)
mid = result["image"][0][:h, :w, :].numpy()
print(f"Interpolation took {time.time() - t1:.1f}s")
print(f"Output shape: {mid.shape}")

# Save test output
os.makedirs(TEST_OUTPUT, exist_ok=True)
out = np.clip(mid * 255, 0, 255).astype(np.uint8)
Image.fromarray(out).save(os.path.join(TEST_OUTPUT, "test_mid.png"))
print(f"Saved test frame to {TEST_OUTPUT}/test_mid.png")
print("SUCCESS!")
