// Tests for TimerConfigContext — défauts palette cohérents PROD/DEV
// (Lambda F1, correctif 2).
//
// Avant correctif : la branche PROD de getDefaultValues semait
// `palette: { currentPalette, selectedColorIndex: 0 }` alors que currentColor
// est la source de vérité (hex, C6.2) et selectedColorIndex est DÉRIVÉ
// ailleurs (paletteData useMemo, ~l.353) — jamais une valeur à semer. La
// branche DEV, elle, semait déjà currentColor correctement. Les deux
// branches doivent maintenant semer currentColor et jamais selectedColorIndex.
//
// On capture les defaultValues passés à usePersistedObject (mocké) plutôt
// que de simuler AsyncStorage — c'est directement ce que produit
// getDefaultValues() pour chaque branche.
import React from 'react';
import { renderHook } from '../test-utils';
import { TIMER_PALETTES } from '../../src/config/timer-palettes';
import { TimerConfigProvider, useTimerConfig } from '../../src/contexts/TimerConfigContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockUsePersistedObject = jest.fn();
jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedObject: (...args) => mockUsePersistedObject(...args),
}));

// Getter live-binding : DEV_MODE est lu par getDefaultValues() à chaque
// rendu (import ES → property access sur le module mocké via l'interop
// CommonJS de Babel), donc muter mockDevMode entre les tests suffit — pas
// besoin de resetModules/isolateModules (qui recrée une seconde instance de
// React, incompatible avec react-test-renderer déjà chargé par test-utils).
let mockDevMode = false;
jest.mock('../../src/config/test-mode', () => ({
  get DEV_MODE() {
    return mockDevMode;
  },
  DEV_DEFAULT_TIMER_CONFIG: { activity: 'meditation', duration: 1200 },
}));

const wrapper = ({ children }) => (
  <TimerConfigProvider>{children}</TimerConfigProvider>
);

describe('TimerConfigContext — défauts palette PROD/DEV cohérents', () => {
  beforeEach(() => {
    mockUsePersistedObject.mockReset();
    mockUsePersistedObject.mockImplementation((key, defaultValues) => ({
      values: defaultValues,
      setValues: jest.fn(),
      updateValue: jest.fn(),
      isLoading: false,
    }));
  });

  it('PROD : sème currentColor, jamais selectedColorIndex', () => {
    mockDevMode = false;

    renderHook(() => useTimerConfig(), { wrapper });

    const seededDefaults = mockUsePersistedObject.mock.calls[0][1];
    expect(seededDefaults.palette).toEqual({
      currentPalette: 'serenity',
      currentColor: TIMER_PALETTES.serenity.colors[0],
    });
    expect(seededDefaults.palette).not.toHaveProperty('selectedColorIndex');
  });

  it('DEV : sème currentColor, jamais selectedColorIndex', () => {
    mockDevMode = true;

    renderHook(() => useTimerConfig(), { wrapper });

    const seededDefaults = mockUsePersistedObject.mock.calls[0][1];
    expect(seededDefaults.palette).toEqual({
      currentPalette: 'serenity',
      currentColor: TIMER_PALETTES.serenity.colors[0],
    });
    expect(seededDefaults.palette).not.toHaveProperty('selectedColorIndex');
  });
});
