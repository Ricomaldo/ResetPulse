// src/hooks/useCustomActivities.js
// Depuis porte-3 (bug emoji custom) : l'état vit dans un contexte PARTAGÉ
// (CustomActivitiesContext) — chaque appel de ce hook lisait auparavant sa
// propre instance persistée, et les instances ne se parlaient pas (RitualForm
// créait l'activité, la liste des rituels ne la voyait jamais). Ce fichier
// n'est plus qu'un re-export : l'API des consommateurs est inchangée.

export { useCustomActivities } from '../contexts/CustomActivitiesContext';
export { useCustomActivities as default } from '../contexts/CustomActivitiesContext';
