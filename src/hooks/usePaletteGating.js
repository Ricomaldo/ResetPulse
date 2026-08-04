// src/hooks/usePaletteGating.js
// Soft-gating palettes (Lot 3b, mandat Eric — frontière gratuit/payant) :
// jamais de mur, mais mémoire du dernier inclus + retour au redémarrage.
// À monter UNE FOIS dans TimerScreen (TimerScreenContent, mount unique).
//
// Deux responsabilités :
// 1. Mémoire : à chaque fois que la palette active est gratuite, elle
//    devient le "dernier inclus" persisté — c'est là qu'on reviendra si
//    l'essai Ambiances (palette premium appliquée en FREE, cf.
//    PalettesPanel) s'arrête.
// 2. Retour au lancement : une seule fois par montage, une fois le statut
//    premium ET les deux persistances (config + dernier inclus) résolus —
//    si FREE et que la palette active est Ambiances, on repasse au dernier
//    inclus (ou 'serenity'). Un ref verrouille la décision, jamais de
//    boucle ni de re-déclenchement au fil des re-renders.
//
// Lambda V (pédagogie du prêt) : le hook EXPOSE la retombée quand elle a
// lieu — `returnedPalette` = la clé de la palette Ambiances qui vient de
// rentrer chez elle au lancement (null sinon). Posé au même instant que le
// retour (le ref de verrouillage garantit déjà l'unicité par montage) ;
// resolvePaletteOnLaunch reste pure, aucune logique de décision ajoutée.
import { useEffect, useRef, useState } from 'react';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { usePremiumStatus } from './usePremiumStatus';
import { usePersistedState } from './usePersistedState';
import { isPalettePremium, resolvePaletteOnLaunch } from '../config/timer-palettes';

const LAST_INCLUDED_KEY = '@ResetPulse:lastIncludedPalette';

export function usePaletteGating() {
  const {
    palette: { currentPalette },
    setPalette,
    transient: { isLoading: isConfigLoading },
  } = useTimerConfig();
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();
  const [lastIncludedPalette, setLastIncludedPalette, isPersistLoading] = usePersistedState(
    LAST_INCLUDED_KEY,
    null
  );

  // Les deux sources doivent avoir fini de charger avant qu'on touche à
  // quoi que ce soit — sinon on écrirait/déciderait sur la valeur par
  // défaut (avant que le vrai état persisté n'arrive), pattern famille
  // « course entre deux instances d'un état persisté ».
  const isReady = !isConfigLoading && !isPersistLoading;

  useEffect(() => {
    if (!isReady) return;
    if (!isPalettePremium(currentPalette) && currentPalette !== lastIncludedPalette) {
      setLastIncludedPalette(currentPalette);
    }
  }, [isReady, currentPalette, lastIncludedPalette, setLastIncludedPalette]);

  // Retombée exposée (Lambda V) : la palette empruntée qui vient de rentrer.
  const [returnedPalette, setReturnedPalette] = useState(null);

  const hasResolvedLaunchRef = useRef(false);
  useEffect(() => {
    if (hasResolvedLaunchRef.current) return;
    if (isPremiumLoading || !isReady) return;

    hasResolvedLaunchRef.current = true;
    const target = resolvePaletteOnLaunch(isPremium, currentPalette, lastIncludedPalette);
    if (target !== currentPalette) {
      setPalette(target);
      setReturnedPalette(currentPalette);
    }
  }, [isPremium, isPremiumLoading, isReady, currentPalette, lastIncludedPalette, setPalette]);

  return { returnedPalette };
}

export default usePaletteGating;
