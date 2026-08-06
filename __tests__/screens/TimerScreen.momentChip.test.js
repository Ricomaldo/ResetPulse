/**
 * @fileoverview TimerScreen — chip intelligent (Lambda R2, Q3b, arbitrage
 * Eric « à essayer ») : « un rituel remplit un cadran vierge ; un cadran
 * déjà réglé, il ne change que l'activité. » Ce test couvre le branchement
 * écran (CompactRow) — les transitions pures de l'état SALE/VIERGE sont
 * couvertes indépendamment par __tests__/config/moment.test.js.
 *
 * Scaffolding de mocks repris de TimerScreen.snapshotDefer.test.js (même
 * périmètre : TimerScreen réel, sous-arbres stubbés) — favoriteRituals et
 * les setters du contexte diffèrent pour exercer CompactRow réellement.
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerScreen from '../../src/screens/TimerScreen';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

let capturedTimeTimerProps = null;
jest.mock('../../src/components/dial/TimeTimer', () => (props) => {
  capturedTimeTimerProps = props;
  return null;
});
// Stub qui capture ses props — sert à déclencher `onRitualApplied` comme le
// ferait RitualsPanel (panneau « Mes rituels ») sans monter tout AsideZone
// (Gesture.Pan chaîné, hors périmètre de ce test).
let capturedAsideZoneProps = null;
jest.mock('../../src/components/layout/AsideZone', () => (props) => {
  capturedAsideZoneProps = props;
  return null;
});
jest.mock('../../src/components/first-run/FirstRunTips', () => () => null);
jest.mock('../../src/components/first-run/FirstRunThreshold', () => () => null);

const mockSetCurrentActivity = jest.fn();
const mockSetCurrentDuration = jest.fn();
const mockSetSelectedSoundId = jest.fn();
const mockSetColorByValue = jest.fn();
const mockSetColorIndex = jest.fn();
const mockTrackRitualApplied = jest.fn();

jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    mode: { current: 'mixte' },
    setMode: jest.fn(),
    timer: { currentDuration: 240, currentActivity: { id: 'none', emoji: '' }, selectedSoundId: 'bell_classic' },
    palette: { currentColor: '#8B4513', paletteColors: ['#8B4513', '#2E7D32'] },
    display: { showTime: true },
    setCurrentActivity: mockSetCurrentActivity,
    setCurrentDuration: mockSetCurrentDuration,
    setSelectedSoundId: mockSetSelectedSoundId,
    setColorByValue: mockSetColorByValue,
    setColorIndex: mockSetColorIndex,
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackRitualApplied: mockTrackRitualApplied,
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

// Un seul rituel favori — réel (config/rituals.js non mocké) : le payload
// résolu (activité/durée/couleur/son) vient de buildRitualApplyPayload.
jest.mock('../../src/hooks/useRituals', () => ({
  useRituals: () => ({
    favoriteRituals: [
      {
        id: 'ritual_work',
        name: 'Travail',
        activityId: 'work',
        color: '#111111',
        duration: 1500,
        soundId: 'chime',
        steps: [],
      },
    ],
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

describe('TimerScreen — chip intelligent (CompactRow, Q3b)', () => {
  let renderer;

  const pressChip = () => {
    const chip = renderer.root.findByProps({ testID: 'ritual.item.ritual_work' });
    act(() => {
      chip.props.onPress();
    });
  };

  const pressColorDot = (index) => {
    const dot = renderer.root.findByProps({ testID: `palette.dot.${index}` });
    act(() => {
      dot.props.onPress();
    });
  };

  beforeEach(() => {
    capturedTimeTimerProps = null;
    capturedAsideZoneProps = null;
    mockSetCurrentActivity.mockClear();
    mockSetCurrentDuration.mockClear();
    mockSetSelectedSoundId.mockClear();
    mockSetColorByValue.mockClear();
    mockSetColorIndex.mockClear();
    mockTrackRitualApplied.mockClear();
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => {
        renderer.unmount();
      });
      renderer = null;
    }
  });

  it('Moment vierge : le tap applique le rituel EN ENTIER (activité + durée + couleur + son)', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    pressChip();

    expect(mockSetCurrentActivity).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1500);
    expect(mockSetSelectedSoundId).toHaveBeenCalledWith('chime');
    expect(mockSetColorByValue).toHaveBeenCalledWith('#111111');
    // Non-régression (purge activity_selected, audit 06/08) : ritual_applied
    // reste le seul événement du chemin home_row, mode 'full' porté.
    expect(mockTrackRitualApplied).toHaveBeenCalledTimes(1);
    expect(mockTrackRitualApplied).toHaveBeenCalledWith('home_row', 'full');
  });

  it('Moment sale (couleur réglée à la main) : le tap ne touche QUE l\'activité', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    // Réglage manuel de couleur (rangée d'accueil) — salit le Moment.
    pressColorDot(1);
    mockSetCurrentActivity.mockClear(); // isole le tap chip qui suit

    pressChip();

    expect(mockSetCurrentActivity).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentDuration).not.toHaveBeenCalled();
    expect(mockSetSelectedSoundId).not.toHaveBeenCalled();
    expect(mockSetColorByValue).not.toHaveBeenCalled();
    // mode 'activity_only' toujours porté par ritual_applied, même chemin
    // partiel — ce n'est plus activity_selected qui distingue ce cas.
    expect(mockTrackRitualApplied).toHaveBeenCalledTimes(1);
    expect(mockTrackRitualApplied).toHaveBeenCalledWith('home_row', 'activity_only');
  });

  it('un rembobinage (stopTimer, tap pendant la séance) remet le Moment à vierge : le chip redevient complet', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    pressColorDot(1); // salit
    mockSetCurrentActivity.mockClear();

    pressChip(); // sale : partiel, l'activité seule
    expect(mockSetCurrentDuration).not.toHaveBeenCalled();

    // Rembobinage (ADR-007) : tap pendant la séance → handleDialTap lit
    // timerRef.current.running et appelle stopTimer() — événement de
    // nettoyage du Moment (cf. src/config/moment.js).
    const fakeTimer = {
      running: true,
      isCompleted: false,
      remaining: 100,
      displayMessage: '',
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
      resetTimer: jest.fn(),
    };
    act(() => {
      capturedTimeTimerProps.onTimerRef(fakeTimer);
    });
    act(() => {
      capturedTimeTimerProps.onDialTap();
    });
    expect(fakeTimer.stopTimer).toHaveBeenCalledTimes(1);

    mockSetCurrentDuration.mockClear();
    mockSetSelectedSoundId.mockClear();
    mockSetColorByValue.mockClear();

    pressChip(); // vierge à nouveau : apply complet

    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1500);
    expect(mockSetSelectedSoundId).toHaveBeenCalledWith('chime');
    expect(mockSetColorByValue).toHaveBeenCalledWith('#111111');
  });

  it('un apply complet depuis le panneau "Mes rituels" (AsideZone.onRitualApplied) remet aussi le Moment à vierge', async () => {
    await act(async () => {
      renderer = create(<TimerScreen />);
    });

    pressColorDot(1); // salit
    expect(typeof capturedAsideZoneProps.onRitualApplied).toBe('function');

    // Signal que RitualsPanel envoie à CHAQUE apply (toujours complet) —
    // relayé par AsideZone, cf. AsideZone.jsx onApplied.
    act(() => {
      capturedAsideZoneProps.onRitualApplied();
    });

    mockSetCurrentDuration.mockClear();
    mockSetSelectedSoundId.mockClear();
    mockSetColorByValue.mockClear();

    pressChip(); // vierge à nouveau : apply complet, pas seulement l'activité

    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1500);
    expect(mockSetSelectedSoundId).toHaveBeenCalledWith('chime');
    expect(mockSetColorByValue).toHaveBeenCalledWith('#111111');
  });
});
