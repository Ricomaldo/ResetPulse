// src/contexts/CustomActivitiesContext.jsx
// Store PARTAGÉ des activités personnalisées (porte-3, bug emoji custom).
//
// Avant : useCustomActivities appelait usePersistedState directement — chaque
// composant consommateur avait SA PROPRE instance de l'état (RitualForm créait
// l'activité, RitualsPanel/CompactRow ne la voyaient jamais → emoji 💻 par
// défaut dans la liste). Pattern famille « deux instances d'un état persisté
// qui ne se parlent pas ».
//
// Désormais : UNE instance de l'état vit ici, tous les consommateurs lisent
// le même contexte via useCustomActivities (API inchangée — le hook
// src/hooks/useCustomActivities.js re-exporte d'ici).

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { usePersistedState } from '../hooks/usePersistedState';

const STORAGE_KEY = '@ResetPulse:customActivities';
const DEFAULT_PULSE_DURATION = 800; // Normal pulse speed
const FREE_CUSTOM_LIMIT = 1; // Free users can create 1 custom activity (during onboarding)

const CustomActivitiesContext = createContext(null);

export function CustomActivitiesProvider({ children }) {
  const [customActivities, setCustomActivities, isLoading] = usePersistedState(
    STORAGE_KEY,
    []
  );

  /**
   * Crée une nouvelle activité personnalisée
   * @param {string} emoji - Emoji sélectionné
   * @param {string} name - Nom de l'activité (max 20 chars)
   * @param {number} defaultDuration - Durée par défaut en secondes
   * @param {Object} metadata - Métadonnées optionnelles (ex: { createdDuringOnboarding: true })
   * @returns {Object} L'activité créée
   */
  const createActivity = useCallback((emoji, name, defaultDuration, metadata = {}) => {
    const newActivity = {
      id: `custom_${Date.now()}`,
      emoji,
      name,
      label: name, // Pour compatibilité avec les activités built-in
      defaultDuration,
      createdAt: new Date().toISOString(),
      isPremium: true,
      isCustom: true,
      timesUsed: 0,
      suggestedColor: 'calm', // Default suggested color
      pulseDuration: DEFAULT_PULSE_DURATION,
      ...metadata, // Spread metadata to allow createdDuringOnboarding, etc.
    };

    setCustomActivities((prev) => [...prev, newActivity]);
    return newActivity;
  }, [setCustomActivities]);

  /**
   * Met à jour une activité existante
   * @param {string} id - ID de l'activité
   * @param {Object} updates - Champs à mettre à jour
   */
  const updateActivity = useCallback((id, updates) => {
    setCustomActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          const updated = { ...activity, ...updates };
          // Sync label with name if name is updated
          if (updates.name) {
            updated.label = updates.name;
          }
          return updated;
        }
        return activity;
      })
    );
  }, [setCustomActivities]);

  /**
   * Supprime une activité
   * @param {string} id - ID de l'activité à supprimer
   */
  const deleteActivity = useCallback((id) => {
    setCustomActivities((prev) => prev.filter((activity) => activity.id !== id));
  }, [setCustomActivities]);

  /**
   * Incrémente le compteur d'utilisation d'une activité
   * @param {string} id - ID de l'activité
   */
  const incrementUsage = useCallback((id) => {
    setCustomActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          return {
            ...activity,
            timesUsed: (activity.timesUsed || 0) + 1,
          };
        }
        return activity;
      })
    );
  }, [setCustomActivities]);

  /**
   * Récupère une activité par son ID
   * @param {string} id - ID de l'activité
   * @returns {Object|undefined} L'activité ou undefined
   */
  const getActivityById = useCallback((id) => {
    return customActivities.find((activity) => activity.id === id);
  }, [customActivities]);

  /**
   * Retourne le nombre total d'activités personnalisées
   * @returns {number}
   */
  const getCustomActivitiesCount = useCallback(() => {
    return customActivities.length;
  }, [customActivities]);

  /**
   * Vérifie si l'utilisateur peut créer une nouvelle activité personnalisée
   * @param {boolean} isPremium - Statut premium de l'utilisateur
   * @returns {boolean} Vrai si création autorisée
   */
  const canCreateActivity = useCallback((isPremium) => {
    if (isPremium) return true;
    return customActivities.length < FREE_CUSTOM_LIMIT;
  }, [customActivities]);

  const value = useMemo(() => ({
    customActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    incrementUsage,
    getActivityById,
    getCustomActivitiesCount,
    canCreateActivity,
    FREE_CUSTOM_LIMIT,
    isLoading,
  }), [
    customActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    incrementUsage,
    getActivityById,
    getCustomActivitiesCount,
    canCreateActivity,
    isLoading,
  ]);

  return (
    <CustomActivitiesContext.Provider value={value}>
      {children}
    </CustomActivitiesContext.Provider>
  );
}

CustomActivitiesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCustomActivities = () => {
  const context = useContext(CustomActivitiesContext);
  if (!context) {
    throw new Error('useCustomActivities must be used within CustomActivitiesProvider');
  }
  return context;
};
