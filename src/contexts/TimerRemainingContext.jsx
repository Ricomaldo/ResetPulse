// src/contexts/TimerRemainingContext.jsx
/**
 * @fileoverview TimerRemainingContext — état transitoire haute fréquence
 * @description hotfix-porte-1 C4 : `timerRemaining` vivait dans le useMemo
 * géant de TimerConfigContext. `TimeTimer.jsx` l'écrit à ~60 Hz (une fois par
 * tick de `useTimer`, ADR-007) ; comme `timerRemaining` était une dépendance
 * du `value` mémoïsé de TimerConfigContext, CHAQUE tick reconstruisait cette
 * valeur et re-rendait tous les consommateurs de `useTimerConfig()` — cause
 * racine du gel du stepper/slider pendant qu'un timer tourne en fond (audit
 * hotfix-porte-1). Sorti dans un contexte dédié, minuscule, pour que seul le
 * (ou les) consommateur(s) réel(s) de `timerRemaining` re-rende(nt).
 * `useTimer` (noyau sacré ADR-007) est INTOUCHÉ — seul le setter change de
 * provenance côté TimeTimer.jsx.
 */
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const TimerRemainingContext = createContext(null);

export const TimerRemainingProvider = ({ children }) => {
  const [timerRemaining, setTimerRemaining] = useState(0);
  return (
    <TimerRemainingContext.Provider value={{ timerRemaining, setTimerRemaining }}>
      {children}
    </TimerRemainingContext.Provider>
  );
};

TimerRemainingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTimerRemaining = () => {
  const context = useContext(TimerRemainingContext);
  if (!context) {
    throw new Error('useTimerRemaining must be used within TimerRemainingProvider');
  }
  return context;
};
