import json
import math
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palette import palette

# VARIABLES
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
artDir = os.path.join(root, "art")
outDir = os.path.join(root, "build", "www")
previewDir = os.path.join(root, "build", "art-preview")
defaultKeys = {"k": "ink", "W": "white", "w": "cream"}
padding = 2
atlasWidth = 1024


# FUNCTIONS
def parseColor(value):
    alpha = 255
    if "@" in value:
        value, alphaText = value.split("@")
        alpha = int(float(alphaText) * 255)
    if value.startswith("#"):
        hexValue = value[1:]
    else:
        if value not in palette:
            raise ValueError("unknown palette color '%s'" % value)
        hexValue = palette[value][1:]
    return (int(hexValue[0:2], 16), int(hexValue[2:4], 16), int(hexValue[4:6], 16), alpha)


def parseOptions(tokens):
    options = {}
    for token in tokens:
        if "=" in token:
            key, value = token.split("=", 1)
            options[key] = value
        elif "x" in token and token.replace("x", "").isdigit():
            options["size"] = token
        else:
            options[token] = "1"
    return options


def parseFile(path):
    sprites = []
    current = None
    frame = None
    lineNumber = 0
    for rawLine in open(path, encoding="utf-8"):
        lineNumber += 1
        line = rawLine.rstrip("\n").rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("sprite "):
            tokens = stripped.split()
            current = {"name": tokens[1], "options": parseOptions(tokens[2:]), "keys": dict(defaultKeys), "frames": [], "file": path, "line": lineNumber}
            frame = None
            sprites.append(current)
        elif stripped.startswith("keys:"):
            for pair in stripped[5:].split():
                char, color = pair.split("=", 1)
                current["keys"][char] = color
        elif stripped == "frame":
            frame = []
            current["frames"].append(frame)
        elif stripped == "end":
            current = None
            frame = None
        else:
            if current is None:
                raise ValueError("%s:%d pixel row outside sprite" % (path, lineNumber))
            if frame is None:
                frame = []
                current["frames"].append(frame)
            frame.append(stripped)
    return sprites


def renderRows(rows, keys, options, name):
    widths = set(len(row) for row in rows)
    if len(widths) > 1:
        print("WARNING: sprite %s has rows of different widths %s" % (name, sorted(widths)))
    mirror = options.get("mirror")
    if mirror == "1" or mirror == "even":
        rows = [row + row[::-1] for row in rows]
    elif mirror == "odd":
        rows = [row + row[-2::-1] for row in rows]
    width = max(len(row) for row in rows)
    height = len(rows)
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = image.load()
    for y, row in enumerate(rows):
        for x, char in enumerate(row):
            if char in ". ":
                continue
            if char not in keys:
                raise ValueError("sprite %s uses undefined key '%s'" % (name, char))
            pixels[x, y] = parseColor(keys[char])
    return image


def addOutline(image, mode, color):
    width, height = image.size
    out = Image.new("RGBA", (width + 2, height + 2), (0, 0, 0, 0))
    out.paste(image, (1, 1))
    source = out.load()
    result = out.copy()
    target = result.load()
    if mode == "8":
        neighbours = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]
    else:
        neighbours = [(0, -1), (-1, 0), (1, 0), (0, 1)]
    for y in range(height + 2):
        for x in range(width + 2):
            if source[x, y][3] > 0:
                continue
            for dx, dy in neighbours:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width + 2 and 0 <= ny < height + 2 and source[nx, ny][3] > 40:
                    target[x, y] = color
                    break
    return result


def swapColors(image, swaps):
    mapping = {}
    for pair in swaps.split(","):
        old, new = pair.split(">")
        mapping[parseColor(old)[:3]] = parseColor(new)
    result = image.copy()
    pixels = result.load()
    for y in range(result.size[1]):
        for x in range(result.size[0]):
            pixel = pixels[x, y]
            if pixel[3] > 0 and pixel[:3] in mapping:
                replacement = mapping[pixel[:3]]
                pixels[x, y] = (replacement[0], replacement[1], replacement[2], pixel[3])
    return result


