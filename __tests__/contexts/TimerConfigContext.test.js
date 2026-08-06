// Tests for TimerConfigContext — garde-fossile shouldPulse (QA visuelle #1,
// bug 1, Lambda X 04/08).
//
// Contexte du bug : un blob @ResetPulse:config écrit par un build antérieur
// à ec76ff2 (halo ON par défaut, 31/07) porte encore shouldPulse:false ET le
// champ mort showActivityEmoji (purgé du code par 7c2984e, jamais réécrit
// depuis — v2.1.6 en prod contient déjà la clé @ResetPulse:config, cf.
// consolidation ADR-009 déc. 2025). usePersistedObject ne fait qu'un merge
// SHALLOW au premier niveau (usePersistedState.js) : ce blob écrase
// entièrement le nouveau défaut display.shouldPulse=true, y compris au
// chemin d'upgrade — la migration OLD_KEYS ne se déclenche jamais pour ces
// installs (@ResetPulse:config existe déjà), elle n'est pas l'autrice.
//
// Calqué sur useCustomActivities.test.js/useSessionCount.test.js :
// usePersistedObject mocké avec état simulé, pas d'AsyncStorage réel pour
// la clé consolidée (assertions sur updateValue, pas sur un re-render —
// mockUpdateValue ne déclenche pas de re-render React, comme les autres
// tests du contexte partagé de ce repo).
import React from 'react';
import { renderHook } from '../test-utils';
import { TimerConfigProvider, useTimerConfig } from '../../src/contexts/TimerConfigContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const wrapper = ({ children }) => (
  <TimerConfigProvider>{children}</TimerConfigProvider>
);

function baseValues(display) {
  return {
    version: 2,
    timer: {
      currentActivity: { id: 'work', label: 'Work', emoji: '💼' },
      currentDuration: 1500,
      selectedSoundId: 'timer_complete',
      clockwise: false,
    },
    display,
    system: { keepAwakeEnabled: true },
    mode: { current: 'mixte' },
    favorites: { favoriteActivities: [], favoritePalettes: [] },
    layout: { commandBarConfig: [], carouselBarConfig: [] },
    stats: {
      activityDurations: {},
      completedTimersCount: 0,
      hasSeenTwoTimersModal: false,
      hasSeenReviewRequest: false,
    },
    palette: { currentPalette: 'serenity', currentColor: '#8FA98F', selectedColorIndex: 0 },
  };
}

let mockValues;
const mockSetValues = jest.fn((updater) => {
  mockValues = typeof updater === 'function' ? updater(mockValues) : updater;
});
const mockUpdateValue = jest.fn((field, value) => {
  mockValues = { ...mockValues, [field]: value };
});

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedObject: jest.fn(() => ({
    values: mockValues,
    setValues: mockSetValues,
    updateValue: mockUpdateValue,
    isLoading: false,
  })),
}));

describe('TimerConfigContext — garde-fossile shouldPulse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installation neuve (pas de fossile) : shouldPulse true, aucune écriture display', () => {
    mockValues = baseValues({ shouldPulse: true, showDigitalTimer: false, showTime: true });

    const { result } = renderHook(() => useTimerConfig(), { wrapper });

    expect(result.current.display.shouldPulse).toBe(true);
    expect(mockUpdateValue).not.toHaveBeenCalledWith('display', expect.anything());
  });

  it('blob fossile (showActivityEmoji présent, shouldPulse:false) : la garde force true et purge le fossile', () => {
    mockValues = baseValues({
      shouldPulse: false,
      showDigitalTimer: false,
      showActivityEmoji: true,
      showTime: true,
    });

    renderHook(() => useTimerConfig(), { wrapper });

    expect(mockUpdateValue).toHaveBeenCalledWith('display', {
      shouldPulse: true,
      showDigitalTimer: false,
      showTime: true,
    });
  });

  it('préférence utilisateur explicite (pas de fossile, shouldPulse:false) : jamais écrasée', () => {
    mockValues = baseValues({ shouldPulse: false, showDigitalTimer: false, showTime: true });

    const { result } = renderHook(() => useTimerConfig(), { wrapper });

    expect(result.current.display.shouldPulse).toBe(false);
    expect(mockUpdateValue).not.toHaveBeenCalledWith('display', expect.anything());
  });
});
