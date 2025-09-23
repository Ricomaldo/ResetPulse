// src/hooks/usePersistedState.js
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook pour persister un état dans AsyncStorage
 * @param {string} key - Clé unique pour le stockage
 * @param {*} defaultValue - Valeur par défaut
 * @returns {Array} [value, setValue, isLoading]
 */
export function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Charger la valeur au montage
  useEffect(() => {
    const loadPersistedValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null && isMountedRef.current) {
          const parsed = JSON.parse(storedValue);
          setValue(parsed);
        }
      } catch (error) {
        console.warn(`Erreur lors du chargement de ${key}:`, error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadPersistedValue();

    return () => {
      isMountedRef.current = false;
    };
  }, [key]);

  // Sauvegarder quand la valeur change
  useEffect(() => {
    if (!isLoading) {
      const saveValue = async () => {
        try {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.warn(`Erreur lors de la sauvegarde de ${key}:`, error);
        }
      };

      saveValue();
    }
  }, [key, value, isLoading]);

  return [value, setValue, isLoading];
}

/**
 * Hook pour persister plusieurs états dans un seul objet
 * @param {string} key - Clé unique pour le stockage
 * @param {Object} defaultValues - Objet avec les valeurs par défaut
 * @returns {Object} {values, setValues, updateValue, isLoading}
 */
export function usePersistedObject(key, defaultValues) {
  const [values, setValues] = useState(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Charger les valeurs au montage
  useEffect(() => {
    const loadPersistedValues = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null && isMountedRef.current) {
          const parsed = JSON.parse(storedValue);
          // Merge avec les valeurs par défaut pour gérer les nouvelles propriétés
          setValues({ ...defaultValues, ...parsed });
        }
      } catch (error) {
        console.warn(`Erreur lors du chargement de ${key}:`, error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadPersistedValues();

    return () => {
      isMountedRef.current = false;
    };
  }, [key]);

  // Sauvegarder quand les valeurs changent
  useEffect(() => {
    if (!isLoading) {
      const saveValues = async () => {
        try {
          await AsyncStorage.setItem(key, JSON.stringify(values));
        } catch (error) {
          console.warn(`Erreur lors de la sauvegarde de ${key}:`, error);
        }
      };

      saveValues();
    }
  }, [key, values, isLoading]);

  // Fonction pour mettre à jour une valeur spécifique
  const updateValue = (field, newValue) => {
    setValues(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  return { values, setValues, updateValue, isLoading };
}