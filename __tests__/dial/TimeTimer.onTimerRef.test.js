/**
 * @fileoverview TimeTimer — l'effet onTimerRef ne re-notifie pas le parent
 * quand les primitifs consommés en aval (running/remaining/isCompleted/
 * displayMessage) sont stables entre renders.
 *
 * Régression « Maximum update depth exceeded » au drag rapide (lot-fix-drag) :
 * useTimer() renvoie un objet NEUF à chaque render. Avant le correctif,
 * l'effet dépendait de cet objet (`[onTimerRef, timer]`) et refirait à
 * CHAQUE render, même quand rien n'avait réellement changé. Le mock de
 * useTimer ci-dessous reproduit fidèlement ce trait (nouvelle référence à
 * chaque appel, valeurs contrôlées séparément) — un test qui renverrait le
 * même objet à chaque fois ne distinguerait pas l'ancien code du nouveau.
 */
import React from 'react';
import { create, act } from 'react-test-renderer';
import TimeTimer from '../../src/components/dial/TimeTimer';

jest.mock('../../src/hooks/useTimer', () => jest.fn());
import useTimer from '../../src/hooks/useTimer';

jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    timer: {
      clockwise: true,
      scaleMode: 'minutes',
      currentActivity: { id: 'none', label: 'None', emoji: '', isCustom: false },
      currentDuration: 240,
    },
    setCurrentDuration: jest.fn(),
    palette: { currentColor: '#8B4513' },
    mode: { current: 'mixte' },
  }),
}));

jest.mock('../../src/contexts/TimerRemainingContext', () => ({
  useTimerRemaining: () => ({ setTimerRemaining: jest.fn() }),
}));

jest.mock('../../src/hooks/useCustomActivities', () => ({
  useCustomActivities: () => ({ incrementUsage: jest.fn() }),
}));

jest.mock('../../src/hooks/useScreenOrientation', () => ({
  useScreenOrientation: () => {},
}));

// TimerDial : sous-arbre lourd (SVG, gestes) hors périmètre de ce test —
// seule compte la notification onTimerRef portée par TimeTimer lui-même.
jest.mock('../../src/components/dial/TimerDial', () => 'TimerDial');

/**
 * Fabrique un retour useTimer() avec une IDENTITÉ D'OBJET NEUVE à chaque
 * appel (fidèle au vrai hook), pour des primitifs donnés.
 */
function makeTimerReturn({
  running = false,
  remaining = 240,
  isCompleted = false,
  displayMessage = 'Ready',
} = {}) {
  return {
    running,
    remaining,
    isCompleted,
    displayMessage,
    progress: 1,
    duration: 240,
    setDuration: jest.fn(),
  };
}

describe('TimeTimer — effet onTimerRef (fix nested-update drag rapide)', () => {
  beforeEach(() => {
    useTimer.mockReset();
  });

  it('ne notifie qu’une fois quand les primitifs sont stables sur 2 renders', () => {
    const onTimerRef = jest.fn();
    useTimer.mockImplementation(() => makeTimerReturn({ remaining: 240 }));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer onTimerRef={onTimerRef} />);
    });
    expect(onTimerRef).toHaveBeenCalledTimes(1);

    // Second render, mêmes primitifs (mais useTimer renvoie un objet NEUF —
    // c'est justement ce que l'ancien code aurait re-notifié).
    act(() => {
      renderer.update(<TimeTimer onTimerRef={onTimerRef} />);
    });
    expect(onTimerRef).toHaveBeenCalledTimes(1);
  });

  it('notifie de nouveau quand un primitif change réellement (remaining)', () => {
    const onTimerRef = jest.fn();
    useTimer.mockImplementation(() => makeTimerReturn({ remaining: 240 }));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer onTimerRef={onTimerRef} />);
    });
    expect(onTimerRef).toHaveBeenCalledTimes(1);

    useTimer.mockImplementation(() => makeTimerReturn({ remaining: 239 }));
    act(() => {
      renderer.update(<TimeTimer onTimerRef={onTimerRef} />);
    });
    expect(onTimerRef).toHaveBeenCalledTimes(2);
    expect(onTimerRef.mock.calls[1][0].remaining).toBe(239);
  });

  it('notifie avec timerRef.current (objet frais), pas un objet périmé', () => {
    const onTimerRef = jest.fn();
    useTimer.mockImplementation(() => makeTimerReturn({ remaining: 100, displayMessage: 'Ready' }));

    let renderer;
    act(() => {
      renderer = create(<TimeTimer onTimerRef={onTimerRef} />);
    });

    useTimer.mockImplementation(() => makeTimerReturn({ remaining: 42, displayMessage: 'Running' }));
    act(() => {
      renderer.update(<TimeTimer onTimerRef={onTimerRef} />);
    });

    const lastCallArg = onTimerRef.mock.calls[onTimerRef.mock.calls.length - 1][0];
    expect(lastCallArg.remaining).toBe(42);
    expect(lastCallArg.displayMessage).toBe('Running');
  });
});
