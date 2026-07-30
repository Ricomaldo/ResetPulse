// src/hooks/useSessionImmersion.js
// Machine d'état de l'immersion — Cadrage 3c (immersion automatique, Q1/Q2).
// Pure logique, sans dépendance React Native : observe `running`/`isCompleted`
// (snapshot useTimer, ADR-007) et pilote `immersed`. Ne touche JAMAIS au
// timer — c'est un observateur, pas un acteur.

import { useCallback, useEffect, useRef, useState } from 'react';

// Séance RUNNING + ce délai sans AUCUN toucher → le chrome s'efface (le
// disque devient décor). Réglable ici — cadrage 3c Q1.
export const IMMERSION_DELAY = 10000;

/**
 * @param {Object} params
 * @param {boolean} params.running - snapshot.running (useTimer)
 * @param {boolean} params.isCompleted - snapshot.isCompleted (useTimer)
 * @param {number} [params.delay] - délai d'inactivité avant immersion (ms)
 * @returns {{ immersed: boolean, registerActivity: () => void }}
 *   `registerActivity` : à appeler sur TOUTE interaction (tap, drag, sheet,
 *   ou le tap consommé par l'overlay de sortie) — réarme le délai ET sort
 *   immédiatement de l'immersion si elle était active.
 */
export function useSessionImmersion({ running, isCompleted, delay = IMMERSION_DELAY }) {
  const [immersed, setImmersed] = useState(false);
  const timeoutRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setImmersed(true);
    }, delay);
  }, [clearTimer, delay]);

  // Séance RUNNING (et pas terminée) : (ré)arme le délai. Sinon (stop,
  // rembobinage, fin de séance) : sortie immédiate — le bloom et le message
  // de fin ne se jouent jamais dans le vide (Q2).
  useEffect(() => {
    if (running && !isCompleted) {
      arm();
    } else {
      clearTimer();
      setImmersed(false);
    }
    return clearTimer;
  }, [running, isCompleted, arm, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const registerActivity = useCallback(() => {
    setImmersed((wasImmersed) => (wasImmersed ? false : wasImmersed));
    if (running && !isCompleted) {
      arm();
    }
  }, [running, isCompleted, arm]);

  return { immersed, registerActivity };
}
