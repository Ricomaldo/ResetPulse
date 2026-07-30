// Tests for useSessionImmersion — cadrage 3c (immersion automatique, Q1/Q2)
import { act } from 'react-test-renderer';
import { renderHook } from '../test-utils';
import { useSessionImmersion, IMMERSION_DELAY } from '../../src/hooks/useSessionImmersion';

describe('useSessionImmersion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('never immerses when the timer is not running', () => {
    const { result } = renderHook(() => useSessionImmersion({ running: false, isCompleted: false }));
    expect(result.current.immersed).toBe(false);

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY + 1000);
    });
    expect(result.current.immersed).toBe(false);
  });

  it('immerses after IMMERSION_DELAY of running with no activity', () => {
    const { result } = renderHook(() => useSessionImmersion({ running: true, isCompleted: false }));
    expect(result.current.immersed).toBe(false);

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY - 1);
    });
    expect(result.current.immersed).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.immersed).toBe(true);
  });

  it('registerActivity rearms the delay before immersion', () => {
    const { result } = renderHook(() => useSessionImmersion({ running: true, isCompleted: false }));

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY - 1000);
    });
    act(() => {
      result.current.registerActivity();
    });
    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY - 1000);
    });
    expect(result.current.immersed).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.immersed).toBe(true);
  });

  it('registerActivity exits immersion immediately and rearms', () => {
    const { result } = renderHook(() => useSessionImmersion({ running: true, isCompleted: false }));

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY);
    });
    expect(result.current.immersed).toBe(true);

    act(() => {
      result.current.registerActivity();
    });
    expect(result.current.immersed).toBe(false);

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY);
    });
    expect(result.current.immersed).toBe(true);
  });

  it('exits immersion automatically when the session completes', () => {
    const props = { running: true, isCompleted: false };
    const { result, rerender } = renderHook(() => useSessionImmersion(props));

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY);
    });
    expect(result.current.immersed).toBe(true);

    props.isCompleted = true;
    act(() => {
      rerender();
    });
    expect(result.current.immersed).toBe(false);
  });

  it('exits immersion automatically when the timer stops running', () => {
    const props = { running: true, isCompleted: false };
    const { result, rerender } = renderHook(() => useSessionImmersion(props));

    act(() => {
      jest.advanceTimersByTime(IMMERSION_DELAY);
    });
    expect(result.current.immersed).toBe(true);

    props.running = false;
    act(() => {
      rerender();
    });
    expect(result.current.immersed).toBe(false);
  });
});
