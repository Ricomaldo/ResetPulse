// src/hooks/useLiveActivity.js
// Hook OBSERVATEUR du cycle de vie du Moment — mission 3d (Live Activity,
// écran verrouillé + Dynamic Island). Ne touche JAMAIS à useTimer (ADR-007,
// sacré) : il lit l'état déjà exposé par TimerScreen (running/isCompleted/
// duration/couleur/emoji) et pilote le pont natif modules/timer-activity.
// Zéro état neuf, zéro re-render ajouté — que des effets.
//
// Stratégie (architecture ratifiée Eric, cf. mission 3d) :
// - RUNNING (repos → séance) : start(colorHex, emoji, duration). Les dates
//   startDate/endDate FIXES sont calculées côté Swift à cet instant précis
//   (now + duration) — le système anime seul le décompte, zéro update
//   depuis ici (principe ratifié : décompte animé PAR LE SYSTÈME).
// - Complétion naturelle (running: true→false ET isCompleted vaut true dans
//   ce même snapshot — useTimer bascule les deux ensemble, cf.
//   useTimer.js:96-103) : end(true) — l'écran « accompli ✨ » natif gère sa
//   propre disparition (dismissalPolicy .after côté Swift).
// - Rembobinage (running: true→false, isCompleted resté false — tap pendant
//   la séance, cf. useTimer.js:stopTimer) : end(false), retrait immédiat.
// - Changement durée/couleur/emoji/sens PENDANT running (drag du disque, tap
//   sur un rituel ou une couleur, toggle clockwise du sheet) : le module
//   n'expose pas d'API "update" (on ne l'invente pas, cf. mandat) →
//   end(false) + start(nouveaux paramètres). Débouncé (DRAG_DEBOUNCE_MS),
//   via le cleanup naturel de
//   l'effet : le drag fait changer `currentDuration` en continu, à la
//   cadence du geste (TimerDial.jsx — `onGraduationTap` appelé à chaque
//   mouvement, pas seulement au relâchement) ; redémarrer l'Activity à
//   cette cadence spammerait ActivityKit pour rien. Seule la valeur
//   stabilisée déclenche le redémarrage.
// - Démontage du composant / app tuée : rien de spécial — les dates fixes
//   sont le principe même de la mission, la Live Activity vit sa vie sans
//   JS. Seul un redémarrage en attente est annulé par le cleanup d'effet
//   (n'a pas à survivre au démontage de l'écran qui le porte).

import { useEffect, useRef } from 'react';
import { isLiveActivitySupported, startLiveActivity, endLiveActivity } from '../../modules/timer-activity';
import logger from '../utils/logger';

// Le module lui-même n'attend/relance jamais (index.js avale ses propres
// erreurs et ne rejette jamais) — les .catch ci-dessous sont une défense en
// profondeur, pas une réaction à un cas observé aujourd'hui.
export const DRAG_DEBOUNCE_MS = 500;

/**
 * @param {Object} params
 * @param {boolean} params.running - snapshot.running (useTimer, via TimerScreen)
 * @param {boolean} params.isCompleted - snapshot.isCompleted (useTimer, via TimerScreen)
 * @param {number} params.duration - currentDuration en secondes (durée pleine de la séance)
 * @param {string} params.colorHex - currentColor (hex) — couleur de la séance
 * @param {string} params.emoji - currentActivity?.emoji — emoji compagnon
 * @param {boolean} params.clockwise - timer.clockwise (TimerConfigContext) —
 *   sens de rotation du disque app, à répercuter sur l'anneau natif
 */
export function useLiveActivity({ running, isCompleted, duration, colorHex, emoji, clockwise }) {
  const prevRunningRef = useRef(false);
  const activeRef = useRef(false); // une Activité est-elle censée vivre côté natif ?

  useEffect(() => {
    const wasRunning = prevRunningRef.current;
    prevRunningRef.current = running;

    // Transition repos → séance : démarrage direct, jamais débouncé.
    if (running && !wasRunning) {
      if (!isLiveActivitySupported()) {
        return undefined;
      }
      activeRef.current = true;
      startLiveActivity(colorHex, emoji, duration, clockwise).catch((error) => {
        logger.warn('useLiveActivity: start() a échoué', error);
      });
      return undefined;
    }

    // Transition séance → repos : fin — accompli (true) ou rembobinage
    // (false), selon `isCompleted` au même instant (voir entête).
    if (!running && wasRunning) {
      if (activeRef.current) {
        activeRef.current = false;
        endLiveActivity(isCompleted).catch((error) => {
          logger.warn('useLiveActivity: end() a échoué', error);
        });
      }
      return undefined;
    }

    // Toujours en séance, mais durée/couleur/emoji ont bougé (drag, tap
    // couleur/rituel) : pas d'API "update" côté module → redémarrage
    // débouncé (end puis start avec les valeurs stabilisées). Le cleanup
    // ci-dessous annule ce timeout si une valeur plus récente arrive avant
    // qu'il ne se déclenche — c'est le debounce.
    if (running && wasRunning && activeRef.current) {
      const timeoutId = setTimeout(() => {
        endLiveActivity(false)
          .catch((error) => {
            logger.warn('useLiveActivity: end() (redémarrage) a échoué', error);
          })
          .finally(() => {
            startLiveActivity(colorHex, emoji, duration, clockwise).catch((error) => {
              logger.warn('useLiveActivity: start() (redémarrage) a échoué', error);
            });
          });
      }, DRAG_DEBOUNCE_MS);
      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [running, isCompleted, duration, colorHex, emoji, clockwise]);
}

export default useLiveActivity;
