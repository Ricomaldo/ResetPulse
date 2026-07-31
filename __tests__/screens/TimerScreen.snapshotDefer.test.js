/**
 * @fileoverview TimerScreen — handleTimerRef casse la chaîne imbriquée
 * (mandat lot-fix-drag) : une rafale de notifications ne programme qu'UN
 * seul setSnapshot différé, avec la dernière valeur.
 *
 * TimeTimer est stubbé (sous-arbre hors périmètre — déjà couvert par
 * TimeTimer.onTimerRef.test.js) : le stub expose l'`onTimerRef` reçu pour
 * que le test puisse simuler exactement ce que TimeTimer envoie
 * (timerRef.current, à chaque notification réelle). C'est le point
 * d'intégration réel entre les deux fichiers du correctif — TimerScreen
 * n'avait jamais été monté en test avant ce lot ; les mocks ci-dessous
 * (safe-area-context, gesture-handler) complètent l'infra jest existante
 * (déjà mockée pour reanimated/svg/ThemeProvider dans jest.setup.js).
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerScreen from '../../src/screens/TimerScreen';
// Mocké ci-dessous (TimeTimerStub) — importé pour le retrouver dans l'arbre
// via findByType, plus robuste que findByProps + expect.any(Function).
import TimeTimer from '../../src/components/dial/TimeTimer';

// react-native-safe-area-context : jamais monté en test avant ce lot — le
// mock officiel du package fournit SafeAreaProvider/SafeAreaView avec des
// insets par défaut (sans lui, SafeAreaProvider ne rend aucun enfant en
// environnement jsdom/test-renderer, faute de mesure de layout réelle).
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Le mock global (jest.setup.js) de react-native-gesture-handler ne chaîne
// pas le builder Gesture.Tap().numberOfTaps().maxDelay().onEnd() utilisé par
// TimerScreen (double-tap fond → Focus) — override local, chainable.
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  const chainable = () => {
    const obj = {};
    ['numberOfTaps', 'maxDelay', 'onStart', 'onEnd', 'onUpdate', 'onBegin', 'onFinalize', 'minDistance', 'activateAfterLongPress', 'onChange', 'shouldCancelWhenOutside', 'enabled'].forEach((m) => {
      obj[m] = () => obj;
    });
    return obj;
  };
  return {
    Gesture: { Tap: chainable, LongPress: chainable, Pan: chainable },
    GestureDetector: ({ children }) => children,
    GestureHandlerRootView: RN.View,
    ScrollView: RN.View,
    Swipeable: RN.View,
    DrawerLayout: RN.View,
    State: {},
    Directions: {},
  };
});

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

jest.mock('../../src/hooks/usePaletteGating', () => ({
  usePaletteGating: () => undefined,
}));

jest.mock('../../src/hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false, isLoading: false }),
}));

jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

function makeTimer({ running = false, remaining = 240, isCompleted = false, displayMessage = 'Ready' } = {}) {
  return { running, remaining, isCompleted, displayMessage, duration: 240, progress: 1 };
}

describe('TimerScreen — handleTimerRef casse la chaîne imbriquée (fix drag rapide)', () => {
  let renderer;

  beforeEach(() => {
    capturedOnTimerRef = null;
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

  it('une rafale de notifications ne produit qu’un seul setSnapshot différé, avec la dernière valeur', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    expect(typeof capturedOnTimerRef).toBe('function');

    // Baseline : TimerScreen arme déjà d'autres minuteurs à lui, sans
    // rapport avec le correctif (pastille « surprends-moi » 4s, invitations
    // post-première-fois — chacun via usePersistedState, réel, non mocké).
    // Seul le DELTA après la rafale nous intéresse.
    const timerCountBeforeBurst = jest.getTimerCount();

    // Rafale : simule des ticks de drag rapide successifs (remaining
    // décroît à chaque frame, comme le ferait TimeTimer réel après le
    // correctif — un timer object frais et réellement différent à chaque
    // notification). running=true pour que le temps affiché en haut
    // d'écran (TopTime) suive `remaining` — sinon il affiche la durée
    // réglée, indépendante de la rafale, et le test ne prouverait rien.
    act(() => {
      capturedOnTimerRef(makeTimer({ running: true, remaining: 239 }));
      capturedOnTimerRef(makeTimer({ running: true, remaining: 238 }));
      capturedOnTimerRef(makeTimer({ running: true, remaining: 237 }));
      capturedOnTimerRef(makeTimer({ running: true, remaining: 236 }));
    });

    // Un seul différé en vol pour toute la rafale (cancel-and-replace) —
    // jamais quatre setTimeout empilés en plus de la baseline.
    expect(jest.getTimerCount()).toBe(timerCountBeforeBurst + 1);

    await act(async () => {
      jest.runAllTimers();
    });

    // 236 s = 03:56 — le temps digital (TopTime) ne montre que la DERNIÈRE
    // valeur de la rafale, jamais une valeur intermédiaire (03:59/03:58/
    // 03:57) : la coalescence est invisible pour l'utilisateur.
    const tree = JSON.stringify(renderer.toJSON());
    expect(tree).toContain('03:56');
    expect(tree).not.toContain('03:59');
    expect(tree).not.toContain('03:58');
    expect(tree).not.toContain('03:57');
  });

  it('handleDialTap (tap) lit timerRef.current de façon synchrone, sans attendre le différé', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    const timer = {
      ...makeTimer({ running: false }),
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
      resetTimer: jest.fn(),
    };
    act(() => {
      capturedOnTimerRef(timer);
    });

    // Ne PAS flusher les timers ici : timerRef.current doit déjà pointer
    // sur l'objet frais avant même que le différé de snapshot ne parte —
    // c'est la garantie que le tap (start/stop/reset) ne dépend jamais du
    // différé, seulement de l'assignation synchrone `timerRef.current = timer`.
    const dialTapView = renderer.root.findByType(TimeTimer);
    act(() => {
      dialTapView.props.onDialTap();
    });

    expect(timer.startTimer).toHaveBeenCalledTimes(1);
  });
});
