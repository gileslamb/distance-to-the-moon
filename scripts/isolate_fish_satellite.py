"""
Isolate the fish shoal and satellite from their raw extracted frames.
Crops to the relevant region, removes dark background, stabilizes position.
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image
import numpy as np

BASE = Path(__file__).parent.parent / "public"
DARK_THRESHOLD = 28
PADDING = 15

SEQUENCES = {
    "fish_shoal": {
        "src": BASE / "sequences" / "fish_shoal_raw",
        "out": BASE / "sequences_looped" / "fish_shoal",
        "crop": (300, 0, 1000, 858),  # Left of ladder — fish are here
    },
    "satellite": {
        "src": BASE / "sequences" / "satellite_raw",
        "out": BASE / "sequences_looped" / "satellite",
        "crop": (1200, 0, 2048, 858),  # Right of ladder — satellite is here
    },
}


def process_frame(src_path: Path, crop_box: tuple) -> Image.Image | None:
    img = Image.open(src_path).convert("RGBA")
    img = img.crop(crop_box)

    arr = np.array(img)
    brightness = arr[:, :, :3].max(axis=2)
    arr[brightness <= DARK_THRESHOLD, 3] = 0
    img = Image.fromarray(arr)

    bbox = img.getbbox()
    if bbox is None:
        return None
    return img


def stabilize_and_save(frames: list[Image.Image], out_dir: Path):
    """Center all frames on a common canvas based on content centroid."""
    centroids = []
    bboxes = []
    for img in frames:
        bbox = img.getbbox()
        if bbox is None:
            centroids.append(None)
            bboxes.append(None)
            continue
        x0, y0, x1, y1 = bbox
        cx = (x0 + x1) / 2
        cy = (y0 + y1) / 2
        centroids.append((cx, cy))
        bboxes.append((x1 - x0, y1 - y0))

    valid = [(c, b) for c, b in zip(centroids, bboxes) if c is not None]
    if not valid:
        return

    avg_cx = sum(c[0] for c, _ in valid) / len(valid)
    avg_cy = sum(c[1] for c, _ in valid) / len(valid)
    max_w = max(b[0] for _, b in valid)
    max_h = max(b[1] for _, b in valid)

    canvas_w = max_w + PADDING * 2
    canvas_h = max_h + PADDING * 2

    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    for i, img in enumerate(frames):
        bbox = img.getbbox()
        if bbox is None:
            continue
        x0, y0, x1, y1 = bbox
        cx = (x0 + x1) / 2
        cy = (y0 + y1) / 2

        cropped = img.crop((x0 - PADDING, y0 - PADDING, x1 + PADDING, y1 + PADDING))
        cw, ch = cropped.size

        canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        paste_x = (canvas_w - cw) // 2 + int(avg_cx - cx)
        paste_y = (canvas_h - ch) // 2 + int(avg_cy - cy)
        paste_x = max(0, min(canvas_w - cw, paste_x))
        paste_y = max(0, min(canvas_h - ch, paste_y))
        canvas.paste(cropped, (paste_x, paste_y))

        saved += 1
        canvas.save(out_dir / f"frame_{saved:04d}.png")

    print(f"  Saved {saved} stabilized frames to {out_dir}")


def main():
    for name, cfg in SEQUENCES.items():
        print(f"\nProcessing {name}...")
        src_dir = cfg["src"]
        crop_box = cfg["crop"]

        src_frames = sorted(src_dir.glob("frame_*.png"))
        print(f"  Found {len(src_frames)} source frames")

        frames = []
        for src in src_frames:
            result = process_frame(src, crop_box)
            if result is not None:
                frames.append(result)

        print(f"  {len(frames)} frames with content")
        if frames:
            stabilize_and_save(frames, cfg["out"])


if __name__ == "__main__":
    main()
