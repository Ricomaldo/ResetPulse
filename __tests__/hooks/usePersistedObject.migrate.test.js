// Tests for usePersistedObject — option `migrate` (socle de versionnage
// lot-socle-v3, cf. src/config/config-schema.js).
//
// Contrairement à __tests__/hooks/usePersistedState.test.js (deepMergeDefaults
// pur) et __tests__/contexts/TimerConfigContext.test.js (usePersistedObject
// entièrement mocké), ce fichier exerce le hook réel contre le mock
// AsyncStorage global (jest.setup.js) pour vérifier le branchement de
// l'option `migrate` dans l'effet de chargement : appelée sur le blob BRUT,
// AVANT deepMergeDefaults, et un no-op par défaut si l'option est absente
// (comportement identique à avant ce socle pour tout appelant existant).
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from 'react-test-renderer';
import { renderHook } from '../test-utils';
import { usePersistedObject } from '../../src/hooks/usePersistedState';

// Laisse les micro-tâches de la chaîne AsyncStorage.getItem → JSON.parse →
// migrate → deepMergeDefaults → setValues se résoudre avant d'asserter.
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('usePersistedObject — option migrate', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('appelle migrate sur le blob stocké BRUT, avant deepMergeDefaults', async () => {
    const KEY = '@Test:migrate-raw';
    await AsyncStorage.setItem(KEY, JSON.stringify({ foo: 'raw', version: 2 }));
    const migrate = jest.fn((stored) => ({ ...stored, migrated: true, version: 3 }));
    const defaults = { foo: 'default', bar: 'default', version: 3 };

    const { result } = renderHook(() => usePersistedObject(KEY, defaults, { migrate }));
    await flush();

    expect(migrate).toHaveBeenCalledWith({ foo: 'raw', version: 2 });
    // bar (absent du blob stocké) est comblé par deepMergeDefaults APRÈS migrate.
    expect(result.current.values).toEqual({ foo: 'raw', bar: 'default', migrated: true, version: 3 });
    expect(result.current.isLoading).toBe(false);
  });

  it('option migrate absente : comportement identique à avant ce socle (identité)', async () => {
    const KEY = '@Test:migrate-absent';
    await AsyncStorage.setItem(KEY, JSON.stringify({ foo: 'raw' }));
    const defaults = { foo: 'default', bar: 'default' };

    const { result } = renderHook(() => usePersistedObject(KEY, defaults));
    await flush();

    expect(result.current.values).toEqual({ foo: 'raw', bar: 'default' });
  });

  it('aucun blob stocké (première installation) : migrate jamais appelée, défauts inchangés', async () => {
    const KEY = '@Test:migrate-empty';
    const migrate = jest.fn((stored) => ({ ...stored, migrated: true }));
    const defaults = { foo: 'default' };

    const { result } = renderHook(() => usePersistedObject(KEY, defaults, { migrate }));
    await flush();

    expect(migrate).not.toHaveBeenCalled();
    expect(result.current.values).toEqual({ foo: 'default' });
  });
});
