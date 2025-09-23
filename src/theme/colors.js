// src/theme/colors.js
// Système de couleurs simple et maintenable pour light/dark mode

// Couleurs de base partagées entre les thèmes
const baseColors = {
  // Marque IRIM - Identité visuelle fixe
  brand: {
    primary: '#00A0A0',    // Turquoise authentique IRIM
    secondary: '#004466',  // Bleu foncé IRIM
    accent: '#F06424',     // Orange accentuation IRIM
    deep: '#003955',       // Bleu accessible IRIM
  },

  // États sémantiques - Même signification en light/dark
  semantic: {
    success: '#48BB78',    // Vert de validation
    warning: '#ED8936',    // Orange d'alerte
    error: '#E74C3C',      // Rouge d'erreur
    info: '#3D5A80',       // Bleu d'information
  },

  // Couleurs fixes (ne changent pas selon le thème)
  fixed: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  }
};

// Thème clair (par défaut)
export const lightTheme = {
  ...baseColors,

  // Couleurs adaptatives pour le mode clair - Plus nuancées, moins blanches
  background: '#F9FAFB',          // Fond principal légèrement gris
  surface: '#FFFFFF',             // Cartes et surfaces
  surfaceAlt: '#F3F4F6',         // Surface alternative plus visible
  cardBackground: '#FAFBFC',      // Fond des cartes

  text: '#1F2937',               // Texte principal plus contrasté
  textSecondary: '#6B7280',      // Texte secondaire
  textOnPrimary: '#FFFFFF',      // Texte sur couleur primaire
  textOnDark: '#FFFFFF',         // Texte sur fond sombre

  border: '#E5E7EB',             // Bordures plus visibles
  divider: '#E5E7EB',            // Séparateurs

  neutral: '#9CA3AF',            // Neutre pour éléments inactifs

  // Overlays et ombres - Moins agressifs
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(248, 249, 250, 0.92)',  // Moins blanc, plus subtil
  overlaySubtle: 'rgba(255, 255, 255, 0.75)',
};

// Thème sombre
export const darkTheme = {
  ...baseColors,

  // Couleurs adaptatives pour le mode sombre
  background: '#1A1A1A',          // Fond principal
  surface: '#2D2D2D',             // Cartes et surfaces
  surfaceAlt: '#383838',          // Surface alternative
  cardBackground: '#252525',      // Fond des cartes

  text: '#FEFEFE',                // Texte principal
  textSecondary: '#B8B8B8',       // Texte secondaire
  textOnPrimary: '#FFFFFF',       // Texte sur couleur primaire
  textOnDark: '#FFFFFF',          // Texte sur fond sombre

  border: '#4A4A4A',              // Bordures
  divider: '#3A3A3A',             // Séparateurs

  neutral: '#6B6B6B',             // Neutre pour éléments inactifs

  // Overlays et ombres
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.85)',
  overlaySubtle: 'rgba(0, 0, 0, 0.4)',
};

// Export pour accès direct si besoin
export { baseColors };