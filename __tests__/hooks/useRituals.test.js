// Tests for useRituals hook - C6 (ADR-015)
// Lambda D (ADR-016) : l'état vit désormais dans un contexte PARTAGÉ
// (RitualsContext) — renderHook monte le provider ; l'API du hook est
// inchangée. Calqué sur __tests__/hooks/useCustomActivities.test.js.
import React from 'react';
import { renderHook, act } from '../test-utils';
import { useRituals } from '../../src/hooks/useRituals';
import { RitualsProvider } from '../../src/contexts/RitualsContext';
import { MAX_DURATION, MIN_DURATION } from '../../src/config/durations';
import { DEFAULT_RITUAL_COLOR } from '../../src/config/rituals';

const wrapper = ({ children }) => (
  <RitualsProvider>{children}</RitualsProvider>
);

const mockSetRituals = jest.fn((updater) => {
  if (typeof updater === 'function') {
    return updater([]);
  }
  return updater;
});

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: jest.fn(() => [
    [], // rituals
    mockSetRituals,
    false, // isLoading
  ]),
}));

describe('useRituals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
      [],
      mockSetRituals,
      false,
    ]);
  });

  describe('Initialization', () => {
    it('provides all expected methods', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      expect(typeof result.current.createRitual).toBe('function');
      expect(typeof result.current.updateRitual).toBe('function');
      expect(typeof result.current.deleteRitual).toBe('function');
      expect(typeof result.current.getRitualById).toBe('function');
      expect(typeof result.current.toggleFavorite).toBe('function');
      expect(typeof result.current.ensureRitualFavorite).toBe('function');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createRitual', () => {
    it('creates a ritual with a unique id and the given fields', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Lecture',
          activityId: 'reading',
          color: '#D4A853',
          duration: 1800,
          soundId: 'bell_classic',
        });
      });

      expect(created.id).toMatch(/^ritual_\d+$/);
      expect(created.name).toBe('Lecture');
      expect(created.activityId).toBe('reading');
      expect(created.color).toBe('#D4A853');
      expect(created.duration).toBe(1800);
      expect(created.soundId).toBe('bell_classic');
      expect(created.steps).toEqual([]);
    });

    it('clamps duration on creation, keeps color in value', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Trop long',
          activityId: 'work',
          color: '#6B9B6B',
          duration: 999999,
          soundId: 'timer_complete',
        });
      });

      expect(created.duration).toBe(MAX_DURATION);
      expect(created.color).toBe('#6B9B6B');
    });

    it('falls back to DEFAULT_RITUAL_COLOR when no color is given', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Sans couleur',
          activityId: 'work',
          duration: 600,
          soundId: 'timer_complete',
        });
      });

      expect(created.color).toBe(DEFAULT_RITUAL_COLOR);
    });

    it('calls setRituals to add the ritual', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.createRitual({
          name: 'Test',
          activityId: 'work',
          color: '#5A7BA8',
          duration: 600,
          soundId: 'timer_complete',
        });
      });

      expect(mockSetRituals).toHaveBeenCalled();
    });
  });

  describe('updateRitual', () => {
    const existing = {
      id: 'ritual_123',
      name: 'Deep Work',
      activityId: 'work',
      color: '#6B9B6B',
      duration: 3000,
      soundId: 'timer_complete',
      steps: [],
    };

    it('merges updates into the existing ritual', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { name: 'Deep Work XL', duration: 3600 });
      });

      expect(updaterResult[0].name).toBe('Deep Work XL');
      expect(updaterResult[0].duration).toBe(3600);
      expect(updaterResult[0].activityId).toBe('work'); // untouched fields survive
    });

    it('updates the color in value, independent of any palette', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { color: '#E8857A' });
      });

      expect(updaterResult[0].color).toBe('#E8857A');
    });

    it('falls back to DEFAULT_RITUAL_COLOR if color is updated to a falsy value', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { color: null });
      });

      expect(updaterResult[0].color).toBe(DEFAULT_RITUAL_COLOR);
    });

    it('clamps duration when updated above MAX_DURATION', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { duration: 999999 });
      });

      expect(updaterResult[0].duration).toBe(MAX_DURATION);
    });

    it('leaves other rituals untouched', () => {
      const other = { ...existing, id: 'ritual_456', name: 'Other' };
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing, other],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing, other]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { name: 'Changed' });
      });

      expect(updaterResult[1]).toEqual(other);
    });
  });

  describe('deleteRitual', () => {
    it('removes the ritual from the list', () => {
      const rituals = [
        { id: 'ritual_1', name: 'A' },
        { id: 'ritual_2', name: 'B' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        rituals,
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater(rituals);
      });

      act(() => {
        result.current.deleteRitual('ritual_1');
      });

      expect(updaterResult).toHaveLength(1);
      expect(updaterResult[0].id).toBe('ritual_2');
    });
  });

  describe('getRitualById', () => {
    it('returns the ritual when found', () => {
      const rituals = [
        { id: 'ritual_a', name: 'A' },
        { id: 'ritual_b', name: 'B' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        rituals,
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      expect(result.current.getRitualById('ritual_b').name).toBe('B');
    });

    it('returns undefined when not found', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });
      expect(result.current.getRitualById('nope')).toBeUndefined();
    });
  });

  describe('Default seed', () => {
    it('is used as the persisted-state default value (3 base rituals)', () => {
      const usePersistedStateMock = require('../../src/hooks/usePersistedState').usePersistedState;
      renderHook(() => useRituals(), { wrapper });

      const defaultArg = usePersistedStateMock.mock.calls[usePersistedStateMock.mock.calls.length - 1][1];
      expect(defaultArg).toHaveLength(3);
      expect(defaultArg.every((r) => r.steps.length === 0)).toBe(true);
    });
  });

  describe('hasMissingBaseRituals (D8, hotfix-porte-1)', () => {
    it('is true when no base ritual is present', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });
      expect(result.current.hasMissingBaseRituals).toBe(true);
    });

    it('is false when all 3 base rituals are present', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [
          { id: 'ritual_meditation', name: 'Respiration', activityId: 'meditation', duration: 300, steps: [] },
          { id: 'ritual_break', name: 'Pause café', activityId: 'break', duration: 900, steps: [] },
          { id: 'ritual_work', name: 'Deep Work', activityId: 'work', duration: 3000, steps: [] },
        ],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });
      expect(result.current.hasMissingBaseRituals).toBe(false);
    });

    it('is true when only some base rituals are present', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [{ id: 'ritual_meditation', name: 'Respiration', activityId: 'meditation', duration: 300, steps: [] }],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });
      expect(result.current.hasMissingBaseRituals).toBe(true);
    });
  });

  describe('restoreBaseRituals (D8, hotfix-porte-1)', () => {
    it('adds all base rituals when none are present, without touching customs', () => {
      const custom = { id: 'ritual_1700000000000', name: 'Lecture', activityId: 'reading', duration: 1800, steps: [] };
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [custom],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([custom]);
      });

      act(() => {
        result.current.restoreBaseRituals();
      });

      expect(updaterResult).toHaveLength(4);
      expect(updaterResult).toContainEqual(custom); // le custom n'est ni écrasé ni dupliqué
      const restoredIds = updaterResult.map((r) => r.id);
      expect(restoredIds).toEqual(expect.arrayContaining(['ritual_meditation', 'ritual_break', 'ritual_work']));
    });

    it('only restores the missing base ritual, leaves an already-present base ritual untouched', () => {
      const existingMeditation = {
        id: 'ritual_meditation',
        name: 'Nom custom conservé', // preuve : pas écrasé par le seed
        activityId: 'meditation',
        duration: 600,
        steps: [],
      };
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existingMeditation],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existingMeditation]);
      });

      act(() => {
        result.current.restoreBaseRituals();
      });

      expect(updaterResult).toHaveLength(3);
      expect(updaterResult).toContainEqual(existingMeditation);
      const restoredIds = updaterResult.map((r) => r.id);
      expect(restoredIds).toEqual(expect.arrayContaining(['ritual_meditation', 'ritual_break', 'ritual_work']));
    });

    it('is a no-op (same content) when all base rituals are already present', () => {
      const rituals = [
        { id: 'ritual_meditation', name: 'Respiration', activityId: 'meditation', duration: 300, steps: [] },
        { id: 'ritual_break', name: 'Pause café', activityId: 'break', duration: 900, steps: [] },
        { id: 'ritual_work', name: 'Deep Work', activityId: 'work', duration: 3000, steps: [] },
      ];
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        rituals,
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals(), { wrapper });

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater(rituals);
      });

      act(() => {
        result.current.restoreBaseRituals();
      });

      expect(updaterResult).toHaveLength(3);
      expect(updaterResult).toEqual(rituals);
    });
  });

  describe('Guard: MIN_DURATION floor is respected', () => {
    it('never returns a duration below MIN_DURATION on create', () => {
      const { result } = renderHook(() => useRituals(), { wrapper });

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Trop court',
          activityId: 'work',
          color: '#5A7BA8',
          duration: 0,
          soundId: 'timer_complete',
        });
      });

      expect(created.duration).toBe(MIN_DURATION);
    });
  });

  describe('Favoris (porte-2) — max 3, migration douce', () => {
    beforeEach(() => {
      mockSetRituals.mockImplementation((updater) =>
        typeof updater === 'function' ? updater([]) : updater
      );
    });
    const seed = (ritualsArray) => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        ritualsArray,
        mockSetRituals,
        false,
      ]);
    };
    const mk = (id, favorite) => ({
      id, name: id, activityId: 'work', color: DEFAULT_RITUAL_COLOR,
      duration: 600, soundId: 'timer_complete', steps: [],
      ...(favorite === undefined ? {} : { favorite }),
    });

    it('sans favori explicite, les 3 premiers font office (rangée d\'accueil)', () => {
      seed([mk('a'), mk('b'), mk('c'), mk('d')]);
      const { result } = renderHook(() => useRituals(), { wrapper });
      expect(result.current.favoriteRituals.map((r) => r.id)).toEqual(['a', 'b', 'c']);
    });

    it('toggleFavorite refuse une 4e étoile (max 3) et retourne false', () => {
      seed([mk('a', true), mk('b', true), mk('c', true), mk('d', false)]);
      const { result } = renderHook(() => useRituals(), { wrapper });
      let accepted;
      act(() => {
        accepted = result.current.toggleFavorite('d');
      });
      expect(accepted).toBe(false);
      expect(mockSetRituals).not.toHaveBeenCalled();
    });

    it('le retrait d\'une étoile est toujours permis et matérialise la migration', () => {
      seed([mk('a'), mk('b'), mk('c'), mk('d')]); // aucun favori explicite
      const { result } = renderHook(() => useRituals(), { wrapper });
      let accepted;
      act(() => {
        accepted = result.current.toggleFavorite('a'); // retrait d'un implicite
      });
      expect(accepted).toBe(true);
      const written = mockSetRituals.mock.calls[0][0]([mk('a'), mk('b'), mk('c'), mk('d')]);
      const byId = Object.fromEntries(written.map((r) => [r.id, r.favorite]));
      // a retiré, b/c matérialisés favoris, d resté hors favoris
      expect(byId).toEqual({ a: false, b: true, c: true, d: false });
    });

    it('élire un favori quand une place est libre retourne true', () => {
      seed([mk('a', true), mk('b', true), mk('c', false), mk('d', false)]);
      const { result } = renderHook(() => useRituals(), { wrapper });
      let accepted;
      act(() => {
        accepted = result.current.toggleFavorite('d');
      });
      expect(accepted).toBe(true);
      const written = mockSetRituals.mock.calls[0][0](
        [mk('a', true), mk('b', true), mk('c', false), mk('d', false)]
      );
      expect(written.find((r) => r.id === 'd').favorite).toBe(true);
    });
  });

  describe('ensureRitualFavorite (ADR-017 §2 — auto-favori du rituel gardé)', () => {
    beforeEach(() => {
      mockSetRituals.mockImplementation((updater) =>
        typeof updater === 'function' ? updater([]) : updater
      );
    });
    const seed = (ritualsArray) => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        ritualsArray,
        mockSetRituals,
        false,
      ]);
    };
    const mk = (id, favorite) => ({
      id, name: id, activityId: 'work', color: DEFAULT_RITUAL_COLOR,
      duration: 600, soundId: 'timer_complete', steps: [],
      ...(favorite === undefined ? {} : { favorite }),
    });

    it('sans favori explicite (repli implicite déjà à 3) : élit le rituel gardé, évince le DERNIER implicite (le 3e template) — perso + 2 templates reste visible', () => {
      seed([mk('ritual_meditation'), mk('ritual_break'), mk('ritual_work'), mk('perso')]);
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.ensureRitualFavorite('perso');
      });

      const written = mockSetRituals.mock.calls[0][0](
        [mk('ritual_meditation'), mk('ritual_break'), mk('ritual_work'), mk('perso')]
      );
      const byId = Object.fromEntries(written.map((r) => [r.id, r.favorite]));
      expect(byId).toEqual({
        ritual_meditation: true,
        ritual_break: true,
        ritual_work: false, // évincé
        perso: true, // le rituel gardé, désormais visible sur la rangée
      });
    });

    it('avec 3 favoris explicites déjà posés : évince le dernier favori du tableau pour faire de la place au rituel gardé', () => {
      seed([mk('a', true), mk('b', true), mk('c', true), mk('perso', false)]);
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.ensureRitualFavorite('perso');
      });

      const written = mockSetRituals.mock.calls[0][0](
        [mk('a', true), mk('b', true), mk('c', true), mk('perso', false)]
      );
      const byId = Object.fromEntries(written.map((r) => [r.id, r.favorite]));
      expect(byId).toEqual({ a: true, b: true, c: false, perso: true });
    });

    it('rituel déjà favori : no-op, la visibilité était déjà acquise', () => {
      seed([mk('a', true), mk('b', false)]);
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.ensureRitualFavorite('a');
      });

      const written = mockSetRituals.mock.calls[0][0]([mk('a', true), mk('b', false)]);
      expect(written.find((r) => r.id === 'a').favorite).toBe(true);
      expect(written.find((r) => r.id === 'b').favorite).toBe(false);
    });

    it('sous le cap (moins de 3 rituels au total) : devient favori sans rien évincer', () => {
      seed([mk('a'), mk('perso')]);
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.ensureRitualFavorite('perso');
      });

      const written = mockSetRituals.mock.calls[0][0]([mk('a'), mk('perso')]);
      const byId = Object.fromEntries(written.map((r) => [r.id, r.favorite]));
      expect(byId).toEqual({ a: true, perso: true });
    });

    it('rituel introuvable : no-op silencieux, ne plante pas', () => {
      seed([mk('a', true)]);
      const { result } = renderHook(() => useRituals(), { wrapper });

      act(() => {
        result.current.ensureRitualFavorite('inconnu');
      });

      const written = mockSetRituals.mock.calls[0][0]([mk('a', true)]);
      expect(written).toEqual([mk('a', true)]);
    });
  });
});
