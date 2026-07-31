// Tests for useLiveActivity — mission 3d (Live Activity écran verrouillé +
// Dynamic Island). Module natif mocké : ce hook est un pur observateur de
// running/isCompleted/duration/colorHex/emoji (jamais useTimer lui-même).
import { act } from 'react-test-renderer';
import { renderHook } from '../test-utils';
import { useLiveActivity, DRAG_DEBOUNCE_MS } from '../../src/hooks/useLiveActivity';
import { isLiveActivitySupported, startLiveActivity, endLiveActivity } from '../../modules/timer-activity';

jest.mock('../../modules/timer-activity', () => ({
  isLiveActivitySupported: jest.fn(() => true),
  startLiveActivity: jest.fn(() => Promise.resolve('activity-id')),
  endLiveActivity: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/utils/logger', () => ({
  warn: jest.fn(),
}));

// Vide la file des microtâches (nécessaire : le hook chaîne
// .catch()/.finally() sur les promesses du module mocké — plusieurs
// tours de microtâches séparent `jest.advanceTimersByTime` de l'appel
// effectif à startLiveActivity dans la branche "redémarrage").
const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

const baseProps = () => ({
  running: false,
  isCompleted: false,
  duration: 600,
  colorHex: '#E89665',
  emoji: '🎯',
});

describe('useLiveActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isLiveActivitySupported.mockReturnValue(true);
  });

  it('ne fait rien au montage au repos (running: false)', () => {
    renderHook(() => useLiveActivity(baseProps()));
    expect(startLiveActivity).not.toHaveBeenCalled();
    expect(endLiveActivity).not.toHaveBeenCalled();
  });

  it('démarre l\'Activity au passage à running avec les bons paramètres', () => {
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));

    props.running = true;
    act(() => {
      rerender();
    });

    expect(startLiveActivity).toHaveBeenCalledTimes(1);
    expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 600);
  });

  it('termine avec done=true à la complétion naturelle (running→false ET isCompleted→true)', () => {
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));

    props.running = true;
    act(() => rerender());
    expect(startLiveActivity).toHaveBeenCalledTimes(1);

    // useTimer bascule running et isCompleted ensemble sur la fin naturelle
    // (cf. useTimer.js updateTimer) — même snapshot, un seul rerender.
    props.running = false;
    props.isCompleted = true;
    act(() => rerender());

    expect(endLiveActivity).toHaveBeenCalledTimes(1);
    expect(endLiveActivity).toHaveBeenCalledWith(true);
  });

  it('termine avec done=false au rembobinage (running→false, isCompleted resté false)', () => {
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));

    props.running = true;
    act(() => rerender());
    expect(startLiveActivity).toHaveBeenCalledTimes(1);

    props.running = false;
    // isCompleted reste false : c'est un rembobinage, pas une fin naturelle.
    act(() => rerender());

    expect(endLiveActivity).toHaveBeenCalledTimes(1);
    expect(endLiveActivity).toHaveBeenCalledWith(false);
  });

  it('ne démarre ni ne termine rien si isSupported() est faux (Android/Expo Go/device non éligible)', () => {
    isLiveActivitySupported.mockReturnValue(false);
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));

    props.running = true;
    act(() => rerender());
    expect(startLiveActivity).not.toHaveBeenCalled();

    props.running = false;
    props.isCompleted = true;
    act(() => rerender());
    expect(endLiveActivity).not.toHaveBeenCalled();
  });

  describe('changement de paramètres pendant running (drag du disque, tap couleur/rituel)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('redémarre (end(false) puis start) après le délai de debounce, avec les nouvelles valeurs', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      startLiveActivity.mockClear();

      // Drag : la durée bouge en direct (TimerDial appelle setCurrentDuration
      // à chaque mouvement, pas seulement au relâchement).
      props.duration = 900;
      act(() => rerender());

      // Rien avant le délai — c'est le point du debounce.
      expect(endLiveActivity).not.toHaveBeenCalled();
      expect(startLiveActivity).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 900);
    });

    it('annule le redémarrage précédent si une nouvelle valeur arrive avant la fin du debounce', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();

      props.duration = 700;
      act(() => rerender());
      act(() => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS - 100);
      });

      // Deuxième mouvement avant l'expiration du premier debounce.
      props.duration = 900;
      act(() => rerender());

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      // Un seul cycle end/start, avec la valeur FINALE — pas 700.
      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 900);
    });
  });
});
