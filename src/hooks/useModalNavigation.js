/**
 * @fileoverview Modal navigation management hook
 * Prevents modal stacking loops by managing a single modal queue
 * @created 2025-12-14
 */
import { useState, useCallback } from 'react';

/**
 * useModalNavigation - Manage modal state with a stack (only one visible at a time)
 * @returns {Object} Modal navigation state and methods
 */
export const useModalNavigation = () => {
  const [modalStack, setModalStack] = useState([]);

  // Open a modal (close current one if any)
  const openModal = useCallback((modalId, props = {}) => {
    setModalStack([{ id: modalId, props }]);
  }, []);

  // Replace current modal with another
  const replaceModal = useCallback((modalId, props = {}) => {
    setModalStack([{ id: modalId, props }]);
  }, []);

  // Close current modal
  const closeModal = useCallback(() => {
    setModalStack([]);
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  // Get current visible modal
  const currentModal = modalStack[0] || null;

  return {
    currentModal,
    openModal,
    replaceModal,
    closeModal,
    closeAllModals,
    modalStack,
  };
};

export default useModalNavigation;
