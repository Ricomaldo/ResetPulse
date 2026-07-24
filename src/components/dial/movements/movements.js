/**
 * @fileoverview movements - Registre des Mouvements MOT-a→e (Lot 3a)
 * @description Bibliothèque d'animation de l'emoji au centre du disque.
 * Correspondance spec (`_docs/specs/recentrage.md`, section « Mouvements ») :
 *   MOT-a Respire = breathe · MOT-b Tourne = spin · MOT-c Flotte = float
 *   MOT-d Rebond = bounce · MOT-e Bat = beat
 * Le choix libre du mouvement est parqué (Ambiances) — ici, un registre plat.
 */

export const MOVEMENTS = ['breathe', 'spin', 'float', 'bounce', 'beat'];

/**
 * Variantes par mouvement (retour Eric, Lot 3a) : chaque tirage du dé pioche
 * aussi une intensité — même MOT, effet différent, la surprise est double.
 * Les valeurs par défaut de l'ambiance (useEmojiMovement sans variant) ne
 * bougent pas : la variabilité appartient à la Distraction.
 */
export const MOVEMENT_VARIANTS = {
  breathe: [{ scale: 1.09 }, { scale: 1.14 }, { scale: 1.2 }],
  spin: [{ degrees: 90 }, { degrees: 180 }, { degrees: 270 }, { degrees: 360 }],
  float: [
    { rise: -10, fade: 0.6 },
    { rise: -14, fade: 0.3 },
    { rise: -18, fade: 0 }, // disparition totale — la « disparition fun » assumée
  ],
  bounce: [{ height: -9 }, { height: -13 }, { height: -17 }],
  beat: [
    { strong: 1.16, soft: 1.1 },
    { strong: 1.22, soft: 1.13 },
    { strong: 1.28, soft: 1.16 },
  ],
};

/**
 * Tire une variante pour un mouvement donné. Pure, `randomFn` injectable.
 * @param {string} movement - Membre de MOVEMENTS
 * @param {() => number} [randomFn] - Générateur [0,1) (défaut Math.random)
 * @returns {Object|null} Une variante du registre, ou null si mouvement inconnu
 */
export function pickVariant(movement, randomFn = Math.random) {
  const variants = MOVEMENT_VARIANTS[movement];
  if (!variants || variants.length === 0) {
    return null;
  }
  const index = Math.min(
    Math.floor(randomFn() * variants.length),
    variants.length - 1
  );
  return variants[index];
}

export default MOVEMENTS;
