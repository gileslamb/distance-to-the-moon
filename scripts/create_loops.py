#!/usr/bin/env python3
"""
Create smooth-looping PNG sequences from cleaned frames.

For each sequence:
1. Stabilize object position (center content in every frame so centroid doesn't drift)
2. Find the best loop point where the last frame most closely matches frame 1
3. Trim to that loop point
4. Save stabilized + trimmed frames to /sequences_looped/

Key: the object stays in the same position within the frame across all frames,
so when the animation loops there's no visible jerk.
"""

import os
import sys
import numpy as np
from PIL import Image

CLEAN_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_clean"
LOOP_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_looped"
ALPHA_THRESH = 10


def get_content_info(img_array):
    """Get centroid, bounding box, and mass from RGBA array."""
    alpha = img_array[:, :, 3]
    mask = alpha > ALPHA_THRESH
    if not mask.any():
        h, w = img_array.shape[:2]
        return {"cx": w // 2, "cy": h // 2, "mass": 0, "bbox": (0, 0, w, h), "empty": True}

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]

    ys, xs = np.where(mask)
    weights = alpha[mask].astype(np.float64)
    cx = np.average(xs, weights=weights)
    cy = np.average(ys, weights=weights)
    mass = int(mask.sum())

    return {"cx": cx, "cy": cy, "mass": mass, "bbox": (c0, r0, c1 + 1, r1 + 1), "empty": False}


def get_frame_signature(img_array, bbox):
    """Get a 32x32 grayscale thumbnail of the content for similarity comparison."""
    c0, r0, c1, r1 = bbox
    if c1 <= c0 or r1 <= r0:
        return np.zeros(32 * 32, dtype=np.float32)
    gray = np.mean(img_array[r0:r1, c0:c1, :3], axis=2)
    thumb = np.array(Image.fromarray(gray.astype(np.uint8)).resize((32, 32), Image.LANCZOS))
    return thumb.flatten().astype(np.float32)


def signature_similarity(sig1, sig2):
    """Normalized cross-correlation."""
    s1 = sig1 - sig1.mean()
    s2 = sig2 - sig2.mean()
    n1 = np.linalg.norm(s1)
    n2 = np.linalg.norm(s2)
    if n1 < 1e-8 or n2 < 1e-8:
        return 0.0
    return float(np.dot(s1, s2) / (n1 * n2))


def load_sequence(name, frame_range=None):
    """Load all frames as RGBA arrays. Optionally filter to frame_range=(start, end) inclusive."""
    d = os.path.join(CLEAN_DIR, name)
    files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    if frame_range:
        start, end = frame_range
        files = [f for f in files if start <= int(f.split("_")[1].split(".")[0]) <= end]
    frames = []
    for f in files:
        img = Image.open(os.path.join(d, f)).convert("RGBA")
        frames.append(np.array(img))
    return frames


def stabilize_frames(frames):
    """
    Center-align all frames so the object's centroid is at the same position.
    Uses the median centroid as the target position.
    Returns list of stabilized RGBA arrays (same canvas size).
    """
    infos = [get_content_info(f) for f in frames]

    # Target centroid: median of all frame centroids
    cxs = [i["cx"] for i in infos if not i["empty"]]
    cys = [i["cy"] for i in infos if not i["empty"]]
    if not cxs:
        return frames
    target_cx = np.median(cxs)
    target_cy = np.median(cys)

    h, w = frames[0].shape[:2]
    stabilized = []

    for frame, info in zip(frames, infos):
        if info["empty"]:
            stabilized.append(frame.copy())
            continue

        dx = int(round(target_cx - info["cx"]))
        dy = int(round(target_cy - info["cy"]))

        if dx == 0 and dy == 0:
            stabilized.append(frame.copy())
            continue

        new_frame = np.zeros_like(frame)
        # Source region
        src_y0 = max(0, -dy)
        src_y1 = min(h, h - dy)
        src_x0 = max(0, -dx)
        src_x1 = min(w, w - dx)
        # Dest region
        dst_y0 = max(0, dy)
        dst_y1 = min(h, h + dy)
        dst_x0 = max(0, dx)
        dst_x1 = min(w, w + dx)

        sh = min(src_y1 - src_y0, dst_y1 - dst_y0)
        sw = min(src_x1 - src_x0, dst_x1 - dst_x0)
        if sh > 0 and sw > 0:
            new_frame[dst_y0:dst_y0 + sh, dst_x0:dst_x0 + sw] = \
                frame[src_y0:src_y0 + sh, src_x0:src_x0 + sw]

        stabilized.append(new_frame)

    return stabilized


