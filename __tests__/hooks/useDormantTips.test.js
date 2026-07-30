// __tests__/hooks/useDormantTips.test.js
// Astuces dormantes v1 (ADR-016 §4, Lambda C) — seule la logique de
// décision est testée ici (resolveDormantTip, fonction pure). Le hook lui-
// même orchestre persistance + timers (comme useFirstRun/breatheInvitation)
// et reste couvert visuellement par le câblage TimerScreen/AsideZone.
import { resolveDormantTip } from '../../src/hooks/useDormantTips';

const base = {
  completedSessions: 0,
  hasOpenedPalettes: false,
  hasTriedFocus: false,
  shownFlags: { palettes: false, focus: false },
};

describe('resolveDormantTip (ADR-016 §4)', () => {
  test('aucune astuce en dessous du seuil des deux fonctions', () => {
    expect(resolveDormantTip({ ...base, completedSessions: 2 })).toBeNull();
    expect(resolveDormantTip({ ...base, completedSessions: 4, hasOpenedPalettes: true })).toBeNull();
  });

  test('astuce palettes dès 3 séances si les palettes n\'ont jamais été ouvertes', () => {
    expect(resolveDormantTip({ ...base, completedSessions: 3 })).toBe('palettes');
  });

  test('jamais l\'astuce palettes une fois les palettes ouvertes', () => {
    expect(
      resolveDormantTip({ ...base, completedSessions: 3, hasOpenedPalettes: true })
    ).toBeNull();
  });

  test('jamais l\'astuce palettes une deuxième fois — une astuce, pas une campagne', () => {
    expect(
      resolveDormantTip({
        ...base,
        completedSessions: 10,
        hasTriedFocus: true,
        shownFlags: { palettes: true, focus: false },
      })
    ).toBeNull();
  });

  test('astuce focus dès 5 séances si le focus n\'a jamais été essayé, palettes déjà réglées', () => {
    expect(
      resolveDormantTip({
        ...base,
        completedSessions: 5,
        hasOpenedPalettes: true,
      })
    ).toBe('focus');
  });

  test('priorité aux palettes quand les deux conditions sont réunies en même temps', () => {
    expect(resolveDormantTip({ ...base, completedSessions: 6 })).toBe('palettes');
  });

  test('jamais l\'astuce focus une fois montrée', () => {
    expect(
      resolveDormantTip({
        ...base,
        completedSessions: 5,
        hasOpenedPalettes: true,
        shownFlags: { palettes: false, focus: true },
      })
    ).toBeNull();
  });

  test('tolère completedSessions non défini (état de chargement)', () => {
    expect(resolveDormantTip({ ...base, completedSessions: undefined })).toBeNull();
  });
});
