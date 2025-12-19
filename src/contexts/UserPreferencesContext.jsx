/**
 * @fileoverview User Preferences Context - Manages user settings and preferences
 * Including favorite tool selection for AsideZone Layer 1
 * @created 2025-12-19
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ResetPulse:favoriteToolMode';
const DEFAULT_FAVORITE_TOOL = 'commands'; // Options: activities, colors, commands, none

const UserPreferencesContext = createContext(null);

/**
 * UserPreferencesProvider - Manages user preferences with AsyncStorage persistence
 * @param {React.ReactNode} children - Components to wrap
 */
export function UserPreferencesProvider({ children }) {
  const [favoriteToolMode, setFavoriteToolModeState] = useState(DEFAULT_FAVORITE_TOOL);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFavoriteToolModeState(stored);
        }
      } catch {
        // Silently fail - use default
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreferences();
  }, []);

  // Wrapper to persist on change
  const setFavoriteToolMode = async (newMode) => {
    try {
      setFavoriteToolModeState(newMode);
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Silently fail
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        favoriteToolMode,
        setFavoriteToolMode,
        isLoaded,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

UserPreferencesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access user preferences
 * @returns {Object} { favoriteToolMode, setFavoriteToolMode, isLoaded }
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