def find_best_loop(frames, min_loop=4):
    """
    Find the best loop point: the frame index where the sequence should end
    so that it loops smoothly back to frame 0.
    Returns (loop_end_index, similarity_score).
    """
    if len(frames) < min_loop + 1:
        return len(frames) - 1, 0.0

    ref_info = get_content_info(frames[0])
    if ref_info["empty"]:
        return len(frames) - 1, 0.0
    ref_sig = get_frame_signature(frames[0], ref_info["bbox"])
    ref_mass = ref_info["mass"]

    best_idx = len(frames) - 1
    best_score = -999.0

    for i in range(min_loop, len(frames)):
        info = get_content_info(frames[i])
        if info["empty"]:
            continue

        sig = get_frame_signature(frames[i], info["bbox"])
        sim = signature_similarity(ref_sig, sig)
        mass_ratio = info["mass"] / ref_mass if ref_mass > 0 else 0
        mass_penalty = abs(1.0 - mass_ratio) * 0.5

        # Combined score: higher = better loop point
        score = sim - mass_penalty

        if score > best_score:
            best_score = score
            best_idx = i

    return best_idx, best_score


def save_sequence(frames, name):
    """Save frames to LOOP_DIR/name/ with sequential numbering."""
    out_dir = os.path.join(LOOP_DIR, name)
    os.makedirs(out_dir, exist_ok=True)
    for i, frame in enumerate(frames):
        path = os.path.join(out_dir, f"frame_{i + 1:04d}.png")
        Image.fromarray(frame).save(path, "PNG", optimize=True)
    return len(frames)


def process_embrace():
    """
    Embrace: 153 frames with a near-perfect cycle at frame 99 (sim=0.999).
    Frames 1-98 form a complete loop.
    """
    print("\n  embrace: loading...")
    frames = load_sequence("embrace")

    # The analysis showed frame 99 is nearly identical to frame 1
    # Use frames 0-97 (indices) = frames 1-98 (1-indexed) for the loop
    loop_frames = frames[:98]
    print(f"  Trimming to frames 1-98 (perfect cycle at frame 99)")

    stabilized = stabilize_frames(loop_frames)
    count = save_sequence(stabilized, "embrace")
    print(f"  embrace: saved {count} stabilized looped frames")
    return count


def process_gramophone():
    """
    Gramophone: 138 frames. Very stable through frame 83 (gentle rotation/wobble).
    After frame 83 the image changes drastically.
    The gramophone gently rotates/wobbles. Use a longer loop for more natural motion.
    """
    print("\n  gramophone: loading...")
    frames = load_sequence("gramophone", frame_range=(1, 83))

    stabilized = stabilize_frames(frames)
    # Use a longer minimum to capture the full wobble cycle
    loop_idx, score = find_best_loop(stabilized, min_loop=20)
    print(f"  Best loop point: frame {loop_idx + 1} of {len(stabilized)} (score={score:.3f})")

    loop_frames = stabilized[:loop_idx]
    if len(loop_frames) < 20:
        loop_frames = stabilized

    count = save_sequence(loop_frames, "gramophone")
    print(f"  gramophone: saved {count} stabilized looped frames")
    return count


def process_books():
    """
    Books: 86 frames. Mass grows over time (books accumulating).
    Best loop at frame 22-23 where content is most similar to frame 1.
    Use frames 1-22 and verify the loop quality. If similarity is high enough,
    use direct loop; otherwise use ping-pong.
    """
    print("\n  books: loading...")
    frames = load_sequence("books")

    # Use frames up to the best loop point
    loop_section = frames[:22]
    stabilized = stabilize_frames(loop_section)

    # Check how well the last frame matches the first
    ref_info = get_content_info(stabilized[0])
    last_info = get_content_info(stabilized[-1])
    ref_sig = get_frame_signature(stabilized[0], ref_info["bbox"])
    last_sig = get_frame_signature(stabilized[-1], last_info["bbox"])
    sim = signature_similarity(ref_sig, last_sig)
    mass_ratio = last_info["mass"] / ref_info["mass"] if ref_info["mass"] > 0 else 0
    print(f"  Loop quality: sim={sim:.3f}, mass_ratio={mass_ratio:.3f}")

    if sim >= 0.85 and 0.8 <= mass_ratio <= 1.2:
        loop_frames = stabilized
        print(f"  Using direct loop: {len(loop_frames)} frames")
    else:
        # Ping-pong for smoother loop
        forward = stabilized
        backward = stabilized[-2:0:-1]
        loop_frames = forward + backward
        print(f"  Using ping-pong loop: {len(forward)} forward + {len(backward)} backward")

    count = save_sequence(loop_frames, "books")
    print(f"  books: saved {count} stabilized looped frames")
    return count


