"""Turn original phone photos into web-ready files for the photo wall.

    python3 scripts/photos.py [--crop-bottom 0.05] <folder-with-originals> [name1 name2 ...]

For each photo (JPEG, PNG or HEIC):
  * applies the EXIF rotation, then drops ALL metadata (GPS location, device, time)
  * never upscales; keeps the aspect ratio (only --crop-bottom crops)
  * writes WebP at 640 / 1280 / 2560 px on the long edge (quality 90)
    plus a 2560 px JPEG (quality 92) as the full-quality fallback
  * records size and average colour in src/data/photos.json

Pass names to pick and order photos; otherwise every photo in the folder is used.
--crop-bottom trims that fraction off the bottom edge, e.g. to remove a phone's
date / location stamp. It is the only crop ever applied. A single photo can
override it with name@fraction, e.g. IMG_1.jpg@0.08 or IMG_2.jpg@0.
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # HEIC support is optional
    pass

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "photos"
DATA = ROOT / "src" / "data" / "photos.json"
SIZES = (640, 1280, 2560)
EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}


def resized(img: Image.Image, long_edge: int) -> Image.Image:
    w, h = img.size
    scale = long_edge / max(w, h)
    if scale >= 1:
        return img.copy()
    return img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)


def main() -> None:
    args = sys.argv[1:]
    crop_bottom = 0.0
    if args and args[0] == "--crop-bottom":
        crop_bottom = float(args[1])
        args = args[2:]
    src = Path(args[0])
    picks = args[1:]
    files = sorted(p for p in src.iterdir() if p.suffix.lower() in EXTS)
    crops = {p.name: crop_bottom for p in files}
    if picks:
        by_name = {p.name: p for p in files}
        chosen = []
        for pick in picks:
            name, _, frac = pick.partition("@")
            if frac:
                crops[name] = float(frac)
            chosen.append(by_name[name])
        files = chosen

    OUT.mkdir(parents=True, exist_ok=True)
    entries = []
    for i, path in enumerate(files, start=1):
        with Image.open(path) as raw:
            img = ImageOps.exif_transpose(raw).convert("RGB")
        cut = crops[path.name]
        if cut:
            img = img.crop((0, 0, img.width, round(img.height * (1 - cut))))
        slug = f"photo-{i:02d}"
        for size in SIZES:
            # Saving without exif= / icc_profile= strips all metadata.
            resized(img, size).save(OUT / f"{slug}-{size}.webp", "WEBP", quality=90, method=6)
        full = resized(img, SIZES[-1])
        full.save(OUT / f"{slug}-{SIZES[-1]}.jpg", "JPEG", quality=92, optimize=True, progressive=True)
        avg = img.resize((1, 1), Image.BOX).getpixel((0, 0))
        entries.append(
            {
                "id": slug,
                "width": full.width,
                "height": full.height,
                "color": "#%02x%02x%02x" % avg,
                "alt": "",
                "caption": "",
            }
        )
        print(f"{path.name} -> {slug} {full.width}x{full.height}")

    DATA.write_text(json.dumps(entries, indent=2) + "\n")
    print(f"wrote {len(entries)} photos to {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
