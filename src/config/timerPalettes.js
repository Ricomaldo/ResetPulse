import i18n from "../i18n";

export const TIMER_PALETTES = {
  sérénité: {
    colors: ["#e5a8a3", "#edceb1", "#C17B7A", "#8B6F5C"],
    get name() {
      return i18n.t("palettes.sérénité");
    },
    isPremium: false,
    description: "Couleurs douces et apaisantes du logo ResetPulse",
  },
  softLaser: {
    colors: ["#00D17A", "#00B8D9", "#D14AB8", "#E6D500"],
    get name() {
      return i18n.t("palettes.softLaser");
    },
    isPremium: true,
    description: "Palette laser adoucie, plus douce pour les yeux",
  },

  terre: {
    colors: ["#3B82A0", "#68752C", "#8B3A3A", "#FFD700"],
    get name() {
      return i18n.t("palettes.terre");
    },
    isPremium: false,
    description: "Couleurs naturelles et terrestres",
  },
  zen: {
    colors: ["#9DC88D", "#A8DADC", "#E5E5E5", "#B8A9C9"],
    get name() {
      return i18n.t("palettes.zen");
    },
    isPremium: true,
    description: "Tons doux pour la méditation",
  },
  classique: {
    colors: ["#2E5090", "#D94040", "#E8B93C", "#5AAA50"],
    get name() {
      return i18n.t("palettes.classique");
    },
    isPremium: true,
    description: "Palette traditionnelle harmonieuse",
  },
  tropical: {
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA500"],
    get name() {
      return i18n.t("palettes.tropical");
    },
    isPremium: true,
    description: "Couleurs chaudes et exotiques",
  },
  crépuscule: {
    colors: ["#FF6347", "#FF8C00", "#9370DB", "#4B0082"],
    get name() {
      return i18n.t("palettes.crépuscule");
    },
    isPremium: true,
    description: "Tons chauds du soir",
  },
  darkLaser: {
    colors: ["#00C27A", "#00A1BF", "#B0439A", "#C9B200"],
    get name() {
      return i18n.t("palettes.darkLaser");
    },
    isPremium: true,
    description: "Palette laser atténuée, idéale sur fond sombre",
  },
  automne: {
    colors: ["#D2691E", "#CD853F", "#8B4513", "#DAA520"],
    get name() {
      return i18n.t("palettes.automne");
    },
    isPremium: true,
    description: "Tons chauds d'automne",
  },
  aurore: {
    colors: ["#FFB6C1", "#FFE4B5", "#E6E6FA", "#F0E68C"],
    get name() {
      return i18n.t("palettes.aurore");
    },
    isPremium: true,
    description: "Couleurs douces du matin",
  },
  douce: {
    colors: ["#E8B4B8", "#C5A3C0", "#A7C7E7", "#B8D4B8"],
    get name() {
      return i18n.t("palettes.douce");
    },
    isPremium: true,
    description: "Pastels délicats",
  },
  lavande: {
    colors: ["#9370DB", "#BA55D3", "#DDA0DD", "#E6E6FA"],
    get name() {
      return i18n.t("palettes.lavande");
    },
    isPremium: true,
    description: "Violets doux apaisants",
  },
  canard: {
    colors: ["#004D4D", "#008080", "#20B2AA", "#48D1CC"],
    get name() {
      return i18n.t("palettes.canard");
    },
    isPremium: true,
    description: "Bleus-verts sophistiqués",
  },
  forêt: {
    colors: ["#2D5016", "#4A7C2E", "#6FA84A", "#9ED16F"],
    get name() {
      return i18n.t("palettes.forêt");
    },
    isPremium: true,
    description: "Verts profonds et naturels",
  },
  océan: {
    colors: ["#003366", "#0066CC", "#3399FF", "#66CCFF"],
    get name() {
      return i18n.t("palettes.océan");
    },
    isPremium: true,
    description: "Bleus apaisants des mers",
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
  TIMER_PALETTES[paletteName]?.colors || TIMER_PALETTES.sérénité.colors;

export const getTimerColors = (paletteName) => {
  const colors = getPaletteColors(paletteName);
  return {
    energy: colors[0],
    focus: colors[1],
    calm: colors[2],
    deep: colors[3],
  };
};
