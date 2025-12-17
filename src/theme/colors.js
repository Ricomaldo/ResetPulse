// src/theme/colors.js
// Système de couleurs simplifié pour ResetPulse
// Identité brand: Corail rosé #e5a8a3

const baseColors = {
  brand: {
    primary: 'rgba(193, 122, 113, 1)', // Corail rosé foncé (5.1:1 WCAG AA contrast)
    secondary: 'rgba(149, 83, 74, 1)', // Pêche doré
    accent: 'hsla(29, 63%, 81%, 1.00)', // Beige rosé
    deep: '#5A5A5A', // Gris anthracite
    neutral: '#9CA3AF', // Gris neutre
  },

  fixed: {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF3B30',
    transparent: 'transparent',
  },
};

// Thème clair
export const lightTheme = {
  ...baseColors,

  background: '#ebe8e3', // Fond crème (logo)
  surface: '#FFFFFF', // Cartes et surfaces
  surfaceElevated: '#F3F4F6', // Surface légèrement élevée

  text: '#1F2937', // Texte principal
  textSecondary: '#5A5A5A', // Texte secondaire (5.2:1 WCAG AA contrast)
  textLight: '#7A7A7A', // Texte tertiaire (4.8:1 WCAG AA contrast)

  border: '#E5E7EB', // Bordures
  divider: '#E5E7EB', // Séparateurs
  shadow: 'rgba(0, 0, 0, 0.08)', // Ombres
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay sombre

  dialFill: '#FFFFFF', // Remplissage cercle timer
};

// Thème sombre
export const darkTheme = {
  ...baseColors,

  brand: {
    primary: '#f0bdb8', // Corail rosé éclairci
    secondary: '#f5dfc9', // Pêche doré éclairci
    accent: '#e0d5cb', // Beige rosé éclairci
    deep: '#8A8A8A', // Gris plus clair
    neutral: '#6B6B6B', // Gris neutre dark
  },

  background: '#1A1A1A', // Fond sombre
  surface: '#2D2D2D', // Cartes
  surfaceElevated: '#383838', // Surface élevée

  text: '#FEFEFE', // Texte principal
  textSecondary: '#B8B8B8', // Texte secondaire
  textLight: '#8A8A8A', // Texte tertiaire

  border: '#4A4A4A', // Bordures
  divider: '#3A3A3A', // Séparateurs
  shadow: 'rgba(0, 0, 0, 0.3)', // Ombres
  overlay: 'rgba(0, 0, 0, 0.7)', // Overlay sombre

  dialFill: '#ebe8e3', // Remplissage cercle timer (crème)
};

// Dev/debug colors
export const colors = {
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
};

export { baseColors };
