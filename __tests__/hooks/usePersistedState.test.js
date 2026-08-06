// Tests for deepMergeDefaults (Lambda F1, correctif 1) — merge récursif qui
// remplace le spread shallow `{ ...defaultValues, ...parsed }` dans
// usePersistedObject. Classe MISSING-FIELD : un champ présent dans les
// défauts et absent du blob stocké doit être injecté, y compris au fond
// d'un sous-objet — la classe INVALID-VALUE (garde-fossile shouldPulse,
// TimerConfigContext) reste hors scope : un champ réellement présent dans
// `stored`, même à une valeur "par défaut" comme false, n'est jamais touché.
//
// Fonction pure, testée directement sans AsyncStorage ni React.
import { deepMergeDefaults } from '../../src/hooks/usePersistedState';

describe('deepMergeDefaults', () => {
  it('injecte un champ ajouté dans un sous-objet absent du stored (cas lockedScale)', () => {
    const defaults = {
      display: { shouldPulse: true, lockedScale: null, showTime: true },
    };
    // Blob ancien : lockedScale n'existait pas encore.
    const stored = {
      display: { shouldPulse: true, showTime: false },
    };

    const result = deepMergeDefaults(defaults, stored);

    expect(result).toEqual({
      display: { shouldPulse: true, lockedScale: null, showTime: false },
    });
  });

  it('préserve une valeur réelle stored (shouldPulse:false n\'est PAS réparé par ce merge)', () => {
    const defaults = { display: { shouldPulse: true, showTime: true } };
    const stored = { display: { shouldPulse: false, showTime: true } };

    const result = deepMergeDefaults(defaults, stored);

    expect(result.display.shouldPulse).toBe(false);
  });

  it('remplace un array en bloc, ne le merge jamais élément par élément', () => {
    const defaults = { favorites: { favoriteActivities: ['work', 'break', 'meditation'] } };
    const stored = { favorites: { favoriteActivities: ['custom'] } };

    const result = deepMergeDefaults(defaults, stored);

    expect(result.favorites.favoriteActivities).toEqual(['custom']);
  });

  it('conserve un null explicite dans stored (null est une valeur, pas une absence)', () => {
    const defaults = { display: { lockedScale: '30min' } };
    const stored = { display: { lockedScale: null } };

    const result = deepMergeDefaults(defaults, stored);

    expect(result.display.lockedScale).toBeNull();
  });

  it('injecte le défaut quand stored porte undefined explicite', () => {
    const defaults = { display: { lockedScale: '30min' } };
    const stored = { display: { lockedScale: undefined } };

    const result = deepMergeDefaults(defaults, stored);

    expect(result.display.lockedScale).toBe('30min');
  });

  it('merge récursivement sur 3 niveaux d\'imbrication', () => {
    const defaults = {
      a: { b: { c: 1, d: 2, e: 3 } },
    };
    const stored = {
      a: { b: { c: 99 } },
    };

    const result = deepMergeDefaults(defaults, stored);

    expect(result).toEqual({
      a: { b: { c: 99, d: 2, e: 3 } },
    });
  });

  it('injecte un champ top-level manquant sans toucher au reste', () => {
    const defaults = { version: 2, timer: { clockwise: false }, palette: { currentPalette: 'serenity' } };
    const stored = { version: 2, timer: { clockwise: true } };

    const result = deepMergeDefaults(defaults, stored);

    expect(result).toEqual({
      version: 2,
      timer: { clockwise: true },
      palette: { currentPalette: 'serenity' },
    });
  });
});
