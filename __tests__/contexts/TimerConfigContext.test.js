// Tests for TimerConfigContext — absence de garde-fossile shouldPulse
// (lot gardes-v3, 07/08).
//
// Historique : la garde-fossile every-boot qui vivait ici (QA visuelle #1
// bug 1, Lambda X 04/08 — un blob @ResetPulse:config écrit avant ec76ff2,
// halo ON par défaut 31/07, portait shouldPulse:false + le champ mort
// showActivityEmoji) a été consolidée dans CONFIG_MIGRATIONS[2]
// (src/config/config-schema.js), run-once, cf. équivalence détaillée dans
// __tests__/config/config-migrations.test.js. Ce fichier ne teste donc plus
// une correction du CONTEXTE, mais l'inverse : le contexte n'en fait plus
// aucune — il fait confiance à ce que usePersistedObject (migration +
// deepMergeDefaults) lui a déjà livré, même sur un blob qui contient encore
// le fossile (le mock ci-dessous simule un usePersistedObject qui n'a PAS
// fait tourner la migration, pour isoler le comportement du contexte seul).
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

describe('TimerConfigContext — plus de garde-fossile shouldPulse (consolidée en migration, lot gardes-v3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installation neuve (pas de fossile) : shouldPulse true, aucune écriture display', () => {
    mockValues = baseValues({ shouldPulse: true, showDigitalTimer: false, showTime: true });

    const { result } = renderHook(() => useTimerConfig(), { wrapper });

    expect(result.current.display.shouldPulse).toBe(true);
    expect(mockUpdateValue).not.toHaveBeenCalledWith('display', expect.anything());
  });

  it('blob fossile (showActivityEmoji présent, shouldPulse:false) livré tel quel par usePersistedObject : le contexte ne le corrige plus', () => {
    mockValues = baseValues({
      shouldPulse: false,
      showDigitalTimer: false,
      showActivityEmoji: true,
      showTime: true,
    });

    const { result } = renderHook(() => useTimerConfig(), { wrapper });

    // Le contexte n'a plus de useEffect de correction : il expose la valeur
    // reçue telle quelle. C'est CONFIG_MIGRATIONS[2] (config-schema.js) qui
    // porte désormais cette correction, en amont, run-once — cf.
    // __tests__/config/config-migrations.test.js pour son équivalence.
    expect(result.current.display.shouldPulse).toBe(false);
    expect(mockUpdateValue).not.toHaveBeenCalledWith('display', expect.anything());
  });

  it('préférence utilisateur explicite (pas de fossile, shouldPulse:false) : jamais écrasée', () => {
    mockValues = baseValues({ shouldPulse: false, showDigitalTimer: false, showTime: true });

    const { result } = renderHook(() => useTimerConfig(), { wrapper });

    expect(result.current.display.shouldPulse).toBe(false);
    expect(mockUpdateValue).not.toHaveBeenCalledWith('display', expect.anything());
  });
});
