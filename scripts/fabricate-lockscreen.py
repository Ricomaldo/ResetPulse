#!/usr/bin/env python3
"""Fabrique la capture ③ (écran verrouillé + anneau Live Activity).

La pastille est le VRAI rendu de l'extension (croppée d'un screenshot device
d'Eric, IMG_2561 du 26/08 — anneau corail, 🧘, 6:17) ; seul l'habillage de
l'écran verrouillé est recomposé : heure 9:41, date neutre, rien de personnel.
Sort deux brutes (fr/en) au format des raws simulateur (1206×2622) — la chaîne
`dress-store-captures.py` les habille ensuite comme les autres.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'assets/store-captures/3.0/raw'
PILL = ROOT / 'assets/store-captures/3.0/raw/_pill-live-activity.png'

W, H = 1206, 2622
FONT_CLOCK = '/System/Library/Fonts/HelveticaNeue.ttc'
DATES = {'fr': 'jeudi 12 juin', 'en': 'Thursday, June 12'}


def fabricate(lang: str) -> Path:
    canvas = Image.new('RGB', (W, H), '#050505')
    draw = ImageDraw.Draw(canvas)

    date_font = ImageFont.truetype(FONT_CLOCK, 58)
    clock_font = ImageFont.truetype(FONT_CLOCK, 320)

    date = DATES[lang]
    dw = draw.textlength(date, font=date_font)
    draw.text(((W - dw) / 2, 300), date, font=date_font, fill='#E8E2D8')

    clock = '9:41'
    cw = draw.textlength(clock, font=clock_font)
    draw.text(((W - cw) / 2, 380), clock, font=clock_font, fill='#F2EDE4')

    pill = Image.open(PILL)
    target_w = 1100
    pill = pill.resize((target_w, round(pill.height * target_w / pill.width)), Image.LANCZOS)
    canvas.paste(pill, ((W - target_w) // 2, 1985))

    # Barre home
    draw.rounded_rectangle([(W - 400) // 2, H - 60, (W + 400) // 2, H - 40],
                           radius=10, fill='#F2EDE4')

    out = RAW / f'07-lockscreen-{lang}.png'
    canvas.save(out, 'PNG')
    return out


if __name__ == '__main__':
    for lang in ('fr', 'en'):
        print(fabricate(lang))
