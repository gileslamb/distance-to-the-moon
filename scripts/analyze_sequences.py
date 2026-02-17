#!/usr/bin/env python3
"""Analyze PNG sequences: bounding boxes, content mass, centroids, and position jumps."""

import os
import json
from PIL import Image
import numpy as np

SEQUENCES_DIR = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences"

def analyze_frame(path):
    """Analyze a single frame: bounding box, content mass, centroid."""
    try:
        img = Image.open(path).convert("RGBA")
    except Exception as e:
        return {"error": str(e), "path": path}

    arr = np.array(img)
    alpha = arr[:, :, 3]

    # Threshold: pixels with alpha > 10 are "content"
    mask = alpha > 10
    total_pixels = int(np.sum(mask))

    if total_pixels == 0:
        return {
            "path": os.path.basename(path),
            "size": (img.width, img.height),
            "empty": True,
            "total_pixels": 0,
        }

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = int(np.where(rows)[0][0]), int(np.where(rows)[0][-1])
    cmin, cmax = int(np.where(cols)[0][0]), int(np.where(cols)[0][-1])

    # Weighted centroid
    ys, xs = np.where(mask)
    weights = alpha[mask].astype(float)
    cx = float(np.average(xs, weights=weights))
    cy = float(np.average(ys, weights=weights))

    return {
        "path": os.path.basename(path),
        "size": (img.width, img.height),
        "empty": False,
        "total_pixels": total_pixels,
        "bbox": (cmin, rmin, cmax, rmax),  # left, top, right, bottom
        "bbox_w": cmax - cmin + 1,
        "bbox_h": rmax - rmin + 1,
        "centroid": (round(cx, 1), round(cy, 1)),
    }


def analyze_sequence(seq_dir):
    """Analyze all frames in a sequence directory."""
    frames = sorted(f for f in os.listdir(seq_dir) if f.endswith(".png"))
    results = []
    for f in frames:
        info = analyze_frame(os.path.join(seq_dir, f))
        results.append(info)
    return results


def print_summary(name, results):
    print(f"\n{'='*60}")
    print(f"  {name}: {len(results)} frames")
    print(f"{'='*60}")

    non_empty = [r for r in results if not r.get("empty", True)]
    empty = [r for r in results if r.get("empty", True)]

    if empty:
        print(f"  Empty frames ({len(empty)}): {[r['path'] for r in empty]}")

    if not non_empty:
        print("  ALL FRAMES EMPTY")
        return

    # Image sizes
    sizes = set(r["size"] for r in non_empty)
    print(f"  Canvas sizes: {sizes}")

    # Bounding box ranges
    bboxes = [r["bbox"] for r in non_empty]
    lefts = [b[0] for b in bboxes]
    tops = [b[1] for b in bboxes]
    rights = [b[2] for b in bboxes]
    bottoms = [b[3] for b in bboxes]
    widths = [r["bbox_w"] for r in non_empty]
    heights = [r["bbox_h"] for r in non_empty]

    print(f"  Bbox left:   min={min(lefts)}, max={max(lefts)}, range={max(lefts)-min(lefts)}")
    print(f"  Bbox top:    min={min(tops)}, max={max(tops)}, range={max(tops)-min(tops)}")
    print(f"  Bbox right:  min={min(rights)}, max={max(rights)}, range={max(rights)-min(rights)}")
    print(f"  Bbox bottom: min={min(bottoms)}, max={max(bottoms)}, range={max(bottoms)-min(bottoms)}")
    print(f"  Content W:   min={min(widths)}, max={max(widths)}")
    print(f"  Content H:   min={min(heights)}, max={max(heights)}")

    # Pixel mass
    masses = [r["total_pixels"] for r in non_empty]
    print(f"  Pixel mass:  min={min(masses)}, max={max(masses)}, median={int(np.median(masses))}")

    # Centroid movement
    centroids = [r["centroid"] for r in non_empty]
    if len(centroids) > 1:
        jumps = []
        for i in range(1, len(centroids)):
            dx = centroids[i][0] - centroids[i-1][0]
            dy = centroids[i][1] - centroids[i-1][1]
            dist = (dx**2 + dy**2) ** 0.5
            jumps.append((non_empty[i]["path"], round(dist, 1), round(dx, 1), round(dy, 1)))

        jump_dists = [j[1] for j in jumps]
        print(f"  Centroid jumps: min={min(jump_dists):.1f}, max={max(jump_dists):.1f}, median={np.median(jump_dists):.1f}")

        # Flag large jumps (>2x median)
        median_jump = np.median(jump_dists)
        threshold = max(median_jump * 3, 20)
        big_jumps = [(j[0], j[1], j[2], j[3]) for j in jumps if j[1] > threshold]
        if big_jumps:
            print(f"  ** Large jumps (>{threshold:.0f}px):")
            for name, dist, dx, dy in big_jumps[:15]:
                print(f"     {name}: {dist:.1f}px (dx={dx:.1f}, dy={dy:.1f})")

    # Mass anomalies
    median_mass = int(np.median(masses))
    mass_threshold_low = median_mass * 0.15
    mass_threshold_high = median_mass * 3
    anomalies = [(r["path"], r["total_pixels"]) for r in non_empty
                 if r["total_pixels"] < mass_threshold_low or r["total_pixels"] > mass_threshold_high]
    if anomalies:
        print(f"  ** Mass anomalies (median={median_mass}):")
        for name, mass in anomalies[:15]:
            ratio = mass / median_mass
            print(f"     {name}: {mass} ({ratio:.2f}x median)")


if __name__ == "__main__":
    for seq_name in sorted(os.listdir(SEQUENCES_DIR)):
        seq_path = os.path.join(SEQUENCES_DIR, seq_name)
        if not os.path.isdir(seq_path) or seq_name == "cleaned":
            continue
        results = analyze_sequence(seq_path)
        print_summary(seq_name, results)
