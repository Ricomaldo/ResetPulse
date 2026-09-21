/**
 * @fileoverview Interrupteurs du SKETCH enow — temps 3, l'épreuve (arc enow).
 * @created 2026-09-21
 *
 * Ce fichier est JETABLE, comme le build qu'il configure. Il porte la seule
 * chose que le temps 3 change sur le cadran de la 3.0 :
 *   - le rendu s'inverse : l'arc part vide et SE REMPLIT pendant la séance
 *     (la cible réglée reste visible en fantôme) ;
 *   - l'échelle du cadran est VERROUILLÉE : plus d'auto-scale (ADR-011),
 *     un tour = ENOW_LOCKED_SCALE minutes.
 * Tout à false / null → comportement 3.0 intact.
 * Voir _cockpit/missions/active/arc-enow.md, « Temps 3 — la porte ».
 */

/** L'arc se remplit au lieu de se vider. */
export const ENOW_FILL_UP = true;

/** Échelle verrouillée en minutes (null = auto-scale 3.0). */
export const ENOW_LOCKED_SCALE = 60;

/** Opacité du fantôme de la cible (durée réglée) quand le rendu est inversé. */
export const ENOW_GHOST_OPACITY = 0.22;

/** Au lancement, durée à zéro : repos sans preset (retour Eric 21/09). */
export const ENOW_START_EMPTY = true;

/** Tap central = pause / reprise ; double tap = réinitialisation (retour Eric 21/09). */
export const ENOW_TAP_PAUSE = true;
