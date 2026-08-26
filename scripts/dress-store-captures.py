#!/usr/bin/env python3
"""Habillage des captures store 3.0 — gabarit CD (Captures Store - Hi-Fi).

Compose chaque brute simulateur sur un canevas store : fond signature
(crème #F4EFE7 / anthracite #1A1A1A), device frame #2D2520 aux coins hauts
arrondis, coupé en bas (« l'écran sort par le bas »), accroche minuscule en
tête (96 px à l'échelle 1290, une ligne, point final).

Usage :
  python3 scripts/dress-store-captures.py proof   # une seule image témoin (01-en)
  python3 scripts/dress-store-captures.py all     # les 12, format iPhone 6.7"
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'assets/store-captures/3.0/raw'
OUT = ROOT / 'assets/store-captures/3.0/dressed'

# Canevas Apple iPhone 6.7" (spec CD)
CANVAS = (1290, 2796)
CREAM = '#F4EFE7'
COAL = '#1A1A1A'
FRAME = '#2D2520'
HOOK_ON_CREAM = '#2D2520'
HOOK_ON_COAL = '#E8E2D8'

# Proportions du gabarit CD (mock : carte 290 / device 232 / contour 6 / coin 34)
DEVICE_W_RATIO = 232 / 290       # largeur device vs canevas
FRAME_RATIO = 6 / 232            # épaisseur contour vs largeur device
CORNER_RATIO = 34 / 232          # rayon des coins hauts vs largeur device
HOOK_SIZE = 96                   # px à l'échelle 1290 (spec CD)
HOOK_BAND = 300                  # bande réservée à l'accroche au-dessus du device

FONT = '/System/Library/Fonts/Avenir Next.ttc'

# n° -> (accroche, fond) — accroches = spec CD ; ① et ⑤ muettes.
SHOTS = {
    '01': (None, CREAM),
    '02': {'en': 'yours, not a stopwatch.', 'fr': 'le sien, pas un chrono.', 'bg': CREAM},
    '03': {'en': 'your rituals, one tap each.', 'fr': 'ses rituels, un tap chacun.', 'bg': CREAM},
    '04': {'en': 'your colors, your sounds, your pace.', 'fr': 'ses couleurs, ses sons, son rythme.', 'bg': CREAM},
    '05': (None, COAL),
    '06': {'en': 'palettes & sounds, to unlock.', 'fr': 'palettes & sons, à débloquer.', 'bg': CREAM},
}


def rounded_mask(size, radius):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0], size[1]], radius=radius, fill=255)
    return m


def dress(raw_path: Path, num: str, lang: str) -> Path:
    spec = SHOTS[num]
    if isinstance(spec, tuple):
        hook, bg = spec
    else:
        hook, bg = spec[lang], spec['bg']

    canvas = Image.new('RGB', CANVAS, bg)
    cw, ch = CANVAS

    # Accroche
    # Device ENTIER (retour Eric 26/08 : le « coupé en bas » du gabarit CD
    # rendait mal — bande sheet tronquée, device affaissé) : cadre complet aux
    # 4 coins arrondis, écran intégral, centré dans l'espace sous l'accroche.
    dev_w = round(cw * DEVICE_W_RATIO)
    frame_px = round(dev_w * FRAME_RATIO)
    radius = round(dev_w * CORNER_RATIO)

    shot = Image.open(raw_path).convert('RGB')
    scr_w = dev_w - 2 * frame_px
    scale = scr_w / shot.width
    scr_h = round(shot.height * scale)
    shot = shot.resize((scr_w, scr_h), Image.LANCZOS)

    dev_h = scr_h + 2 * frame_px

    frame_img = Image.new('RGB', (dev_w, dev_h), FRAME)
    scr_mask = rounded_mask((scr_w, scr_h), max(radius - frame_px, 0))
    frame_img.paste(shot, (frame_px, frame_px), scr_mask)
    frame_mask = rounded_mask((dev_w, dev_h), radius)

    hook_band = HOOK_BAND if hook else 0
    device_top = hook_band + max((ch - hook_band - dev_h) // 2, 0)
    canvas.paste(frame_img, ((cw - dev_w) // 2, device_top), frame_mask)

    # Accroche : centrée dans la bande dédiée au-dessus du device
    if hook:
        draw = ImageDraw.Draw(canvas)
        color = HOOK_ON_CREAM if bg == CREAM else HOOK_ON_COAL
        # Ajuste la taille pour que l'accroche tienne (marge 90 px de chaque côté)
        size = HOOK_SIZE
        font = ImageFont.truetype(FONT, size)
        while draw.textlength(hook, font=font) > cw - 180 and size > 40:
            size -= 4
            font = ImageFont.truetype(FONT, size)
        tw = draw.textlength(hook, font=font)
        draw.text(((cw - tw) / 2, (device_top - size) / 2), hook, font=font, fill=color)

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f'iphone-6.7/{num}-{lang}.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, 'PNG')
    return out


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'proof'
    raws = sorted(RAW.glob('*.png'))
    done = []
    for raw in raws:
        num = raw.name[:2]
        lang = 'fr' if raw.stem.endswith('-fr') else 'en'
        if mode == 'proof' and not (num == '01' and lang == 'en'):
            continue
        if num not in SHOTS:
            continue
        done.append(dress(raw, num, lang))
    for p in done:
        print(p.relative_to(ROOT))


if __name__ == '__main__':
    main()
