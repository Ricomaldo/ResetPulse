// src/hooks/useRituals.js
// Store des Rituels (ADR-015) — l'état vit désormais dans un contexte
// PARTAGÉ (RitualsContext) — chaque appel de ce hook lisait auparavant sa
// propre instance persistée, et les instances ne se parlaient pas (« garde
// ce moment ? » mettait à jour un rituel, la rangée d'accueil ne le voyait
// jamais). Ce fichier n'est plus qu'un re-export : l'API des consommateurs
// est inchangée.

export { useRituals } from '../contexts/RitualsContext';
export { useRituals as default } from '../contexts/RitualsContext';
