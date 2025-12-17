// Minimaliste test utils for SDK 54 - using only react-test-renderer
import { create, act } from 'react-test-renderer';
import React from 'react';

/**
 * Minimal renderHook implementation using react-test-renderer
 * No external dependencies, just what jest-expo provides
 *
 * @param {Function} callback - Hook to render
 * @param {Object} options - Options object
 * @param {React.ComponentType} options.wrapper - Optional wrapper component (for Context providers)
 */
export function renderHook(callback, options = {}) {
  const result = { current: null };
  let error = null;
  let renderer;
  const { wrapper: Wrapper } = options;

  function TestComponent() {
    try {
      result.current = callback();
    } catch (e) {
      error = e;
    }
    return null;
  }

  const ComponentToRender = Wrapper
    ? () => <Wrapper><TestComponent /></Wrapper>
    : TestComponent;

  act(() => {
    renderer = create(<ComponentToRender />);
  });

  if (error) {
    throw error;
  }

  return {
    result,
    rerender: () => {
      act(() => {
        renderer.update(<ComponentToRender />);
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
