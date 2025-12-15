// src/contexts/ModalStackContext.jsx
// Modal Stack Manager - Handles nested modal navigation
// Solves modal stacking deadlock issue (U6)

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';

const ModalStackContext = createContext(null);

export const ModalStackProvider = ({ children }) => {
  // Stack of modals: [{ id, Component, props }, ...]
  const [modalStack, setModalStack] = useState([]);

  // Push a new modal to the stack
  const push = (Component, props = {}) => {
    const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.log('[ModalStack] Pushing modal:', modalId);

    setModalStack((prev) => [
      ...prev,
      {
        id: modalId,
        Component,
        props,
      },
    ]);

    return modalId;
  };

  // Pop the top modal from the stack
  const pop = () => {
    if (modalStack.length === 0) {
      logger.warn('[ModalStack] Attempted to pop from empty stack');
      return;
    }

    const poppedModal = modalStack[modalStack.length - 1];
    logger.log('[ModalStack] Popping modal:', poppedModal.id);

    setModalStack((prev) => prev.slice(0, -1));
  };

  // Pop a specific modal by ID (useful for closing from within the modal)
  const popById = (modalId) => {
    const index = modalStack.findIndex((m) => m.id === modalId);

    if (index === -1) {
      logger.warn('[ModalStack] Modal not found:', modalId);
      return;
    }

    logger.log('[ModalStack] Popping modal by ID:', modalId);
    setModalStack((prev) => prev.filter((m) => m.id !== modalId));
  };

  // Clear all modals
  const clear = () => {
    logger.log('[ModalStack] Clearing all modals');
    setModalStack([]);
  };

  // Get current stack depth
  const depth = modalStack.length;

  // Check if stack is empty
  const isEmpty = modalStack.length === 0;

  const value = {
    push,
    pop,
    popById,
    clear,
    depth,
    isEmpty,
    modalStack, // Expose for rendering
  };

  return (
    <ModalStackContext.Provider value={value}>
      {children}
    </ModalStackContext.Provider>
  );
};

ModalStackProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useModalStack = () => {
  const context = useContext(ModalStackContext);
  if (!context) {
    throw new Error('useModalStack must be used within ModalStackProvider');
  }
  return context;
};

export default ModalStackContext;
