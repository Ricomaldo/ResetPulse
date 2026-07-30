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

export default shouldShowBreatheInvitation;
