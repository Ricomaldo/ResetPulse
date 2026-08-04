// src/hooks/useSoundGating.js
// Soft-gating sons (Lambda L, mandat Eric — miroir de usePaletteGating.js,
// même grammaire « essai libre » qu'ADR-017 §6, appliquée aux sons) :
// jamais de mur, mais mémoire du dernier inclus + retour au redémarrage.
// À monter UNE FOIS dans TimerScreen (TimerScreenContent, mount unique) —
// hook séparé de usePaletteGating (ne pas fusionner, mandat explicite) :
// même mécanique, deux domaines indépendants (palette ≠ son).
//
// Deux responsabilités :
// 1. Mémoire : à chaque fois que le son actif est inclus, il devient le
//    "dernier inclus" persisté — c'est là qu'on reviendra si l'essai
//    Ambiances (son premium sélectionné en FREE, cf. SoundsPanel) s'arrête.
// 2. Retour au lancement : une seule fois par montage, une fois le statut
//    premium ET les deux persistances (config + dernier inclus) résolus —
//    si FREE et que le son actif est Ambiances, on repasse au dernier
//    inclus (ou DEFAULT_SOUND_ID). Un ref verrouille la décision, jamais de
//    boucle ni de re-déclenchement au fil des re-renders.
//
// Lambda V (pédagogie du prêt) : le hook EXPOSE la retombée quand elle a
// lieu — `returnedSoundId` = l'id du son Ambiances qui vient de rentrer
// chez lui au lancement (null sinon). Posé au même instant que le retour
// (le ref de verrouillage garantit déjà l'unicité par montage) ;
// resolveSoundOnLaunch reste pure, aucune logique de décision ajoutée.
import { useEffect, useRef, useState } from 'react';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { usePremiumStatus } from './usePremiumStatus';
import { usePersistedState } from './usePersistedState';
import { isSoundPremium, resolveSoundOnLaunch } from '../config/sounds';

const LAST_INCLUDED_KEY = '@ResetPulse:lastIncludedSound';

export function useSoundGating() {
  const {
    timer: { selectedSoundId },
    setSelectedSoundId,
    transient: { isLoading: isConfigLoading },
  } = useTimerConfig();
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();
  const [lastIncludedSoundId, setLastIncludedSoundId, isPersistLoading] = usePersistedState(
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
    if (!isSoundPremium(selectedSoundId) && selectedSoundId !== lastIncludedSoundId) {
      setLastIncludedSoundId(selectedSoundId);
    }
  }, [isReady, selectedSoundId, lastIncludedSoundId, setLastIncludedSoundId]);

  // Retombée exposée (Lambda V) : le son emprunté qui vient de rentrer.
  const [returnedSoundId, setReturnedSoundId] = useState(null);

  const hasResolvedLaunchRef = useRef(false);
  useEffect(() => {
    if (hasResolvedLaunchRef.current) return;
    if (isPremiumLoading || !isReady) return;

    hasResolvedLaunchRef.current = true;
    const target = resolveSoundOnLaunch(isPremium, selectedSoundId, lastIncludedSoundId);
    if (target !== selectedSoundId) {
      setSelectedSoundId(target);
      setReturnedSoundId(selectedSoundId);
    }
  }, [isPremium, isPremiumLoading, isReady, selectedSoundId, lastIncludedSoundId, setSelectedSoundId]);

  return { returnedSoundId };
}

export default useSoundGating;
