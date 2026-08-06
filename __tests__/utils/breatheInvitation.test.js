// __tests__/utils/breatheInvitation.test.js
// Lot 3b : décision d'affichage de l'invitation « fais-le faire respirer »
// (post-séance, jamais un mur) — seule logique pure du livrable 2, cf.
// src/utils/breatheInvitation.js.
import { shouldShowBreatheInvitation, shouldEvaluateBreatheInvitation } from '../../src/utils/breatheInvitation';

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

// Gate isLoading (audit fiabilité 06/08, décision Eric 07/08 « rien plutôt
// que skeleton ») : l'effet TimerScreen ne doit JAMAIS évaluer
// shouldShowBreatheInvitation tant que le statut premium n'est pas confirmé
// — un déclenchement à `isPremium=false` (défaut avant réponse RevenueCat)
// est permanent (ref verrouillée + flag persisté), il ne se corrige pas au
// re-render suivant comme le ferait un simple `!isPremium &&` de rendu.
describe('shouldEvaluateBreatheInvitation (gate isLoading, audit 06/08)', () => {
  const readyBase = {
    sessionCountLoading: false,
    breatheInvitationLoading: false,
    isPremiumLoading: false,
  };

  test('évalue seulement quand les trois sources ont fini de charger', () => {
    expect(shouldEvaluateBreatheInvitation(readyBase)).toBe(true);
  });

  test('jamais tant que le statut premium (RevenueCat) charge encore', () => {
    expect(shouldEvaluateBreatheInvitation({ ...readyBase, isPremiumLoading: true })).toBe(false);
  });

  test('jamais tant que le compte de séances charge encore', () => {
    expect(shouldEvaluateBreatheInvitation({ ...readyBase, sessionCountLoading: true })).toBe(false);
  });

  test('jamais tant que le flag persisté "déjà vue" charge encore', () => {
    expect(shouldEvaluateBreatheInvitation({ ...readyBase, breatheInvitationLoading: true })).toBe(false);
  });
});
