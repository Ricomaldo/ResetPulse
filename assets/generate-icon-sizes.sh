#!/bin/bash
# Generate all required icon sizes from icon.png
# Created: 2025-12-20
# Modifié 2026-08-04 : source = icon.png (fond plein, état « en séance »)
#   — splash-icon.png est désormais transparent (motif repos seul), impropre
#   à un icon set App Store/iOS qui exige un fond opaque.

SOURCE="assets/icon.png"
DEST_DIR="assets/app-icons"

# Create destination directory
mkdir -p "$DEST_DIR"

# iOS/Android/App Store sizes
declare -a SIZES=(
  "1024"  # App Store
  "512"   # High-res
  "256"   # Medium
  "192"   # Android xxxhdpi
  "180"   # iPhone @3x
  "167"   # iPad Pro
  "152"   # iPad @2x
  "120"   # iPhone @2x
  "87"    # iPad Pro @3x
  "80"    # iPad Spotlight
  "76"    # iPad
  "60"    # iPhone Spotlight
  "58"    # Settings @2x
  "40"    # Spotlight
  "29"    # Settings
  "20"    # Notifications
)

echo "🎨 Generating icon sizes from $SOURCE..."
echo ""

for size in "${SIZES[@]}"; do
  echo "  → ${size}x${size}..."
  sips -z $size $size "$SOURCE" --out "$DEST_DIR/icon-${size}.png" > /dev/null 2>&1
done

echo ""
echo "✅ All icon sizes generated in $DEST_DIR/"
echo "📦 Total: ${#SIZES[@]} files (20x20 to 1024x1024)"
