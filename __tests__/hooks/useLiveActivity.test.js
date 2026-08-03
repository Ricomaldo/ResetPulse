// Tests for useLiveActivity — mission 3d (Live Activity écran verrouillé +
// Dynamic Island). Module natif mocké : ce hook est un pur observateur de
// running/isCompleted/duration/remaining/colorHex/emoji (jamais useTimer
// lui-même).
import { act } from 'react-test-renderer';
import { AppState } from 'react-native';
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
  // Au repos/démarrage, restant == durée pleine (voir mandat : le
  // démarrage initial repart de `duration`, jamais de `remaining`).
  remaining: 600,
  colorHex: '#E89665',
  emoji: '🎯',
  clockwise: false,
});

describe('useLiveActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isLiveActivitySupported.mockReturnValue(true);
  });

  it('ne démarre rien au montage au repos (running: false) — seule la réconciliation passe (end(false), cf. describe dédié)', () => {
    renderHook(() => useLiveActivity(baseProps()));
    expect(startLiveActivity).not.toHaveBeenCalled();
    // La passe de réconciliation au mount (ADR-018 §③) retire une éventuelle
    // orpheline — end sans activité vivante est un no-op sûr côté module.
    expect(endLiveActivity).toHaveBeenCalledTimes(1);
    expect(endLiveActivity).toHaveBeenCalledWith(false);
  });

  it('démarre l\'Activity au passage à running avec la durée PLEINE (restant == durée au départ)', () => {
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));

    props.running = true;
    act(() => {
      rerender();
    });

    expect(startLiveActivity).toHaveBeenCalledTimes(1);
    expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 600, false);
  });

  it('termine avec done=true à la complétion naturelle (running→false ET isCompleted→true)', () => {
    const props = baseProps();
    const { rerender } = renderHook(() => useLiveActivity(props));
    endLiveActivity.mockClear(); // passe de réconciliation au mount

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
    endLiveActivity.mockClear(); // passe de réconciliation au mount

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

    it('redémarre (end(false) puis start) après le délai de debounce, en repartant du RESTANT — pas de la durée pleine', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      // Séance déjà entamée : le restant a diminué (120s écoulées), tandis
      // qu'un drag fait bouger la durée pleine affichée à 900 — le bug
      // constaté par Eric était de redémarrer l'anneau sur cette durée
      // pleine (900) au lieu du restant réel.
      props.duration = 900;
      props.remaining = 480;
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
      // Le restant (480), jamais la durée pleine (900).
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 480, false);
    });

    it('annule le redémarrage précédent si une nouvelle valeur arrive avant la fin du debounce, avec le restant le plus récent', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      props.duration = 700;
      props.remaining = 550;
      act(() => rerender());
      act(() => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS - 100);
      });

      // Deuxième mouvement avant l'expiration du premier debounce.
      props.duration = 900;
      props.remaining = 540;
      act(() => rerender());

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      // Un seul cycle end/start, avec le restant FINAL — pas 550, pas 900.
      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 540, false);
    });

    it('redémarre avec la nouvelle valeur de clockwise, en repartant du restant (pas de la durée pleine)', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 600, false);
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      // Toggle clockwise du sheet PENDANT la séance : mêmes durée/couleur/
      // emoji, seul le sens change — doit déclencher le même redémarrage
      // débouncé que durée/couleur/emoji (cf. mandat). Le restant a bougé
      // depuis le départ (555, distinct de la durée pleine 600) : la
      // preuve que c'est bien lui qui est utilisé au redémarrage.
      props.clockwise = true;
      props.remaining = 555;
      act(() => rerender());

      expect(endLiveActivity).not.toHaveBeenCalled();
      expect(startLiveActivity).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledWith('#E89665', '🎯', 555, true);
    });

    it('un changement de `remaining` SEUL (tick chaque seconde) ne déclenche AUCUN redémarrage ni réarmement du debounce', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      // Le compte à rebours tique pendant plusieurs secondes : remaining
      // seul bouge, rien d'autre. `remaining` n'est PAS dans les deps de
      // l'effet (piège du tick) : aucun effet ne se relance, donc aucun
      // debounce n'est jamais armé.
      for (let i = 0; i < 5; i += 1) {
        props.remaining -= 1;
        // eslint-disable-next-line no-loop-func
        act(() => rerender());
      }

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS * 2);
        await flushMicrotasks();
      });

      expect(endLiveActivity).not.toHaveBeenCalled();
      expect(startLiveActivity).not.toHaveBeenCalled();
    });

    it('un tick de `remaining` pendant un debounce déjà armé ne le réarme pas — le redémarrage utilise le restant le plus frais au moment où il se déclenche', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      // Un vrai changement (couleur) arme le debounce.
      props.colorHex = '#123456';
      act(() => rerender());

      // Juste avant l'échéance, remaining tique — ne doit ni réarmer le
      // debounce (pas de dep), ni empêcher son déclenchement.
      act(() => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS - 50);
      });
      props.remaining = 599;
      act(() => rerender());

      await act(async () => {
        jest.advanceTimersByTime(100);
        await flushMicrotasks();
      });

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(startLiveActivity).toHaveBeenCalledTimes(1);
      // La valeur de remaining la plus fraîche au moment du déclenchement.
      expect(startLiveActivity).toHaveBeenCalledWith('#123456', '🎯', 599, false);
    });

    it('restant à 0 au moment du redémarrage → end(false) SANS start (cas de bord)', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      props.colorHex = '#123456';
      props.remaining = 0;
      act(() => rerender());

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
      expect(startLiveActivity).not.toHaveBeenCalled();
    });

    it('restant négatif au moment du redémarrage → end(false) SANS start (cas de bord)', async () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      startLiveActivity.mockClear();
      endLiveActivity.mockClear(); // passe de réconciliation au mount

      props.colorHex = '#123456';
      props.remaining = -1;
      act(() => rerender());

      await act(async () => {
        jest.advanceTimersByTime(DRAG_DEBOUNCE_MS);
        await flushMicrotasks();
      });

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
      expect(startLiveActivity).not.toHaveBeenCalled();
    });
  });

  describe('réconciliation au premier plan (ADR-018 §③)', () => {
    let appStateHandler;
    let removeSubscription;

    beforeEach(() => {
      appStateHandler = undefined;
      removeSubscription = jest.fn();
      jest.spyOn(AppState, 'addEventListener').mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: removeSubscription };
      });
    });

    afterEach(() => {
      AppState.addEventListener.mockRestore();
    });

    it('au mount avec timer à l\'arrêt → end(false) appelé une fois (orpheline d\'un démarrage à froid)', () => {
      renderHook(() => useLiveActivity(baseProps()));

      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
      expect(startLiveActivity).not.toHaveBeenCalled();
    });

    it('au mount avec timer en marche → aucun end (une séance vivante n\'est jamais touchée)', () => {
      const props = baseProps();
      props.running = true;
      renderHook(() => useLiveActivity(props));

      // Le start de la transition repos→séance a lieu, mais la
      // réconciliation, elle, ne tue rien : les dates fixes restent justes.
      expect(endLiveActivity).not.toHaveBeenCalled();
    });

    it('passage background→active avec timer à l\'arrêt → end(false) (séance finie app suspendue)', () => {
      renderHook(() => useLiveActivity(baseProps()));
      endLiveActivity.mockClear(); // passe du mount

      // Un passage en fond ne réconcilie pas — seul le retour actif compte.
      act(() => appStateHandler('background'));
      expect(endLiveActivity).not.toHaveBeenCalled();

      act(() => appStateHandler('active'));
      expect(endLiveActivity).toHaveBeenCalledTimes(1);
      expect(endLiveActivity).toHaveBeenCalledWith(false);
    });

    it('passage background→active avec timer en marche → aucun end (la réconciliation épargne la séance vivante)', () => {
      const props = baseProps();
      const { rerender } = renderHook(() => useLiveActivity(props));

      props.running = true;
      act(() => rerender());
      endLiveActivity.mockClear(); // passe du mount

      act(() => appStateHandler('background'));
      act(() => appStateHandler('active'));

      expect(endLiveActivity).not.toHaveBeenCalled();
    });

    it('non supporté (isSupported false) → aucun appel, ni au mount ni au retour actif', () => {
      isLiveActivitySupported.mockReturnValue(false);
      renderHook(() => useLiveActivity(baseProps()));

      act(() => appStateHandler('active'));

      expect(endLiveActivity).not.toHaveBeenCalled();
      expect(startLiveActivity).not.toHaveBeenCalled();
    });

    it('démontage → le listener AppState est retiré', () => {
      const { unmount } = renderHook(() => useLiveActivity(baseProps()));
      unmount();
      expect(removeSubscription).toHaveBeenCalledTimes(1);
    });
  });
});
