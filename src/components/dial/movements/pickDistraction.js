/**
 * @fileoverview pickDistraction - Tirage MOT-f (Lot 3a)
 * @description Fonction pure : tire un Mouvement au hasard parmi MOVEMENTS,
 * jamais deux fois le même d'affilée (spec SCR-15, tirage A). `randomFn` est
 * injectable pour les tests (déterminisme sans mocker Math.random globalement).
 */

import { MOVEMENTS } from './movements';

/**
 * @param {string|string[]|null} excluded - Mouvement(s) à écarter du tirage :
 * le dernier montré, mais aussi le mouvement AMBIANT (celui de l'activité en
 * séance, le pouls `breathe` au repos) — sinon le dé peut tirer l'animation
 * déjà affichée et le tap reste muet à l'écran (finding Lot 3a).
 * @param {() => number} [randomFn] - Générateur [0,1) injectable (défaut Math.random)
 * @returns {string} Un mouvement de MOVEMENTS hors exclusions
 */
export function pickDistraction(excluded, randomFn = Math.random) {
  const excludedList = Array.isArray(excluded) ? excluded : [excluded];
  const filtered = MOVEMENTS.filter((movement) => !excludedList.includes(movement));
  // Garde-fou : des exclusions qui videraient le pool (hors contrat — au plus
  // 3 exclusions distinctes sur 5 mouvements) retombent sur le tirage complet.
  const pool = filtered.length > 0 ? filtered : MOVEMENTS;

  const index = Math.floor(randomFn() * pool.length);
  // Garde-fou : un randomFn injecté qui renverrait exactement 1 (hors contrat
  // Math.random, [0,1)) ne doit jamais faire déborder l'index.
  const safeIndex = Math.min(index, pool.length - 1);

  return pool[safeIndex];
}

export default pickDistraction;
