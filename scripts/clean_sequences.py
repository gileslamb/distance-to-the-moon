#!/usr/bin/env python3
"""
Clean PNG sequences: center-align, remove bad frames, trim to stable loops.

Strategy per sequence:
- VERTICAL DRIFTERS (books, embrace, gramophone, ladder, teddy):
  Center each frame's content on a uniform canvas. Objects appear stable.
- HORIZONTAL SWIMMERS (fish, whale):
  Use union bounding box (fixed crop). Objects move naturally within frame.
"""

import os
import shutil
from PIL import Image
import numpy as np

SEQUENCES_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences"
CLEAN_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_clean"

ALPHA_THRESHOLD = 10
PADDING = 20


def frame_num(filename):
    return int(filename.split("_")[1].split(".")[0])


def get_frame_info(path):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    alpha = arr[:, :, 3]
    mask = alpha > ALPHA_THRESHOLD
    total = int(np.sum(mask))

    if total == 0:
        return None, img

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = int(np.where(rows)[0][0]), int(np.where(rows)[0][-1])
    cmin, cmax = int(np.where(cols)[0][0]), int(np.where(cols)[0][-1])

    ys, xs = np.where(mask)
    weights = alpha[mask].astype(float)
    cx = float(np.average(xs, weights=weights))
    cy = float(np.average(ys, weights=weights))

    return {
        "bbox": (cmin, rmin, cmax + 1, rmax + 1),
        "w": cmax - cmin + 1,
        "h": rmax - rmin + 1,
        "mass": total,
        "centroid": (cx, cy),
    }, img


def load_sequence(seq_dir, frame_filter=None):
    frames = sorted(f for f in os.listdir(seq_dir) if f.endswith(".png"))
    data = []
    for f in frames:
        if frame_filter and not frame_filter(f):
            continue
        path = os.path.join(seq_dir, f)
        info, img = get_frame_info(path)
        if info is not None:
            data.append((f, info, img))
    return data


def filter_mass(data, low_mult=0.2, high_mult=5.0):
    if not data:
        return data
    masses = [info["mass"] for _, info, _ in data]
    median = np.median(masses)
    filtered = [(f, info, img) for f, info, img in data
                if median * low_mult <= info["mass"] <= median * high_mult]
    removed = len(data) - len(filtered)
    if removed:
        print(f"    Mass filter: removed {removed} frames (median={int(median)})")
    return filtered


def filter_jumps(data, max_jump_px):
    if not data or len(data) < 2:
        return data
    original_len = len(data)
    changed = True
    while changed:
        changed = False
        new_data = [data[0]]
        for i in range(1, len(data)):
            prev_cx, prev_cy = new_data[-1][1]["centroid"]
            curr_cx, curr_cy = data[i][1]["centroid"]
            dist = ((curr_cx - prev_cx) ** 2 + (curr_cy - prev_cy) ** 2) ** 0.5
            if dist <= max_jump_px:
                new_data.append(data[i])
            else:
                changed = True
        if len(new_data) < len(data):
            data = new_data
    removed = original_len - len(data)
    if removed:
        print(f"    Jump filter (max {max_jump_px}px): removed {removed} frames")
    return data


def center_on_canvas(data, pad=PADDING):
    max_w = max(info["w"] for _, info, _ in data)
    max_h = max(info["h"] for _, info, _ in data)
    canvas_w = max_w + pad * 2
    canvas_h = max_h + pad * 2
    print(f"    Canvas: {canvas_w}x{canvas_h} (max content: {max_w}x{max_h})")

    result = []
    for _, info, img in data:
        left, top, right, bottom = info["bbox"]
        content = img.crop((left, top, right, bottom))
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        paste_x = (canvas_w - content.width) // 2
        paste_y = (canvas_h - content.height) // 2
        canvas.paste(content, (paste_x, paste_y))
        result.append(canvas)
    return result


def union_crop(data, pad=PADDING):
    all_lefts = [info["bbox"][0] for _, info, _ in data]
    all_tops = [info["bbox"][1] for _, info, _ in data]
    all_rights = [info["bbox"][2] for _, info, _ in data]
    all_bottoms = [info["bbox"][3] for _, info, _ in data]

    u_left = max(0, min(all_lefts) - pad)
    u_top = max(0, min(all_tops) - pad)
    u_right = max(all_rights) + pad
    u_bottom = max(all_bottoms) + pad

    canvas_w = u_right - u_left
    canvas_h = u_bottom - u_top
    print(f"    Union crop: {canvas_w}x{canvas_h}")

    result = []
    for _, info, img in data:
        # Ensure we don't crop outside image bounds
        img_w, img_h = img.size
        crop_right = min(u_right, img_w)
        crop_bottom = min(u_bottom, img_h)
        cropped = img.crop((u_left, u_top, crop_right, crop_bottom))
        # Paste onto correct-sized canvas if we had to clip
        if cropped.size != (canvas_w, canvas_h):
            canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
            canvas.paste(cropped, (0, 0))
            result.append(canvas)
        else:
            result.append(cropped)
    return result


