// src/hooks/useDormantTips.js
// Astuces dormantes v1 (ADR-016 §4, Lambda C) — héritage assumé des tips
// 2.0, sans le tour : une astuce ponctuelle se réveille UNE fois si une
// fonction n'a jamais été touchée. Une seule astuce active à la fois
// (priorité : palettes d'abord). Jamais pendant qu'un Moment tourne, jamais
// pendant la Première fois, jamais en immersion ni en Focus — ces gardes
// vivent CÔTÉ APPELANT (`enabled`), ce hook ne connaît ni `snapshot`, ni
// `immersed`, ni `isFocus`.
//
// Single-mount : ce hook n'est monté qu'UNE fois (TimerScreen). Les
// marqueurs « fonction touchée » doivent pourtant pouvoir être posés depuis
// ailleurs (AsideZone pour les palettes) — d'où les setters exposés
// (`markPalettesOpened`, `markFocusTried`) plutôt qu'un état lu localement à
// plusieurs endroits. Si ce hook devait un jour être monté à plusieurs
// endroits, ces marqueurs devraient migrer vers un contexte partagé (comme
// TimerConfigContext) pour rester synchronisés en RAM — inutile tant qu'il
// n'a qu'UN montage.
//
// Câblage retenu (mission Lambda C) : `markPalettesOpened` est appelé via
// une callback prop TimerScreen → AsideZone, PAS via une deuxième instance
// de `usePersistedState` sur la même clé côté AsideZone — ça évite la
// fenêtre de désynchronisation RAM entre deux instances (lecture au boot
// suivant seulement) que le brief mentionnait comme acceptable mais pas
// idéale.

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import { useSessionCount } from './useSessionCount';

const HAS_OPENED_PALETTES_KEY = '@ResetPulse:hasOpenedPalettes';
const HAS_TRIED_FOCUS_KEY = '@ResetPulse:hasTriedFocus';
const TIP_SHOWN_PALETTES_KEY = '@ResetPulse:tipShown.palettes';
const TIP_SHOWN_FOCUS_KEY = '@ResetPulse:tipShown.focus';

// Comme la pastille « surprends-moi » (hasSeenDistractionLabel, TimerScreen) :
// se dismisse au premier geste écran, ou après ce délai.
const DISMISS_DELAY_MS = 6000;

// Fonction pure : résout QUELLE astuce doit se montrer, sans savoir COMMENT
// (persistance, timers) — testable seule, cf. __tests__/hooks/useDormantTips.test.js.
export function resolveDormantTip({
  completedSessions,
  hasOpenedPalettes,
  hasTriedFocus,
  shownFlags,
}) {
  const sessions = completedSessions ?? 0;
  const shown = shownFlags ?? {};

  if (sessions >= 3 && !hasOpenedPalettes && !shown.palettes) {
    return 'palettes';
  }
  if (sessions >= 5 && !hasTriedFocus && !shown.focus) {
    return 'focus';
  }
  return null;
}

export function useDormantTips({ enabled = true } = {}) {
  const { completedSessions, isLoading: sessionCountLoading } = useSessionCount();

  const [hasOpenedPalettes, setHasOpenedPalettes, openedPalettesLoading] =
    usePersistedState(HAS_OPENED_PALETTES_KEY, false);
  const [hasTriedFocus, setHasTriedFocus, triedFocusLoading] =
    usePersistedState(HAS_TRIED_FOCUS_KEY, false);
  const [tipShownPalettes, setTipShownPalettes, shownPalettesLoading] =
    usePersistedState(TIP_SHOWN_PALETTES_KEY, false);
  const [tipShownFocus, setTipShownFocus, shownFocusLoading] =
    usePersistedState(TIP_SHOWN_FOCUS_KEY, false);

  const isLoading =
    sessionCountLoading ||
    openedPalettesLoading ||
    triedFocusLoading ||
    shownPalettesLoading ||
    shownFocusLoading;

  const [activeTip, setActiveTip] = useState(null);
  const dismissTimeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled || isLoading) {
      return undefined;
    }
    const resolved = resolveDormantTip({
      completedSessions,
      hasOpenedPalettes,
      hasTriedFocus,
      shownFlags: { palettes: tipShownPalettes, focus: tipShownFocus },
    });
    if (!resolved) {
      return undefined;
    }
    setActiveTip(resolved);
    // Marquée « montrée » dès l'AFFICHAGE (one-shot strict, comme la
    // pastille dé) — pas au dismiss : une astuce jamais lue ne se repropose
    // pas non plus. Ça fait naturellement retomber `resolveDormantTip` à
    // `null` au prochain passage de cet effet (pas besoin d'un verrou en ref).
    if (resolved === 'palettes') {
      setTipShownPalettes(true);
    } else if (resolved === 'focus') {
      setTipShownFocus(true);
    }
    dismissTimeoutRef.current = setTimeout(() => {
      setActiveTip(null);
      dismissTimeoutRef.current = null;
    }, DISMISS_DELAY_MS);
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
    };
    // Les setters de usePersistedState sont stables (useState) — pas
    // nécessaire de les lister dans les dépendances.
  }, [
    enabled,
    isLoading,
    completedSessions,
    hasOpenedPalettes,
    hasTriedFocus,
    tipShownPalettes,
    tipShownFocus,
  ]);

  const dismissActiveTip = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    setActiveTip(null);
  }, []);

  const markPalettesOpened = useCallback(() => {
    setHasOpenedPalettes(true);
  }, [setHasOpenedPalettes]);

  const markFocusTried = useCallback(() => {
    setHasTriedFocus(true);
  }, [setHasTriedFocus]);

  return {
    activeTip,
    dismissActiveTip,
    markPalettesOpened,
    markFocusTried,
  };
}

export default useDormantTips;
