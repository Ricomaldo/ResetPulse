/**
 * @fileoverview Modals - Centralized export
 * @updated 2025-12-21 - BottomSheet migration COMPLETE ✅
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
 *
 * 🎉 ALL MODALS MIGRATED TO @gorhom/bottom-sheet v5
 */

// === BottomSheet Infrastructure ===
export { default as BottomSheetModal } from './BottomSheetModal';

// === Premium/Discovery Modals (ModalStack pattern) ===
export { default as PremiumModalContent } from './PremiumModalContent';
export { default as DiscoveryModalContent } from './DiscoveryModalContent';

// === Custom Activity Modals (Direct usage pattern) ===
export { default as CreateActivityModal } from './CreateActivityModal';
export { default as EditActivityModal } from './EditActivityModal';

// === System Modals ===
export { default as TwoTimersModal } from './TwoTimersModal';
