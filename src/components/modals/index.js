// src/components/modals/index.js
// Export centralisé de toutes les modales
//
// 📋 TEMPLATE BOTTOMSHEET:
// Pour créer un nouveau modal avec @gorhom/bottom-sheet (pattern detached):
// 1. Dupliquer BottomSheet.template.jsx → VotreModal.jsx
// 2. Suivre instructions inline dans le template
// 3. Devlog: _internal/cockpit/knowledge/devlog/2025-12-18_bottomsheet-modal-pattern.md

export { default as PremiumModal } from './PremiumModal';
export { default as DiscoveryModal } from './DiscoveryModal';
export { default as MoreActivitiesModal } from './MoreActivitiesModal';
export { default as MoreColorsModal } from './MoreColorsModal';
export { default as TwoTimersModal } from './TwoTimersModal';
export { default as CreateActivityModal } from './CreateActivityModal';
export { default as EditActivityModal } from './EditActivityModal';
