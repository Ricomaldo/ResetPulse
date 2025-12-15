// src/screens/onboarding/OnboardingFlow.jsx
// Orchestrateur du funnel onboarding V3

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../theme/ThemeProvider';
import { rs, getStepName } from './onboardingConstants';
import analytics from '../../services/analytics';
import logger from '../../utils/logger';
import { DEV_MODE } from '../../config/test-mode';
import StepIndicator from '../../components/onboarding/StepIndicator';

import {
import { fontWeights } from '../../../theme/tokens';
  Filter010Opening,
  Filter020Needs,
  Filter030Creation,
  Filter040Test,
  Filter050Notifications,
  Filter060Branch,
  Filter070VisionDiscover,
  Filter080SoundPersonalize,
  Filter090PaywallDiscover,
  Filter100InterfacePersonalize,
} from './filters';

const TOTAL_FILTERS = 8;

export default function OnboardingFlow({ onComplete }) {
  const { colors, spacing } = useTheme();
  const [currentFilter, setCurrentFilter] = useState(0);
  const [needs, setNeeds] = useState([]);
  const [timerConfig, setTimerConfig] = useState({});
  const [branch, setBranch] = useState(null); // 'discover' | 'personalize'
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [shouldRequestPermissionLater, setShouldRequestPermissionLater] = useState(false);
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

  const goToPreviousFilter = () => {
    // Track back navigation
    if (currentFilter > 0) {
      setCurrentFilter((prev) => prev - 1);
    }
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
    setShouldRequestPermissionLater(false);
    setSoundConfig(null);
    setInterfaceConfig(null);
    hasTrackedStart.current = false;
  };

  const requestNotificationPermissionAfterOnboarding = async () => {
    if (!shouldRequestPermissionLater) {
      return;
    }

    try {
      logger.log('[Onboarding] Requesting notification permission after onboarding');
      const { status } = await Notifications.requestPermissionsAsync();
      logger.log('[Onboarding] Notification permission result:', status);
    } catch (error) {
      logger.error('[Onboarding] Failed to request notification permission:', error);
    }
  };

  const handleComplete = async (result) => {
    // Track final step completed
    analytics.trackOnboardingStepCompleted(currentFilter, getStepName(currentFilter, branch), { result });
    // Track onboarding completed avec résultat et branch
    analytics.trackOnboardingCompleted(result, needs, branch);

    // Request notification permission after onboarding completes
    await requestNotificationPermissionAfterOnboarding();

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
        // Filter 010: Opening (breathe)
        return <Filter010Opening onContinue={goToNextFilter} />;

      case 1:
        // Filter 020: Needs
        return (
          <Filter020Needs
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
        // Filter 030: Creation
        return (
          <Filter030Creation
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
        // Filter 040: Test 60 sec
        return (
          <Filter040Test timerConfig={timerConfig} onContinue={goToNextFilter} />
        );

      case 4:
        // Filter 050: Notifications Permission
        return (
          <Filter050Notifications
            onContinue={(data) => {
              setNotificationPermission(data.notificationPermission);
              setShouldRequestPermissionLater(data.shouldRequestLater || false);
              analytics.trackOnboardingStepCompleted(4, getStepName(4, branch), {
                permission_granted: data.notificationPermission,
              });
              setCurrentFilter((prev) => prev + 1);
            }}
          />
        );

      case 5:
        // Filter 060: Branch Choice
        return (
          <Filter060Branch
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
        // Filter 070 (discover) or 080 (personalize)
        if (branch === 'discover') {
          return <Filter070VisionDiscover needs={needs} onContinue={goToNextFilter} />;
        } else if (branch === 'personalize') {
          return (
            <Filter080SoundPersonalize
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
        return <Filter010Opening onContinue={goToNextFilter} />;

      case 7:
        // Filter 6 (paywall for discover) or 5c (interface for personalize)
        if (branch === 'discover') {
          return <Filter090PaywallDiscover onComplete={handleComplete} />;
        } else if (branch === 'personalize') {
          return (
            <Filter100InterfacePersonalize
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
        return <Filter010Opening onContinue={goToNextFilter} />;

      default:
        return <Filter010Opening onContinue={goToNextFilter} />;
    }
  };

  const styles = createStyles(colors, spacing);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DevBar />
      {/* Back button header - hidden on first screen */}
      {currentFilter > 0 && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goToPreviousFilter}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        </View>
      )}
      <StepIndicator current={currentFilter} total={TOTAL_FILTERS} />
      {renderFilter()}
    </View>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: rs(spacing.md),
      paddingVertical: rs(spacing.sm),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: rs(44),
      height: rs(44),
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44,
      minHeight: 44,
    },
    backButtonText: {
      fontSize: rs(32),
      color: colors.text,
      fontWeight: fontWeights.light,
    },
  });

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
      backgroundColor: colors.brand.primary,
    },
    devResetButton: {
      width: rs(36),
      height: rs(36),
      borderRadius: rs(18),
      backgroundColor: colors.brand.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: rs(spacing.md),
    },
    devButtonText: {
      color: colors.text,
      fontSize: rs(14),
      fontWeight: fontWeights.semibold,
    },
  });
