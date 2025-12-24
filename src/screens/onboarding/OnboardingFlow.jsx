// src/screens/onboarding/OnboardingFlow.jsx
/**
 * Onboarding Flow v2.1 - Linear 8-step flow
 * No branching - single path for all users
 * ADR-010 implementation
 * Updated: Filter-025 replaces Filter-040 and Filter-050
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, AppState, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import StepIndicator from '../../components/onboarding/StepIndicator';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ONBOARDING_TRANSITIONS } from '../../styles/animations';

// Import all filters
import {
  Filter010Opening,
  Filter020Tool,
  Filter025Intentions,
  Filter030Creation,
  Filter060Sound,
  Filter070Notifications,
  Filter080Paywall,
  Filter090FirstTimer,
} from './filters';

// Filter configuration - simplified switch statement
const FILTERS = [
  { Component: Filter010Opening },
  { Component: Filter020Tool },
  { Component: Filter025Intentions },
  { Component: Filter030Creation },
  { Component: Filter060Sound },
  { Component: Filter070Notifications },
  { Component: Filter080Paywall, needsData: ['customActivity', 'interactionProfile'] },
  { Component: Filter090FirstTimer, needsData: ['customActivity', 'interactionProfile', 'favoriteToolMode'] },
];

const TOTAL_STEPS = FILTERS.length;

function OnboardingFlowContent({ onComplete }) {
  const { colors } = useTheme();
  const analytics = useAnalytics();
  const {
    setOnboardingCompleted,
    setCurrentActivity,
    setCurrentDuration,
    setInteractionProfile,
  } = useTimerConfig();

  // State - always restart from beginning if app interrupted
  const [currentStep, setCurrentStep] = useState(0);

  // Collected data from filters (in-memory only)
  const [flowData, setFlowData] = useState({
    favoriteToolMode: null,
    customActivity: null,
    intentions: null,
    challenges: null,
    otherIntention: null,
    interactionProfile: null,
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

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 0) {
        // Go back to previous step
        setCurrentStep((prev) => prev - 1);
        return true; // Prevent default (exit app)
      }
      return false; // Allow exit on step 0
    });

    return () => backHandler.remove();
  }, [currentStep]);

  // Complete onboarding - extracted for clarity
  const completeOnboarding = useCallback(
    (finalData) => {
      // Pre-select custom activity (IKEA effect)
      if (finalData.customActivity) {
        setCurrentActivity(finalData.customActivity);
        setCurrentDuration(finalData.customActivity.defaultDuration);
        console.log('[OnboardingFlow] Pre-selected custom activity:', finalData.customActivity);
      }

      // Apply interaction profile from Filter-025
      if (finalData.interactionProfile) {
        setInteractionProfile(finalData.interactionProfile);
        console.log('[OnboardingFlow] Applied interaction profile:', finalData.interactionProfile);
      }

      setOnboardingCompleted(true);
      analytics.trackOnboardingCompleted({
        result: finalData.purchaseResult || 'completed',
        toolMode: finalData.favoriteToolMode,
        persona: finalData.persona,
      });
      onComplete(finalData);
    },
    [setCurrentActivity, setCurrentDuration, setInteractionProfile, setOnboardingCompleted, analytics, onComplete]
  );

  // Generic continue handler - simplified
  const handleContinue = useCallback(
    (stepData = {}) => {
      // Guard: Filter out React Native events (prevent cyclical structure errors)
      const sanitizedData = stepData?.nativeEvent ? {} : stepData;

      // Merge new data
      const mergedData = { ...flowData, ...sanitizedData };
      setFlowData(mergedData);

      // Track step completion
      analytics.trackOnboardingStepCompleted(currentStep, `filter_${currentStep}`, sanitizedData);

      // Move to next step or complete
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        completeOnboarding(mergedData);
      }
    },
    [currentStep, flowData, analytics, completeOnboarding]
  );

  // Render current filter - config-driven
  const renderCurrentFilter = () => {
    const filter = FILTERS[currentStep];
    if (!filter) return null;

    const { Component, needsData } = filter;

    // Build props dynamically
    const props = {
      onContinue: handleContinue,
      // Add flowData if filter needs it
      ...(needsData?.reduce((acc, key) => {
        acc[key] = flowData[key];
        return acc;
      }, {})),
    };

    return <Component {...props} />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Step Indicator - Hidden on first and last step */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <StepIndicator current={currentStep} total={TOTAL_STEPS} />
      )}

      {/* Current Filter with animated transitions */}
      <Animated.View
        key={`filter-${currentStep}`}
        entering={FadeIn.duration(ONBOARDING_TRANSITIONS.enterDuration).delay(ONBOARDING_TRANSITIONS.delayBetween)}
        style={styles.filterContainer}
      >
        {renderCurrentFilter()}
      </Animated.View>
    </SafeAreaView>
  );
}

// Wrapper with SafeAreaProvider (matching TimerScreen pattern)
export default function OnboardingFlow({ onComplete }) {
  return (
    <SafeAreaProvider>
      <OnboardingFlowContent onComplete={onComplete} />
    </SafeAreaProvider>
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
