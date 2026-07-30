// __tests__/utils/breatheInvitation.test.js
// Lot 3b : décision d'affichage de l'invitation « fais-le faire respirer »
// (post-séance, jamais un mur) — seule logique pure du livrable 2, cf.
// src/utils/breatheInvitation.js.
import { shouldShowBreatheInvitation } from '../../src/utils/breatheInvitation';

const base = {
  isCompleted: true,
  isPremium: false,
  completedSessions: 2,
  hasSeenInvitation: false,
};

describe('shouldShowBreatheInvitation (Lot 3b)', () => {
  test('affiche quand toutes les conditions sont réunies', () => {
    expect(shouldShowBreatheInvitation(base)).toBe(true);
  });

  test('jamais tant que la séance n\'est pas terminée', () => {
    expect(shouldShowBreatheInvitation({ ...base, isCompleted: false })).toBe(false);
  });

  test('jamais pour un utilisateur Ambiances (premium)', () => {
    expect(shouldShowBreatheInvitation({ ...base, isPremium: true })).toBe(false);
  });

  test('jamais avant 2 séances terminées', () => {
    expect(shouldShowBreatheInvitation({ ...base, completedSessions: 1 })).toBe(false);
    expect(shouldShowBreatheInvitation({ ...base, completedSessions: 0 })).toBe(false);
  });

  test('exactement 2 séances suffit (borne)', () => {
    expect(shouldShowBreatheInvitation({ ...base, completedSessions: 2 })).toBe(true);
  });

  test('jamais une deuxième fois — une invitation, pas une campagne', () => {
    expect(shouldShowBreatheInvitation({ ...base, hasSeenInvitation: true })).toBe(false);
  });

  test('tolère completedSessions non défini (état de chargement)', () => {
    expect(shouldShowBreatheInvitation({ ...base, completedSessions: undefined })).toBe(false);
  });
});
