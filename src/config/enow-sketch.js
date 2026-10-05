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

/** Opacité du fantôme de la cible (gris clair du thème, brand.neutral) — teintes Eric 21/09 :
 *  nombres et bordure en encre, poignée gris foncé, fantôme gris clair. */
export const ENOW_GHOST_OPACITY = 0.45;

/** Au lancement, durée à zéro : repos sans preset (retour Eric 21/09). */
export const ENOW_START_EMPTY = true;

/** Tap central = pause / reprise ; double tap = réinitialisation (retour Eric 21/09). */
export const ENOW_TAP_PAUSE = true;

/** Drag lent = durée fine à la seconde ; l'aimantage à la minute ne joue que sur un drag rapide. */
export const ENOW_FINE_DRAG = true;
/** Vitesse (minutes/s) à partir de laquelle le relâcher aimante à la minute. */
export const ENOW_SNAP_MIN_VELOCITY = 10;

// --- Build T3-2 : le cadran entier vaut la séance ---

/** Le cadran entier = la séance : l'arc monte de 0 au plein quelle que soit la durée, plus de fantôme. */
export const ENOW_SESSION_DIAL = true;

/** Poignée de durée et halo de drag rendus (false = invisibles, le pan reste câblé). */
export const ENOW_HANDLE = false;

/** Graduations et nombres du cadran rendus (false = cadran nu, bordure en encre). */
export const ENOW_GRADUATIONS = false;

/** Opacité de l'emoji fantôme du moyeu, derrière la couche en couleur traversée par le front. */
export const ENOW_HUB_GHOST_OPACITY = 0.3;
