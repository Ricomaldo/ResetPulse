// src/theme/colors.js
// ResetPulse Color System - Brand-First Architecture
//
// DEBUG_MODE: High-saturation colors for visual audit
// - Timer dial color (user palette) stays UNCHANGED to distinguish CONTENT vs SYSTEM
// - See: _internal/cockpit/knowledge/devlog/2025-12-19_color-system-debug-audit.md

const DEBUG_MODE = false;

// --- Brand Palettes ---
const brandLightProd = {
  primary: '#C17A71', // Coral (5.1:1 WCAG AA)
  secondary: '#78716C', // Gris chaud (stone-500)
  accent: '#D4A853', // Or classique
  deep: '#5A5A5A',
  neutral: '#9CA3AF',
};

const brandLightDebug = {
  primary: '#0066FF', // Bleu électrique
  secondary: '#7B2CFF', // Violet saturé
  accent: '#FF8A00', // Orange vif
  deep: '#5A5A5A',
  neutral: '#9CA3AF',
};

const brandLight = DEBUG_MODE ? brandLightDebug : brandLightProd;

const brandDark = {
  primary: '#C17A71', // Coral (même que light = cohérence brand)
  secondary: '#A8A29E', // Gris chaud éclairci (stone-400)
  accent: '#D4A853', // Or éclairci
  deep: '#8A8A8A',
  neutral: '#6B6B6B',
};

const fixed = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF3B30',
  transparent: 'transparent',
};

// --- Light Theme ---
// Hierarchy: background (screen) < surface (cards) < surfaceElevated (modals)
const lightThemeProd = {
  background: '#ebe8e3', // Cream
  surface: '#FFFFFF', // Pure white
  surfaceElevated: '#F8F6F3',
};

const lightThemeDebug = {
  background: '#121212', // Noir charbon
  surface: '#1AFF6A', // Vert fluo
  surfaceElevated: '#FFF200', // Jaune acide
};

const lt = DEBUG_MODE ? lightThemeDebug : lightThemeProd;

export const lightTheme = {
  brand: brandLight,
  fixed,

  // Backgrounds (conditional DEBUG/PROD)
  background: lt.background,
  surface: lt.surface,
  surfaceElevated: lt.surfaceElevated,

  // Typography
  text: '#1F2937',
  textSecondary: brandLight.deep,
  textLight: '#7A7A7A',

  // Borders
  border: brandLight.primary + '40',
  divider: brandLight.neutral + '20',

  // Effects
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',

  // Semantic
  danger: '#D94040',

  // Brand opacity variants
  brandAccent15: brandLight.primary + '15',
  brandAccent20: brandLight.primary + '20',
  brandAccent40: brandLight.primary + '40',
};

// --- Dark Theme ---
export const darkTheme = {
  brand: brandDark,
  fixed,

  background: '#1A1A1A',
  surface: '#2D2D2D',
  surfaceElevated: '#3A3A3A',

  text: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textLight: brandDark.deep,

  border: brandDark.primary + '50',
  divider: brandDark.neutral + '30',

  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',

  danger: '#FF6B6B',

  brandAccent15: brandDark.primary + '15',
  brandAccent20: brandDark.primary + '20',
  brandAccent40: brandDark.primary + '40',
};

// --- Dev Colors (DevFab only) ---
export const devColors = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#4a6fa5',
  success: '#5cb85c',
  danger: '#d9534f',
  devBg: '#1a1a2e',
  devBorder: '#333333',
  devBorderLight: '#555555',
  devBorderDark: '#555555',
  devBgSecondary: '#2d2d3d',
  textSecondary: '#888888',
  textTertiary: '#cccccc',
  debug1: '#00CED1',
  debug2: '#9932CC',
  debug3: '#FF8C00',
};

// Legacy export
export const baseColors = { brand: brandLight, fixed };
