/**
 * @fileoverview ModalStackRenderer - Renders modal stack with BottomSheet architecture
 * Type-based modal rendering: String type → BottomSheetModal wrapper + Content component
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React from 'react';
import { useModalStack } from '../../contexts/ModalStackContext';
import BottomSheetModal from './BottomSheetModal';
import PremiumModalContent from './PremiumModalContent';
import DiscoveryModalContent from './DiscoveryModalContent';

/**
 * Modal type mapping (string → Content component)
 *
 * Usage:
 * - modalStack.push('premium', { highlightedFeature: 'activity' })
 * - modalStack.push('discovery', { title: 'More Activities', children: <Grid /> })
 */
const MODAL_TYPES = {
  premium: PremiumModalContent,
  discovery: DiscoveryModalContent,
};

/**
 * ModalStackRenderer - Renders all modals in the stack
 *
 * Architecture:
 * - New pattern: String type → BottomSheetModal (wrapper) + *Content (business logic)
 * - Old pattern: Component directly (backward compat during migration)
 *
 * Stack behavior:
 * - All modals rendered simultaneously (stacked on top)
 * - Each modal auto-passes modalId for popById()
 * - visible={true} for all (controlled by presence in stack)
 */
export default function ModalStackRenderer() {
  const { modalStack, popById } = useModalStack();
  const [closingModalIds, setClosingModalIds] = React.useState([]);

  console.log('[ModalStackRenderer] Render:', {
    modalCount: modalStack.length,
    modalStack: modalStack.map(m => ({ id: m.id, type: m.Component })),
    closingModalIds
  });

  if (modalStack.length === 0) {
    return null;
  }

  // Only render the top modal (last in stack) with detached BottomSheet
  // Multiple detached BottomSheets cause conflicts
  const topModal = modalStack[modalStack.length - 1];

  if (!topModal) {
    return null;
  }

  const { id, Component, props } = topModal;
  const ContentComponent = MODAL_TYPES[Component];

  if (!ContentComponent) {
    console.error(`[ModalStackRenderer] Unknown modal type: ${Component}`);
    return null;
  }

  const isClosing = closingModalIds.includes(id);
  const isVisible = !isClosing;

  console.log(`[ModalStackRenderer] Rendering top modal ${id}:`, {
    Component,
    isClosing,
    isVisible,
    totalInStack: modalStack.length
  });

  // onClose handler with animation delay
  const handleClose = () => {
    console.log(`[ModalStackRenderer] handleClose called for ${id}`);

    // Mark modal as closing (triggers visible=false → close animation)
    setClosingModalIds(prev => [...prev, id]);

    // Wait for BottomSheet close animation (300ms) before removing from stack
    setTimeout(() => {
      console.log(`[ModalStackRenderer] Removing ${id} from stack after animation`);
      popById(id);
      setClosingModalIds(prev => prev.filter(modalId => modalId !== id));
    }, 300);
  };

  return (
    <BottomSheetModal
      key={id}
      visible={isVisible}
      onClose={handleClose}
      snapPoints={props.snapPoints || ['90%']} // Customizable per modal
      enableDynamicSizing={props.enableDynamicSizing || false}
    >
      <ContentComponent
        modalId={id}
        onClose={handleClose}
        {...props}
      />
    </BottomSheetModal>
  );
}
