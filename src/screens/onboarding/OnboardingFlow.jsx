// src/screens/onboarding/OnboardingFlow.jsx
// Orchestrateur du funnel onboarding V3

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, AppState } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs, getStepName } from './onboardingConstants';
import analytics from '../../services/analytics';
import { DEV_MODE } from '../../config/testMode';

import {
  Filter0Opening,
  Filter1Needs,
  Filter2Creation,
  Filter3Test,
  Filter3_5Notifications,
  Filter4Branch,
  Filter5aVision,
  Filter5bSound,
  Filter5cInterface,
  Filter5Paywall,
} from './filters';

const TOTAL_FILTERS = 8;

export default function OnboardingFlow({ onComplete }) {
  const { colors, spacing } = useTheme();
  const [currentFilter, setCurrentFilter] = useState(0);
  const [needs, setNeeds] = useState([]);
  const [timerConfig, setTimerConfig] = useState({});
  const [branch, setBranch] = useState(null); // 'discover' | 'personalize'
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [soundConfig, setSoundConfig] = useState(null);
  const [interfaceConfig, setInterfaceConfig] = useState(null);
  const appStateRef = useRef(AppState.currentState);
  const hasTrackedStart = useRef(false);

  // Track onboarding_started au premier mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.trackOnboardingStarted();
      analytics.trackOnboardingStepViewed(0, getStepName(0, branch));
      hasTrackedStart.current = true;
    }
  }, []);

  // Track step_viewed quand currentFilter change
  useEffect(() => {
    if (currentFilter > 0) {
      analytics.trackOnboardingStepViewed(currentFilter, getStepName(currentFilter, branch));
    }
  }, [currentFilter, branch]);

  // Track onboarding_abandoned si l'app passe en background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        analytics.trackOnboardingAbandoned(currentFilter, getStepName(currentFilter, branch));
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [currentFilter, branch]);

  const goToNextFilter = () => {
    // Track step_completed avant transition
    analytics.trackOnboardingStepCompleted(currentFilter, getStepName(currentFilter, branch));
    setCurrentFilter((prev) => prev + 1);
  };

  const jumpToFilter = (n) => {
    setCurrentFilter(n);
  };

  const reset = () => {
    setCurrentFilter(0);
    setNeeds([]);
    setTimerConfig({});
    setBranch(null);
    setNotificationPermission(false);
    setSoundConfig(null);
    setInterfaceConfig(null);
    hasTrackedStart.current = false;
  };

  const handleComplete = (result) => {
    // Track final step completed
    analytics.trackOnboardingStepCompleted(currentFilter, getStepName(currentFilter, branch), { result });
    // Track onboarding completed avec résultat et branch
    analytics.trackOnboardingCompleted(result, needs, branch);
    // Transmet le résultat final et toutes les configs
    onComplete({
      result,
      needs,
      timerConfig,
      branch,
      notificationPermission,
      soundConfig,
      interfaceConfig,
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
        // Filter 0: Opening (breathe)
        return <Filter0Opening onContinue={goToNextFilter} />;

      case 1:
        // Filter 1: Needs
        return (
          <Filter1Needs
            onContinue={(selectedNeeds) => {
              setNeeds(selectedNeeds);
              // Track step completed avec les needs sélectionnés
              analytics.trackOnboardingStepCompleted(1, getStepName(1, branch), {
                needs_selected: selectedNeeds,
                needs_count: selectedNeeds.length,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );

      case 2:
        // Filter 2: Creation
        return (
          <Filter2Creation
            needs={needs}
            onContinue={(config) => {
              setTimerConfig(config);
              // Track timer config saved avec les choix utilisateur
              analytics.trackTimerConfigSaved(config);
              // Track step completed avec la config
              analytics.trackOnboardingStepCompleted(2, getStepName(2, branch), {
                activity: config.activity,
                palette: config.palette,
                duration: config.duration,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );

      case 3:
        // Filter 3: Test 60 sec
        return (
          <Filter3Test timerConfig={timerConfig} onContinue={goToNextFilter} />
        );

      case 4:
        // Filter 3.5: Notifications Permission
        return (
          <Filter3_5Notifications
            onContinue={(data) => {
              setNotificationPermission(data.notificationPermission);
              analytics.trackOnboardingStepCompleted(4, getStepName(4, branch), {
                permission_granted: data.notificationPermission,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );

      case 5:
        // Filter 4: Branch Choice
        return (
          <Filter4Branch
            onContinue={(data) => {
              setBranch(data.branch);
              // Track V3 specific event
              analytics.trackOnboardingBranchSelected(data.branch);
              analytics.trackOnboardingStepCompleted(5, getStepName(5, data.branch), {
                branch_selected: data.branch,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );

      case 6:
        // Filter 5a (discover) or 5b (personalize)
        if (branch === 'discover') {
          return <Filter5aVision needs={needs} onContinue={goToNextFilter} />;
        } else if (branch === 'personalize') {
          return (
            <Filter5bSound
              onContinue={(data) => {
                setSoundConfig(data.selectedSound);
                // Track V3 specific event
                analytics.trackOnboardingSoundSelected(data.selectedSound);
                analytics.trackOnboardingStepCompleted(6, getStepName(6, branch), {
                  sound_selected: data.selectedSound,
                });
                setCurrentFilter((prev) => prev + 1);
              }}
            />
          );
        }
        return <Filter0Opening onContinue={goToNextFilter} />;

      case 7:
        // Filter 6 (paywall for discover) or 5c (interface for personalize)
        if (branch === 'discover') {
          return <Filter5Paywall onComplete={handleComplete} />;
        } else if (branch === 'personalize') {
          return (
            <Filter5cInterface
              onContinue={(data) => {
                setInterfaceConfig(data);
                // Track V3 specific event
                analytics.trackOnboardingInterfaceConfigured(
                  data.theme,
                  data.minimalInterface,
                  data.digitalTimer
                );
                analytics.trackOnboardingStepCompleted(7, getStepName(7, branch), {
                  theme: data.theme,
                  minimal_interface: data.minimalInterface,
                  digital_timer: data.digitalTimer,
                });
                // Complete onboarding without paywall
                handleComplete('skipped');
              }}
            />
          );
        }
        return <Filter0Opening onContinue={goToNextFilter} />;

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
