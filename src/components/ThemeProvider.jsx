// src/components/ThemeProvider.js
import React, { createContext, useContext } from 'react';
import { theme } from '../styles/theme';

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Helper hook for responsive styles
export const useResponsiveStyle = (styles) => {
  const { device } = useTheme();
  return styles[device.size] || styles.medium || styles;
};