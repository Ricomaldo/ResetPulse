// src/theme/colors.js
// ============================================================================
// ResetPulse Color System - Brand-First Architecture
// ============================================================================
//
// ARCHITECTURE:
// 1. brandLight/brandDark: Core brand palette (5 colors each)
// 2. lightTheme/darkTheme: Semantic tokens derived from brand
// 3. devColors: Development-only colors (DevFab only)
//
// PHILOSOPHY:
// All semantic tokens (background, text, border) DERIVE from brand colors.
// This ensures visual consistency and reinforces brand identity throughout the app.
//
// BRAND COLOR ROLES:
// - primary: Main interactive color (buttons, active states, highlights)
// - secondary: Complementary interactive (borders, secondary actions)
// - accent: Lightest brand color (backgrounds, subtle fills)
// - deep: Darkest brand color (primary text, strong contrast)
// - neutral: Mid-tone brand color (secondary text, dividers)
//
// ============================================================================

// ============================================================================
// Brand Colors - Light Mode Optimized
// ============================================================================
const brandLight = {
  primary: 'rgba(193, 122, 113, 1)', // Coral rosé foncé (5.1:1 WCAG AA)
  secondary: 'rgba(149, 83, 74, 1)', // Pêche doré
  accent: '#ebe8e3', // Cream (lightest) - backgrounds
  deep: '#5A5A5A', // Anthracite grey (darkest) - text
  neutral: '#9CA3AF', // Mid grey - secondary text
};

// ============================================================================
// Brand Colors - Dark Mode Optimized
// ============================================================================
const brandDark = {
  primary: '#f0bdb8', // Lightened coral
  secondary: '#f5dfc9', // Lightened peach
  accent: '#e0d5cb', // Lightened beige
  deep: '#8A8A8A', // Lighter grey
  neutral: '#6B6B6B', // Dark neutral
};

// ============================================================================
// Fixed Colors (theme-agnostic)
// ============================================================================
const fixed = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF3B30',
  transparent: 'transparent',
};

// ============================================================================
// Light Theme - All Tokens Derive From Brand
// ============================================================================
// PHILOSOPHY: 2-tier hierarchy (background/surface) - no pure white except dial
//
// BUTTON STATES (semantic naming):
// - Resting: surface (#F3F4F6) + transparent border
// - Hover: surface + border (brand.primary + '30')
// - Active: brand.secondary (#95534A) + border brand.primary (2px)
//
// ============================================================================
export const lightTheme = {
  brand: brandLight,
  fixed,

  // Backgrounds (2-tier hierarchy - simplified)
  background: brandLight.accent, // Cream (#ebe8e3) - Screen backgrounds
  surface: '#E8E5E0', // Warm gray (darker than cream) - Cards, items, drawers, modals

  // Typography
  text: '#1F2937', // Primary text (darker than brand.deep for readability)
  textSecondary: brandLight.deep, // Secondary text (#5A5A5A)
  textLight: '#7A7A7A', // Tertiary text (lighter variant)

  // Borders & Dividers - Brand-first
  border: brandLight.primary + '40', // Coral at 40% opacity - subtle but visible
  divider: brandLight.neutral + '20', // Neutral at 20% - very subtle

  // Effects
  shadow: 'rgba(0, 0, 0, 0.08)', // Shadow color
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
};

// ============================================================================
// Dark Theme - All Tokens Derive From Brand
// ============================================================================
// PHILOSOPHY: 2-tier hierarchy (background/surface) - simplified
//
// BUTTON STATES (semantic naming):
// - Resting: surface (#2D2D2D) + transparent border
// - Hover: surface + border (brand.primary + '40')
// - Active: brand.secondary + border brand.primary
//
// ============================================================================
export const darkTheme = {
  brand: brandDark,
  fixed,

  // Backgrounds (2-tier hierarchy - simplified)
  background: '#1A1A1A', // Dark container - Screen backgrounds
  surface: '#2D2D2D', // Mid-dark gray - Cards, items, drawers, modals

  // Typography
  text: '#FEFEFE', // Primary text
  textSecondary: '#B8B8B8', // Secondary text (lighter than brand for readability)
  textLight: brandDark.deep, // Tertiary text (#8A8A8A)

  // Borders & Dividers - Brand-first
  border: brandDark.primary + '50', // Lightened coral at 50% - visible on dark
  divider: brandDark.neutral + '30', // Neutral at 30%

  // Effects
  shadow: 'rgba(0, 0, 0, 0.3)', // Stronger shadow for dark mode
  overlay: 'rgba(0, 0, 0, 0.7)', // Darker overlay
};

// ============================================================================
// Dev Colors - Development/Testing Only
// ============================================================================
// USAGE: Import explicitly as { devColors } - only used in DevFab.jsx
// DO NOT use in production components
// ============================================================================
export const devColors = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#4a6fa5', // Dev blue (distinct from brand)
  success: '#5cb85c', // Dev green
  danger: '#d9534f', // Dev red
  devBg: '#1a1a2e', // Dev background
  devBorder: '#333333', // Dev border
  devBorderLight: '#555555', // Dev border light
  devBorderDark: '#555555', // Dev border dark
  devBgSecondary: '#2d2d3d', // Dev background secondary
  textSecondary: '#888888', // Dev text secondary
  textTertiary: '#cccccc', // Dev text tertiary
};

// Legacy export for backward compatibility
export const baseColors = {
  brand: brandLight,
  fixed,
};
