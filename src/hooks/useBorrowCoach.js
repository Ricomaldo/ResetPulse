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
// L'emprunt se fait forcément DANS le sheet (Palettes/Sons), lui-même
// ouvert par-dessus TimerScreen — la ligne posée immédiatement se serait
// consumée derrière le sheet, invisible (bug QA visuelle #5, bug 2). Le
// moment 1 se DIFFÈRE donc jusqu'à la fermeture : `sheetOpen` (remonté par
// TimerScreen, cf. AsideZone `onOpenChange`) fait de `notifyBorrowed` un
// simple ARMEMENT (`pendingBorrowRef`, pas de flag posé) tant que le sheet
// est ouvert ; la transition ouvert→fermé rejoue l'emprunt en attente et
// SEULEMENT LÀ pose le flag + montre la pill. Pas de file : un second
// emprunt avant fermeture remplace le premier en attente (une ligne max
// par lancement, cohérent avec le reste de Lambda V). Une relance de l'app
// avant fermeture perd l'attente SANS poser le flag — l'item redeviendra
// éligible au prochain emprunt (accepté, documenté aux tests).
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

// Fonction pure (bug QA visuelle #5, bug 2) : que fait `notifyBorrowed` de
// cet appel ? 'ignore' (gardes habituelles — pas de flag, cf.
// resolveBorrowOnce/enabled) ; 'pending' (sheet ouvert — on ARME sans poser
// le flag, la ligne attend la fermeture) ; 'show' (sheet déjà fermé — cas
// théorique dans le câblage actuel, l'emprunt se fait toujours dans le
// sheet, mais le hook reste correct si un futur appelant notifie hors
// sheet).
export function resolveNotifyBorrowedAction({
  enabled,
  shownLoading,
  sheetOpen,
  isPremium,
  kind,
  itemKey,
  shownItems,
}) {
  if (!enabled || shownLoading) return 'ignore';
  if (!resolveBorrowOnce({ isPremium, kind, itemKey, shownItems })) return 'ignore';
  return sheetOpen ? 'pending' : 'show';
}

// Fonction pure : le sheet vient de se fermer (transition ouvert→fermé,
// PAS un montage à `sheetOpen: false`) — l'emprunt en attente doit-il
// devenir la ligne coach ? Re-valide `resolveBorrowOnce` : l'état (premium,
// flag déjà posé par un autre chemin) a pu changer pendant que le sheet
// était ouvert. Retourne l'emprunt à committer, ou null.
export function resolveSheetClosedBorrow({
  wasOpen,
  sheetOpen,
  pending,
  enabled,
  shownLoading,
  isPremium,
  shownItems,
}) {
  if (!wasOpen || sheetOpen) return null;
  if (!pending) return null;
  if (!enabled || shownLoading) return null;
  if (!resolveBorrowOnce({ isPremium, kind: pending.kind, itemKey: pending.itemKey, shownItems })) {
    return null;
  }
  return pending;
}

export function useBorrowCoach({
  enabled = true,
  sheetOpen = false,
  returnedPalette = null,
  returnedSoundId = null,
} = {}) {
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

  // Pose le flag + montre la pill — le geste réel du moment 1, qu'il soit
  // immédiat (sheet déjà fermé, cas théorique) ou rejoué à la fermeture.
  const commitBorrow = useCallback(
    (kind, itemKey) => {
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
    [isPremium, shownItems, setShownItems, showMessage]
  );

  // Emprunt en attente de la fermeture du sheet — pas de file (`pas de
  // file d'attente`, cf. commentaire d'en-tête) : un second emprunt avant
  // fermeture écrase le premier.
  const pendingBorrowRef = useRef(null);

  // Moment 1 — appelé par PalettesPanel/SoundsPanel (via AsideZone) au tap
  // qui applique un item Ambiances en FREE. kind: 'palette' | 'sound'.
  const notifyBorrowed = useCallback(
    (kind, itemKey) => {
      const action = resolveNotifyBorrowedAction({
        enabled,
        shownLoading,
        sheetOpen,
        isPremium,
        kind,
        itemKey,
        shownItems,
      });
      if (action === 'ignore') return;
      if (action === 'pending') {
        // Le sheet est ouvert (c'est là que l'emprunt se fait) : on ARME
        // seulement, sans poser le flag — la ligne attend la fermeture.
        pendingBorrowRef.current = { kind, itemKey };
        return;
      }
      commitBorrow(kind, itemKey);
    },
    [enabled, shownLoading, sheetOpen, isPremium, shownItems, commitBorrow]
  );

  // Fermeture du sheet : l'emprunt en attente, s'il y en a un, devient la
  // ligne coach — `resolveSheetClosedBorrow` isole la décision (testable
  // seule, cf. __tests__/hooks/useBorrowCoach.test.js).
  const wasSheetOpenRef = useRef(sheetOpen);
  useEffect(() => {
    const wasOpen = wasSheetOpenRef.current;
    wasSheetOpenRef.current = sheetOpen;
    if (!wasOpen || sheetOpen) return;
    const pending = pendingBorrowRef.current;
    pendingBorrowRef.current = null;
    const toCommit = resolveSheetClosedBorrow({
      wasOpen,
      sheetOpen,
      pending,
      enabled,
      shownLoading,
      isPremium,
      shownItems,
    });
    if (toCommit) {
      commitBorrow(toCommit.kind, toCommit.itemKey);
    }
  }, [sheetOpen, enabled, shownLoading, isPremium, shownItems, commitBorrow]);

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
