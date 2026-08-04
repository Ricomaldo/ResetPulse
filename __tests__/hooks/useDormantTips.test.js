// __tests__/hooks/useDormantTips.test.js
// Astuces dormantes v1 (ADR-016 §4, Lambda C) — seule la logique de
// décision est testée ici (resolveDormantTip, fonction pure). Le hook lui-
// même orchestre persistance + timers (comme useFirstRun/breatheInvitation)
// et reste couvert visuellement par le câblage TimerScreen/AsideZone.
import { resolveDormantTip } from '../../src/hooks/useDormantTips';

// ritualsRow déjà montrée dans ce fixture de base : isole les scénarios
// palettes/focus historiques (inchangés) de la nouvelle astuce sans seuil
// (mandat W, P1-8) — sinon elle gagnerait systématiquement la priorité.
const base = {
  completedSessions: 0,
  hasOpenedPalettes: false,
  hasTriedFocus: false,
  hadLongSession: false,
  isCompleted: false,
  shownFlags: { palettes: false, focus: false, ritualsRow: true },
};

describe('resolveDormantTip (ADR-016 §4)', () => {
  test('aucune astuce en dessous du seuil des deux fonctions', () => {
    expect(resolveDormantTip({ ...base, completedSessions: 2 })).toBeNull();
    // Seuil focus abaissé à 3 (composé, cf. describe dédié plus bas) — sous
    // 3 séances ET sans séance longue, palettes ouvertes n'ouvre la voie à
    // aucune des deux astuces.
    expect(resolveDormantTip({ ...base, completedSessions: 2, hasOpenedPalettes: true })).toBeNull();
  });

  test('astuce palettes dès 3 séances si les palettes n\'ont jamais été ouvertes', () => {
    expect(resolveDormantTip({ ...base, completedSessions: 3 })).toBe('palettes');
  });

  test('jamais l\'astuce palettes une fois les palettes ouvertes', () => {
    // hasTriedFocus:true isole du seuil focus composé (désormais 3 aussi,
    // cf. FOCUS_SESSION_THRESHOLD) — sans lui, l'astuce focus prendrait
    // légitimement le relai à 3 séances et ferait échouer cette assertion
    // pour la mauvaise raison.
    expect(
      resolveDormantTip({ ...base, completedSessions: 3, hasOpenedPalettes: true, hasTriedFocus: true })
    ).toBeNull();
  });

  test('jamais l\'astuce palettes une deuxième fois — une astuce, pas une campagne', () => {
    expect(
      resolveDormantTip({
        ...base,
        completedSessions: 10,
        hasTriedFocus: true,
        shownFlags: { palettes: true, focus: false, ritualsRow: true },
      })
    ).toBeNull();
  });

  test('astuce focus dès 3 séances (seuil composé) si le focus n\'a jamais été essayé, palettes déjà réglées', () => {
    expect(
      resolveDormantTip({
        ...base,
        completedSessions: 3,
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
        shownFlags: { palettes: false, focus: true, ritualsRow: true },
      })
    ).toBeNull();
  });

  test('tolère completedSessions non défini (état de chargement)', () => {
    expect(resolveDormantTip({ ...base, completedSessions: undefined })).toBeNull();
  });

  describe('rangée favoris — seuil composé Focus (P2-Focus, réponses §4 CD validées)', () => {
    test('astuce rangée favoris dès que non montrée et pas en état complété — aucun seuil de séances', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 0,
          shownFlags: { palettes: false, focus: false, ritualsRow: false },
        })
      ).toBe('ritualsRow');
    });

    test('jamais l\'astuce rangée favoris pendant l\'état complété — évite la double voix avec « garde ce moment ? »', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 0,
          isCompleted: true,
          shownFlags: { palettes: false, focus: false, ritualsRow: false },
        })
      ).toBeNull();
    });

    test('jamais l\'astuce rangée favoris une deuxième fois', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 0,
          shownFlags: { palettes: false, focus: false, ritualsRow: true },
        })
      ).toBeNull();
    });

    test('astuce focus au 3e Moment accompli, sans séance longue', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 3,
          hasOpenedPalettes: true, // isole du branchement palettes
        })
      ).toBe('focus');
    });

    test('astuce focus dès la 1re séance si elle est accomplie ≥ 30 min', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 1,
          hasOpenedPalettes: true,
          hadLongSession: true,
        })
      ).toBe('focus');
    });

    test('jamais l\'astuce focus (ni aucune) pendant l\'état complété, même séance longue à la 1re — évite la collision avec « garde ce moment ? »', () => {
      // La collision réelle qui a motivé ce garde : 1re séance >= 30 min,
      // complétion naturelle — `keepMoment` (completedSessions === 1) parle
      // DÉJÀ sur la ligne de fin au même instant. Sans le garde `isCompleted`
      // en tête de resolveDormantTip, `focus` se serait résolu ici (seuil
      // composé atteint via hadLongSession) — deux voix à la fois.
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 1,
          hasOpenedPalettes: true,
          hadLongSession: true,
          isCompleted: true,
          shownFlags: { palettes: false, focus: false, ritualsRow: true },
        })
      ).toBeNull();
    });

    test('pas d\'astuce focus avant le seuil composé — ni 3 séances, ni séance longue', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 2,
          hasOpenedPalettes: true,
          hadLongSession: false,
        })
      ).toBeNull();
    });

    test('jamais l\'astuce focus si déjà essayé, même avec une séance longue', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 1,
          hasOpenedPalettes: true,
          hadLongSession: true,
          hasTriedFocus: true,
        })
      ).toBeNull();
    });

    test('jamais l\'astuce focus si déjà montrée, même avec une séance longue', () => {
      expect(
        resolveDormantTip({
          ...base,
          completedSessions: 1,
          hasOpenedPalettes: true,
          hadLongSession: true,
          shownFlags: { palettes: false, focus: true, ritualsRow: true },
        })
      ).toBeNull();
    });
  });
});
