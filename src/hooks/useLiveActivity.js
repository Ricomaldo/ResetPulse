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
//   ⚠️ Ce redémarrage repart du temps RESTANT (`remainingRef.current`), pas
//   de `duration` (bug constaté sur device par Eric, mission 3d) : sinon
//   l'anneau natif revient à la durée pleine alors que la séance app est
//   déjà entamée, et l'écran verrouillé se désynchronise de l'app. Si le
//   restant est absent/0/négatif à l'instant du redémarrage, on ne
//   redémarre pas — end(false) seul (un anneau absent vaut mieux qu'un
//   anneau faux).
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
 * @param {number} params.duration - currentDuration en secondes (durée pleine de la séance) —
 *   utilisée UNIQUEMENT au démarrage initial (repos → running), où restant == durée.
 * @param {number} params.remaining - snapshot.remaining (useTimer, via TimerScreen) — secondes
 *   restantes, vivantes (tick chaque seconde en running). Lue via `remainingRef` au moment du
 *   redémarrage débouncé, JAMAIS mise en dep d'effet (voir remainingRef ci-dessous).
 * @param {string} params.colorHex - currentColor (hex) — couleur de la séance
 * @param {string} params.emoji - currentActivity?.emoji — emoji compagnon
 * @param {boolean} params.clockwise - timer.clockwise (TimerConfigContext) —
 *   sens de rotation du disque app, à répercuter sur l'anneau natif
 */
export function useLiveActivity({ running, isCompleted, duration, remaining, colorHex, emoji, clockwise }) {
  const prevRunningRef = useRef(false);
  const activeRef = useRef(false); // une Activité est-elle censée vivre côté natif ?

  // `remaining` tique chaque seconde pendant running : s'il entrait dans les
  // deps de l'effet ci-dessous, le debounce du redémarrage serait réarmé à
  // chaque tick et ne se déclencherait jamais (setTimeout annulé en boucle
  // par le cleanup). Le ref se met à jour à CHAQUE render sans faire partie
  // des deps — l'effet le lit seulement au moment où il redémarre
  // effectivement l'Activity, sans jamais se relancer pour lui.
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

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
            // Repart du restant vivant au moment du redémarrage (pas de
            // `duration`, cf. entête) — lu via le ref pour ne pas dépendre
            // de `remaining` dans les deps de l'effet.
            const remainingNow = remainingRef.current;
            if (!(remainingNow > 0)) {
              // Restant absent/0/négatif : pas de redémarrage, l'anneau
              // reste retiré plutôt que de mentir sur le temps restant.
              return;
            }
            startLiveActivity(colorHex, emoji, remainingNow, clockwise).catch((error) => {
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
