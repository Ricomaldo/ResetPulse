// src/config/timerPalettes.js
// Palettes de couleurs pour le timer (séparées du système de thème)

export const TIMER_PALETTES = {
  classique: {
    colors: ["#2E5090", "#D94040", "#E8B93C", "#5AAA50"],
    name: "Classique",
    isPremium: false,
    description: "Palette traditionnelle harmonieuse",
  },
  softLaser: {
    colors: ["#00D17A", "#00B8D9", "#D14AB8", "#E6D500"],
    name: "Soft Laser",
    isPremium: false,
    description: "Palette laser adoucie, plus douce pour les yeux",
  },
  terre: {
    colors: ["#68752C", "#4A5568", "#8B3A3A", "#FFD700"],
    name: "Terre",
    isPremium: false,
    description: "Couleurs naturelles et apaisantes",
  },
  tropical: {
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA500"],
    name: "Tropical",
    isPremium: true,
    description: "Couleurs chaudes et exotiques",
  },
  zen: {
    colors: ["#9DC88D", "#A8DADC", "#E5E5E5", "#B8A9C9"],
    name: "Zen",
    isPremium: true,
    description: "Tons doux pour la méditation",
  },
  forêt: {
    colors: ["#2D5016", "#4A7C2E", "#6FA84A", "#9ED16F"],
    name: "Forêt",
    isPremium: true,
    description: "Verts profonds et naturels",
  },
  océan: {
    colors: ["#003366", "#0066CC", "#3399FF", "#66CCFF"],
    name: "Océan",
    isPremium: true,
    description: "Bleus apaisants des mers",
  },
  aurore: {
    colors: ["#FFB6C1", "#FFE4B5", "#E6E6FA", "#F0E68C"],
    name: "Aurore",
    isPremium: true,
    description: "Couleurs douces du matin",
  },
  crépuscule: {
    colors: ["#FF6347", "#FF8C00", "#9370DB", "#4B0082"],
    name: "Crépuscule",
    isPremium: true,
    description: "Tons chauds du soir",
  },
  douce: {
    colors: ["#E8B4B8", "#C5A3C0", "#A7C7E7", "#B8D4B8"],
    name: "Douce",
    isPremium: true,
    description: "Pastels délicats",
  },
  pastel_girly: {
    colors: ["#FFB3D9", "#E0BBE4", "#FFDFD3", "#C7CEEA"],
    name: "Pastelles",
    isPremium: true,
    description: "Pastels féminins tendres",
  },
  verts: {
    colors: ["#2D5016", "#4A7C2E", "#6FA84A", "#9ED16F"],
    name: "Verts",
    isPremium: true,
    description: "Nuances de vert nature",
  },
  bleus: {
    colors: ["#003366", "#0066CC", "#3399FF", "#66CCFF"],
    name: "Bleus",
    isPremium: true,
    description: "Palette de bleus variés",
  },
  canard: {
    colors: ["#004D4D", "#008080", "#20B2AA", "#48D1CC"],
    name: "Canard",
    isPremium: true,
    description: "Bleus-verts sophistiqués",
  },
  darkLaser: {
    colors: ["#00C27A", "#00A1BF", "#B0439A", "#C9B200"],
    name: "Dark Laser",
    isPremium: true,
    description: "Palette laser atténuée, idéale sur fond sombre",
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
