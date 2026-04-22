---
created: '2025-09-28'
updated: '2025-10-20'
status: active
milestone: M2-M7
confidence: high
---

# Theme Management System

## Overview

ResetPulse uses a simplified dual-theme system that separates UI theming from timer palette colors for better maintainability and user experience.

## Architecture

### Directory Structure
```
src/
├── theme/                    # UI Theme System
│   ├── colors.js            # Light/Dark color definitions
│   ├── tokens.js            # Design tokens (spacing, typography, shadows)
│   └── ThemeProvider.jsx    # Theme context and provider
│
├── config/
│   ├── timerPalettes.js     # Timer color palettes (terre, laser, etc.)
│   └── activities.js        # Activity configurations
│
└── contexts/
    ├── TimerPaletteContext.jsx  # Timer palette management
    └── TimerOptionsContext.jsx  # Timer settings (duration, direction)
```

## Color System

### 1. Brand Colors (IRIM Identity)
Used for system UI elements only:
- **Primary**: `#00A0A0` - Turquoise authentique
- **Secondary**: `#004466` - Bleu foncé
- **Accent**: `#F06424` - Orange accentuation
- **Deep**: `#003955` - Bleu accessible

### 2. Timer Palettes
User-selectable color schemes for the timer:
- **terre** (default): Natural earth tones
- **laser**: Vibrant neon colors
- **14 additional palettes** (12 premium)

### 3. Theme Modes

#### Light Theme (Default)
```javascript
{
  background: '#F9FAFB',      // Subtle gray background
  surface: '#FFFFFF',         // Card surfaces
  text: '#1F2937',           // High contrast text
  shadow: 'rgba(0,0,0,0.08)' // Subtle shadows
}
```

#### Dark Theme (Prepared)
```javascript
{
  background: '#1A1A1A',
  surface: '#2D2D2D',
  text: '#FEFEFE',
  shadow: 'rgba(0,0,0,0.3)'
}
```

## Usage

### Using Theme in Components

```javascript
import { useTheme } from '../theme/ThemeProvider';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.background,
      ...theme.shadows.md
    }}>
      <Text style={{ color: theme.colors.text }}>
        Hello
      </Text>
    </View>
  );
}
```

### Using Timer Palettes

```javascript
import { useTimerPalette } from '../contexts/TimerPaletteContext';

function TimerComponent() {
  const { currentColor, setPalette, setColorIndex } = useTimerPalette();

  return (
    <Circle fill={currentColor} />
  );
}
```

## Design Principles

### 1. Separation of Concerns
- **UI Theme**: Controls app interface (backgrounds, cards, text)
- **Timer Palettes**: Controls timer visualization only
- **Activities**: Only set duration, NOT color (user choice)

### 2. Color Usage Guidelines

| Element Type | Color Source | Example |
|-------------|--------------|---------|
| App background | `theme.colors.background` | Main screen bg |
| Cards/Surfaces | `theme.colors.surface` | Timer container |
| System buttons | `theme.colors.brand.*` | Settings icon |
| Timer colors | `useTimerPalette()` | Progress arc |
| Activity selection | Current palette color | Selected activity bg |

### 3. Accessibility
- Text contrast ratios meet WCAG AA standards
- Color is not the only indicator (icons, labels)
- Support for system dark mode preference

## Migration from Old System

### Before (Complex)
```javascript
// Old: Mixed responsibilities
import { theme } from '../styles/theme';
theme.colors.energy // Timer color mixed with UI
```

### After (Simple)
```javascript
// New: Clear separation
import { useTheme } from '../theme/ThemeProvider';
import { useTimerPalette } from '../contexts/TimerPaletteContext';

const theme = useTheme();        // UI colors
const { currentColor } = useTimerPalette(); // Timer colors
```

## Adding New Features

### Adding a New Timer Palette
1. Edit `src/config/timerPalettes.js`
2. Add palette definition:
```javascript
myPalette: {
  colors: ['#color1', '#color2', '#color3', '#color4'],
  name: 'My Palette',
  isPremium: false,
  description: 'Description'
}
```

### Enabling Dark Mode
1. The system is ready for dark mode
2. To enable: Add toggle in Settings
3. Theme automatically adapts via `useColorScheme()`

## Best Practices

### ✅ DO
- Use theme colors for UI elements
- Let users choose their timer colors
- Keep IRIM brand colors for system elements
- Use semantic color names (background, surface, text)

### ❌ DON'T
- Hard-code colors in components
- Mix timer palettes with UI theme
- Force activity colors on users
- Use brand colors for timer elements

## Troubleshooting

### Common Issues

1. **White/Bland Interface**
   - Check: Using `theme.colors.background` not `#FFFFFF`
   - Solution: Use theme colors with proper shadows

2. **Color Mismatch**
   - Check: Not mixing `theme.colors.brand` with timer colors
   - Solution: Keep UI and timer colors separate

3. **Missing Shadows**
   - Check: Using `theme.shadows.*` not custom shadows
   - Solution: Use predefined shadow tokens

## Future Enhancements

- [ ] User-customizable palettes
- [ ] High contrast mode
- [ ] Color blind friendly palettes
- [ ] Theme sync with system preferences
- [ ] Custom brand color overrides for white-label