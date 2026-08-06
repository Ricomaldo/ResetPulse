// src/hooks/usePersistedState.js
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

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
          try {
            const parsed = JSON.parse(storedValue);
            setValue(parsed);
          } catch (parseError) {
            logger.warn(`JSON parse error for key "${key}"`, parseError.message);
            // Keep default value
          }
        }
      } catch (error) {
        logger.warn(`Failed to load key "${key}"`, error.message);
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
          logger.warn(`Failed to save key "${key}"`, error.message);
        }
      };

      saveValue();
    }
  }, [key, value, isLoading]);

  return [value, setValue, isLoading];
}

function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Merge récursif d'un objet stocké (AsyncStorage) sur des valeurs par
 * défaut, pour combler les champs MISSING (nouvelles clés ajoutées au
 * modèle depuis l'écriture du blob persisté) — classe distincte de la
 * garde-fossile shouldPulse (TimerConfigContext), qui traite les valeurs
 * INVALID, pas les champs absents. Les deux sont complémentaires : ce merge
 * ne touche jamais un champ présent dans `stored`, y compris à `false`.
 *
 * Règles :
 * - objets simples : récursif, `stored` gagne feuille par feuille : un
 *   champ présent dans `defaults` et ABSENT de `stored` est injecté.
 * - arrays et scalaires de `stored` : gagnent EN BLOC (jamais mergé avec
 *   l'array par défaut).
 * - `undefined` dans `stored` : traité comme absent → défaut injecté.
 * - `null` explicite dans `stored` : conservé tel quel (null est une
 *   valeur, cf. display.lockedScale).
 *
 * Fonction pure — aucune dépendance à AsyncStorage/React.
 *
 * @param {*} defaults - Valeurs par défaut
 * @param {*} stored - Valeurs parsées depuis le storage
 * @returns {*} Résultat fusionné
 */
export function deepMergeDefaults(defaults, stored) {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return stored === undefined ? defaults : stored;
  }

  const result = {};
  const keys = new Set([...Object.keys(defaults), ...Object.keys(stored)]);

  keys.forEach((key) => {
    const defaultVal = defaults[key];

    if (!(key in stored)) {
      result[key] = defaultVal;
      return;
    }

    const storedVal = stored[key];

    if (storedVal === undefined) {
      result[key] = defaultVal;
    } else if (isPlainObject(defaultVal) && isPlainObject(storedVal)) {
      result[key] = deepMergeDefaults(defaultVal, storedVal);
    } else {
      // Array, scalaire ou null : stored gagne en bloc.
      result[key] = storedVal;
    }
  });

  return result;
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
          try {
            const parsed = JSON.parse(storedValue);
            // Merge récursif avec les valeurs par défaut pour gérer les
            // nouvelles propriétés (deepMergeDefaults) — un simple spread
            // shallow écrase entièrement un sous-objet dès qu'une seule de
            // ses clés est nouvelle (classe MISSING-FIELD, cf. bug
            // shouldPulse/lockedScale).
            setValues(deepMergeDefaults(defaultValues, parsed));
          } catch (parseError) {
            logger.warn(`JSON parse error for key "${key}"`, parseError.message);
            // Keep default values
            setValues(defaultValues);
          }
        }
      } catch (error) {
        logger.warn(`Failed to load key "${key}"`, error.message);
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
          logger.warn(`Failed to save key "${key}"`, error.message);
        }
      };

      saveValues();
    }
  }, [key, values, isLoading]);

  // Fonction pour mettre à jour une valeur spécifique
  const updateValue = useCallback((field, newValue) => {
    setValues(prev => ({
      ...prev,
      [field]: newValue
    }));
  }, []);

  return { values, setValues, updateValue, isLoading };
}