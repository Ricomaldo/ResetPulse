---
created: '2025-12-20'
updated: '2025-12-20'
status: active
---

# GIMP Logo Color Adjustment Guide

**Goal**: Shift logo-1024.png from soft pink/peach → Coral (#C17A71) with increased contrast against cream background (#ebe8e3).

**Time**: 5-10 minutes
**Difficulty**: Beginner
**File**: `assets/logo/logo-1024.png`

---

## Target Colors

| Element | Current | Target | RGB |
|---------|---------|--------|-----|
| **Brand Primary (Coral)** | Soft Pink | #C17A71 | 193, 122, 113 |
| **Background (Cream)** | #ebe8e3 | #ebe8e3 | 235, 232, 227 |
| **Contrast Ratio** | ~2.5:1 | Target: 4:1+ | – |

---

## Step-by-Step GIMP Instructions

### 1️⃣ **Open File**
```
File → Open
Select: assets/logo/logo-1024.png
```

### 2️⃣ **Duplicate Layer (Safety)**
```
Layer → Duplicate Layer
Name it: "color-adjusted"
(Keep original layer as backup)
```

### 3️⃣ **Method A: Hue-Saturation Shift (Recommended)**

**Purpose**: Shift the pink/peach tones → vibrant coral/orange/sunshine gradient.

```
Colors → Hue-Saturation
```

**Settings (Aggressive "Sunshine" Version)**:
- **Select**: Red channel (targets pinks/corals)
- **Hue**: +15 to +25 (shift toward orange/sunshine)
- **Lightness**: -15 to -20 (darken significantly for contrast)
- **Saturation**: +30 to +50 (maximum vibrancy - push hard!)

**Settings (Conservative "Coral" Version)**:
- **Select**: Red channel (targets pinks/corals)
- **Hue**: +5 to +15 (shift toward coral/orange)
- **Lightness**: -10 to -15 (darken for better contrast)
- **Saturation**: +15 to +25 (intensify for more vibrancy)

**Live Preview**: Check the circle and lotus respond well. If too warm, reduce Hue. If too dark, increase Lightness.

### 4️⃣ **Method B: Color Balance (Fine-Tuning)**

```
Colors → Color Balance
```

**Shadows**:
- Cyan ↔ **Red**: +10
- Magenta ↔ **Green**: -5
- Yellow ↔ **Blue**: -10

**Midtones**:
- Cyan ↔ **Red**: +15
- Magenta ↔ **Green**: -3
- Yellow ↔ **Blue**: -8

**Highlights**:
- Cyan ↔ **Red**: +8
- Magenta ↔ **Green**: -2
- Yellow ↔ **Blue**: -5

*Purpose*: Push midtones toward coral (more red/warm).

### 5️⃣ **Increase Contrast (Curves)**

```
Colors → Curves
```

**Curve Shape** (S-curve for contrast):
- Pull **shadows** point down slightly (-5 to -10)
- Pull **highlights** point up slightly (+5 to +10)
- Keep midtones neutral

**Rationale**: Makes the darker coral areas richer, lighter areas brighter → more pop against cream.

### 6️⃣ **Optional: Selective Saturation Boost**

```
Colors → Hue-Saturation
```

- **Select**: Master (all colors)
- **Saturation**: +10 (gentle boost across entire image)

---

## Validation Checklist

### ✅ Visual Checks
- [ ] Circle gradient shifted from pink → coral
- [ ] Lotus petals now warm coral, not pale pink
- [ ] Border ring matches new coral tone
- [ ] Gradient still smooth (no posterization)

### ✅ Contrast Check
```
Tools → Color Picker (I key)
Click on:
  - Darkest circle area (should be close to #C17A71)
  - Background (should be #ebe8e3)
Compare in Foreground/Background color swatches
```

**Target**: At least 4:1 contrast ratio (WCAG AA)

### ✅ Against Cream Background
- Open a reference image with #ebe8e3 background
- Compare your logo visually
- Coral should "pop" noticeably (not fade into cream)

---

## Export Settings

Once satisfied:

```
File → Export As
Filename: logo-1024.png
Format: PNG Image
Settings:
  - Interlacing: None (Adam7)
  - Compression level: 9
  - Save background color: OFF
  - Save gamma: OFF
  - Save layer offset: OFF
  - Save resolution: OFF
  - Save creation time: OFF
  - Save comment: OFF
```

**Click Export** → PNG export options appear → Click Export again

---

## Troubleshooting

### ❌ Color too desaturated / looks washed out
- **Solution**: Increase Saturation (+20 to +30 in Hue-Saturation)
- **Or**: Reduce Lightness further (-20 instead of -15)

### ❌ Dégradé looks posterized (banding)
- **Solution**: Skip Curves S-curve, use Color Balance only
- **Or**: Apply subtle Gaussian Blur (0.5px) after curves

### ❌ Still not enough contrast
- **Solution**: Apply Curves again with more aggressive S-curve
- **Or**: Slightly desaturate background (if you control it in design)

### ❌ Lost texture/detail in lotus
- **Solution**: Your layers are too aggressive. Start over with smaller increments:
  - Hue-Saturation: Hue +5, Lightness -5, Saturation +10
  - Test, then repeat if needed

---

## Color Reference Values

Keep these bookmarked for A/B comparison:

```
NEW BRAND PRIMARY (Coral)
Hex: #C17A71
RGB: 193, 122, 113
HSV: 8°, 41%, 76%

CREAM BACKGROUND
Hex: #ebe8e3
RGB: 235, 232, 227
HSV: 30°, 3%, 92%

GOAL CONTRAST RATIO
Min 4:1 (WCAG AA)
Current ~2.5:1 → Target ≥4:1
```

Use **WebAIM Contrast Checker** if you want exact ratio:
https://webaim.org/resources/contrastchecker/

---

## Quick Reference: GIMP Shortcuts

| Action | Shortcut |
|--------|----------|
| Open | `Ctrl+O` |
| Duplicate Layer | `Shift+Ctrl+D` |
| Hue-Saturation | `Ctrl+U` |
| Color Balance | `Ctrl+B` |
| Curves | `Ctrl+M` |
| Color Picker | `O` |
| Export | `Shift+Ctrl+E` |

---

## After Export

1. **Compare original vs new** side-by-side
2. **Test on cream background** visually
3. **Check on app icon preview** (if App Store assets folder exists)
4. **Generate icon sizes** (see script below)
5. **Commit**: `git add assets/ && git commit -m "update: Logo color shift to sunshine gradient"`

---

## Generating Multiple Icon Sizes (macOS)

Once you have your final `splash-icon.png`, use this script to generate all required sizes:

```bash
#!/bin/bash
# Save as: assets/generate-icon-sizes.sh

SOURCE="assets/splash-icon.png"
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

for size in "${SIZES[@]}"; do
  echo "Generating ${size}x${size}..."
  sips -z $size $size "$SOURCE" --out "$DEST_DIR/icon-${size}.png"
done

echo "✅ All icon sizes generated in $DEST_DIR"
```

**Usage**:
```bash
chmod +x assets/generate-icon-sizes.sh
./assets/generate-icon-sizes.sh
```

**Result**: 16 icon files from 20x20 to 1024x1024 in `assets/app-icons/`

---

## Real-World Result: Sunshine Version

**What worked** (from splash-icon-2.png):
- Hue: +20 to +25 (orange/yellow shift)
- Lightness: -18 to -22 (dark enough for contrast)
- Saturation: +40 to +50 (maximum vibrancy)
- **Gradient**: Coral top → Orange middle → Yellow bottom
- **Effect**: "Sunrise/Sunset" energy instead of soft pastel
- **Contrast**: ~4.5:1 on cream background (WCAG AA+)
- **Visual impact**: Icon "pops" in App Store grid

**Why it works**:
- Warmer tones read as "energetic" not "medical/anatomical"
- High saturation makes lotus petals clearly visible
- Gradient suggests movement/time (perfect for timer app)
- Yellow bottom = optimism, warmth, focus

---

## Notes

- **Layer safety**: Always work on duplicated layer, keep original as backup
- **Save as XCF**: Before exporting PNG, save as `logo-1024.xcf` (GIMP native) for future edits
- **Multiple attempts**: This is iterative. Export → view → adjust → export again is normal
- **Don't be afraid to push**: If it looks "too saturated" in GIMP, it's probably just right for mobile screens
- **Test with friends**: Show it to others - if they see unintended shapes, push colors further toward warm/energetic tones

