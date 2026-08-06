// src/utils/breatheInvitation.js
// Lot 3b (frontière gratuit/payant) : décision d'affichage de l'invitation
// « fais-le respirer » — extraite en fonction pure pour rester testable sans
// monter TimerScreen. Jamais de mur : la fonction ne fait que dire si le
// MOMENT est le bon, pas ce qui se passe ensuite (tracking/flag/push modale
// vivent dans l'écran).
export function shouldShowBreatheInvitation({
  isCompleted,
  isPremium,
  completedSessions,
  hasSeenInvitation,
}) {
  return (
    Boolean(isCompleted) &&
    !isPremium &&
    (completedSessions ?? 0) >= 2 &&
    !hasSeenInvitation
  );
}

// Gate isLoading (audit fiabilité 06/08, décision Eric 07/08 « rien plutôt
// que skeleton ») : cette invitation se décide dans un effet à
// déclenchement UNIQUE (ref verrouillée côté TimerScreen + flag persisté
// `hasSeenBreatheInvitation`) — une décision prise sur `isPremium=false`
// pendant l'init RevenueCat (avant confirmation du statut réel) ne se
// corrige JAMAIS, contrairement aux surfaces qui se re-rendent à chaque
// changement d'état. Extraite en fonction pure (comme shouldShowBreatheInvitation
// ci-dessus) pour rester testable sans monter TimerScreen.
export function shouldEvaluateBreatheInvitation({
  sessionCountLoading,
  breatheInvitationLoading,
  isPremiumLoading,
}) {
  return !sessionCountLoading && !breatheInvitationLoading && !isPremiumLoading;
}

export default shouldShowBreatheInvitation;