def buildSprites(parsed):
    frames = {}
    byName = {}
    for sprite in parsed:
        byName[sprite["name"]] = sprite
    order = []
    pending = [sprite for sprite in parsed if "from" not in sprite["options"]] + [sprite for sprite in parsed if "from" in sprite["options"]]
    for sprite in pending:
        options = sprite["options"]
        name = sprite["name"]
        if "from" in options:
            base = byName[options["from"]]
            sprite["rendered"] = [swapColors(image, options.get("swap", "")) if options.get("swap") else image.copy() for image in base["rendered"]]
            sprite["anchor"] = base["anchor"]
        else:
            images = []
            for rows in sprite["frames"]:
                image = renderRows(rows, sprite["keys"], options, name)
                outline = options.get("outline", "4")
                if outline != "0":
                    image = addOutline(image, outline, parseColor(options.get("outlineColor", "ink")))
                images.append(image)
            if not images:
                raise ValueError("sprite %s has no frames" % name)
            if len(set(image.size for image in images)) > 1:
                print("WARNING: sprite %s has frames of different sizes" % name)
            sprite["rendered"] = images
            offset = 1 if options.get("outline", "4") != "0" else 0
            if "anchor" in options:
                ax, ay = [int(v) for v in options["anchor"].split(",")]
                sprite["anchor"] = (ax + offset, ay + offset)
            else:
                sprite["anchor"] = (images[0].size[0] // 2, images[0].size[1] // 2)
        for index, image in enumerate(sprite["rendered"]):
            frameName = name if len(sprite["rendered"]) == 1 else "%s_%d" % (name, index)
            if frameName in frames:
                raise ValueError("duplicate sprite name %s" % frameName)
            frames[frameName] = {"image": image, "anchor": sprite["anchor"], "file": sprite["file"]}
            order.append(frameName)
    return frames, order


def proceduralSprites():
    result = {}

    def add(name, image, anchor=None):
        result[name] = {"image": image, "anchor": anchor or (image.size[0] // 2, image.size[1] // 2), "file": "procedural"}

    add("px", Image.new("RGBA", (4, 4), (255, 255, 255, 255)))
    missing = Image.new("RGBA", (8, 8), (255, 0, 255, 255))
    for y in range(8):
        for x in range(8):
            if (x // 4 + y // 4) % 2 == 0:
                missing.putpixel((x, y), (20, 0, 20, 255))
    add("missing", missing)
    for size in (6, 8, 12, 16, 24, 32, 48, 64):
        image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        pixels = image.load()
        radius = size / 2
        for y in range(size):
            for x in range(size):
                dx = x + 0.5 - radius
                dy = y + 0.5 - radius
                if dx * dx + dy * dy <= radius * radius:
                    pixels[x, y] = (255, 255, 255, 255)
        add("circle_%d" % size, image)
    for size, thickness in ((16, 2), (32, 2), (64, 3), (128, 4)):
        image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        pixels = image.load()
        radius = size / 2
        for y in range(size):
            for x in range(size):
                dx = x + 0.5 - radius
                dy = y + 0.5 - radius
                distance = math.sqrt(dx * dx + dy * dy)
                if radius - thickness <= distance <= radius:
                    pixels[x, y] = (255, 255, 255, 255)
        add("ring_%d" % size, image)
    for size in (16, 32, 64):
        image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        pixels = image.load()
        radius = size / 2
        for y in range(size):
            for x in range(size):
                dx = x + 0.5 - radius
                dy = y + 0.5 - radius
                distance = math.sqrt(dx * dx + dy * dy) / radius
                if distance < 1:
                    level = 1 - distance
                    stepped = math.ceil(level * 5) / 5
                    alpha = int(255 * stepped * stepped)
                    pixels[x, y] = (255, 255, 255, alpha)
        add("glow_%d" % size, image)
    for width, height in ((12, 5), (20, 7), (32, 10), (48, 14)):
        image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        pixels = image.load()
        for y in range(height):
            for x in range(width):
                dx = (x + 0.5 - width / 2) / (width / 2)
                dy = (y + 0.5 - height / 2) / (height / 2)
                if dx * dx + dy * dy <= 1:
                    pixels[x, y] = (255, 255, 255, 255)
        add("shadow_%d" % width, image)
    for size in (32, 64):
        image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        pixels = image.load()
        radius = size / 2
        for y in range(size):
            for x in range(size):
                dx = x + 0.5 - radius
                dy = y + 0.5 - radius
                distance = math.sqrt(dx * dx + dy * dy) / radius
                if distance < 1:
                    alpha = 70 if distance < 0.88 else 230
                    pixels[x, y] = (255, 255, 255, alpha)
        add("zone_%d" % size, image)
    image = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    pixels = image.load()
    for y in range(16):
        for x in range(16):
            pixels[x, y] = (255, 255, 255, 70 if 1 <= y <= 14 else 230)
    add("zonerect", image)
    for evo in (False, True):
        for frameIndex in range(3):
            image = clawSlash(frameIndex, evo)
            add(("fx_slash_evo_%d" if evo else "fx_slash_%d") % frameIndex, image)
    add("fx_puddle", blobImage(32, 7, [parseColor("white"), parseColor("cream"), parseColor("blue1")], 1))
    add("fx_cloud", blobImage(32, 11, [parseColor("green2@0.75"), parseColor("mint2@0.7"), parseColor("green4@0.8")], 3))
    add("fx_galaxy", galaxyImage(32))
    return result


def clawSlash(frameIndex, evo):
    import random
    width, height = (20, 36)
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = image.load()
    cx, cy = -14.0, height / 2
    limit = 0.62
    thickness = 1.5 if evo else 1.05
    radii = [26.5, 30.5, 34.5] if not evo else [26, 30, 34]
    core = parseColor("yellow2") if evo else parseColor("white")
    edge = parseColor("orange3") if evo else parseColor("orange1")
    stripe = parseColor("ink")
    for y in range(height):
        for x in range(width):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            distance = math.sqrt(dx * dx + dy * dy)
            angle = math.atan2(dy, dx)
            if abs(angle) > limit:
                continue
            progress = (angle + limit) / (2 * limit)
            if frameIndex == 0 and progress > 0.55:
                continue
            if frameIndex == 2 and progress < 0.35:
                continue
            taper = 1 - (abs(angle) / limit) ** 2
            for index, radius in enumerate(radii):
                width_here = thickness * taper + 0.35
                if frameIndex == 2:
                    width_here *= 0.7
                gap = abs(distance - radius)
                if gap < width_here:
                    color = core if gap < width_here * 0.55 else edge
                    if evo and int(progress * 14) % 4 == 0 and gap < width_here * 0.8:
                        color = stripe
                    alpha = 255 if frameIndex < 2 else 200
                    pixels[x, y] = (color[0], color[1], color[2], alpha)
    return image


def blobImage(size, count, colors, seed):
    import random
    rng = random.Random(seed)
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = image.load()
    circles = [(size / 2, size / 2, size * 0.36)]
    for i in range(count):
        angle = rng.random() * math.pi * 2
        distance = rng.random() * size * 0.22
        circles.append((size / 2 + math.cos(angle) * distance, size / 2 + math.sin(angle) * distance, size * (0.14 + rng.random() * 0.1)))
    def inside(x, y):
        best = -999
        for cx, cy, r in circles:
            best = max(best, r - math.sqrt((x - cx) ** 2 + (y - cy) ** 2))
        return best
    for y in range(size):
        for x in range(size):
            depth = inside(x + 0.5, y + 0.5)
            if depth <= 0:
                continue
            if depth < 1.4:
                color = colors[2]
            elif rng.random() < 0.06:
                color = colors[1]
            else:
                color = colors[0]
            pixels[x, y] = color
    return image


def galaxyImage(size):
    import random
    rng = random.Random(7)
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = image.load()
    radius = size / 2 - 0.5
    for y in range(size):
        for x in range(size):
            dx = x + 0.5 - size / 2
            dy = y + 0.5 - size / 2
            r = math.sqrt(dx * dx + dy * dy)
            if r > radius:
                continue
            theta = math.atan2(dy, dx)
            arm = math.cos(2 * (theta - 0.32 * r))
            if r < 2.5:
                color = parseColor("white")
            elif r < 4.5:
                color = parseColor("yellow1")
            elif arm > 0.45:
                color = parseColor("purple2") if r < radius * 0.6 else parseColor("purple3")
            elif arm > -0.1:
                color = parseColor("purple4")
            else:
                color = parseColor("purple6@0.85")
            if r > radius - 1.5:
                color = parseColor("purple5")
            if rng.random() < 0.05 and r > 4:
                color = parseColor("white")
            pixels[x, y] = color
    return image


def pack(frames, order):
    entries = sorted(order, key=lambda n: (-frames[n]["image"].size[1], -frames[n]["image"].size[0], n))
    x = padding
    y = padding
    shelfHeight = 0
    placements = {}
    for name in entries:
        width, height = frames[name]["image"].size
        if x + width + padding > atlasWidth:
            x = padding
            y += shelfHeight + padding
            shelfHeight = 0
        placements[name] = (x, y)
        x += width + padding
        shelfHeight = max(shelfHeight, height)
    totalHeight = y + shelfHeight + padding
    atlasHeight = 64
    while atlasHeight < totalHeight:
        atlasHeight *= 2
    return placements, atlasHeight


def writePreviews(frames, order):
    os.makedirs(previewDir, exist_ok=True)
    groups = {}
    for name in order:
        groups.setdefault(os.path.basename(frames[name]["file"]), []).append(name)
    scale = 5
    for fileName, names in groups.items():
        cells = []
        for name in names:
            image = frames[name]["image"]
            cells.append((name, image.resize((image.size[0] * scale, image.size[1] * scale), Image.NEAREST)))
        columns = 6
        cellWidth = max(max(cell[1].size[0] for cell in cells), 150) + 12
        cellHeight = max(cell[1].size[1] for cell in cells) + 28
        rows = (len(cells) + columns - 1) // columns
        sheet = Image.new("RGBA", (cellWidth * min(columns, len(cells)), cellHeight * rows), (0, 0, 0, 255))
        draw = ImageDraw.Draw(sheet)
        for index, (name, image) in enumerate(cells):
            cx = (index % columns) * cellWidth
            cy = (index // columns) * cellHeight
            for ty in range(0, cellHeight, 10):
                for tx in range(0, cellWidth, 10):
                    shade = (98, 110, 92, 255) if (tx // 10 + ty // 10) % 2 == 0 else (110, 124, 102, 255)
                    draw.rectangle([cx + tx, cy + ty, cx + tx + 9, cy + ty + 9], fill=shade)
            sheet.alpha_composite(image, (cx + 6, cy + 20))
            draw.text((cx + 4, cy + 4), name, fill=(255, 255, 255, 255))
        sheet.save(os.path.join(previewDir, fileName.replace(".txt", ".png")))


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    parsed = []
    if only:
        parsed = parseFile(os.path.join(artDir, only))
        names = set(sprite["name"] for sprite in parsed)
        needed = set(sprite["options"]["from"] for sprite in parsed if "from" in sprite["options"]) - names
        if needed:
            for fileName in sorted(os.listdir(artDir)):
                if not fileName.endswith(".txt") or fileName == only:
                    continue
                try:
                    for sprite in parseFile(os.path.join(artDir, fileName)):
                        if sprite["name"] in needed:
                            parsed.insert(0, sprite)
                except Exception as error:
                    print("skipping %s: %s" % (fileName, error))
    else:
        for fileName in sorted(os.listdir(artDir)):
            if fileName.endswith(".txt"):
                parsed.extend(parseFile(os.path.join(artDir, fileName)))
    frames, order = buildSprites(parsed)
    if only:
        names = [n for n in order if os.path.basename(frames[n]["file"]) == only]
        writePreviews(frames, names)
        print("preview written for %s (%d frames)" % (only, len(names)))
        return
    procedural = proceduralSprites()
    for name, frame in procedural.items():
        frames[name] = frame
        order.append(name)
    placements, atlasHeight = pack(frames, order)
    atlas = Image.new("RGBA", (atlasWidth, atlasHeight), (0, 0, 0, 0))
    meta = {"w": atlasWidth, "h": atlasHeight, "frames": {}}
    for name in order:
        image = frames[name]["image"]
        x, y = placements[name]
        atlas.paste(image, (x, y))
        ax, ay = frames[name]["anchor"]
        meta["frames"][name] = [x, y, image.size[0], image.size[1], ax, ay]
    os.makedirs(outDir, exist_ok=True)
    atlas.save(os.path.join(outDir, "atlas.png"), optimize=True)
    with open(os.path.join(outDir, "atlas.json"), "w") as handle:
        json.dump(meta, handle, separators=(",", ":"))
    writePreviews(frames, [n for n in order if frames[n]["file"] != "procedural"])
    print("atlas %dx%d with %d frames" % (atlasWidth, atlasHeight, len(order)))


# INITIALIZATION
if __name__ == "__main__":
    main()
