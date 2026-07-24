/**
 * @fileoverview pickDistraction - Tirage MOT-f (Lot 3a)
 * @description Fonction pure : tire un Mouvement au hasard parmi MOVEMENTS,
 * jamais deux fois le même d'affilée (spec SCR-15, tirage A). `randomFn` est
 * injectable pour les tests (déterminisme sans mocker Math.random globalement).
 */

import { MOVEMENTS } from './movements';

/**
 * @param {string|null} lastMovement - Dernier mouvement affiché (ou null au premier tirage)
 * @param {() => number} [randomFn] - Générateur [0,1) injectable (défaut Math.random)
 * @returns {string} Un mouvement de MOVEMENTS, distinct de lastMovement s'il est fourni
 */
export function pickDistraction(lastMovement, randomFn = Math.random) {
  const pool = lastMovement
    ? MOVEMENTS.filter((movement) => movement !== lastMovement)
    : MOVEMENTS;

  const index = Math.floor(randomFn() * pool.length);
  // Garde-fou : un randomFn injecté qui renverrait exactement 1 (hors contrat
  // Math.random, [0,1)) ne doit jamais faire déborder l'index.
  const safeIndex = Math.min(index, pool.length - 1);

  return pool[safeIndex];
}

export default pickDistraction;
