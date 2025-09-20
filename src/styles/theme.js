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

// Color tokens - IRIM palette
const COLORS = {
  // Primary timer colors - Laser palette
  energy: '#00FF00',     // Vert laser
  focus: '#00FFFF',      // Cyan laser
  calm: '#FF00FF',       // Magenta laser
  deep: '#FFFF00',       // Jaune laser

  // Mapped colors for components
  primary: '#00FF00',    // Mapped to energy (laser green)
  secondary: '#00FFFF',  // Mapped to focus (laser cyan)

  // System colors
  background: '#FEFEFE',
  surface: '#F8F9FA',
  text: '#2D3748',
  textLight: '#718096',
  border: '#E2E8F0',
  neutral: '#A0AEC0',

  // Timer states
  running: '#48BB78',
  paused: '#ED8936',
  completed: '#9F7AEA',
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

export const theme = {
  colors: COLORS,
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