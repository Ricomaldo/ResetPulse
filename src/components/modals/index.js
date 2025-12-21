/**
 * @fileoverview Modals - Centralized export
 * @updated 2025-12-21 - Added BottomSheet wrapper pattern
 *
 * 📋 BOTTOMSHEET MODAL PATTERN (NEW - 2025-12-21):
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

// === NEW PATTERN: BottomSheet wrapper + Content ===
export { default as BottomSheetModal } from './BottomSheetModal';
export { default as PremiumModalContent } from './PremiumModalContent';
export { default as DiscoveryModalContent } from './DiscoveryModalContent';

// === OLD PATTERN: React Native <Modal> (backward compat, will be deprecated) ===
export { default as PremiumModal } from './PremiumModal'; // TODO: Migrate usages to 'premium' type
export { default as DiscoveryModal } from './DiscoveryModal'; // TODO: Migrate usages to 'discovery' type

// === Specialized wrappers (use DiscoveryModal internally, will be migrated) ===
export { default as MoreActivitiesModal } from './MoreActivitiesModal';
export { default as MoreColorsModal } from './MoreColorsModal';

// === Other modals (not yet migrated to BottomSheet) ===
export { default as TwoTimersModal } from './TwoTimersModal';
export { default as CreateActivityModal } from './CreateActivityModal';
export { default as EditActivityModal } from './EditActivityModal';
