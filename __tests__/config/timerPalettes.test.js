// __tests__/config/timerPalettes.test.js
import {
  TIMER_PALETTES,
  getFreePalettes,
  getAllPalettes,
  isPalettePremium,
  getPaletteInfo,
  getPaletteColors,
  getTimerColors,
} from '../../src/config/timer-palettes';

describe('timerPalettes Configuration', () => {
  describe('Palette Key Conventions (ADR-02 Compliant)', () => {
    test('All palette keys should be in English', () => {
      const paletteKeys = Object.keys(TIMER_PALETTES);

      // Define French accent characters to check
      const frenchAccentPattern = /[àâäéèêëïîôöœüæÀÂÄÉÈÊËÏÎÔÖŒÜÆ]/;

      paletteKeys.forEach((key) => {
        // Check for accented characters (French)
        const hasFrenchAccents = frenchAccentPattern.test(key);
        expect(hasFrenchAccents).toBe(false);

        // Verify key matches camelCase convention
        expect(key).toMatch(/^[a-z][a-zA-Z]*$/);
      });
    });

    test('Free palettes should have isPremium: false', () => {
      const freePalettes = getFreePalettes();

      freePalettes.forEach((paletteKey) => {
        expect(TIMER_PALETTES[paletteKey].isPremium).toBe(false);
      });
    });

    test('Should have at least 2 free palettes', () => {
      const freePalettes = getFreePalettes();
      expect(freePalettes.length).toBeGreaterThanOrEqual(2);
    });

    test('Should have more premium palettes than free palettes', () => {
      const allPalettes = Object.keys(TIMER_PALETTES);
      const freePalettes = getFreePalettes();
      const premiumCount = allPalettes.length - freePalettes.length;

      expect(premiumCount).toBeGreaterThan(freePalettes.length);
    });
  });

  describe('Palette Structure & Validation', () => {
    test('Each palette should have required properties', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        expect(palette).toHaveProperty('colors');
        expect(palette).toHaveProperty('name');
        expect(palette).toHaveProperty('isPremium');
        expect(palette).toHaveProperty('description');
      });
    });

    test('Colors array should have exactly 4 colors', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        expect(Array.isArray(palette.colors)).toBe(true);
        expect(palette.colors).toHaveLength(4);
      });
    });

    test('Colors should be valid hex values', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;

      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        palette.colors.forEach((color) => {
          expect(hexRegex.test(color)).toBe(true);
        });
      });
    });

    test('Palette name getter should return a string', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        const name = palette.name;
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    test('Description should be a non-empty string', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        expect(typeof palette.description).toBe('string');
        expect(palette.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Utility Functions', () => {
    test('getFreePalettes should return array of free palette keys', () => {
      const free = getFreePalettes();

      expect(Array.isArray(free)).toBe(true);
      free.forEach((key) => {
        expect(TIMER_PALETTES[key]).toBeDefined();
        expect(TIMER_PALETTES[key].isPremium).toBe(false);
      });
    });

    test('getAllPalettes should return only free for non-premium users', () => {
      const allForFree = getAllPalettes(false);
      const free = getFreePalettes();

      expect(allForFree).toEqual(free);
    });

    test('getAllPalettes should return all for premium users', () => {
      const allForPremium = getAllPalettes(true);
      const allKeys = Object.keys(TIMER_PALETTES);

      expect(allForPremium).toEqual(allKeys);
    });

    test('isPalettePremium should correctly identify premium palettes', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        expect(isPalettePremium(key)).toBe(palette.isPremium);
      });
    });

    test('isPalettePremium should return false for non-existent palettes', () => {
      expect(isPalettePremium('nonExistent')).toBe(false);
    });

    test('getPaletteInfo should return palette object or null', () => {
      // Valid palette
      expect(getPaletteInfo('serenity')).toEqual(TIMER_PALETTES.serenity);

      // Invalid palette
      expect(getPaletteInfo('nonExistent')).toBeNull();
    });

    test('getPaletteColors should return color array or fallback to serenity', () => {
      // Valid palette
      expect(getPaletteColors('serenity')).toEqual(
        TIMER_PALETTES.serenity.colors
      );

      // Invalid palette should fallback to serenity
      expect(getPaletteColors('nonExistent')).toEqual(
        TIMER_PALETTES.serenity.colors
      );
    });

    test('getTimerColors should map colors to type properties', () => {
      const timerColors = getTimerColors('serenity');

      expect(timerColors).toHaveProperty('energy');
      expect(timerColors).toHaveProperty('focus');
      expect(timerColors).toHaveProperty('calm');
      expect(timerColors).toHaveProperty('deep');

      const serenityColors = TIMER_PALETTES.serenity.colors;
      expect(timerColors.energy).toBe(serenityColors[0]);
      expect(timerColors.focus).toBe(serenityColors[1]);
      expect(timerColors.calm).toBe(serenityColors[2]);
      expect(timerColors.deep).toBe(serenityColors[3]);
    });
  });

  describe('English Key Migration (Refactor Validation)', () => {
    test('Should not contain any French palette keys', () => {
      const frenchKeys = [
        'sérénité',
        'terre',
        'classique',
        'forêt',
        'océan',
        'aurore',
        'crépuscule',
        'douce',
        'automne',
        'lavande',
        'canard',
      ];

      const allKeys = Object.keys(TIMER_PALETTES);

      frenchKeys.forEach((frenchKey) => {
        expect(allKeys).not.toContain(frenchKey);
      });
    });

    test('Should contain expected English palette keys', () => {
      const expectedEnglishKeys = [
        'serenity',
        'earth',
        'classic',
        'forest',
        'ocean',
        'dawn',
        'dusk',
        'soft',
        'autumn',
        'lavender',
        'teal',
      ];

      const allKeys = Object.keys(TIMER_PALETTES);

      expectedEnglishKeys.forEach((englishKey) => {
        expect(allKeys).toContain(englishKey);
      });
    });

    test('Default free palette should be "serenity"', () => {
      const free = getFreePalettes();
      // serenity should be in free palettes
      expect(free).toContain('serenity');
    });
  });

  describe('Palette Consistency', () => {
    test('All color arrays should have unique values', () => {
      Object.entries(TIMER_PALETTES).forEach(([key, palette]) => {
        const uniqueColors = new Set(palette.colors);
        expect(uniqueColors.size).toBe(palette.colors.length);
      });
    });

    test('Palette keys should be consistent across usage', () => {
      const allKeys = Object.keys(TIMER_PALETTES);

      // Verify each palette key is accessible
      allKeys.forEach((key) => {
        expect(getPaletteInfo(key)).toBeDefined();
        expect(getPaletteColors(key)).toBeDefined();
        expect(typeof isPalettePremium(key)).toBe('boolean');
      });
    });
  });
});
