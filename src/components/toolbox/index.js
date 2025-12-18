// src/components/toolbox/index.js
// Exports centralisés pour tous les outils configurables

// Carousels
export { default as ActivityCarousel } from './carousels/ActivityCarousel';
export { default as PaletteCarousel } from './carousels/PaletteCarousel';

// Controls
export { default as CircularToggle } from './controls/CircularToggle';
export { default as DurationIncrementer } from './controls/DurationIncrementer';
export { default as ScaleButtons } from './controls/ScaleButtons';

// Bars
export { default as CommandBar } from './bars/CommandBar';
// Note: CarouselBar supprimé - utiliser ActivityCarousel/PaletteCarousel directement
