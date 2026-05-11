#!/usr/bin/env python3
"""Generate Elplayer release icons.

Outputs:
- build/icon.png   1024 x 1024 PNG
- build/icon.ico   Windows multi-size ICO
- build/icon.icns  macOS ICNS
- public/icons/app-icon.png 256 x 256 PNG fallback
- public/icons/tray.png 32 x 32 PNG tray icon
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
PUBLIC_ICONS = ROOT / "public" / "icons"
BUILD.mkdir(exist_ok=True)
PUBLIC_ICONS.mkdir(parents=True, exist_ok=True)

SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]


def gradient_square(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    for y in range(size):
        for x in range(size):
            nx = x / max(1, size - 1)
            ny = y / max(1, size - 1)
            r = int(12 + 26 * nx + 8 * (1 - ny))
            g = int(18 + 42 * (1 - nx) + 18 * ny)
            b = int(42 + 90 * nx + 38 * (1 - ny))
            px[x, y] = (r, g, b, 255)
    return img


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def make_icon(size: int = 1024) -> Image.Image:
    base = gradient_square(size)
    mask = rounded_mask(size, int(size * 0.23))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((int(size * 0.09), int(size * 0.05), int(size * 0.58), int(size * 0.54)), fill=(120, 205, 255, 76))
    gd.ellipse((int(size * 0.48), int(size * 0.46), int(size * 1.04), int(size * 1.02)), fill=(188, 132, 255, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(int(size * 0.055)))
    out.alpha_composite(glow)

    d = ImageDraw.Draw(out)
    pad = int(size * 0.13)
    d.rounded_rectangle((pad, pad, size - pad, size - pad), radius=int(size * 0.16), outline=(255, 255, 255, 58), width=max(3, int(size * 0.012)))

    # Vinyl disc.
    cx, cy = int(size * 0.40), int(size * 0.51)
    r = int(size * 0.235)
    for i in range(r, 0, -1):
        t = i / r
        shade = int(18 + 26 * (1 - t))
        alpha = 255 if i > r * 0.18 else 238
        d.ellipse((cx - i, cy - i, cx + i, cy + i), fill=(shade, shade + 2, shade + 10, alpha))
    for rr in [0.86, 0.67, 0.48, 0.28]:
        i = int(r * rr)
        d.ellipse((cx - i, cy - i, cx + i, cy + i), outline=(255, 255, 255, 34), width=max(2, int(size * 0.004)))
    d.ellipse((cx - int(r * 0.21), cy - int(r * 0.21), cx + int(r * 0.21), cy + int(r * 0.21)), fill=(228, 246, 255, 245))
    d.ellipse((cx - int(r * 0.075), cy - int(r * 0.075), cx + int(r * 0.075), cy + int(r * 0.075)), fill=(20, 25, 42, 238))

    # Floating lyric lines.
    lx = int(size * 0.56)
    for idx, (w, a) in enumerate([(0.28, 226), (0.21, 132), (0.18, 86)]):
        y = int(size * (0.40 + idx * 0.105))
        d.rounded_rectangle((lx, y, lx + int(size * w), y + int(size * 0.042)), radius=int(size * 0.021), fill=(245, 250, 255, a))

    # Small play triangle.
    tri = [(int(size * 0.735), int(size * 0.672)), (int(size * 0.735), int(size * 0.782)), (int(size * 0.835), int(size * 0.727))]
    d.polygon(tri, fill=(232, 246, 255, 232))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((int(size * .015), int(size * .026), int(size * .985), int(size * .994)), radius=int(size * .23), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(size * .035)))
    final = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final.alpha_composite(shadow)
    final.alpha_composite(out)
    return final


def main() -> None:
    icon = make_icon(1024)
    icon.save(BUILD / "icon.png")
    icon.resize((256, 256), Image.LANCZOS).save(PUBLIC_ICONS / "app-icon.png")
    icon.resize((32, 32), Image.LANCZOS).save(PUBLIC_ICONS / "tray.png")

    # Windows ICO: save from the largest source image with an explicit sizes list.
    # Pillow ignores append_images for ICO in some versions and may otherwise emit
    # only the first 16x16 frame, which makes electron-builder fail with:
    # "icon.ico must be at least 256x256".
    icon.save(
        BUILD / "icon.ico",
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )

    icns_images = [icon.resize((s, s), Image.LANCZOS) for s in [16, 32, 64, 128, 256, 512, 1024]]
    icns_images[-1].save(BUILD / "icon.icns", append_images=icns_images[:-1])
    print("[OK] generated release icons")


if __name__ == "__main__":
    main()
