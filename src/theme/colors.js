// src/theme/colors.js
// Système de couleurs simple et maintenable pour light/dark mode

// Couleurs de base partagées entre les thèmes
const baseColors = {
  // Palette "Interface Apaisante" - Ergonomie cognitive pour TDAH/TSA
  // Hiérarchie visuelle claire sans fatigue oculaire :
  // - Rouge vénitien : points focaux et actions importantes uniquement
  // - Gris chauds : structure UI sans agressivité
  // - Verts subtils : feedback positif et zones actives
  // - Bleus doux : navigation et information secondaire
  brand: {
    primary: '#e5a8a3',    // Corail rosé - couleur principale (logo)
    secondary: '#edceb1',  // Pêche doré - dégradé (logo)
    accent: '#d4c5b8',     // Beige rosé - zones actives/sélectionnées
    deep: '#5A5A5A',       // Gris anthracite - textes et icônes
    gradient: '#edceb1',   // Pêche doré - pour effets dégradés
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
  background: '#ebe8e3',          // Fond principal crème (logo)
  surface: '#FFFFFF',             // Cartes et surfaces
  surfaceAlt: '#F3F4F6',         // Surface alternative plus visible
  cardBackground: '#FAFBFC',      // Fond des cartes

  text: '#1F2937',               // Texte principal plus contrasté
  textSecondary: '#6B7280',      // Texte secondaire
  textLight: '#9CA3AF',          // Texte léger/tertiaire
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
  // Override brand colors pour meilleur contraste
  brand: {
    primary: '#6B7A8A',    // Version éclaircie du gris-bleu
    secondary: '#8A9B4A',  // Version éclaircie de l'olive  
    accent: '#B85A5A',     // Version éclaircie du rouge brique
    deep: '#8A8A8A',       // Gris plus clair
  },
  // Couleurs adaptatives pour le mode sombre
  background: '#1A1A1A',          // Fond principal
  surface: '#2D2D2D',             // Cartes et surfaces
  surfaceAlt: '#383838',          // Surface alternative
  cardBackground: '#252525',      // Fond des cartes

  text: '#FEFEFE',                // Texte principal
  textSecondary: '#B8B8B8',       // Texte secondaire
  textLight: '#8A8A8A',           // Texte léger/tertiaire
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