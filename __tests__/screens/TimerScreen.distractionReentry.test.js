/**
 * @fileoverview TimerScreen — ré-entrée du dé Distraction (retour Eric 03/08) :
 * enchaîner les taps rapidement doit faire du cancel-and-replace, jamais de
 * l'empilement — chaque nouveau tirage ANNULE le timeout du précédent, et le
 * retour à l'ambiant (`distraction: null` vers TimeTimer → PulseButton) part
 * de la fin du DERNIER tirage, pas du premier. Sans le cancel, le timeout du
 * 1er tap coupait le 3e tirage en plein vol (« l'emoji se réinitialise pas et
 * ça fait des choses bizarres »).
 *
 * Le volet visuel du même bug (shared values gelées en plein vol au
 * changement de mouvement) vit dans useEmojiMovement — non testable ici : le
 * mock Reanimated de jest.setup collapse withRepeat/withSequence à leur
 * valeur finale, une valeur « gelée en plein vol » n'y existe pas.
 *
 * Scaffolding de mocks repris de TimerScreen.snapshotDefer.test.js (même
 * périmètre : TimerScreen réel, sous-arbres stubbés).
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerScreen from '../../src/screens/TimerScreen';
import { MOVEMENTS } from '../../src/components/dial/movements/movements';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Le double-tap fond → Focus est mort (Lambda R2 Q2, arbitrage Eric) — plus
// aucun builder Gesture chaîné dans TimerScreen. Le mock global
// (jest.setup.js) suffit désormais, plus d'override local.

// Stub TimeTimer : capture la prop `distraction` que TimerScreen fait
// descendre vers PulseButton — c'est le contrat observé par ce test.
let capturedDistraction = null;

jest.mock('../../src/components/dial/TimeTimer', () => {
  return function TimeTimerStub(props) {
    capturedDistraction = props.distraction;
    return null;
  };
});

jest.mock('../../src/components/layout/AsideZone', () => () => null);
jest.mock('../../src/components/first-run/FirstRunTips', () => () => null);
jest.mock('../../src/components/first-run/FirstRunThreshold', () => () => null);

jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    mode: { current: 'mixte' },
    setMode: jest.fn(),
    timer: { currentDuration: 240, currentActivity: { id: 'none', emoji: '' }, selectedSoundId: 'bell_classic' },
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

jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackActivitySelected: jest.fn(),
    trackRitualApplied: jest.fn(),
    trackColorSelected: jest.fn(),
    trackDiceRolled: jest.fn(),
    trackFocusEntered: jest.fn(),
    trackFirstMomentStarted: jest.fn(),
    trackFirstMomentCompleted: jest.fn(),
    trackAmbiancesInvitationShown: jest.fn(),
    trackAmbiancesInvitationTapped: jest.fn(),
    trackRitualKept: jest.fn(),
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

jest.mock('../../src/hooks/useDormantTips', () => ({
  useDormantTips: () => ({
    activeTip: null,
    markFocusTried: jest.fn(),
    markPalettesOpened: jest.fn(),
    dismissActiveTip: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/useRituals', () => ({
  useRituals: () => ({
    favoriteRituals: [],
    rituals: [],
    updateRitual: jest.fn(),
    createRitual: jest.fn(),
    ensureRitualFavorite: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/useCustomActivities', () => ({
  useCustomActivities: () => ({ customActivities: [], incrementUsage: jest.fn() }),
}));

jest.mock('../../src/hooks/useSessionCount', () => ({
  useSessionCount: () => ({
    completedSessions: 0,
    incrementSessionCount: jest.fn(),
    isLoading: false,
  }),
}));

// Lambda V : les gating exposent désormais la retombée — les mocks suivent
// le contrat réel (pas de retombée dans ces scénarios).
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

describe('TimerScreen — dé Distraction enchaîné : cancel-and-replace, retour net à l’ambiant', () => {
  let renderer;

  const pressDice = () => {
    const dice = renderer.root.findByProps({ testID: 'timer.dice' });
    act(() => {
      dice.props.onPress();
    });
  };

  beforeEach(() => {
    capturedDistraction = null;
    jest.useFakeTimers();
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => {
        renderer.unmount();
      });
      renderer = null;
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('trois taps rapides : un seul retour à null, 2 s après le DERNIER tirage', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    // Tap 1 (t=0) : un tirage part vers le dial.
    pressDice();
    expect(capturedDistraction).not.toBeNull();
    expect(MOVEMENTS).toContain(capturedDistraction.movement);
    const first = capturedDistraction;

    // Tap 2 (t=800) : nouveau tirage, jamais le même mouvement d'affilée.
    act(() => { jest.advanceTimersByTime(800); });
    pressDice();
    expect(capturedDistraction).not.toBeNull();
    expect(capturedDistraction.movement).not.toBe(first.movement);
    const second = capturedDistraction;

    // Tap 3 (t=1600) : idem.
    act(() => { jest.advanceTimersByTime(800); });
    pressDice();
    expect(capturedDistraction).not.toBeNull();
    expect(capturedDistraction.movement).not.toBe(second.movement);
    const third = capturedDistraction;

    // t=3500 : les timeouts des taps 1 (échéance t=2000) et 2 (t=2800) ont
    // été ANNULÉS — le 3e tirage est toujours en scène, pas coupé en vol.
    act(() => { jest.advanceTimersByTime(1900); });
    expect(capturedDistraction).toBe(third);

    // t=3600 : 2 s après le dernier tap — retour NET à l'ambiant.
    act(() => { jest.advanceTimersByTime(100); });
    expect(capturedDistraction).toBeNull();
  });
});