def save_sequence(images, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for i, img in enumerate(images):
        out_path = os.path.join(output_dir, f"frame_{i + 1:04d}.png")
        img.save(out_path, "PNG", optimize=True)
    print(f"    Saved {len(images)} frames to {os.path.basename(output_dir)}/")


# ============================================================
# Per-sequence processors
# ============================================================

def process_books():
    """Books: tumbling book. Remove chaotic early/late frames, center."""
    print("\n=== books ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "books_sequence")
    data = load_sequence(seq_dir, frame_filter=lambda f: 16 <= frame_num(f) <= 101)
    print(f"  Loaded: {len(data)} frames (16-101)")
    data = filter_mass(data, 0.25, 4.0)
    data = filter_jumps(data, 60)
    print(f"  Final: {len(data)} frames")
    images = center_on_canvas(data)
    save_sequence(images, os.path.join(CLEAN_DIR, "books"))


def process_embrace():
    """Embrace: flowing draped figure. Relatively stable, just center."""
    print("\n=== embrace ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "embrace_sequence")
    data = load_sequence(seq_dir)
    print(f"  Loaded: {len(data)} frames")
    data = filter_jumps(data, 50)
    print(f"  Final: {len(data)} frames")
    images = center_on_canvas(data)
    save_sequence(images, os.path.join(CLEAN_DIR, "embrace"))


def process_fish():
    """Fish: swimming fish. Known contamination from character head/torso in frames 79-99.
    Use explicit clean range (40-78), union crop for natural movement."""
    print("\n=== fish ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "fish_sequence")
    # Visually confirmed: frames 40-78 are clean fish only.
    # Frames 35-39 may have trace fragments; 79-99 have character head.
    data = load_sequence(seq_dir, frame_filter=lambda f: 40 <= frame_num(f) <= 78)
    print(f"  Loaded: {len(data)} frames (40-78, clean fish only)")
    data = filter_mass(data, 0.15, 5.0)
    print(f"  Final: {len(data)} frames")
    if data:
        images = union_crop(data)
        save_sequence(images, os.path.join(CLEAN_DIR, "fish"))


def process_gramophone():
    """Gramophone: spinning gramophone. Very stable, one moderate jump at frame 84.
    Use generous jump filter to preserve the natural spinning motion."""
    print("\n=== gramophone ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "gramophone_sequence")
    data = load_sequence(seq_dir)
    print(f"  Loaded: {len(data)} frames")
    data = filter_jumps(data, 50)
    print(f"  Final: {len(data)} frames")
    images = center_on_canvas(data)
    save_sequence(images, os.path.join(CLEAN_DIR, "gramophone"))


def process_ladder():
    """Ladder: extremely chaotic sequence. Only frames 6-13 have clear,
    substantial ladder content (close-up views of ladder tumbling).
    All other frames are tiny fragments. Use only the clear frames."""
    print("\n=== ladder ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "ladder_sequence")
    # Only frames 6-13 have clear ladder content (close-up views)
    data = load_sequence(seq_dir, frame_filter=lambda f: 6 <= frame_num(f) <= 13)
    print(f"  Loaded: {len(data)} frames (6-13, clear ladder views)")
    print(f"  Final: {len(data)} frames")

    if data:
        images = center_on_canvas(data)
        save_sequence(images, os.path.join(CLEAN_DIR, "ladder"))


def process_teddy():
    """Teddy: tumbling teddy bear. Frames 11-21 show character hand/arm."""
    print("\n=== teddy ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "teddy_sequence")
    data = load_sequence(seq_dir, frame_filter=lambda f: not (11 <= frame_num(f) <= 21))
    print(f"  Loaded: {len(data)} frames (excluding 11-21)")
    data = filter_mass(data, 0.25, 4.0)
    data = filter_jumps(data, 60)
    print(f"  Final: {len(data)} frames")
    if data:
        images = center_on_canvas(data)
        save_sequence(images, os.path.join(CLEAN_DIR, "teddy"))


def process_whale():
    """Whale: swimming whale. Fairly stable, 2 small jerks at frames 15 and 18.
    Union crop for natural movement."""
    print("\n=== whale ===")
    seq_dir = os.path.join(SEQUENCES_DIR, "whale_sequence")
    data = load_sequence(seq_dir)
    print(f"  Loaded: {len(data)} frames")
    data = filter_jumps(data, 70)
    print(f"  Final: {len(data)} frames")
    if data:
        images = union_crop(data)
        save_sequence(images, os.path.join(CLEAN_DIR, "whale"))


if __name__ == "__main__":
    if os.path.exists(CLEAN_DIR):
        shutil.rmtree(CLEAN_DIR)
    os.makedirs(CLEAN_DIR)

    process_books()
    process_embrace()
    process_fish()
    process_gramophone()
    process_ladder()
    process_teddy()
    process_whale()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for name in sorted(os.listdir(CLEAN_DIR)):
        path = os.path.join(CLEAN_DIR, name)
        if os.path.isdir(path):
            count = len([f for f in os.listdir(path) if f.endswith(".png")])
            dur = count / 12
            print(f"  {name:12s}: {count:3d} frames ({dur:.1f}s at 12fps)")
    print(f"\nOutput: {CLEAN_DIR}")
