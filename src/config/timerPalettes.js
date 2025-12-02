// src/config/timerPalettes.js
// Palettes de couleurs pour le timer (séparées du système de thème)
// Organisation : Gratuites (2) → Vives/Saturées (4) → Chauds/Terreux (2) → Pastels/Doux (4) → Nature (3)
// Progression : Énergie → Chaleur → Douceur → Sérénité
import i18n from '../i18n';

export const TIMER_PALETTES = {
  // ========================================
  // 🆓 PALETTES GRATUITES (2) - Introduction accessible
  // ========================================
  terre: {
    colors: ["#3B82A0", "#68752C", "#8B3A3A", "#FFD700"], // Bleu terre en premier (couleur par défaut onboarding)
    get name() { return i18n.t('palettes.terre'); },
    isPremium: false,
    description: "Couleurs naturelles et apaisantes",
  },
  softLaser: {
    colors: ["#00D17A", "#00B8D9", "#D14AB8", "#E6D500"],
    get name() { return i18n.t('palettes.softLaser'); },
    isPremium: false,
    description: "Palette laser adoucie, plus douce pour les yeux",
  },

  // ========================================
  // 🌈 PALETTES VIVES/SATURÉES (4) - Couleurs énergiques
  // ========================================
  classique: {
    colors: ["#2E5090", "#D94040", "#E8B93C", "#5AAA50"],
    get name() { return i18n.t('palettes.classique'); },
    isPremium: true,
    description: "Palette traditionnelle harmonieuse",
  },
  tropical: {
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA500"],
    get name() { return i18n.t('palettes.tropical'); },
    isPremium: true,
    description: "Couleurs chaudes et exotiques",
  },
  crépuscule: {
    colors: ["#FF6347", "#FF8C00", "#9370DB", "#4B0082"],
    get name() { return i18n.t('palettes.crépuscule'); },
    isPremium: true,
    description: "Tons chauds du soir",
  },
  darkLaser: {
    colors: ["#00C27A", "#00A1BF", "#B0439A", "#C9B200"],
    get name() { return i18n.t('palettes.darkLaser'); },
    isPremium: true,
    description: "Palette laser atténuée, idéale sur fond sombre",
  },

  // ========================================
  // 🍁 PALETTES CHAUDS/TERREUX (2) - Tons naturels chauds
  // ========================================
  automne: {
    colors: ["#D2691E", "#CD853F", "#8B4513", "#DAA520"], // Chocolat, Cuivre, Rouille, Or
    get name() { return i18n.t('palettes.automne'); },
    isPremium: true,
    description: "Tons chauds d'automne",
  },
  aurore: {
    colors: ["#FFB6C1", "#FFE4B5", "#E6E6FA", "#F0E68C"],
    get name() { return i18n.t('palettes.aurore'); },
    isPremium: true,
    description: "Couleurs douces du matin",
  },

  // ========================================
  // 🌸 PALETTES PASTELS/DOUX (4) - Tons apaisants
  // ========================================
  douce: {
    colors: ["#E8B4B8", "#C5A3C0", "#A7C7E7", "#B8D4B8"],
    get name() { return i18n.t('palettes.douce'); },
    isPremium: true,
    description: "Pastels délicats",
  },
  pastel_girly: {
    colors: ["#FFB3D9", "#E0BBE4", "#FFDFD3", "#C7CEEA"],
    get name() { return i18n.t('palettes.pastel_girly'); },
    isPremium: true,
    description: "Pastels féminins tendres",
  },
  lavande: {
    colors: ["#9370DB", "#BA55D3", "#DDA0DD", "#E6E6FA"], // Violet moyen, Orchidée, Prune, Lavande
    get name() { return i18n.t('palettes.lavande'); },
    isPremium: true,
    description: "Violets doux apaisants",
  },
  zen: {
    colors: ["#9DC88D", "#A8DADC", "#E5E5E5", "#B8A9C9"],
    get name() { return i18n.t('palettes.zen'); },
    isPremium: true,
    description: "Tons doux pour la méditation",
  },

  // ========================================
  // 🌊 PALETTES NATURE/BLEU-VERT (3) - Finale apaisante
  // ========================================
  canard: {
    colors: ["#004D4D", "#008080", "#20B2AA", "#48D1CC"],
    get name() { return i18n.t('palettes.canard'); },
    isPremium: true,
    description: "Bleus-verts sophistiqués",
  },
  forêt: {
    colors: ["#2D5016", "#4A7C2E", "#6FA84A", "#9ED16F"],
    get name() { return i18n.t('palettes.forêt'); },
    isPremium: true,
    description: "Verts profonds et naturels",
  },
  océan: {
    colors: ["#003366", "#0066CC", "#3399FF", "#66CCFF"],
    get name() { return i18n.t('palettes.océan'); },
    isPremium: true,
    description: "Bleus apaisants des mers",
  },
};

// Helper functions
export const getFreePalettes = () =>
  Object.keys(TIMER_PALETTES).filter((key) => !TIMER_PALETTES[key].isPremium);

export const getAllPalettes = (isPremiumUser = false) =>
  isPremiumUser ? Object.keys(TIMER_PALETTES) : getFreePalettes();

export const isPalettePremium = (paletteName) =>
  TIMER_PALETTES[paletteName]?.isPremium || false;

export const getPaletteInfo = (paletteName) =>
  TIMER_PALETTES[paletteName] || null;

export const getPaletteColors = (paletteName) =>
  TIMER_PALETTES[paletteName]?.colors || TIMER_PALETTES.terre.colors;

// Mapping pour le timer (compatibilité avec l'ancien système)
export const getTimerColors = (paletteName) => {
  const colors = getPaletteColors(paletteName);
  return {
    energy: colors[0],
    focus: colors[1],
    calm: colors[2],
    deep: colors[3],
  };
};
