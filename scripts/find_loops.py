#!/usr/bin/env python3
"""
Analyze each cleaned PNG sequence to find:
1. Per-frame centroid, bounding box, and pixel mass
2. Best loop point (frame most similar to frame 1)
3. Position drift over time

Outputs a detailed report to guide the loop-trimming script.
"""

import os
import sys
import numpy as np
from PIL import Image

BASE = "/Users/gileslamb/Desktop/distance-to-the-moon/public/sequences_clean"
SEQUENCES = ["books", "embrace", "fish", "gramophone", "ladder", "teddy", "whale"]
ALPHA_THRESH = 10


def analyze_frame(path):
    """Return centroid (cx, cy), bounding box, mass, and content hash."""
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    alpha = arr[:, :, 3]
    mask = alpha > ALPHA_THRESH

    if not mask.any():
        return {"cx": 0, "cy": 0, "mass": 0, "bbox": (0, 0, 0, 0), "w": img.width, "h": img.height, "empty": True}

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]

    # Weighted centroid using alpha values
    ys, xs = np.where(mask)
    weights = alpha[mask].astype(np.float64)
    total = weights.sum()
    cx = np.average(xs, weights=weights)
    cy = np.average(ys, weights=weights)

    mass = int(mask.sum())

    # Content signature: downscaled grayscale for similarity comparison
    gray = np.array(img.convert("L"))
    # Crop to bbox and resize to 32x32 for comparison
    crop = gray[r0:r1+1, c0:c1+1]
    thumb = np.array(Image.fromarray(crop).resize((32, 32), Image.LANCZOS))
    signature = thumb.flatten().astype(np.float32)

    return {
        "cx": cx, "cy": cy, "mass": mass,
        "bbox": (c0, r0, c1, r1),
        "bw": c1 - c0, "bh": r1 - r0,
        "w": img.width, "h": img.height,
        "empty": False,
        "signature": signature,
    }


def signature_similarity(sig1, sig2):
    """Normalized cross-correlation between two signatures."""
    s1 = sig1 - sig1.mean()
    s2 = sig2 - sig2.mean()
    n1 = np.linalg.norm(s1)
    n2 = np.linalg.norm(s2)
    if n1 < 1e-8 or n2 < 1e-8:
        return 0.0
    return float(np.dot(s1, s2) / (n1 * n2))


def analyze_sequence(name):
    d = os.path.join(BASE, name)
    frames = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    n = len(frames)
    if n < 2:
        print(f"\n{name}: only {n} frames, skipping")
        return

    print(f"\n{'='*60}")
    print(f"  {name}: {n} frames")
    print(f"{'='*60}")

    infos = []
    for f in frames:
        info = analyze_frame(os.path.join(d, f))
        info["file"] = f
        infos.append(info)

    # Print per-frame metrics
    ref = infos[0]
    print(f"\n  Frame 1: cx={ref['cx']:.1f} cy={ref['cy']:.1f} mass={ref['mass']} bbox_w={ref.get('bw',0)} bbox_h={ref.get('bh',0)}")
    print(f"\n  {'Frame':>8s}  {'cx':>7s}  {'cy':>7s}  {'mass':>7s}  {'dx':>6s}  {'dy':>6s}  {'dist':>6s}  {'m_ratio':>7s}  {'sim':>6s}")
    print(f"  {'-'*72}")

    best_loop = None
    best_score = float("inf")
    min_loop_len = max(4, n // 4)  # At least 25% of sequence or 4 frames

    for i, info in enumerate(infos):
        if info["empty"]:
            print(f"  {i+1:>8d}  EMPTY")
            continue

        dx = info["cx"] - ref["cx"]
        dy = info["cy"] - ref["cy"]
        dist = np.sqrt(dx**2 + dy**2)
        m_ratio = info["mass"] / ref["mass"] if ref["mass"] > 0 else 0

        sim = 0.0
        if "signature" in info and "signature" in ref:
            sim = signature_similarity(info["signature"], ref["signature"])

        print(f"  {i+1:>8d}  {info['cx']:>7.1f}  {info['cy']:>7.1f}  {info['mass']:>7d}  {dx:>+6.1f}  {dy:>+6.1f}  {dist:>6.1f}  {m_ratio:>7.2f}  {sim:>6.3f}")

        # Score for loop point (lower = better)
        # Only consider frames past minimum loop length
        if i >= min_loop_len:
            # Combined score: position distance + mass difference + content dissimilarity
            pos_score = dist / max(ref.get("bw", 100), 1)  # Normalize by object width
            mass_score = abs(1.0 - m_ratio) * 2.0
            sim_score = (1.0 - sim) * 3.0  # Content similarity weighted heavily
            total_score = pos_score + mass_score + sim_score

            if total_score < best_score:
                best_score = total_score
                best_loop = i

    if best_loop is not None:
        bl = infos[best_loop]
        dx = bl["cx"] - ref["cx"]
        dy = bl["cy"] - ref["cy"]
        dist = np.sqrt(dx**2 + dy**2)
        sim = signature_similarity(bl.get("signature", np.zeros(1)), ref.get("signature", np.zeros(1)))
        print(f"\n  BEST LOOP POINT: frame {best_loop+1} (of {n})")
        print(f"    Loop length: {best_loop} frames")
        print(f"    Position drift: dx={dx:+.1f} dy={dy:+.1f} dist={dist:.1f}")
        print(f"    Mass ratio: {bl['mass']/ref['mass']:.3f}")
        print(f"    Content similarity: {sim:.3f}")
        print(f"    Score: {best_score:.3f}")
    else:
        print(f"\n  No suitable loop point found (sequence too short?)")

    # Also report centroid range
    cxs = [i["cx"] for i in infos if not i["empty"]]
    cys = [i["cy"] for i in infos if not i["empty"]]
    print(f"\n  Centroid range: x=[{min(cxs):.1f}, {max(cxs):.1f}] y=[{min(cys):.1f}, {max(cys):.1f}]")
    print(f"  Centroid spread: dx={max(cxs)-min(cxs):.1f} dy={max(cys)-min(cys):.1f}")


def main():
    for name in SEQUENCES:
        analyze_sequence(name)


if __name__ == "__main__":
    main()
