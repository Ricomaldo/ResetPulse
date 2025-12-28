/**
 * Filter-030-creation - Activity creation screen for onboarding
 * Uses CreateActivityForm with ScrollView (not BottomSheetScrollView)
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useCustomActivities } from '../../../hooks/useCustomActivities';
import { useAnalytics } from '../../../hooks/useAnalytics';
import CreateActivityForm from '../../../components/forms/CreateActivityForm';
import { rs } from '../../../styles/responsive';
import { spacing } from '../../../theme/tokens';

export default function Filter030Creation({ onContinue }) {
  const { colors } = useTheme();
  const { createActivity } = useCustomActivities();
  const analytics = useAnalytics();
  const [selectedIntentionId, setSelectedIntentionId] = useState(null);

  const handleIntentionSelected = (intention) => {
    setSelectedIntentionId(intention.id);

    // Track intention selection
    analytics.trackIntentionSelected(
      intention.id,
      intention.emoji,
      intention.defaultDuration
    );
  };

  const handleFormSubmit = (formData) => {
    // Create activity with onboarding flag (free slot)
    const activity = createActivity(
      formData.emoji,
      formData.name,
      formData.defaultDuration,
      { createdDuringOnboarding: true }
    );

    // Track activity creation with intention context
    analytics.trackCustomActivityCreatedOnboarding(
      formData.emoji,
      formData.name.length,
      formData.defaultDuration,
      selectedIntentionId
    );

    // Pass to next step
    onContinue({ customActivity: activity });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <CreateActivityForm
          mode="onboarding"
          onSubmit={handleFormSubmit}
          onCancel={() => {}}
          onIntentionSelect={handleIntentionSelected}
          showCancelButton={false}
          showHeader={false}
        >
          {(formContent, scrollContentStyle) => (
            <ScrollView
              contentContainerStyle={[scrollContentStyle, styles.scrollContent]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {formContent}
            </ScrollView>
          )}
        </CreateActivityForm>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: rs(spacing.lg),
  },
});
