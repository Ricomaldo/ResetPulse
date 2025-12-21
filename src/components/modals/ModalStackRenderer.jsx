/**
 * @fileoverview ModalStackRenderer - Renders modal stack with BottomSheet architecture
 * Supports both:
 * - New pattern: Type string → BottomSheetModal wrapper + Content component
 * - Old pattern: Component directly (fallback for backward compatibility)
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

  if (modalStack.length === 0) {
    return null;
  }

  return (
    <>
      {modalStack.map(({ id, Component, props }) => {
        // NEW PATTERN: String type → BottomSheetModal wrapper + Content
        if (typeof Component === 'string') {
          const ContentComponent = MODAL_TYPES[Component];

          if (!ContentComponent) {
            console.error(`[ModalStackRenderer] Unknown modal type: ${Component}`);
            return null;
          }

          return (
            <BottomSheetModal
              key={id}
              visible={true}
              onClose={() => popById(id)}
              snapPoints={props.snapPoints || ['90%']} // Customizable per modal
              enableDynamicSizing={props.enableDynamicSizing || false}
            >
              <ContentComponent
                modalId={id}
                onClose={() => popById(id)}
                {...props}
              />
            </BottomSheetModal>
          );
        }

        // OLD PATTERN: Component directly (fallback for backward compatibility)
        return <Component key={id} modalId={id} visible={true} {...props} />;
      })}
    </>
  );
}
