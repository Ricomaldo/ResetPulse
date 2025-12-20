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

**Purpose**: Shift the pink/peach tones → coral while preserving luminance and texture.

```
Colors → Hue-Saturation
```

**Settings**:
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
4. **Commit**: `git add assets/logo/logo-1024.png && git commit -m "update: Logo color shift to brand primary coral"`

---

## Notes

- **Layer safety**: Always work on duplicated layer, keep original as backup
- **Save as XCF**: Before exporting PNG, save as `logo-1024.xcf` (GIMP native) for future edits
- **Multiple attempts**: This is iterative. Export → view → adjust → export again is normal
- **Brand consistency**: Once you're happy, apply same color shift to other logo sizes (512px, 192px, etc.)

