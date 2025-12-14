// src/hooks/useCustomActivities.js
// Hook pour gérer les activités personnalisées (Premium feature)

import { usePersistedState } from './usePersistedState';

// Constants
const STORAGE_KEY = '@ResetPulse:customActivities';
const DEFAULT_PULSE_DURATION = 800; // Normal pulse speed

/**
 * Hook pour gérer les activités personnalisées des utilisateurs premium
 *
 * Usage:
 * const {
 *   customActivities,
 *   createActivity,
 *   updateActivity,
 *   deleteActivity,
 *   incrementUsage,
 *   isLoading
 * } = useCustomActivities();
 */
export const useCustomActivities = () => {
  const [customActivities, setCustomActivities, isLoading] = usePersistedState(
    STORAGE_KEY,
    []
  );

  /**
   * Crée une nouvelle activité personnalisée
   * @param {string} emoji - Emoji sélectionné
   * @param {string} name - Nom de l'activité (max 20 chars)
   * @param {number} defaultDuration - Durée par défaut en secondes
   * @returns {Object} L'activité créée
   */
  const createActivity = (emoji, name, defaultDuration) => {
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
    };

    setCustomActivities((prev) => [...prev, newActivity]);
    return newActivity;
  };

  /**
   * Met à jour une activité existante
   * @param {string} id - ID de l'activité
   * @param {Object} updates - Champs à mettre à jour
   */
  const updateActivity = (id, updates) => {
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
  };

  /**
   * Supprime une activité
   * @param {string} id - ID de l'activité à supprimer
   */
  const deleteActivity = (id) => {
    setCustomActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  /**
   * Incrémente le compteur d'utilisation d'une activité
   * @param {string} id - ID de l'activité
   */
  const incrementUsage = (id) => {
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
  };

  /**
   * Récupère une activité par son ID
   * @param {string} id - ID de l'activité
   * @returns {Object|undefined} L'activité ou undefined
   */
  const getActivityById = (id) => {
    return customActivities.find((activity) => activity.id === id);
  };

  /**
   * Retourne le nombre total d'activités personnalisées
   * @returns {number}
   */
  const getCustomActivitiesCount = () => {
    return customActivities.length;
  };

  return {
    customActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    incrementUsage,
    getActivityById,
    getCustomActivitiesCount,
    isLoading,
  };
};

export default useCustomActivities;
