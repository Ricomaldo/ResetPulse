// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';

const TimerOptionsContext = createContext(null);

export const TimerOptionsProvider = ({ children }) => {
  const theme = useTheme();

  // Timer display options
  const [clockwise, setClockwise] = useState(false);
  const [scaleMode, setScaleMode] = useState('60min'); // '60min' | 'full'
  const [currentColor, setCurrentColor] = useState(theme.colors.energy);

  const value = {
    // States
    clockwise,
    scaleMode,
    currentColor,

    // Actions
    setClockwise,
    setScaleMode,
    setCurrentColor
  };

  return (
    <TimerOptionsContext.Provider value={value}>
      {children}
    </TimerOptionsContext.Provider>
  );
};

export const useTimerOptions = () => {
  const context = useContext(TimerOptionsContext);
  if (!context) {
    throw new Error('useTimerOptions must be used within TimerOptionsProvider');
  }
  return context;
};