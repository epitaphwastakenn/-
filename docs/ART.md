# Purrvivors — Art Spec

Everything is pixel art written as text grids in `art/*.txt`, compiled into one atlas by `tools/build_art.py`.
The look: **cute, chunky, readable on a phone**. Think "sticker" sprites: flat colors, 1–2 shading tones, big eyes, dark plum outline.

## 1. File format

```
# comment
sprite en_mouse anchor=6,5            <- name, then options (all optional)
keys: g=gray2 G=gray3 p=pink2 P=pink3 <- char=paletteName (per sprite)
frame                                 <- starts a frame (2 frames = walk/fly cycle)
....gg......
...gGGg.....
end                                   <- closes the sprite
```

- `.` (or space) = transparent. Every row of a sprite must have the **same width**, and every frame the **same size**.
- Default keys available everywhere: `k`=ink (dark plum, for eyes/mouths/inner lines), `W`=white, `w`=cream.
- Colors **must** be palette names from `tools/palette.py` (ramps go 1 = lightest … 5/6 = darkest):
  `ink white cream gray1-6 orange1-5 brown1-5 pink1-5 red1-5 yellow1-5 green1-6 mint1-5 blue1-6 purple1-6`.
  Append `@0.6` to a color for transparency (e.g. `g=white@0.5`), only for ghosts/glass/effects.
- Options:
  - `outline=4` (default): the builder adds a 1px `ink` outline around the shape automatically. **Do not draw the outer outline yourself.** Leave room: the canvas grows by 1px on each side.
  - `outline=0`: no outline (ground tiles, flat decor, soft effects). `outline=8` = diagonal-filled outline (rarely needed). `outlineColor=green6` = outline with another palette color (nice for subtle decor).
  - `anchor=x,y`: pivot in grid coords (defaults to the center — usually leave it).
  - `mirror=even|odd`: each row is the left half and is mirrored to build the right half (`odd` shares the middle column). Great for symmetric bosses/icons.
  - `from=otherSprite swap=green3>blue3,green4>blue4`: recolor of an existing sprite (no frames needed).
- Frame names: a sprite with 2 frames becomes `name_0`, `name_1`; with 1 frame it is just `name`.

## 2. Style rules

1. **Light comes from the top-left.** Use one lighter tone on top/left edges and one or two darker tones on bottom/right. Keep shading simple (no noisy dithering).
2. **Cute first.** Chibi proportions (big head/body, tiny limbs), big eyes. The standard eye is 2×2: `Wk` over `kk` (white sparkle top-left). Add `pink2` blush on cheeks for cute creatures. Even spooky/fiery enemies stay round and adorable-but-mischievous.
3. **Facing right** by default (the game mirrors them). Front 3/4 view, like the hero cat.
4. **Two-frame animation** for creatures: small, clear differences (legs swap, wings up/down, 1px squash/bob, tail swing). Same canvas size in both frames; keep the body in place so it does not jitter.
5. **Readable silhouettes and saturated colors** that pop against the zone ground (see §4). Avoid big areas of the exact ground color.
6. Interior lines (mouth, eye, separation between overlapping parts) use `k`. Avoid single stray pixels.
7. Size guide (grid size *before* the automatic outline):
   - small enemy 10–13 px, medium 13–15 px, tank 15–18 px, elite 22–30 px, boss 36–56 px
   - icons exactly **16×16**, pickups 6–14 px, enemy bullets 5–10 px, ground tiles exactly **16×16**.

## 3. How to check your work

```
python3 tools/build_art.py --only yourfile.txt
```
This writes `build/art-preview/yourfile.png` (5× zoom on a checkerboard). **Open it with the Read tool and look at it**, then iterate until it looks great. Use `--only`, never the plain command (it rewrites the shared atlas). Fix any `undefined key` / width errors the tool prints.

Reference sprites that define the house style live in `art/reference.txt` (green slime, blue gem, grass tile) and `art/heroes.txt` (orange tabby hero). Match them.

## 4. Zone grounds (for contrast)

| Zone | Ground | Mood |
|---|---|---|
| 1 Prado Florido (meadow) | bright grass `green3/green2`, flowers | sunny, cheerful |
| 2 Bosque Sussurrante (woods) | dark moss `green5/green6` + `brown4` dirt | shady, mysterious |
| 3 Picos Nevados (peaks) | snow `white/blue1/gray1` | cold, crisp |
| 4 Cripta Assombrada (crypt) | purple-gray stone `gray4/gray5/purple6` | spooky-cute |
| 5 Abismo Vulcânico (abyss) | dark basalt `gray6/red5/brown5` with lava | hot, final |
