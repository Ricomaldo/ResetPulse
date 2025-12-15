// src/theme/tokens.js
// Design tokens indépendants du thème (spacing, typography, etc.)

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Golden ratio pour harmonie visuelle
export const GOLDEN_RATIO = 1.618;
const BASE_UNIT = 8;

// Système d'espacement basé sur le nombre d'or
export const spacing = {
  xs: BASE_UNIT * 0.5,                    // 4
  sm: BASE_UNIT,                          // 8
  md: BASE_UNIT * GOLDEN_RATIO,           // ~13
  lg: BASE_UNIT * (GOLDEN_RATIO ** 2),    // ~21
  xl: BASE_UNIT * (GOLDEN_RATIO ** 3),    // ~34
  xxl: BASE_UNIT * (GOLDEN_RATIO ** 4),   // ~55
};

// Système de bordures
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 999,
};

// Ombres pour élévation (adaptées selon le thème)
export const shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 9,
  },
};

// Font weights
export const fontWeights = {
  light: '300',      // For subtle text, timer display
  regular: '400',    // Default body text
  medium: '500',     // Secondary headings, subtitles
  semibold: '600',   // Primary text, buttons, titles
  bold: '700',       // Strong emphasis, headers
};

// Typographie responsive
export const typography = {
  // Tailles de base
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,

  // Styles spécifiques
  timer: {
    fontSize: width * 0.12,  // 12% de la largeur d'écran
    fontWeight: fontWeights.light,
    letterSpacing: -1,
  },
  title: {
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 15,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.5,
  },
};

// Breakpoints pour responsive
export const breakpoints = {
  small: 375,   // iPhone SE, Mini
  medium: 390,  // iPhone 12/13/14
  large: 428,   // iPhone Pro Max
};

// Dimensions de layout
export const layout = {
  screenWidth: width,
  screenHeight: height,

  // Container standard
  containerPadding: spacing.lg,
  maxContentWidth: width * 0.9,

  // Composants
  buttonHeight: 44,  // Standard iOS
  inputHeight: 48,
  iconSize: 24,

  // Timer spécifique
  timerDiameter: Math.min(width, height) * 0.7,
  timerStrokeWidth: width <= breakpoints.small ? 3 : 4,
};

// Durées d'animation
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  overlay: 400,
  tooltip: 500,
};