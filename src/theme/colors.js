// src/theme/colors.js
// ============================================================================
// ResetPulse Color System - Brand-First Architecture
// ============================================================================
//
// ARCHITECTURE:
// 1. brandLight/brandDark: Core brand palette (5 colors each)
// 2. lightTheme/darkTheme: Semantic tokens derived from brand
// 3. devColors: Development-only colors (DevFab only)
// 4. DEBUG MODE: High-saturation audit colors (see devlog 2025-12-19)
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
// DEBUG MODE - Design System Audit
// ============================================================================
// Set to true to use high-saturation colors for visual audit
// See: _internal/cockpit/knowledge/devlog/2025-12-19_color-system-debug-audit.md
//
// IMPORTANT - User-Selected Color (Palette Timer):
// The timer dial color comes from TimerPaletteContext (currentColor prop).
// It is NOT part of the design system tokens - it's USER CONTENT.
// In DEBUG mode, this color stays UNCHANGED (blue/green/red/yellow per user choice).
// This is INTENTIONAL: it distinguishes CONTENT from SYSTEM colors.
//
// Result in DEBUG mode:
// - Screen background: Noir (#121212)
// - Dial fill: Noir (#121212)
// - Dial arc progress: USER COLOR (unchanged, e.g., blue from palette)
// - Dial border: USER COLOR (unchanged)
// - Everything else: DEBUG colors (vert, jaune, bleu, violet, orange)
//
// This allows visual audit of system roles while preserving content integrity.
// ============================================================================
const DEBUG_MODE = true;

// ============================================================================
// PRODUCTION Colors - Final Brand Palette
// ============================================================================
const brandLightProd = {
  primary: 'rgba(193, 122, 113, 1)', // Coral rosé foncé (5.1:1 WCAG AA) - CTA primaires
  secondary: 'rgba(149, 83, 74, 1)', // Pêche foncé - Actions secondaires, outlined buttons
  accent: '#f5dfc9', // Beige clair - Badges, highlights subtils, soft fills
  deep: '#5A5A5A', // Anthracite grey (darkest) - text
  neutral: '#9CA3AF', // Mid grey - secondary text
};

// ============================================================================
// DEBUG Colors - Design System Audit (High Saturation)
// ============================================================================
const brandLightDebug = {
  primary: '#0066FF', // Bleu électrique - Action principale (Play)
  secondary: '#7B2CFF', // Violet saturé - Action secondaire (Stop, Reset)
  accent: '#FF8A00', // Orange vif - État actif, sélection, highlight
  deep: '#5A5A5A', // Keep same (text readability)
  neutral: '#9CA3AF', // Keep same (icons, secondary text)
};

// Active brand palette (conditional)
const brandLight = DEBUG_MODE ? brandLightDebug : brandLightProd;

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
// PHILOSOPHY: 3-tier hierarchy (background/surface/surfaceElevated)
//
// BUTTON STATES (semantic naming):
// - Primary: brand.primary filled + white text
// - Secondary: surface + brand.secondary border/text
// - Ghost: background + brand.primary text
//
// ============================================================================

// Production color values (preserved)
const lightThemeProd = {
  background: '#ebe8e3', // Cream - Screens, large containers, dial fill
  surface: '#FFFFFF', // Pure white - Cards, buttons, interactive items
  surfaceElevated: '#F8F6F3', // Off-white - Modals, overlays, premium features
};

// Debug color values (Design System Audit)
const lightThemeDebug = {
  background: '#121212', // Noir charbon - Monde passif
  surface: '#1AFF6A', // Vert fluo - Conteneurs (cards, buttons)
  surfaceElevated: '#FFF200', // Jaune acide - Au-dessus (modals, AsideZone)
};

export const lightTheme = {
  brand: brandLight,
  fixed,

  // Backgrounds (3-tier hierarchy) - Conditional DEBUG/PROD
  background: DEBUG_MODE ? lightThemeDebug.background : lightThemeProd.background,
  surface: DEBUG_MODE ? lightThemeDebug.surface : lightThemeProd.surface,
  surfaceElevated: DEBUG_MODE ? lightThemeDebug.surfaceElevated : lightThemeProd.surfaceElevated,

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
  overlayDark: 'rgba(0, 0, 0, 0.85)', // Dark overlay for toasts

  // Semantic Colors
  danger: '#D94040', // Destructive actions

  // Brand Opacity Variants (named tokens)
  brandAccent15: brandLight.primary + '15', // Subtle fills
  brandAccent20: brandLight.primary + '20', // Active states
  brandAccent40: brandLight.primary + '40', // Strong borders
};

// ============================================================================
// Dark Theme - All Tokens Derive From Brand
// ============================================================================
// PHILOSOPHY: 3-tier hierarchy (background/surface/surfaceElevated)
//
// BUTTON STATES (semantic naming):
// - Primary: brand.primary filled + white text
// - Secondary: surface + brand.secondary border/text
// - Ghost: background + brand.primary text
//
// ============================================================================
export const darkTheme = {
  brand: brandDark,
  fixed,

  // Backgrounds (3-tier hierarchy)
  background: '#1A1A1A', // Dark container - Screens, dial fill
  surface: '#2D2D2D', // Mid-dark gray - Cards, buttons, interactive items
  surfaceElevated: '#3A3A3A', // Lighter dark - Modals, overlays, premium features

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
  overlayDark: 'rgba(0, 0, 0, 0.9)', // Very dark overlay for toasts

  // Semantic Colors
  danger: '#FF6B6B', // Destructive actions (lighter for dark mode)

  // Brand Opacity Variants (named tokens)
  brandAccent15: brandDark.primary + '15', // Subtle fills
  brandAccent20: brandDark.primary + '20', // Active states
  brandAccent40: brandDark.primary + '40', // Strong borders
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

  // Debug wrapper colors (high contrast for visibility)
  debug1: '#00CED1', // Turquoise vif (DarkTurquoise)
  debug2: '#9932CC', // Pourpre vif (DarkOrchid)
  debug3: '#FF8C00', // Mandarine vif (DarkOrange)
};

// Legacy export for backward compatibility
export const baseColors = {
  brand: brandLight,
  fixed,
};
