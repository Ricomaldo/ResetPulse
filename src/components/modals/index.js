/**
 * @fileoverview Modals - Centralized export
 * @updated 2025-12-21 - BottomSheet migration + ModalStack pattern COMPLETE ✅
 *
 * 📋 BOTTOMSHEET MODAL PATTERN (Unified):
 *
 * Architecture: Wrapper (infrastructure) + Content (business logic)
 * - BottomSheetModal wrapper = BottomSheet config, animations, lifecycle (reusable)
 * - *ModalContent components = Business logic, UI, state (specific)
 *
 * ALL modals use ModalStack pattern for consistency.
 *
 * Usage:
 * 1. Create *ModalContent.jsx component (pure content, no BottomSheet logic)
 * 2. Register type in ModalStackRenderer MODAL_TYPES
 * 3. Push to stack: modalStack.push('yourType', { ...props })
 *
 * Examples:
 * - modalStack.push('premium', { highlightedFeature: 'activity' })
 * - modalStack.push('discovery', { title: 'More Activities', children: <Grid /> })
 * - modalStack.push('createActivity', { onActivityCreated: handleCreate })
 * - modalStack.push('editActivity', { activity, onActivityUpdated, onActivityDeleted })
 * - modalStack.push('twoTimers', { onExplore: handleExplore })
 *
 * References:
 * - BottomSheetModal wrapper: ./BottomSheetModal.jsx
 * - ModalStackRenderer: ./ModalStackRenderer.jsx
 * - AsideZone pattern: ../layout/AsideZone.jsx
 *
 * 🎉 ALL MODALS MIGRATED TO @gorhom/bottom-sheet v5 + ModalStack pattern
 */

// === BottomSheet Infrastructure ===
export { default as BottomSheetModal } from './BottomSheetModal';

// === Modal Content Components (All use ModalStack pattern) ===
// Premium & Discovery
export { default as PremiumModalContent } from './PremiumModalContent';
export { default as DiscoveryModalContent } from './DiscoveryModalContent';

// Custom Activities
export { default as CreateActivityModalContent } from './CreateActivityModalContent';
export { default as EditActivityModalContent } from './EditActivityModalContent';

// System
export { default as TwoTimersModalContent } from './TwoTimersModalContent';
