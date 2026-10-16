"""Crop the generated cutouts by their actual alpha bounds and export web assets."""

from pathlib import Path
import json
from itertools import groupby

from PIL import Image


root = Path(__file__).resolve().parent
image = Image.open(root / "objects-alpha.png").convert("RGBA")
report = []
alpha = image.getchannel("A").point(lambda value: 255 if value > 24 else 0)
occupied = [alpha.crop((x, 0, x + 1, image.height)).getbbox() is not None for x in range(image.width)]
bands = []
for visible, columns in groupby(enumerate(occupied), key=lambda column: column[1]):
    positions = [column[0] for column in columns]
    if visible and len(positions) > 30:
        bands.append((positions[0], positions[-1] + 1))
if len(bands) != 3:
    raise RuntimeError(f"Expected three separated object silhouettes; found {bands}")

for name, (start, end) in zip(("tech", "life", "history"), bands):
    left = max(0, start - 12)
    right = min(image.width, end + 12)
    region = image.crop((left, 0, right, image.height))
    bounds = region.getchannel("A").point(lambda value: 255 if value > 24 else 0).getbbox()
    if not bounds:
        raise RuntimeError(f"No visible object found in {name} region")
    x0, y0, x1, y1 = bounds
    if x0 < 8 or x1 > region.width - 8:
        raise RuntimeError(f"{name} touches region boundary; inspect before cropping")
    cutout = region.crop((max(0, x0 - 5), max(0, y0 - 5), min(region.width, x1 + 5), min(region.height, y1 + 5)))
    cutout.thumbnail((480, 480), Image.Resampling.LANCZOS)
    target = root / "assets" / f"{name}.webp"
    cutout.save(target, quality=93, method=6)
    histogram = cutout.getchannel("A").histogram()
    report.append({"name": name, "sourceBounds": [left + x0, y0, left + x1, y1], "size": list(cutout.size), "transparentPixels": histogram[0], "opaquePixels": histogram[255], "bytes": target.stat().st_size})

(root / "assets-report.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
