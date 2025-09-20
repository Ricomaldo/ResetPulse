// src/styles/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Golden ratio system
const GOLDEN_RATIO = 1.618;
const BASE_UNIT = 8;

// iPhone breakpoints
const BREAKPOINTS = {
  small: 375,   // iPhone SE, Mini
  medium: 390,  // iPhone 12/13/14
  large: 428,   // iPhone 12/13/14 Pro Max
};

const getDeviceSize = () => {
  if (width <= BREAKPOINTS.small) return 'small';
  if (width <= BREAKPOINTS.medium) return 'medium';
  return 'large';
};

// Brand colors - IRIM palette (fixed brand identity)
const BRAND_COLORS = {
  primary: '#FF6B6B',    // Rouge énergisant IRIM
  secondary: '#4ECDC4',  // Turquoise IRIM
  accent: '#95E1D3',     // Vert apaisant IRIM
  deep: '#3D5A80',       // Bleu profond IRIM
  
  // System colors (brand-consistent)
  background: '#FEFEFE',
  surface: '#F8F9FA',
  text: '#2D3748',
  textLight: '#718096',
  border: '#E2E8F0',
  neutral: '#A0AEC0',
  
  // UI states
  success: '#48BB78',
  warning: '#ED8936',
  error: '#E74C3C',
  info: '#3D5A80',
};

// Timer palette system (customizable for timer colors)
const TIMER_PALETTES = {
  // Palette IRIM originale
  irim: {
    energy: '#FF6B6B',     // Rouge énergisant
    focus: '#4ECDC4',      // Turquoise concentration
    calm: '#95E1D3',       // Vert apaisant
    deep: '#3D5A80',       // Bleu profond méditation
  },
  
  // Palette Laser
  laser: {
    energy: '#00FF00',     // Vert laser
    focus: '#00FFFF',      // Cyan laser
    calm: '#FF00FF',       // Magenta laser
    deep: '#FFFF00',       // Jaune laser
  },
  
  // Palette Nature
  nature: {
    energy: '#FF6B6B',     // Rouge feu
    focus: '#4ECDC4',      // Turquoise océan
    calm: '#95E1D3',       // Vert forêt
    deep: '#3D5A80',       // Bleu nuit
  },
  
  // Palette Monochrome
  mono: {
    energy: '#FF6B6B',     // Rouge
    focus: '#8B5A3C',      // Marron
    calm: '#6B7280',       // Gris
    deep: '#374151',       // Gris foncé
  },
};

// Timer states (independent of palette)
const TIMER_STATES = {
  running: '#48BB78',
  paused: '#ED8936',
  completed: '#9F7AEA',
  idle: '#A0AEC0',
};

// Spacing based on golden ratio
const SPACING = {
  xs: BASE_UNIT * 0.5,                    // 4
  sm: BASE_UNIT,                          // 8  
  md: BASE_UNIT * GOLDEN_RATIO,           // ~13
  lg: BASE_UNIT * (GOLDEN_RATIO ** 2),    // ~21
  xl: BASE_UNIT * (GOLDEN_RATIO ** 3),    // ~34
  xxl: BASE_UNIT * (GOLDEN_RATIO ** 4),   // ~55
};

// Border radius system
const BORDER_RADIUS = {
  sm: BASE_UNIT * 0.5,    // 4
  md: BASE_UNIT,          // 8
  lg: BASE_UNIT * 1.5,    // 12
  xl: BASE_UNIT * 2,      // 16
  round: 999,             // Fully rounded
};

// Shadows for iOS
const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
};

// Typography scale
const TYPOGRAPHY = {
  timer: {
    fontSize: width * 0.12,  // 12% screen width
    fontWeight: '300',
    letterSpacing: -1,
  },
  title: {
    fontSize: SPACING.lg,
    fontWeight: '600',
  },
  body: {
    fontSize: SPACING.md,
    fontWeight: '400',
  },
  caption: {
    fontSize: SPACING.sm + 2,
    fontWeight: '500',
  },
};

// Layout system
const LAYOUT = {
  // Container proportions
  container: {
    maxWidth: width * 0.9,
    centerX: width * 0.5,
    centerY: height * 0.5,
  },
  
  // Timer circle sizing
  timer: {
    diameter: Math.min(width, height) * 0.7,
    strokeWidth: getDeviceSize() === 'small' ? 3 : 4,
  },
  
  // Control areas
  controls: {
    height: SPACING.xxl,
    bottomOffset: SPACING.xl,
  },
};

// Theme factory function
export const createTheme = (paletteName = 'irim') => {
  const selectedPalette = TIMER_PALETTES[paletteName] || TIMER_PALETTES.irim;
  
  return {
    // Brand colors (fixed)
    brand: BRAND_COLORS,
    
    // Timer colors (customizable)
    timer: {
      palette: selectedPalette,
      states: TIMER_STATES,
      currentPalette: paletteName,
    },
    
    // Legacy compatibility
    colors: {
      ...BRAND_COLORS,
      ...selectedPalette,
      ...TIMER_STATES,
    },
    
    // Design system
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    typography: TYPOGRAPHY,
    layout: LAYOUT,
    device: {
      width,
      height,
      size: getDeviceSize(),
    },
    golden: GOLDEN_RATIO,
  };
};

// Default theme with IRIM palette
export const theme = createTheme('irim');

// Export palette names for easy access
export const PALETTE_NAMES = Object.keys(TIMER_PALETTES);
export { TIMER_PALETTES, BRAND_COLORS, TIMER_STATES };