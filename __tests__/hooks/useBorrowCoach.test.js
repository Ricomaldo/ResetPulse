// __tests__/hooks/useBorrowCoach.test.js
// La pédagogie du prêt (Lambda V) — seule la logique de décision est
// testée ici (fonctions pures, même règle que useDormantTips) : le hook
// orchestre persistance + timers et reste couvert visuellement par le
// câblage TimerScreen/AsideZone/panels.
import {
  resolveBorrowOnce,
  resolveReturnMessage,
  resolveCoachChannel,
} from '../../src/hooks/useBorrowCoach';

describe('resolveBorrowOnce (moment 1 — une fois par item)', () => {
  test('emprunt jamais vu → la ligne se montre', () => {
    expect(
      resolveBorrowOnce({ isPremium: false, kind: 'palette', itemKey: 'zen', shownItems: [] })
    ).toBe(true);
  });

  test('item déjà montré → plus jamais (flag persisté par item)', () => {
    expect(
      resolveBorrowOnce({
        isPremium: false,
        kind: 'palette',
        itemKey: 'zen',
        shownItems: ['palette.zen'],
      })
    ).toBe(false);
  });

  test('un autre item du même domaine garde SA ligne', () => {
    expect(
      resolveBorrowOnce({
        isPremium: false,
        kind: 'palette',
        itemKey: 'dawn',
        shownItems: ['palette.zen'],
      })
    ).toBe(true);
  });

  test('les domaines ne se contaminent pas — palette.x ≠ sound.x', () => {
    expect(
      resolveBorrowOnce({
        isPremium: false,
        kind: 'sound',
        itemKey: 'kalimba',
        shownItems: ['palette.kalimba'],
      })
    ).toBe(true);
  });

  test('jamais pour un premium', () => {
    expect(
      resolveBorrowOnce({ isPremium: true, kind: 'palette', itemKey: 'zen', shownItems: [] })
    ).toBe(false);
  });

  test('tolère un stockage corrompu ou absent (pas un tableau)', () => {
    expect(
      resolveBorrowOnce({ isPremium: false, kind: 'sound', itemKey: 'kalimba', shownItems: null })
    ).toBe(true);
    expect(
      resolveBorrowOnce({ isPremium: false, kind: 'sound', itemKey: 'kalimba', shownItems: 'zut' })
    ).toBe(true);
  });

  test('kind inconnu ou item vide → silence', () => {
    expect(
      resolveBorrowOnce({ isPremium: false, kind: 'ritual', itemKey: 'zen', shownItems: [] })
    ).toBe(false);
    expect(
      resolveBorrowOnce({ isPremium: false, kind: 'palette', itemKey: '', shownItems: [] })
    ).toBe(false);
  });
});

describe('resolveReturnMessage (moment 2 — la retombée du lancement)', () => {
  test('aucune retombée → pas de ligne', () => {
    expect(resolveReturnMessage({ returnedPalette: null, returnedSoundId: null })).toBeNull();
  });

  test('palette rentrée → ligne paletteReturned avec sa clé', () => {
    expect(resolveReturnMessage({ returnedPalette: 'zen', returnedSoundId: null })).toEqual({
      type: 'paletteReturned',
      itemKey: 'zen',
    });
  });

  test('son rentré → ligne soundReturned avec son id', () => {
    expect(resolveReturnMessage({ returnedPalette: null, returnedSoundId: 'kalimba' })).toEqual({
      type: 'soundReturned',
      itemKey: 'kalimba',
    });
  });

  test('les deux rentrés le même lancement → UNE ligne (palette d\'abord, pas de file)', () => {
    expect(resolveReturnMessage({ returnedPalette: 'zen', returnedSoundId: 'kalimba' })).toEqual({
      type: 'paletteReturned',
      itemKey: 'zen',
    });
  });
});

describe('resolveCoachChannel (une seule voix — le prêt prime)', () => {
  const coachMessage = { type: 'borrowedPalette', itemKey: 'zen' };

  test('prêt et astuce en même temps → le prêt gagne', () => {
    expect(resolveCoachChannel({ coachMessage, dormantTip: 'palettes' })).toEqual({
      kind: 'coach',
      message: coachMessage,
    });
  });

  test('pas de prêt → l\'astuce dormante parle', () => {
    expect(resolveCoachChannel({ coachMessage: null, dormantTip: 'focus' })).toEqual({
      kind: 'dormant',
      tip: 'focus',
    });
  });

  test('personne ne parle → canal muet', () => {
    expect(resolveCoachChannel({ coachMessage: null, dormantTip: null })).toBeNull();
  });
});
