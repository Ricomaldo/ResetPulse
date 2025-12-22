// src/screens/onboarding/OnboardingFlow.jsx
/**
 * Onboarding Flow v2.1 - Linear 9-step flow
 * No branching - single path for all users
 * ADR-010 implementation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import StepIndicator from '../../components/onboarding/StepIndicator';
import { useAnalytics } from '../../hooks/useAnalytics';

// Import all filters
import {
  Filter010Opening,
  Filter020Tool,
  Filter030Creation,
  Filter040TestStart,
  Filter050TestStop,
  Filter060Sound,
  Filter070Notifications,
  Filter080Paywall,
  Filter090FirstTimer,
} from './filters';

const TOTAL_STEPS = 9;

export default function OnboardingFlow({ onComplete }) {
  const { colors } = useTheme();
  const analytics = useAnalytics();
  const { setOnboardingCompleted } = useTimerConfig();

  // Current step (1-indexed for display, 0-indexed internally)
  const [currentStep, setCurrentStep] = useState(0);

  // Collected data from filters
  const [flowData, setFlowData] = useState({
    favoriteToolMode: null,
    customActivity: null,
    startTiming: null,
    stopTiming: null,
    persona: null,
    selectedSoundId: null,
    notificationPermission: null,
    purchaseResult: null,
    firstTimerCompleted: false,
  });

  // Refs for tracking
  const hasTrackedStart = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  // Track onboarding_started on mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.trackOnboardingStarted();
      analytics.trackOnboardingStepViewed(0, `filter_${currentStep}`);
      hasTrackedStart.current = true;
    }
  }, [analytics, currentStep]);

  // Track step_viewed when currentStep changes
  useEffect(() => {
    if (currentStep > 0) {
      analytics.trackOnboardingStepViewed(currentStep, `filter_${currentStep}`);
    }
  }, [currentStep, analytics]);

  // Track onboarding_abandoned if app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        analytics.trackOnboardingAbandoned(currentStep, `filter_${currentStep}`);
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [currentStep, analytics]);

  // Generic continue handler
  const handleContinue = useCallback(
    (stepData = {}) => {
      // Merge new data
      setFlowData((prev) => ({ ...prev, ...stepData }));

      // Track step completion
      analytics.trackOnboardingStepCompleted(currentStep, `filter_${currentStep}`, stepData);

      // Move to next step
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Onboarding complete
        setOnboardingCompleted(true);
        analytics.trackOnboardingCompleted({
          result: stepData.purchaseResult || 'completed',
          toolMode: flowData.favoriteToolMode,
          persona: flowData.persona,
        });
        onComplete(flowData);
      }
    },
    [currentStep, flowData, analytics, setOnboardingCompleted, onComplete]
  );

  // Render current filter
  const renderCurrentFilter = () => {
    const commonProps = { onContinue: handleContinue };

    switch (currentStep) {
      case 0:
        return <Filter010Opening {...commonProps} />;

      case 1:
        return <Filter020Tool {...commonProps} />;

      case 2:
        return <Filter030Creation {...commonProps} />;

      case 3:
        return <Filter040TestStart {...commonProps} />;

      case 4:
        return (
          <Filter050TestStop
            {...commonProps}
            startTiming={flowData.startTiming}
          />
        );

      case 5:
        return <Filter060Sound {...commonProps} />;

      case 6:
        return <Filter070Notifications {...commonProps} />;

      case 7:
        return (
          <Filter080Paywall
            {...commonProps}
            customActivity={flowData.customActivity}
            persona={flowData.persona}
          />
        );

      case 8:
        return (
          <Filter090FirstTimer
            {...commonProps}
            customActivity={flowData.customActivity}
            persona={flowData.persona}
            favoriteToolMode={flowData.favoriteToolMode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Step Indicator - Hidden on first and last step */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <StepIndicator current={currentStep + 1} total={TOTAL_STEPS} />
      )}

      {/* Current Filter */}
      <View style={styles.filterContainer}>{renderCurrentFilter()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flex: 1,
  },
});
