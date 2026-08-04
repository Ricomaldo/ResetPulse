// __tests__/hooks/useBorrowCoach.test.js
// La pédagogie du prêt (Lambda V) — seule la logique de décision est
// testée ici (fonctions pures, même règle que useDormantTips) : le hook
// orchestre persistance + timers et reste couvert visuellement par le
// câblage TimerScreen/AsideZone/panels.
import {
  resolveBorrowOnce,
  resolveReturnMessage,
  resolveCoachChannel,
  resolveNotifyBorrowedAction,
  resolveSheetClosedBorrow,
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

describe('resolveNotifyBorrowedAction (bug QA visuelle #5, bug 2 — sheet ouvert diffère le moment 1)', () => {
  const base = {
    enabled: true,
    shownLoading: false,
    sheetOpen: false,
    isPremium: false,
    kind: 'palette',
    itemKey: 'terre',
    shownItems: [],
  };

  test('sheet ouvert, emprunt jamais vu → armé (\'pending\'), rien affiché', () => {
    expect(resolveNotifyBorrowedAction({ ...base, sheetOpen: true })).toBe('pending');
  });

  test('sheet fermé, emprunt jamais vu → montré tout de suite (\'show\')', () => {
    expect(resolveNotifyBorrowedAction({ ...base, sheetOpen: false })).toBe('show');
  });

  test('sheet ouvert mais item déjà montré → ignoré, pas armé', () => {
    expect(
      resolveNotifyBorrowedAction({ ...base, sheetOpen: true, shownItems: ['palette.terre'] })
    ).toBe('ignore');
  });

  test('sheet ouvert mais premium → ignoré', () => {
    expect(resolveNotifyBorrowedAction({ ...base, sheetOpen: true, isPremium: true })).toBe('ignore');
  });

  test('sheet ouvert mais enabled faux (séance en cours, etc.) → ignoré', () => {
    expect(resolveNotifyBorrowedAction({ ...base, sheetOpen: true, enabled: false })).toBe('ignore');
  });

  test('sheet ouvert mais persistance pas prête → ignoré', () => {
    expect(resolveNotifyBorrowedAction({ ...base, sheetOpen: true, shownLoading: true })).toBe('ignore');
  });
});

describe('resolveSheetClosedBorrow (bug QA visuelle #5, bug 2 — la fermeture rejoue l\'emprunt en attente)', () => {
  const pending = { kind: 'palette', itemKey: 'terre' };
  const base = {
    wasOpen: true,
    sheetOpen: false,
    pending,
    enabled: true,
    shownLoading: false,
    isPremium: false,
    shownItems: [],
  };

  test('transition ouvert→fermé avec un emprunt en attente → committe (pill + flag côté hook)', () => {
    expect(resolveSheetClosedBorrow(base)).toEqual(pending);
  });

  test('pas de transition (sheet reste ouvert) → rien, même avec un emprunt en attente', () => {
    expect(resolveSheetClosedBorrow({ ...base, wasOpen: true, sheetOpen: true })).toBeNull();
  });

  test('montage à sheetOpen: false (jamais ouvert) → rien, ce n\'est pas une fermeture', () => {
    expect(resolveSheetClosedBorrow({ ...base, wasOpen: false, sheetOpen: false })).toBeNull();
  });

  test('fermeture sans emprunt en attente → rien', () => {
    expect(resolveSheetClosedBorrow({ ...base, pending: null })).toBeNull();
  });

  test('fermeture, mais enabled devenu faux entre-temps → rien de perdu structurellement : pas de flag posé, l\'item reste éligible', () => {
    expect(resolveSheetClosedBorrow({ ...base, enabled: false })).toBeNull();
  });

  test('fermeture, mais l\'item a été montré entre-temps par un autre chemin → rien (re-validation)', () => {
    expect(
      resolveSheetClosedBorrow({ ...base, shownItems: ['palette.terre'] })
    ).toBeNull();
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
