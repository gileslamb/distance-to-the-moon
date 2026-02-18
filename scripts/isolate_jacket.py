"""
Isolate the jacket from the jacket_sequence frames.
Crops the left portion of each frame, removes the dark background
to create transparent PNGs, and auto-trims to content bounding box.
"""

from pathlib import Path
from PIL import Image
import numpy as np

SRC_DIR = Path(__file__).parent.parent / "public" / "sequences" / "jacket_sequence"
OUT_DIR = Path(__file__).parent.parent / "public" / "sequences_looped" / "jacket"

CROP_X = 600  # Only keep leftmost 600px (jacket area)
DARK_THRESHOLD = 28  # Pixels darker than this become transparent
PADDING = 10  # Padding around auto-crop bounding box

def process_frame(src_path: Path, out_path: Path):
    img = Image.open(src_path).convert("RGBA")
    
    # Crop to left portion only
    img = img.crop((0, 0, CROP_X, img.height))
    
    arr = np.array(img)
    
    # Calculate brightness from RGB channels
    brightness = arr[:, :, :3].max(axis=2)
    
    # Make dark pixels transparent
    mask = brightness <= DARK_THRESHOLD
    arr[mask, 3] = 0
    
    img = Image.fromarray(arr)
    
    # Auto-crop to content bounding box
    bbox = img.getbbox()
    if bbox is None:
        return False
    
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - PADDING)
    y0 = max(0, y0 - PADDING)
    x1 = min(img.width, x1 + PADDING)
    y1 = min(img.height, y1 + PADDING)
    img = img.crop((x0, y0, x1, y1))
    
    img.save(out_path)
    return True

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    frames = sorted(SRC_DIR.glob("frame_*.png"))
    print(f"Found {len(frames)} source frames")
    
    saved = 0
    for i, src in enumerate(frames):
        out_path = OUT_DIR / f"frame_{saved + 1:04d}.png"
        if process_frame(src, out_path):
            saved += 1
            if saved % 10 == 0:
                print(f"  Processed {saved} frames...")
    
    print(f"Done — saved {saved} isolated jacket frames to {OUT_DIR}")

if __name__ == "__main__":
    main()
