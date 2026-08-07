/**
 * @fileoverview TimerScreen — « garde ce moment ? » Option A « Tenir jusqu'à
 * action » (07/08). Couvre : verrou consommé à l'ACTION (pas à l'affichage),
 * persistance au-delà de l'auto-effacement de l'état complété, teardown à la
 * nouvelle séance, et extinction des astuces dormantes pendant la fenêtre.
 *
 * Scaffolding repris de TimerScreen.snapshotDefer.test.js : TimeTimer stubbé
 * (le stub capture `onTimerRef` pour piloter timerRef.current / snapshot).
 * `usePersistedState` est mocké pour rendre le verrou déterministe (sinon son
 * chargement async parasite la fenêtre) — un setter par clé, capturé.
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerScreen from '../../src/screens/TimerScreen';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

let capturedOnTimerRef = null;
jest.mock('../../src/components/dial/TimeTimer', () => {
  return function TimeTimerStub(props) {
    capturedOnTimerRef = props.onTimerRef;
    return null;
  };
});

jest.mock('../../src/components/layout/AsideZone', () => () => null);
jest.mock('../../src/components/first-run/FirstRunTips', () => () => null);
jest.mock('../../src/components/first-run/FirstRunThreshold', () => () => null);

// Verrou persisté déterministe : un setter par clé (capturé), value = défaut,
// jamais « loading ». On assert sur l'appel du setter, pas sur AsyncStorage.
const mockPersistedSetters = {};
jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: (key, defaultValue) => {
    if (!mockPersistedSetters[key]) {
      mockPersistedSetters[key] = jest.fn();
    }
    return [defaultValue, mockPersistedSetters[key], false];
  },
}));

jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    mode: { current: 'mixte' },
    setMode: jest.fn(),
    timer: {
      currentDuration: 1200,
      currentActivity: { id: 'meditation', emoji: '🧘', label: 'Méditation' },
      selectedSoundId: 'bell_classic',
    },
    palette: { currentColor: '#8B4513', paletteColors: ['#8B4513'] },
    display: { showTime: true },
    setCurrentActivity: jest.fn(),
    setCurrentDuration: jest.fn(),
    setSelectedSoundId: jest.fn(),
    setColorByValue: jest.fn(),
    setColorIndex: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

const mockTrackRitualKept = jest.fn();
const mockTrackRitualKeepShown = jest.fn();
const mockTrackRitualDismissed = jest.fn();
jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackRitualApplied: jest.fn(),
    trackColorSelected: jest.fn(),
    trackDiceRolled: jest.fn(),
    trackFocusEntered: jest.fn(),
    trackFirstMomentStarted: jest.fn(),
    trackFirstMomentCompleted: jest.fn(),
    trackAmbiancesInvitationShown: jest.fn(),
    trackAmbiancesInvitationTapped: jest.fn(),
    trackRitualKept: mockTrackRitualKept,
    trackRitualKeepShown: mockTrackRitualKeepShown,
    trackRitualDismissed: mockTrackRitualDismissed,
  }),
}));

jest.mock('../../src/hooks/useFirstRun', () => ({
  useFirstRun: () => ({
    hasSeenFirstRun: true,
    hasSeenThreshold: true,
    isLoading: false,
    moment: null,
    completeFirstRun: jest.fn(),
    markDialTouched: jest.fn(),
    markActivityTouched: jest.fn(),
    markColorTouched: jest.fn(),
    skipFirstRun: jest.fn(),
    completeThreshold: jest.fn(),
  }),
}));

// Capture les args passés à useDormantTips pour vérifier le gate `enabled`.
let mockDormantArgs = null;
jest.mock('../../src/hooks/useDormantTips', () => ({
  useDormantTips: (args) => {
    mockDormantArgs = args;
    return {
      activeTip: null,
      markFocusTried: jest.fn(),
      markPalettesOpened: jest.fn(),
      dismissActiveTip: jest.fn(),
    };
  },
}));

const mockUpdateRitual = jest.fn();
const mockCreateRitual = jest.fn(() => ({ id: 'ritual_perso' }));
const mockEnsureRitualFavorite = jest.fn();
jest.mock('../../src/hooks/useRituals', () => ({
  useRituals: () => ({
    favoriteRituals: [],
    rituals: [],
    updateRitual: mockUpdateRitual,
    createRitual: mockCreateRitual,
    ensureRitualFavorite: mockEnsureRitualFavorite,
  }),
}));

jest.mock('../../src/hooks/useCustomActivities', () => ({
  useCustomActivities: () => ({ customActivities: [], incrementUsage: jest.fn() }),
}));

// completedSessions === 1 : condition de déclenchement de « garde ce moment ? ».
jest.mock('../../src/hooks/useSessionCount', () => ({
  useSessionCount: () => ({
    completedSessions: 1,
    incrementSessionCount: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('../../src/hooks/usePaletteGating', () => ({
  usePaletteGating: () => ({ returnedPalette: null }),
}));
jest.mock('../../src/hooks/useSoundGating', () => ({
  useSoundGating: () => ({ returnedSoundId: null }),
}));
jest.mock('../../src/hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false, isLoading: false }),
}));
jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

const KEEP_KEY = '@ResetPulse:hasSeenKeepMoment';

function sendTimer({ running = false, remaining = 0, isCompleted = false } = {}) {
  return {
    running,
    remaining,
    isCompleted,
    displayMessage: isCompleted ? 'Bravo' : 'Ready',
    duration: 1200,
    progress: 1,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
    resetTimer: jest.fn(),
  };
}

const has = (renderer, testID) =>
  renderer.root.findAllByProps({ testID }).length > 0;

describe('TimerScreen — « garde ce moment ? » Option A (tenir jusqu\'à action)', () => {
  let renderer;

  const flush = async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  };

  // Amène l'écran à la fin de la 1re séance : l'invitation se déclenche.
  const completeFirstSession = async () => {
    act(() => {
      capturedOnTimerRef(sendTimer({ isCompleted: true, running: false }));
    });
    await flush();
  };

  beforeEach(() => {
    capturedOnTimerRef = null;
    mockDormantArgs = null;
    jest.useFakeTimers();
    [mockTrackRitualKept, mockTrackRitualKeepShown, mockTrackRitualDismissed,
      mockUpdateRitual, mockCreateRitual, mockEnsureRitualFavorite].forEach((f) => f.mockClear());
    mockCreateRitual.mockReturnValue({ id: 'ritual_perso' });
    Object.values(mockPersistedSetters).forEach((f) => f.mockClear());
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => { renderer.unmount(); });
      renderer = null;
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('fin de la 1re séance : l\'invitation s\'affiche, trackRitualKeepShown émis, verrou NON consommé', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();

    expect(has(renderer, 'keepMoment.keep')).toBe(true);
    expect(mockTrackRitualKeepShown).toHaveBeenCalledTimes(1);
    // Le verrou ne doit PAS être posé à l'affichage (cœur du bug).
    expect(mockPersistedSetters[KEEP_KEY]).not.toHaveBeenCalledWith(true);
  });

  it('persiste au-delà de l\'auto-effacement de l\'état complété (régression bug-2)', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();
    expect(has(renderer, 'keepMoment.keep')).toBe(true);

    // L'état complété retombe (repos) — comme le ferait useTimer à ~4,1 s.
    act(() => {
      capturedOnTimerRef(sendTimer({ isCompleted: false, running: false }));
    });
    await flush();

    // Option A : l'invitation reste visible, elle ne file plus.
    expect(has(renderer, 'keepMoment.keep')).toBe(true);
  });

  it('« garder » : crée le rituel, l\'épingle, consomme le verrou, confirme puis se retire', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();

    act(() => {
      renderer.root.findByProps({ testID: 'keepMoment.keep' }).props.onPress();
    });

    expect(mockCreateRitual).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: 'meditation', color: '#8B4513', duration: 1200, soundId: 'bell_classic' }),
    );
    expect(mockEnsureRitualFavorite).toHaveBeenCalledWith('ritual_perso');
    expect(mockTrackRitualKept).toHaveBeenCalledTimes(1);
    expect(mockPersistedSetters[KEEP_KEY]).toHaveBeenCalledWith(true);
    expect(has(renderer, 'keepMoment.kept')).toBe(true);

    // Confirmation « gardé ✨ » ~1,8 s puis retrait.
    await act(async () => { jest.advanceTimersByTime(1800); });
    expect(has(renderer, 'keepMoment.kept')).toBe(false);
    expect(has(renderer, 'keepMoment.keep')).toBe(false);
  });

  it('« passer » : consomme le verrou, ne sauvegarde rien, se retire', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();

    act(() => {
      renderer.root.findByProps({ testID: 'keepMoment.dismiss' }).props.onPress();
    });

    expect(mockTrackRitualDismissed).toHaveBeenCalledTimes(1);
    expect(mockPersistedSetters[KEEP_KEY]).toHaveBeenCalledWith(true);
    expect(mockCreateRitual).not.toHaveBeenCalled();
    expect(mockUpdateRitual).not.toHaveBeenCalled();
    expect(has(renderer, 'keepMoment.keep')).toBe(false);
    expect(has(renderer, 'keepMoment.kept')).toBe(false);
  });

  it('démarrer une nouvelle séance retire l\'invitation (sans agir)', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();
    expect(has(renderer, 'keepMoment.keep')).toBe(true);

    act(() => {
      capturedOnTimerRef(sendTimer({ isCompleted: false, running: true, remaining: 1200 }));
    });
    await flush();

    expect(has(renderer, 'keepMoment.keep')).toBe(false);
  });

  it('les astuces dormantes sont désarmées pendant que l\'invitation est là', async () => {
    await act(async () => { renderer = create(<TimerScreen />); });
    await completeFirstSession();

    // État complété retombé mais invitation encore là (persistée) : le gate
    // doit rester désarmé sur toute la fenêtre, pas juste isCompleted.
    act(() => {
      capturedOnTimerRef(sendTimer({ isCompleted: false, running: false }));
    });
    await flush();

    expect(has(renderer, 'keepMoment.keep')).toBe(true);
    expect(mockDormantArgs.enabled).toBe(false);
  });
});
