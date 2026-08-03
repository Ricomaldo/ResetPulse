#!/bin/bash
# Génère la chaîne d'assets de marque « E — anneau entamé » (ResetPulse 3.0)
# Source de la géométrie : spec Claude design, maquette 120px → échelle ×8.5333 (1024/120)
# Créé : 2026-08-04
#
# Deux masters SVG sont générés dans assets/brand/ :
#   - motif-en-seance.svg : anneau extérieur entamé ~60° à partir de 0 (12h), sens horaire
#   - motif-repos.svg     : les deux anneaux pleins
# ... puis rasterisés (Inkscape) vers les PNG consommés par app.json.
#
# Règle des deux états (voir CLAUDE.md) :
#   repos      → in-app (PulseLogo), splash
#   en séance  → icône app, adaptive-icon Android, favicon (tout ce qui représente
#                le produit depuis l'extérieur)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/assets"
BRAND_DIR="$ASSETS_DIR/brand"
mkdir -p "$BRAND_DIR"

command -v inkscape >/dev/null 2>&1 || { echo "inkscape introuvable (brew install inkscape)"; exit 1; }
command -v magick >/dev/null 2>&1 || { echo "imagemagick (magick) introuvable (brew install imagemagick)"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 introuvable"; exit 1; }

echo "Calcul de la géométrie (maquette 120px → 1024px, ×8.5333)..."

# --- Géométrie dérivée de la maquette 120px, calculée en Python (trigonométrie exacte) ---
read -r CX CY OUTER_R INNER_R DISC_R STROKE_W \
        ARC_X1 ARC_Y1 ARC_X2 ARC_Y2 \
        GX1 GY1 GX2 GY2 <<PYEOF
$(python3 <<'PY'
import math

SCALE = 1024 / 120
CX = CY = 512.0

outer_r = 36.5 * SCALE
inner_r = 25.0 * SCALE
disc_r = 11.5 * SCALE
stroke_w = 4.0 * SCALE

# Brèche : arc manquant de 60°, de 0h (12h, haut) à 2h, sens horaire.
# Portion DESSINÉE = de 2h (60°) à 12h (360°/0°) dans le sens horaire = 300°.
# Repère horloge φ (0 = 12h, croît horaire) -> coord écran (y vers le bas) :
#   x = cx + r*sin(φ) ; y = cy - r*cos(φ)
def clock_point(phi_deg, r):
    phi = math.radians(phi_deg)
    return (CX + r * math.sin(phi), CY - r * math.cos(phi))

x1, y1 = clock_point(60, outer_r)   # départ du trait dessiné (2h)
x2, y2 = clock_point(360, outer_r)  # arrivée du trait dessiné (12h)

# Dégradé linéaire CSS-équivalent à 160°, direction D = (sinθ, -cosθ)
theta = math.radians(160)
dx, dy = math.sin(theta), -math.cos(theta)
W = H = 1024.0
L = abs(W * math.sin(theta)) + abs(H * math.cos(theta))
half = L / 2
gx1, gy1 = CX - dx * half, CY - dy * half
gx2, gy2 = CX + dx * half, CY + dy * half

vals = [CX, CY, outer_r, inner_r, disc_r, stroke_w, x1, y1, x2, y2, gx1, gy1, gx2, gy2]
print(" ".join(f"{v:.4f}" for v in vals))
PY
)
PYEOF

echo "  centre=($CX,$CY)  outer_r=$OUTER_R  inner_r=$INNER_R  disc_r=$DISC_R  stroke=$STROKE_W"
echo "  brèche (arc dessiné) : de ($ARC_X1,$ARC_Y1) à ($ARC_X2,$ARC_Y2)"
echo "  dégradé 160° : ($GX1,$GY1) -> ($GX2,$GY2)"

# Note : stroke="rgba(...)" n'est pas fiable en attribut de présentation SVG (librsvg
# l'ignore silencieusement -> stroke="none"). On sépare couleur hex + stroke-opacity.
CREAM_HEX="#FFF0E4"
CREAM_OPACITY_OUTER="0.5"
CREAM_OPACITY_INNER="0.7"

# --- Fragment dégradé de fond partagé ---
gradient_defs() {
  cat <<SVG
    <linearGradient id="bgGradient" gradientUnits="userSpaceOnUse" x1="$GX1" y1="$GY1" x2="$GX2" y2="$GY2">
      <stop offset="0" stop-color="#EDA96F"/>
      <stop offset="1" stop-color="#DE8A55"/>
    </linearGradient>
SVG
}

# --- 1. Master « en séance » (anneau extérieur entamé), fond plein — pour icon.png / favicon.png ---
cat > "$BRAND_DIR/icon-en-seance.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
$(gradient_defs)
  </defs>
  <rect x="0" y="0" width="1024" height="1024" fill="url(#bgGradient)"/>
  <path d="M $ARC_X1,$ARC_Y1 A $OUTER_R,$OUTER_R 0 1,1 $ARC_X2,$ARC_Y2"
        fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_OUTER" stroke-width="$STROKE_W" stroke-linecap="round"/>
  <circle cx="$CX" cy="$CY" r="$INNER_R" fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_INNER" stroke-width="$STROKE_W"/>
  <circle cx="$CX" cy="$CY" r="$DISC_R" fill="#FFFFFF"/>
</svg>
SVG

# --- 2. Master « en séance », motif seul sur transparent — pour adaptive-icon.png ---
cat > "$BRAND_DIR/motif-en-seance.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <path d="M $ARC_X1,$ARC_Y1 A $OUTER_R,$OUTER_R 0 1,1 $ARC_X2,$ARC_Y2"
        fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_OUTER" stroke-width="$STROKE_W" stroke-linecap="round"/>
  <circle cx="$CX" cy="$CY" r="$INNER_R" fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_INNER" stroke-width="$STROKE_W"/>
  <circle cx="$CX" cy="$CY" r="$DISC_R" fill="#FFFFFF"/>
</svg>
SVG

# --- 3. Master « repos » (anneaux pleins), motif seul sur transparent — pour splash-icon.png ---
cat > "$BRAND_DIR/motif-repos.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="$CX" cy="$CY" r="$OUTER_R" fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_OUTER" stroke-width="$STROKE_W"/>
  <circle cx="$CX" cy="$CY" r="$INNER_R" fill="none" stroke="$CREAM_HEX" stroke-opacity="$CREAM_OPACITY_INNER" stroke-width="$STROKE_W"/>
  <circle cx="$CX" cy="$CY" r="$DISC_R" fill="#FFFFFF"/>
</svg>
SVG

echo "Masters SVG écrits dans $BRAND_DIR/"

# --- Rasterisation (Inkscape) ---
render() {
  local svg="$1" out="$2" size="$3"
  inkscape "$svg" --export-type=png --export-filename="$out" \
    --export-width="$size" --export-height="$size" >/dev/null 2>&1
  echo "  → $out (${size}x${size})"
}

echo "Rasterisation..."
render "$BRAND_DIR/icon-en-seance.svg"   "$ASSETS_DIR/icon.png"          1024
render "$BRAND_DIR/motif-en-seance.svg"  "$ASSETS_DIR/adaptive-icon.png" 1024
render "$BRAND_DIR/motif-repos.svg"      "$ASSETS_DIR/splash-icon.png"   1024
render "$BRAND_DIR/icon-en-seance.svg"   "$ASSETS_DIR/favicon.png"      48

# icon.png = fond plein carré : pas de canal alpha attendu par iOS → aplatir sur RGB
magick "$ASSETS_DIR/icon.png" -alpha remove -alpha off "$ASSETS_DIR/icon.png"

echo ""
echo "Assets de marque générés : icon.png, adaptive-icon.png, splash-icon.png, favicon.png"
