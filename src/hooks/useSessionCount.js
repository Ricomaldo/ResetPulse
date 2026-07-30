// src/hooks/useSessionCount.js
// Compteur de séances terminées — état PARTAGÉ (SessionCountContext, Lot 3b).
// Ce fichier n'est qu'un re-export : l'API des consommateurs est inchangée,
// cf. le même pattern pour useCustomActivities (porte-3).

export { useSessionCount } from '../contexts/SessionCountContext';
export { useSessionCount as default } from '../contexts/SessionCountContext';
