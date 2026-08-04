// src/hooks/useBorrowCoach.js
// La pédagogie du prêt (Lambda V, design 3a validé CC×CD — réponse au
// retour Eric « je ne comprends pas la contrainte couleur en free ») : le
// coach dit ce qui se passe, aux deux moments où ça se passe.
//
// Moment 1 — à l'EMPRUNT : un FREE applique une palette/un son Ambiances
// (PalettesPanel/SoundsPanel → notifyBorrowed) → une ligne coach, UNE fois
// par item. Stockage une-fois : UNE clé (`@ResetPulse:borrowShown`), un
// tableau JSON d'ids `palette.<key>` / `sound.<id>` — plus sobre qu'une
// clé AsyncStorage par item (une seule instance usePersistedState, pas de
// prolifération de clés). Jamais pour un premium, jamais quand `enabled`
// est faux (Moment qui tourne, Première fois, immersion, Focus — mêmes
// gardes que les astuces dormantes, côté appelant) : la notification est
// alors ABANDONNÉE sans poser le flag (une ligne jamais vue ne compte pas).
//
// Moment 2 — au RETOUR : les hooks de gating exposent la retombée du
// lancement (`returnedPalette`/`returnedSoundId`, cf. usePaletteGating /
// useSoundGating) ; ce hook l'affiche UNE fois l'écran posé (`enabled`),
// une seule ligne par lancement (palette d'abord, jamais de file
// d'attente — un ref verrouille par montage). Pas de flag persisté :
// chaque retombée future re-déclenche. La ligne entière est tappable côté
// écran (modale Ambiances + héros 2c) — c'est pourquoi handleScreenTouch
// ne dismisse QUE les messages d'emprunt : un dismiss au touchStart racine
// tuerait le press de la ligne de retour sous le doigt.
//
// Une seule voix coach à la fois : TimerScreen passe
// `enabled: … && !activeMessage` aux astuces dormantes (le prêt gagne,
// cf. resolveCoachChannel) — pas de refactor du système, une priorité.
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import { usePremiumStatus } from './usePremiumStatus';

const BORROW_SHOWN_KEY = '@ResetPulse:borrowShown';
// Même délai que les astuces dormantes (useDormantTips.DISMISS_DELAY_MS).
const DISMISS_DELAY_MS = 6000;

const borrowShownId = (kind, itemKey) => `${kind}.${itemKey}`;

// Fonction pure : l'emprunt de cet item mérite-t-il (encore) sa ligne ?
// Testable seule, cf. __tests__/hooks/useBorrowCoach.test.js.
export function resolveBorrowOnce({ isPremium, kind, itemKey, shownItems }) {
  if (isPremium) return false;
  if (kind !== 'palette' && kind !== 'sound') return false;
  if (!itemKey) return false;
  const shown = Array.isArray(shownItems) ? shownItems : [];
  return !shown.includes(borrowShownId(kind, itemKey));
}

// Fonction pure : quelle ligne de retour au lancement — une seule, la
// palette d'abord (même priorité que les astuces dormantes), jamais de
// file d'attente (un son retombé le même lancement se tait).
export function resolveReturnMessage({ returnedPalette, returnedSoundId }) {
  if (returnedPalette) {
    return { type: 'paletteReturned', itemKey: returnedPalette };
  }
  if (returnedSoundId) {
    return { type: 'soundReturned', itemKey: returnedSoundId };
  }
  return null;
}

// Fonction pure : une seule voix coach à la fois — le prêt (contextuel à
// un geste ou à une retombée) prime sur l'astuce dormante.
export function resolveCoachChannel({ coachMessage, dormantTip }) {
  if (coachMessage) {
    return { kind: 'coach', message: coachMessage };
  }
  if (dormantTip) {
    return { kind: 'dormant', tip: dormantTip };
  }
  return null;
}

export function useBorrowCoach({ enabled = true, returnedPalette = null, returnedSoundId = null } = {}) {
  const { isPremium } = usePremiumStatus();
  const [shownItems, setShownItems, shownLoading] = usePersistedState(BORROW_SHOWN_KEY, []);

  // { type: 'borrowedPalette'|'borrowedSound'|'paletteReturned'|'soundReturned', itemKey }
  const [activeMessage, setActiveMessage] = useState(null);
  const dismissTimeoutRef = useRef(null);

  const clearDismissTimeout = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  };

  const showMessage = useCallback((message) => {
    clearDismissTimeout();
    setActiveMessage(message);
    dismissTimeoutRef.current = setTimeout(() => {
      setActiveMessage(null);
      dismissTimeoutRef.current = null;
    }, DISMISS_DELAY_MS);
  }, []);

  useEffect(() => () => clearDismissTimeout(), []);

  // Moment 1 — appelé par PalettesPanel/SoundsPanel (via AsideZone) au tap
  // qui applique un item Ambiances en FREE. kind: 'palette' | 'sound'.
  const notifyBorrowed = useCallback(
    (kind, itemKey) => {
      // enabled faux (séance en cours, etc.) ou persistance pas prête :
      // on abandonne SANS poser le flag — la prochaine fois comptera.
      if (!enabled || shownLoading) return;
      if (!resolveBorrowOnce({ isPremium, kind, itemKey, shownItems })) return;
      setShownItems((items) => {
        const list = Array.isArray(items) ? items : [];
        return [...list, borrowShownId(kind, itemKey)];
      });
      showMessage({
        type: kind === 'palette' ? 'borrowedPalette' : 'borrowedSound',
        itemKey,
      });
    },
    [enabled, shownLoading, isPremium, shownItems, setShownItems, showMessage]
  );

  // Moment 2 — la retombée du lancement, une seule ligne par montage.
  // L'état des gating survit tant que l'écran vit : si `enabled` est faux
  // au boot (Première fois, séance relancée…), la ligne attend l'accalmie.
  const hasShownReturnRef = useRef(false);
  useEffect(() => {
    if (!enabled || hasShownReturnRef.current) return;
    const returned = resolveReturnMessage({ returnedPalette, returnedSoundId });
    if (!returned) return;
    hasShownReturnRef.current = true;
    showMessage(returned);
  }, [enabled, returnedPalette, returnedSoundId, showMessage]);

  const dismissActiveMessage = useCallback(() => {
    clearDismissTimeout();
    setActiveMessage(null);
  }, []);

  // Geste écran (touchStart racine, comme les astuces dormantes) : ne
  // dismisse QUE l'emprunt — la ligne de retour est tappable, la faire
  // disparaître au premier contact annulerait son propre press.
  const handleScreenTouch = useCallback(() => {
    setActiveMessage((message) => {
      if (message && (message.type === 'borrowedPalette' || message.type === 'borrowedSound')) {
        clearDismissTimeout();
        return null;
      }
      return message;
    });
  }, []);

  return {
    activeMessage,
    notifyBorrowed,
    dismissActiveMessage,
    handleScreenTouch,
  };
}

export default useBorrowCoach;
