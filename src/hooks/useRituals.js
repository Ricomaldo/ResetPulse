// src/hooks/useRituals.js
// Store des Rituels (ADR-015) — CRUD persisté, calqué sur useCustomActivities

import { usePersistedState } from './usePersistedState';
import { RITUAL_ID_PREFIX, getDefaultRituals, clampRitualDuration, DEFAULT_RITUAL_COLOR } from '../config/rituals';

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
   * @param {Object} fields - { name, activityId, color, duration, soundId }
   * @returns {Object} Le rituel créé
   */
  const createRitual = ({ name, activityId, color, duration, soundId }) => {
    const newRitual = {
      id: `${RITUAL_ID_PREFIX}${Date.now()}`,
      name,
      activityId,
      color: color || DEFAULT_RITUAL_COLOR,
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
        if (updates.color !== undefined) {
          merged.color = updates.color || DEFAULT_RITUAL_COLOR;
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

  // D8 (hotfix-porte-1) : la suppression d'un rituel de base reste libre —
  // ce garde ré-insère les manquants sans dupliquer ni écraser les customs
  // (comparaison par id, `ritual_${activityId}` pour un rituel de base,
  // cf. getDefaultRituals).
  const missingBaseRituals = getDefaultRituals().filter(
    (base) => !rituals.some((ritual) => ritual.id === base.id)
  );
  const hasMissingBaseRituals = missingBaseRituals.length > 0;

  /**
   * Ré-insère les rituels de base manquants (aucun doublon, aucun écrasement
   * d'un rituel existant — custom ou base déjà présent).
   */
  const restoreBaseRituals = () => {
    setRituals((prev) => {
      const existingIds = new Set(prev.map((ritual) => ritual.id));
      const toRestore = getDefaultRituals().filter((base) => !existingIds.has(base.id));
      if (toRestore.length === 0) {
        return prev;
      }
      return [...prev, ...toRestore];
    });
  };

  // ===== Favoris (porte-2, retour Eric) =====
  // La rangée d'accueil montre les 3 rituels FAVORIS (« un tap = tout est
  // prêt »). `favorite: true` sur le rituel, MAX_FAVORITES = 3. Migration
  // douce : un état persisté sans aucun favori élit les 3 premiers (les
  // base au premier lancement). Ordre d'affichage = ordre du tableau.
  const MAX_FAVORITES = 3;
  const hasAnyFavorite = rituals.some((ritual) => ritual.favorite);
  const favoriteRituals = (hasAnyFavorite
    ? rituals.filter((ritual) => ritual.favorite)
    : rituals.slice(0, MAX_FAVORITES)
  ).slice(0, MAX_FAVORITES);

  /**
   * Bascule le statut favori d'un rituel. Refuse (return false) d'en élire
   * un 4e — il faut d'abord en libérer un (le retrait est toujours permis).
   * @param {string} id
   * @returns {boolean} - true si la bascule a eu lieu
   */
  const toggleFavorite = (id) => {
    const target = rituals.find((ritual) => ritual.id === id);
    if (!target) {
      return false;
    }
    // Sans aucun favori explicite, les 3 premiers font office (migration) —
    // matérialise-les avant de basculer, pour que le retrait d'un implicite
    // fonctionne comme attendu.
    const materialized = hasAnyFavorite
      ? rituals
      : rituals.map((ritual, index) => ({ ...ritual, favorite: index < MAX_FAVORITES }));
    const current = materialized.find((ritual) => ritual.id === id);
    const favoriteCount = materialized.filter((ritual) => ritual.favorite).length;
    if (!current.favorite && favoriteCount >= MAX_FAVORITES) {
      return false;
    }
    setRituals((prev) => {
      const prevHasAny = prev.some((ritual) => ritual.favorite);
      const prevMaterialized = prevHasAny
        ? prev
        : prev.map((ritual, index) => ({ ...ritual, favorite: index < MAX_FAVORITES }));
      return prevMaterialized.map((ritual) =>
        ritual.id === id ? { ...ritual, favorite: !ritual.favorite } : ritual
      );
    });
    return true;
  };

  return {
    rituals,
    createRitual,
    updateRitual,
    deleteRitual,
    getRitualById,
    restoreBaseRituals,
    hasMissingBaseRituals,
    favoriteRituals,
    toggleFavorite,
    isLoading,
  };
};

export default useRituals;
