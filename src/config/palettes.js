// src/config/palettes.js

export const PALETTE_CONFIG = {
  // Free palettes
  terre: {
    name: 'Terre',
    isPremium: false,
    description: 'Couleurs naturelles et apaisantes'
  },
  laser: {
    name: 'Laser',
    isPremium: false,
    description: 'Couleurs vives et énergisantes'
  },
  // Premium palettes
  classique: {
    name: 'Classique',
    isPremium: true,
    description: 'Palette traditionnelle harmonieuse'
  },
  tropical: {
    name: 'Tropical',
    isPremium: true,
    description: 'Couleurs chaudes et exotiques'
  },
  zen: {
    name: 'Zen',
    isPremium: true,
    description: 'Tons doux pour la méditation'
  },
  forêt: {
    name: 'Forêt',
    isPremium: true,
    description: 'Verts profonds et naturels'
  },
  océan: {
    name: 'Océan',
    isPremium: true,
    description: 'Bleus apaisants des mers'
  },
  aurore: {
    name: 'Aurore',
    isPremium: true,
    description: 'Couleurs douces du matin'
  },
  crépuscule: {
    name: 'Crépuscule',
    isPremium: true,
    description: 'Tons chauds du soir'
  },
  douce: {
    name: 'Douce',
    isPremium: true,
    description: 'Pastels délicats'
  },
  pastel_girly: {
    name: 'Pastel Girly',
    isPremium: true,
    description: 'Pastels féminins tendres'
  },
  verts: {
    name: 'Verts',
    isPremium: true,
    description: 'Nuances de vert nature'
  },
  bleus: {
    name: 'Bleus',
    isPremium: true,
    description: 'Palette de bleus variés'
  },
  canard: {
    name: 'Canard',
    isPremium: true,
    description: 'Bleus-verts sophistiqués'
  }
};

// Get free palettes
export const getFreePalettes = () =>
  Object.keys(PALETTE_CONFIG).filter(key => !PALETTE_CONFIG[key].isPremium);

// Get all palettes (for premium users)
export const getAllPalettes = (isPremiumUser = false) =>
  isPremiumUser
    ? Object.keys(PALETTE_CONFIG)
    : getFreePalettes();

// Check if palette is premium
export const isPalettePremium = (paletteName) =>
  PALETTE_CONFIG[paletteName]?.isPremium || false;

// Get palette info
export const getPaletteInfo = (paletteName) =>
  PALETTE_CONFIG[paletteName] || null;