// src/contexts/SessionCountContext.jsx
// Compteur PARTAGÉ de séances terminées (Lot 3b, mandat Eric).
//
// Calqué sur CustomActivitiesContext (porte-3) : le compteur est incrémenté
// à un endroit (TimerScreen, fin naturelle de séance) et lu ailleurs (Lot 3,
// écrans à venir) — pattern famille « deux instances d'un état persisté qui
// ne se parlent pas » si on avait laissé chaque consommateur appeler
// usePersistedState directement. Une seule instance vit ici.

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { usePersistedState } from '../hooks/usePersistedState';

const STORAGE_KEY = '@ResetPulse:completedSessions';

const SessionCountContext = createContext(null);

export function SessionCountProvider({ children }) {
  const [completedSessions, setCompletedSessions, isLoading] = usePersistedState(
    STORAGE_KEY,
    0
  );

  const incrementSessionCount = useCallback(() => {
    setCompletedSessions((prev) => prev + 1);
  }, [setCompletedSessions]);

  // DevFab (Lambda C, 3.0 minimaliste) : remet le compteur à zéro — utilisé
  // par « Rejouer la découverte » et « Vanilla ». Le contexte ne remonte pas
  // avec AppContent (il vit au-dessus, dans App.js) donc effacer la clé
  // AsyncStorage seule ne suffit pas ; ce setter donne l'effet immédiat.
  const resetSessionCount = useCallback(() => {
    setCompletedSessions(0);
  }, [setCompletedSessions]);

  const value = useMemo(() => ({
    completedSessions,
    incrementSessionCount,
    resetSessionCount,
    isLoading,
  }), [completedSessions, incrementSessionCount, resetSessionCount, isLoading]);

  return (
    <SessionCountContext.Provider value={value}>
      {children}
    </SessionCountContext.Provider>
  );
}

SessionCountProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSessionCount = () => {
  const context = useContext(SessionCountContext);
  if (!context) {
    throw new Error('useSessionCount must be used within SessionCountProvider');
  }
  return context;
};
