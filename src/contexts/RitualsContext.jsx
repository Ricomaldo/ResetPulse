// src/contexts/RitualsContext.jsx
// Store PARTAGÉ des rituels (ADR-015).
//
// Avant : useRituals appelait usePersistedState directement — chaque
// composant consommateur avait SA PROPRE instance de l'état. Trois instances
// coexistaient (CompactRow dans TimerScreen, TimerScreenContent — ajoutée
// pour « garde ce moment ? » —, RitualsPanel dans le sheet) et ne se
// parlaient pas. Symptôme : après « garde ce moment ? », la rangée d'accueil
// affichait encore l'ancienne durée/couleur du rituel mis à jour — le store
// persisté était correct, la RAM des autres instances non. Même famille de
// bug que porte-3 (emoji custom, CustomActivitiesContext) et le compteur de
// séances (SessionCountContext) : « deux instances d'un état persisté qui ne
// se parlent pas ».
//
// Désormais : UNE instance de l'état vit ici, tous les consommateurs lisent
// le même contexte via useRituals (API inchangée — le hook
// src/hooks/useRituals.js re-exporte d'ici).

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { usePersistedState } from '../hooks/usePersistedState';
import { RITUAL_ID_PREFIX, getDefaultRituals, clampRitualDuration, DEFAULT_RITUAL_COLOR } from '../config/rituals';

const STORAGE_KEY = '@ResetPulse:rituals';

const RitualsContext = createContext(null);

export function RitualsProvider({ children }) {
  const [rituals, setRituals, isLoading] = usePersistedState(STORAGE_KEY, getDefaultRituals());

  /**
   * Crée un nouveau rituel.
   * @param {Object} fields - { name, activityId, color, duration, soundId }
   * @returns {Object} Le rituel créé
   */
  const createRitual = useCallback(({ name, activityId, color, duration, soundId }) => {
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
  }, [setRituals]);

  /**
   * Met à jour un rituel existant.
   * @param {string} id
   * @param {Object} updates
   */
  const updateRitual = useCallback((id, updates) => {
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
  }, [setRituals]);

  /**
   * Supprime un rituel.
   * @param {string} id
   */
  const deleteRitual = useCallback((id) => {
    setRituals((prev) => prev.filter((ritual) => ritual.id !== id));
  }, [setRituals]);

  /**
   * Récupère un rituel par son id.
   * @param {string} id
   * @returns {Object|undefined}
   */
  const getRitualById = useCallback((id) => rituals.find((ritual) => ritual.id === id), [rituals]);

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
  const restoreBaseRituals = useCallback(() => {
    setRituals((prev) => {
      const existingIds = new Set(prev.map((ritual) => ritual.id));
      const toRestore = getDefaultRituals().filter((base) => !existingIds.has(base.id));
      if (toRestore.length === 0) {
        return prev;
      }
      return [...prev, ...toRestore];
    });
  }, [setRituals]);

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
  const toggleFavorite = useCallback((id) => {
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
  }, [rituals, hasAnyFavorite, setRituals]);

  /**
   * Garantit qu'un rituel est VISIBLE sur la rangée d'accueil (favori) —
   * ADR-017 §2 : le rituel gardé (« garde ce moment ? ») doit apparaître
   * immédiatement, sinon le sommet émotionnel devient invisible. Un rituel
   * personnel naît TOUJOURS en fin de tableau (createRitual l'ajoute après
   * les 3 templates) : il ne tombe donc jamais dans le repli implicite
   * `rituals.slice(0, MAX_FAVORITES)` (mécanique de `favoriteRituals`
   * ci-dessus), qui n'élit que les 3 premiers du tableau — sans ce geste,
   * un rituel gardé resterait invisible tant qu'aucun favori explicite
   * n'a jamais été posé.
   *
   * Contrairement à `toggleFavorite` (geste utilisateur explicite, qui
   * REFUSE une 4e étoile tant qu'une place n'a pas été libérée), celui-ci
   * fait de la place lui-même : évince le DERNIER favori du tableau
   * (ordre `rituals` — les 3 templates sont en tête à l'état initial, donc
   * en pratique c'est le 3e template qui cède sa place ; le rituel gardé
   * se retrouve à côté de 2 templates, jamais seul, jamais un mur). Même
   * migration douce que `toggleFavorite` : sans aucun favori explicite,
   * les 3 premiers sont matérialisés avant l'éviction. No-op si le rituel
   * est déjà favori (ou introuvable).
   * @param {string} id
   */
  const ensureRitualFavorite = useCallback((id) => {
    setRituals((prev) => {
      const target = prev.find((ritual) => ritual.id === id);
      if (!target) {
        return prev;
      }
      const prevHasAny = prev.some((ritual) => ritual.favorite);
      const materialized = prevHasAny
        ? prev
        : prev.map((ritual, index) => ({ ...ritual, favorite: index < MAX_FAVORITES }));
      const current = materialized.find((ritual) => ritual.id === id);
      if (current.favorite) {
        return materialized === prev ? prev : materialized;
      }
      const favorites = materialized.filter((ritual) => ritual.favorite);
      const evictId = favorites.length >= MAX_FAVORITES
        ? favorites[favorites.length - 1].id
        : null;
      return materialized.map((ritual) => {
        if (ritual.id === id) {
          return { ...ritual, favorite: true };
        }
        if (evictId && ritual.id === evictId) {
          return { ...ritual, favorite: false };
        }
        return ritual;
      });
    });
  }, [setRituals]);

  // DevFab (Lambda C, 3.0 minimaliste) : « Reset rituels & activités » et
  // « Vanilla » — le contexte ne remonte pas avec AppContent (il vit
  // au-dessus, dans App.js) donc effacer la clé AsyncStorage seule ne
  // suffit pas ; ce setter donne l'effet immédiat (retour aux 3 rituels de
  // base, aucun custom).
  const resetRituals = useCallback(() => {
    setRituals(getDefaultRituals());
  }, [setRituals]);

  const value = useMemo(() => ({
    rituals,
    createRitual,
    updateRitual,
    deleteRitual,
    getRitualById,
    restoreBaseRituals,
    hasMissingBaseRituals,
    favoriteRituals,
    toggleFavorite,
    ensureRitualFavorite,
    resetRituals,
    isLoading,
  }), [
    rituals,
    createRitual,
    updateRitual,
    deleteRitual,
    getRitualById,
    restoreBaseRituals,
    hasMissingBaseRituals,
    favoriteRituals,
    toggleFavorite,
    ensureRitualFavorite,
    resetRituals,
    isLoading,
  ]);

  return (
    <RitualsContext.Provider value={value}>
      {children}
    </RitualsContext.Provider>
  );
}

RitualsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useRituals = () => {
  const context = useContext(RitualsContext);
  if (!context) {
    throw new Error('useRituals must be used within RitualsProvider');
  }
  return context;
};
