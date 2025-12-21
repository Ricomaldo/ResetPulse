import i18n from '../i18n';

export const TIMER_PALETTES = {
  serenity: {
    colors: ['#C17A71', '#D4A853', '#78716C', '#5A5A5A'],
    get name() {
      return i18n.t('palettes.serenity');
    },
    isPremium: false,
    description: 'Palette système ResetPulse (brand colors)',
  },
  softLaser: {
    colors: ['#5DB88A', '#6BC4C4', '#C584B8', '#D4C65E'],
    get name() {
      return i18n.t('palettes.softLaser');
    },
    isPremium: true,
    description: 'Verts menthe, turquoise et roses poudrés harmonisés',
  },

  earth: {
    colors: ['#7C9A92', '#A68B5B', '#9B6B5A', '#6B7F6B'],
    get name() {
      return i18n.t('palettes.earth');
    },
    isPremium: false,
    description: 'Tons naturels harmonisés avec cream',
  },
  zen: {
    colors: ['#8BB880', '#95C7C9', '#B8B0A8', '#A89BBB'],
    get name() {
      return i18n.t('palettes.zen');
    },
    isPremium: true,
    description: 'Vert sauge, turquoise zen et lavande apaisants',
  },
  classic: {
    colors: ['#5A7BA8', '#C97070', '#D4A853', '#6B9B6B'],
    get name() {
      return i18n.t('palettes.classic');
    },
    isPremium: true,
    description: 'Bleu gris, rouge brique, or brand et vert olive',
  },
  tropical: {
    colors: ['#E8857A', '#6DBCB4', '#75B8C4', '#E8A65E'],
    get name() {
      return i18n.t('palettes.tropical');
    },
    isPremium: true,
    description: 'Corail tropical, turquoise lagon et orange mangue',
  },
  dusk: {
    colors: ['#D97A6A', '#E89F5E', '#9B7FB8', '#6B5580'],
    get name() {
      return i18n.t('palettes.dusk');
    },
    isPremium: true,
    description: 'Coucher de soleil: corail, orange doré et lavande',
  },
  darkLaser: {
    colors: ['#5BA880', '#5A9AAF', '#9B6B9A', '#A89B5A'],
    get name() {
      return i18n.t('palettes.darkLaser');
    },
    isPremium: true,
    description: 'Émeraude, pétrole, prune et olive mat',
  },
  autumn: {
    colors: ['#C17A5E', '#B8925E', '#8B6B5A', '#C4A565'],
    get name() {
      return i18n.t('palettes.autumn');
    },
    isPremium: true,
    description: 'Terre cuite, noisette, châtaigne et or automnal',
  },
  dawn: {
    colors: ['#E8A4AA', '#E8C49B', '#C4B8D4', '#D4C488'],
    get name() {
      return i18n.t('palettes.dawn');
    },
    isPremium: true,
    description: 'Aurore: rose matin, beige doré et lavande aube',
  },
  soft: {
    colors: ['#D49B9F', '#B88FB4', '#8FB4D4', '#9BC49B'],
    get name() {
      return i18n.t('palettes.soft');
    },
    isPremium: true,
    description: 'Rose poudré, mauve, bleu ciel et menthe saturés',
  },
  lavender: {
    colors: ['#8B6BB8', '#A86BB8', '#C49BC4', '#D4C4E0'],
    get name() {
      return i18n.t('palettes.lavender');
    },
    isPremium: true,
    description: 'Lavande chaude, orchidée et plum harmonisés',
  },
  teal: {
    colors: ['#5A7A7A', '#6B9595', '#7AAFAA', '#95C4C4'],
    get name() {
      return i18n.t('palettes.teal');
    },
    isPremium: true,
    description: 'Sarcelle anthracite, turquoise mat et lagon chaud',
  },
  forest: {
    colors: ['#5A6B4A', '#6B8B5A', '#80A670', '#9BBF88'],
    get name() {
      return i18n.t('palettes.forest');
    },
    isPremium: true,
    description: 'Mousse, feuillage, prairie et printemps chauds',
  },
  ocean: {
    colors: ['#5A6B88', '#6B8BA8', '#80A8C4', '#9BC4D4'],
    get name() {
      return i18n.t('palettes.ocean');
    },
    isPremium: true,
    description: 'Bleu nuit, mer profonde, méditerranée et lagon',
  },
};

export const getFreePalettes = () =>
  Object.keys(TIMER_PALETTES).filter((key) => !TIMER_PALETTES[key].isPremium);

export const getAllPalettes = (isPremiumUser = false) =>
  isPremiumUser ? Object.keys(TIMER_PALETTES) : getFreePalettes();

export const isPalettePremium = (paletteName) =>
  TIMER_PALETTES[paletteName]?.isPremium || false;

export const getPaletteInfo = (paletteName) =>
  TIMER_PALETTES[paletteName] || null;

export const getPaletteColors = (paletteName) =>
  TIMER_PALETTES[paletteName]?.colors || TIMER_PALETTES.serenity.colors;

export const getTimerColors = (paletteName) => {
  const colors = getPaletteColors(paletteName);
  return {
    energy: colors[0],
    focus: colors[1],
    calm: colors[2],
    deep: colors[3],
  };
};
