// src/screens/onboarding/OnboardingFlow.jsx
// Orchestrateur du funnel onboarding V2

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, AppState } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs, STEP_NAMES } from './onboardingConstants';
import analytics from '../../services/analytics';
import { DEV_MODE } from '../../config/testMode';

import {
  Filter0Opening,
  Filter1Needs,
  Filter2Creation,
  Filter3Test,
  Filter4Vision,
  Filter5Paywall,
} from './filters';

const TOTAL_FILTERS = 6;

export default function OnboardingFlow({ onComplete }) {
  const { colors, spacing } = useTheme();
  const [currentFilter, setCurrentFilter] = useState(0);
  const [needs, setNeeds] = useState([]);
  const [timerConfig, setTimerConfig] = useState({});
  const appStateRef = useRef(AppState.currentState);
  const hasTrackedStart = useRef(false);

  // Track onboarding_started au premier mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.trackOnboardingStarted();
      analytics.trackOnboardingStepViewed(0, STEP_NAMES[0]);
      hasTrackedStart.current = true;
    }
  }, []);

  // Track step_viewed quand currentFilter change
  useEffect(() => {
    if (currentFilter > 0) {
      analytics.trackOnboardingStepViewed(currentFilter, STEP_NAMES[currentFilter]);
    }
  }, [currentFilter]);

  // Track onboarding_abandoned si l'app passe en background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        analytics.trackOnboardingAbandoned(currentFilter, STEP_NAMES[currentFilter]);
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [currentFilter]);

  const goToNextFilter = () => {
    // Track step_completed avant transition
    analytics.trackOnboardingStepCompleted(currentFilter, STEP_NAMES[currentFilter]);
    setCurrentFilter((prev) => prev + 1);
  };

  const jumpToFilter = (n) => {
    setCurrentFilter(n);
  };

  const reset = () => {
    setCurrentFilter(0);
    setNeeds([]);
    setTimerConfig({});
    hasTrackedStart.current = false;
  };

  const handleComplete = (result) => {
    // Track final step completed
    analytics.trackOnboardingStepCompleted(currentFilter, STEP_NAMES[currentFilter], { result });
    // Track onboarding completed avec résultat
    analytics.trackOnboardingCompleted(result, needs);
    // Transmet le résultat final (trial/skipped) et la config
    onComplete({
      result,
      needs,
      timerConfig,
    });
  };

  // Dev navigation (visible uniquement si DEV_MODE = true)
  const DevBar = () => {
    if (!DEV_MODE) return null;

    const styles = createDevStyles(colors, spacing);
    return (
      <View style={styles.devBar}>
        <View style={styles.devRow}>
          {Array.from({ length: TOTAL_FILTERS }).map((_, n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.devButton,
                currentFilter === n && styles.devButtonActive,
              ]}
              onPress={() => jumpToFilter(n)}
            >
              <Text style={styles.devButtonText}>{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.devResetButton} onPress={reset}>
            <Text style={styles.devButtonText}>{'\u21BA'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilter = () => {
    switch (currentFilter) {
      case 0:
        return <Filter0Opening onContinue={goToNextFilter} />;
      case 1:
        return (
          <Filter1Needs
            onContinue={(selectedNeeds) => {
              setNeeds(selectedNeeds);
              // Track step completed avec les needs sélectionnés
              analytics.trackOnboardingStepCompleted(1, STEP_NAMES[1], {
                needs_selected: selectedNeeds,
                needs_count: selectedNeeds.length,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );
      case 2:
        return (
          <Filter2Creation
            needs={needs}
            onContinue={(config) => {
              setTimerConfig(config);
              // Track timer config saved avec les choix utilisateur
              analytics.trackTimerConfigSaved(config);
              // Track step completed avec la config
              analytics.trackOnboardingStepCompleted(2, STEP_NAMES[2], {
                activity: config.activity,
                palette: config.palette,
                duration: config.duration,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );
      case 3:
        return (
          <Filter3Test timerConfig={timerConfig} onContinue={goToNextFilter} />
        );
      case 4:
        return <Filter4Vision needs={needs} onContinue={goToNextFilter} />;
      case 5:
        return <Filter5Paywall onComplete={handleComplete} />;
      default:
        return <Filter0Opening onContinue={goToNextFilter} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DevBar />
      {renderFilter()}
    </View>
  );
}

const createDevStyles = (colors, spacing) =>
  StyleSheet.create({
    devBar: {
      backgroundColor: colors.surface,
      paddingTop: 50,
      paddingBottom: rs(spacing.sm),
      paddingHorizontal: rs(spacing.md),
    },
    devRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: rs(spacing.sm),
    },
    devButton: {
      width: rs(36),
      height: rs(36),
      borderRadius: rs(18),
      backgroundColor: colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    devButtonActive: {
      backgroundColor: colors.primary,
    },
    devResetButton: {
      width: rs(36),
      height: rs(36),
      borderRadius: rs(18),
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: rs(spacing.md),
    },
    devButtonText: {
      color: colors.text,
      fontSize: rs(14),
      fontWeight: '600',
    },
  });
