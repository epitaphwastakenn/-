import json
import math
import os

from PIL import Image, ImageDraw

# VARIABLES
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
atlasPath = os.path.join(root, "build", "www", "atlas.png")
metaPath = os.path.join(root, "build", "www", "atlas.json")
resDir = os.path.join(root, "android", "res")
legacySizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
adaptiveSizes = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
spriteName = "hero_bigode_0"


# FUNCTIONS
def loadSprite():
    atlas = Image.open(atlasPath).convert("RGBA")
    meta = json.load(open(metaPath))
    x, y, w, h = meta["frames"][spriteName][:4]
    return atlas.crop((x, y, x + w, y + h))


def background(size, rounded):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = image.load()
    center = size / 2
    for py in range(size):
        for px in range(size):
            d = math.sqrt((px + 0.5 - center) ** 2 + (py + 0.5 - size * 0.42) ** 2) / (size * 0.7)
            t = min(1, d)
            r = int(92 * (1 - t) + 34 * t)
            g = int(64 * (1 - t) + 24 * t)
            b = int(140 * (1 - t) + 54 * t)
            pixels[px, py] = (r, g, b, 255)
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255)
        image.putalpha(mask)
    return image


def sparkles(image, scale):
    draw = ImageDraw.Draw(image)
    size = image.size[0]
    for fx, fy in ((0.2, 0.22), (0.8, 0.3), (0.74, 0.78), (0.24, 0.7)):
        x = int(size * fx)
        y = int(size * fy)
        s = max(1, scale // 2)
        draw.rectangle((x - s, y - s * 3, x + s, y + s * 3), fill=(255, 224, 140, 200))
        draw.rectangle((x - s * 3, y - s, x + s * 3, y + s), fill=(255, 224, 140, 200))


def placeSprite(canvas, sprite, fraction):
    size = canvas.size[0]
    scale = max(1, int(size * fraction / sprite.size[0]))
    scaled = sprite.resize((sprite.size[0] * scale, sprite.size[1] * scale), Image.NEAREST)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sw = scaled.size[0] * 0.7
    cy = (size + scaled.size[1]) / 2 - scale * 1.5
    sd.ellipse((size / 2 - sw / 2, cy - scale * 1.2, size / 2 + sw / 2, cy + scale * 1.2), fill=(10, 4, 20, 110))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(scaled, ((size - scaled.size[0]) // 2, (size - scaled.size[1]) // 2))
    return scale


def main():
    sprite = loadSprite()
    for density, size in legacySizes.items():
        folder = os.path.join(resDir, "mipmap-" + density)
        os.makedirs(folder, exist_ok=True)
        canvas = background(size, True)
        scale = placeSprite(canvas, sprite, 0.78)
        if scale >= 4:
            sparkles(canvas, scale)
        canvas.save(os.path.join(folder, "ic_launcher.png"))
    for density, size in adaptiveSizes.items():
        folder = os.path.join(resDir, "mipmap-" + density)
        fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        placeSprite(fg, sprite, 0.6)
        fg.save(os.path.join(folder, "ic_launcher_fg.png"))
        bg = background(size, False)
        sparkles(bg, max(2, size // 54))
        bg.save(os.path.join(folder, "ic_launcher_bg.png"))
    preview = background(192, True)
    placeSprite(preview, sprite, 0.78)
    sparkles(preview, 4)
    os.makedirs(os.path.join(root, "build", "art-preview"), exist_ok=True)
    preview.save(os.path.join(root, "build", "art-preview", "app_icon.png"))
    print("icons written")


# INITIALIZATION
if __name__ == "__main__":
    main()
