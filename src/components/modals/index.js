/**
 * @fileoverview Modals - Centralized export
 * @updated 2025-12-21 - BottomSheet wrapper pattern (complete migration)
 *
 * 📋 BOTTOMSHEET MODAL PATTERN:
 *
 * Architecture: Wrapper (infrastructure) + Content (business logic)
 * - BottomSheetModal wrapper = BottomSheet config, animations, lifecycle (reusable)
 * - *ModalContent components = Business logic, UI, state (specific)
 *
 * Same pattern as AsideZone drawer (consistency across all bottom-sheets).
 *
 * Usage:
 * 1. Create *ModalContent.jsx component (pure content, no BottomSheet logic)
 * 2. Register type in ModalStackRenderer MODAL_TYPES
 * 3. Push to stack: modalStack.push('yourType', { ...props })
 *
 * Examples:
 * - modalStack.push('premium', { highlightedFeature: 'activity' })
 * - modalStack.push('discovery', { title: 'More Activities', children: <Grid /> })
 *
 * References:
 * - BottomSheetModal wrapper: ./BottomSheetModal.jsx
 * - ModalStackRenderer: ./ModalStackRenderer.jsx
 * - AsideZone pattern: ../layout/AsideZone.jsx
 */

// === BottomSheet wrapper + Content (NEW PATTERN) ===
export { default as BottomSheetModal } from './BottomSheetModal';
export { default as PremiumModalContent } from './PremiumModalContent';
export { default as DiscoveryModalContent } from './DiscoveryModalContent';

// === Other modals (not yet migrated to BottomSheet) ===
export { default as TwoTimersModal } from './TwoTimersModal';
export { default as CreateActivityModal } from './CreateActivityModal';
export { default as EditActivityModal } from './EditActivityModal';
