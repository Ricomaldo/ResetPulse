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

# Canevas par format (spec CD + exigences stores)
FORMATS = {
    'iphone-6.7': (1290, 2796),
    'ipad-13': (2048, 2732),
    'android-phone': (1080, 1920),
    'android-tablet': (1600, 2560),
}
CANVAS = FORMATS['iphone-6.7']
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


def dress(raw_path: Path, num: str, lang: str, fmt: str = 'iphone-6.7') -> Path:
    spec = SHOTS[num]
    if isinstance(spec, tuple):
        hook, bg = spec
    else:
        hook, bg = spec[lang], spec['bg']

    size = FORMATS[fmt]
    canvas = Image.new('RGB', size, bg)
    cw, ch = size

    # Accroche
    # Device ENTIER (retour Eric 26/08 : le « coupé en bas » du gabarit CD
    # rendait mal — bande sheet tronquée, device affaissé) : cadre complet aux
    # 4 coins arrondis, écran intégral, centré dans l'espace sous l'accroche.
    shot = Image.open(raw_path).convert('RGB')
    hook_band_probe = HOOK_BAND if hook else 0
    # Largeur cible : 80 % du canevas, MAIS jamais plus haut que l'espace
    # disponible (canevas - bande accroche - marges) — sur iPad/tablette,
    # c'est la hauteur qui contraint.
    margin_v = round(ch * 0.06)
    avail_h = ch - hook_band_probe - 2 * margin_v
    dev_w = round(cw * DEVICE_W_RATIO)
    ratio = shot.height / shot.width
    def height_for(w):
        f = round(w * FRAME_RATIO)
        return round((w - 2 * f) * ratio) + 2 * f
    if height_for(dev_w) > avail_h:
        lo, hi = 100, dev_w
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if height_for(mid) <= avail_h:
                lo = mid
            else:
                hi = mid - 1
        dev_w = lo
    frame_px = round(dev_w * FRAME_RATIO)
    radius = round(dev_w * CORNER_RATIO)
    scr_w = dev_w - 2 * frame_px
    scr_h = round(scr_w * ratio)
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
        size = round(HOOK_SIZE * cw / 1290)
        font = ImageFont.truetype(FONT, size)
        while draw.textlength(hook, font=font) > cw - 180 and size > 40:
            size -= 4
            font = ImageFont.truetype(FONT, size)
        tw = draw.textlength(hook, font=font)
        draw.text(((cw - tw) / 2, (device_top - size) / 2), hook, font=font, fill=color)

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f'{fmt}/{num}-{lang}.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, 'PNG')
    return out


FG_SUBTITLE = {'fr': 'Le temps, visible et doux.', 'en': 'Time, visible and gentle.'}


def feature_graphic(lang: str) -> Path:
    """Feature graphic Play 1024x500 (spec CD) : disque de la capture 01 +
    nom + sous-titre de la fiche, fond crème, aucun device frame."""
    raw = RAW / f'01-accueil-seance-{lang}.png'
    shot = Image.open(raw).convert('RGB')
    # Le cadran occupe une zone connue de l'accueil (constante d'un shoot à
    # l'autre : même écran, même layout) — crop carré généreux autour.
    crop = shot.crop((93, 620, 1113, 1640))
    dial = crop.resize((420, 420), Image.LANCZOS)
    mask = Image.new('L', (420, 420), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, 420, 420], fill=255)

    canvas = Image.new('RGB', (1024, 500), CREAM)
    canvas.paste(dial, (60, 40), mask)
    draw = ImageDraw.Draw(canvas)
    title_font = ImageFont.truetype(FONT, 76)
    sub_font = ImageFont.truetype(FONT, 34)
    draw.text((540, 190), 'ResetPulse', font=title_font, fill='#2D2520')
    draw.text((542, 290), FG_SUBTITLE[lang], font=sub_font, fill='#6B5F55')

    out = OUT / f'feature-graphic/{lang}.png'
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
        fmts = ['iphone-6.7'] if mode == 'proof' else list(FORMATS)
        for fmt in fmts:
            done.append(dress(raw, num, lang, fmt))
    if mode == 'all':
        for lang in ('fr', 'en'):
            done.append(feature_graphic(lang))
    for p in done:
        print(p.relative_to(ROOT))


if __name__ == '__main__':
    main()
