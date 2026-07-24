// src/hooks/useRituals.js
// Store des Rituels (ADR-015) — CRUD persisté, calqué sur useCustomActivities

import { usePersistedState } from './usePersistedState';
import { RITUAL_ID_PREFIX, getDefaultRituals, clampRitualDuration } from '../config/rituals';

const STORAGE_KEY = '@ResetPulse:rituals';

/**
 * Hook pour gérer les rituels de l'utilisateur (liste, création, édition,
 * suppression). Gratuit et sans plafond au C6 (frontière gratuit/payant
 * parquée devant les écrans, cf. mission recentrage).
 */
export const useRituals = () => {
  const [rituals, setRituals, isLoading] = usePersistedState(STORAGE_KEY, getDefaultRituals());

  /**
   * Crée un nouveau rituel.
   * @param {Object} fields - { name, activityId, colorIndex, duration, soundId }
   * @returns {Object} Le rituel créé
   */
  const createRitual = ({ name, activityId, colorIndex, duration, soundId }) => {
    const newRitual = {
      id: `${RITUAL_ID_PREFIX}${Date.now()}`,
      name,
      activityId,
      colorIndex: Math.min(3, Math.max(0, colorIndex ?? 0)),
      duration: clampRitualDuration(duration),
      soundId,
      steps: [],
    };
    setRituals((prev) => [...prev, newRitual]);
    return newRitual;
  };

  /**
   * Met à jour un rituel existant.
   * @param {string} id
   * @param {Object} updates
   */
  const updateRitual = (id, updates) => {
    setRituals((prev) =>
      prev.map((ritual) => {
        if (ritual.id !== id) {
          return ritual;
        }
        const merged = { ...ritual, ...updates };
        if (updates.duration !== undefined) {
          merged.duration = clampRitualDuration(updates.duration);
        }
        if (updates.colorIndex !== undefined) {
          merged.colorIndex = Math.min(3, Math.max(0, updates.colorIndex));
        }
        return merged;
      })
    );
  };

  /**
   * Supprime un rituel.
   * @param {string} id
   */
  const deleteRitual = (id) => {
    setRituals((prev) => prev.filter((ritual) => ritual.id !== id));
  };

  /**
   * Récupère un rituel par son id.
   * @param {string} id
   * @returns {Object|undefined}
   */
  const getRitualById = (id) => rituals.find((ritual) => ritual.id === id);

  return {
    rituals,
    createRitual,
    updateRitual,
    deleteRitual,
    getRitualById,
    isLoading,
  };
};

export default useRituals;
