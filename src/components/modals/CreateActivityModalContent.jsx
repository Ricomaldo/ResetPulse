/**
 * @fileoverview CreateActivityModalContent - Modal wrapper for creating custom activities
 * @description Handles business logic (premium gate, analytics) and wraps form with BottomSheetScrollView
 * @created 2025-12-21
 * @updated 2025-12-22 - Refactored to use CreateActivityForm
 */
import React from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useModalStack } from '../../contexts/ModalStackContext';
import CreateActivityForm from '../forms/CreateActivityForm';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';

/**
 * CreateActivityModalContent - Modal wrapper with business logic
 *
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onActivityCreated - Callback when activity is created
 */
export default function CreateActivityModalContent({
  onClose,
  onActivityCreated,
}) {
  const { isPremium } = usePremiumStatus();
  const { createActivity } = useCustomActivities();
  const modalStack = useModalStack();

  const handleClose = () => {
    haptics.selection().catch(() => {});
    onClose();
  };

  const handleFormSubmit = (formData) => {
    // Premium gate
    if (!isPremium) {
      analytics.trackCustomActivityCreateAttemptFreeUser();

      // Close current modal and push premium modal
      onClose();
      setTimeout(() => {
        modalStack.push('premium', {
          highlightedFeature: 'customActivities',
        });
      }, 300);
      return;
    }

    // Create the activity
    const newActivity = createActivity(
      formData.emoji,
      formData.name,
      formData.defaultDuration
    );

    // Track analytics
    analytics.trackCustomActivityCreated(
      formData.emoji,
      formData.name.length,
      formData.defaultDuration
    );

    haptics.success().catch(() => {});
    onActivityCreated?.(newActivity);
    onClose();
  };

  return (
    <CreateActivityForm
      onSubmit={handleFormSubmit}
      onCancel={handleClose}
      showCancelButton={true}
      showHeader={true}
    >
      {(formContent, scrollContentStyle) => (
        <BottomSheetScrollView
          style={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {formContent}
        </BottomSheetScrollView>
      )}
    </CreateActivityForm>
  );
}