def process_fish():
    """
    Fish: 39 frames. Frames come in duplicate pairs. Early frames (1-15) show
    a single fish at different angles. Later frames add more fish.
    Use only single-fish frames (1-15), de-duplicate, center, and ping-pong.
    """
    print("\n  fish: loading...")
    # Only use frames 1-15 (single fish, mass < 80k)
    frames = load_sequence("fish", frame_range=(1, 15))
    print(f"  Using frames 1-15 ({len(frames)} frames, single fish only)")

    # De-duplicate paired frames
    deduped = [frames[0]]
    for i in range(1, len(frames)):
        info_prev = get_content_info(frames[i - 1])
        info_curr = get_content_info(frames[i])
        sig_prev = get_frame_signature(frames[i - 1], info_prev["bbox"])
        sig_curr = get_frame_signature(frames[i], info_curr["bbox"])
        sim = signature_similarity(sig_prev, sig_curr)
        if sim < 0.99:
            deduped.append(frames[i])
    print(f"  De-duplicated: {len(frames)} -> {len(deduped)} frames")

    stabilized = stabilize_frames(deduped)

    # Ping-pong for smooth loop
    forward = stabilized
    backward = stabilized[-2:0:-1]
    loop_frames = forward + backward
    print(f"  Creating ping-pong loop: {len(forward)} forward + {len(backward)} backward")

    count = save_sequence(loop_frames, "fish")
    print(f"  fish: saved {count} stabilized looped frames")
    return count


def process_whale():
    """
    Whale: 33 frames. Whale translates rightward (567->1214 in x).
    CSS handles the horizontal drift. Center and use ping-pong for smooth loop.
    Use early frames (1-14) where body angle change is moderate.
    """
    print("\n  whale: loading...")
    frames = load_sequence("whale", frame_range=(1, 14))
    print(f"  Using frames 1-14 ({len(frames)} frames)")

    stabilized = stabilize_frames(frames)

    # Ping-pong for smooth loop
    forward = stabilized
    backward = stabilized[-2:0:-1]
    loop_frames = forward + backward
    print(f"  Creating ping-pong loop: {len(forward)} forward + {len(backward)} backward")

    count = save_sequence(loop_frames, "whale")
    print(f"  whale: saved {count} stabilized looped frames")
    return count


def process_teddy():
    """
    Teddy: 42 frames. Mass decreases over time (teddy dissolving).
    Use frames where teddy is still substantially visible (mass > 40% of frame 1).
    The dissolving creates a gentle pulsing effect when looped.
    """
    print("\n  teddy: loading...")
    frames = load_sequence("teddy")

    # Use frames where mass is at least 40% of frame 1
    ref_info = get_content_info(frames[0])
    ref_mass = ref_info["mass"]
    stable_end = len(frames)
    for i in range(1, len(frames)):
        info = get_content_info(frames[i])
        ratio = info["mass"] / ref_mass
        if ratio < 0.38:
            stable_end = i
            break
    print(f"  Usable range: frames 1-{stable_end} (of {len(frames)})")

    usable_frames = frames[:stable_end]
    stabilized = stabilize_frames(usable_frames)

    # For a dissolving teddy, create a ping-pong loop:
    # play forward then backward to avoid the abrupt loop back
    if len(stabilized) >= 4:
        # Forward + reverse (skip first and last to avoid duplicate frames at endpoints)
        forward = stabilized
        backward = stabilized[-2:0:-1]  # Reverse, excluding endpoints
        loop_frames = forward + backward
        print(f"  Creating ping-pong loop: {len(forward)} forward + {len(backward)} backward")
    else:
        loop_frames = stabilized

    count = save_sequence(loop_frames, "teddy")
    print(f"  teddy: saved {count} stabilized looped frames")
    return count


def process_ladder():
    """
    Ladder: 8 frames. Short tumbling sequence.
    With so few frames, use a ping-pong loop (forward + backward)
    to create smooth motion without a jarring loop point.
    """
    print("\n  ladder: loading...")
    frames = load_sequence("ladder")

    stabilized = stabilize_frames(frames)

    # Ping-pong: forward + backward (skip endpoints to avoid duplicates)
    forward = stabilized
    backward = stabilized[-2:0:-1]
    loop_frames = forward + backward
    print(f"  Creating ping-pong loop: {len(forward)} forward + {len(backward)} backward")

    count = save_sequence(loop_frames, "ladder")
    print(f"  ladder: saved {count} stabilized looped frames")
    return count


def main():
    if os.path.exists(LOOP_DIR):
        import shutil
        shutil.rmtree(LOOP_DIR)
    os.makedirs(LOOP_DIR)

    results = {}
    results["books"] = process_books()
    results["embrace"] = process_embrace()
    results["fish"] = process_fish()
    results["gramophone"] = process_gramophone()
    results["ladder"] = process_ladder()
    results["teddy"] = process_teddy()
    results["whale"] = process_whale()

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    for name, count in results.items():
        fps = 12
        dur = count / fps
        print(f"  {name:12s}: {count:4d} frames ({dur:.1f}s at {fps}fps)")
    print(f"\nOutput: {LOOP_DIR}")


if __name__ == "__main__":
    main()
