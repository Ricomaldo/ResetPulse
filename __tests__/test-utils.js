// Minimaliste test utils for SDK 54 - using only react-test-renderer
import { create, act } from 'react-test-renderer';
import React from 'react';

/**
 * Minimal renderHook implementation using react-test-renderer
 * No external dependencies, just what jest-expo provides
 */
export function renderHook(callback) {
  let result = { current: null };
  let error = null;
  let renderer;

  function TestComponent() {
    try {
      result.current = callback();
    } catch (e) {
      error = e;
    }
    return null;
  }

  act(() => {
    renderer = create(<TestComponent />);
  });

  if (error) throw error;

  return {
    result,
    rerender: () => {
      act(() => {
        renderer.update(<TestComponent />);
      });
    },
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
    }
  };
}

export { act };
