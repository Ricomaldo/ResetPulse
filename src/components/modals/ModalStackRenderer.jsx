// src/components/modals/ModalStackRenderer.jsx
// Renders the modal stack - place this at the root of your app

import React from 'react';
import { useModalStack } from '../../contexts/ModalStackContext';

export default function ModalStackRenderer() {
  const { modalStack } = useModalStack();

  if (modalStack.length === 0) {
    return null;
  }

  // Render all modals in the stack
  // Each modal will be visible, stacked on top of each other
  return (
    <>
      {modalStack.map(({ id, Component, props }) => (
        <Component key={id} modalId={id} visible={true} {...props} />
      ))}
    </>
  );
}
