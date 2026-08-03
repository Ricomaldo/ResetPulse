/**
 * @fileoverview TimeTimer — throttle du commit vers TimerConfigContext pendant
 * le drag de durée (mandat P1, 2e tentative du fix « Maximum update depth
 * exceeded »).
 *
 * Rappel du bug : chaque MOVE du drag appelait `setCurrentDuration` (context)
 * → TimerConfigContext reconstruit tout son `value` (useMemo géant, ~15
 * consommateurs) + un write AsyncStorage — en drag rapide, ces passes
 * s'empilaient plus vite que React ne les digère.
 *
 * Le fix : `timerRef.current.setDuration` (état LOCAL de useTimer) reste
 * appelé à CHAQUE frame — c'est ce qui anime l'arc. Le commit vers le
 * contexte (`setCurrentDuration`) est throttlé (~130 ms) pendant le geste, et
 * commité systématiquement au relâcher, quel que soit le throttle.
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimeTimer from '../../src/components/dial/TimeTimer';

jest.mock('../../src/hooks/useTimer', () => jest.fn());
import useTimer from '../../src/hooks/useTimer';

jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: jest.fn(),
}));
import { useTimerConfig } from '../../src/contexts/TimerConfigContext';

jest.mock('../../src/hooks/useCustomActivities', () => ({
  useCustomActivities: () => ({ incrementUsage: jest.fn() }),
}));

jest.mock('../../src/hooks/useScreenOrientation', () => ({
  useScreenOrientation: () => {},
}));

// TimerDial : sous-arbre lourd (SVG, gestes) hors périmètre — seul compte le
// callback onGraduationTap qu'on récupère sur ses props pour simuler le drag.
jest.mock('../../src/components/dial/TimerDial', () => 'TimerDial');

const mockSetDuration = jest.fn();

function makeTimerReturn() {
  return {
    running: false,
    remaining: 1500,
    isCompleted: false,
    displayMessage: 'Ready',
    progress: 1,
    duration: 1500,
    setDuration: mockSetDuration,
  };
}

function makeTimerConfig(currentDuration, setCurrentDuration) {
  return {
    timer: {
      clockwise: false,
      scaleMode: '60min',
      currentActivity: { id: 'none', label: 'None', emoji: '', isCustom: false },
      currentDuration,
    },
    setCurrentDuration,
    palette: { currentColor: '#8B4513' },
    mode: { current: 'mixte' },
  };
}

function getOnGraduationTap(renderer) {
  return renderer.root.findByType('TimerDial').props.onGraduationTap;
}

describe('TimeTimer — throttle du commit contexte pendant le drag (mandat P1)', () => {
  let nowSpy;

  beforeEach(() => {
    mockSetDuration.mockClear();
    useTimer.mockImplementation(makeTimerReturn);
    nowSpy = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it("une rafale de MOVE rapprochés (< 130 ms) ne pousse pas vers le contexte à chaque frame", () => {
    const setCurrentDuration = jest.fn();
    useTimerConfig.mockImplementation(() => makeTimerConfig(1500, setCurrentDuration));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer />);
    });
    const onGraduationTap = getOnGraduationTap(renderer);

    // Premier MOVE : le throttle est vierge (ref à 0), le premier point du
    // geste pousse toujours immédiatement — feedback initial non retardé.
    nowSpy.mockReturnValue(1000);
    act(() => onGraduationTap(20, false)); // 20min -> 1200s
    expect(setCurrentDuration).toHaveBeenCalledTimes(1);
    expect(setCurrentDuration).toHaveBeenLastCalledWith(1200);

    // Deux MOVE dans la fenêtre de throttle (50 ms, 100 ms après le push) :
    // l'arc suit (setDuration local appelé), le contexte n'est PAS repoussé.
    nowSpy.mockReturnValue(1050);
    act(() => onGraduationTap(21, false));
    nowSpy.mockReturnValue(1100);
    act(() => onGraduationTap(22, false));
    expect(setCurrentDuration).toHaveBeenCalledTimes(1); // toujours 1, pas 3

    // L'arc local, lui, a bien suivi chaque frame (jamais throttlé).
    expect(mockSetDuration).toHaveBeenCalledTimes(3);
    expect(mockSetDuration).toHaveBeenNthCalledWith(1, 1200);
    expect(mockSetDuration).toHaveBeenNthCalledWith(2, 1260);
    expect(mockSetDuration).toHaveBeenNthCalledWith(3, 1320);

    // MOVE au-delà du délai (200 ms après le dernier push) : nouveau commit.
    nowSpy.mockReturnValue(1200);
    act(() => onGraduationTap(23, false));
    expect(setCurrentDuration).toHaveBeenCalledTimes(2);
    expect(setCurrentDuration).toHaveBeenLastCalledWith(1380);
  });

  it('le RELEASE commit toujours la valeur finale, même juste après un push throttlé (pas avalé par le throttle)', () => {
    const setCurrentDuration = jest.fn();
    useTimerConfig.mockImplementation(() => makeTimerConfig(1500, setCurrentDuration));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer />);
    });
    const onGraduationTap = getOnGraduationTap(renderer);

    nowSpy.mockReturnValue(1000);
    act(() => onGraduationTap(20, false)); // push immédiat -> 1200
    expect(setCurrentDuration).toHaveBeenCalledTimes(1);

    // Relâcher 10ms plus tard seulement (bien en-deçà des 130ms) : le commit
    // final ne doit PAS être avalé par le throttle.
    nowSpy.mockReturnValue(1010);
    act(() => onGraduationTap(24, true)); // 24min -> snap 60min -> 1440s
    expect(setCurrentDuration).toHaveBeenCalledTimes(2);
    expect(setCurrentDuration).toHaveBeenLastCalledWith(1440);
  });

  it("une rafale de moves + release → le contexte reçoit la DERNIÈRE valeur (pas une valeur intermédiaire avalée)", () => {
    const setCurrentDuration = jest.fn();
    useTimerConfig.mockImplementation(() => makeTimerConfig(1500, setCurrentDuration));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer />);
    });
    const onGraduationTap = getOnGraduationTap(renderer);

    nowSpy.mockReturnValue(1000);
    act(() => onGraduationTap(10, false));
    nowSpy.mockReturnValue(1030);
    act(() => onGraduationTap(15, false));
    nowSpy.mockReturnValue(1060);
    act(() => onGraduationTap(18, false));
    nowSpy.mockReturnValue(1090);
    act(() => onGraduationTap(22, true)); // release -> commit final systématique

    const lastCall = setCurrentDuration.mock.calls[setCurrentDuration.mock.calls.length - 1];
    expect(lastCall[0]).toBe(22 * 60);
  });

  it("la resync contexte→timer ne s'active pas à contretemps après un commit throttlé (le garde reconnaît son propre écrit)", () => {
    const setCurrentDuration = jest.fn();
    let currentDuration = 1500;
    useTimerConfig.mockImplementation(() => makeTimerConfig(currentDuration, setCurrentDuration));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer />);
    });
    mockSetDuration.mockClear(); // ignore l'appel d'initialisation
    const onGraduationTap = getOnGraduationTap(renderer);

    nowSpy.mockReturnValue(1000);
    act(() => onGraduationTap(20, false)); // push -> setCurrentDuration(1200)
    expect(mockSetDuration).toHaveBeenCalledTimes(1); // le seul appel : celui du geste

    // Le contexte "réel" (simulé) reflète maintenant la valeur commitée —
    // on force un re-render avec ce nouveau currentDuration, comme le ferait
    // TimerConfigProvider après son propre re-render.
    currentDuration = 1200;
    act(() => {
      renderer.update(<TimeTimer />);
    });

    // Le garde `lastSyncedContextDurationRef` doit reconnaître que ce
    // changement de contexte est le sien (déjà posé au moment du commit) —
    // l'effet de resync ne doit PAS rejouer timer.setDuration une 2e fois.
    expect(mockSetDuration).toHaveBeenCalledTimes(1);
  });
});
