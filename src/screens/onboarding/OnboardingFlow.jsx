// src/screens/onboarding/OnboardingFlow.jsx
// Orchestrateur du funnel onboarding V2

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from './onboardingConstants';

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

  const goToNextFilter = () => {
    setCurrentFilter((prev) => prev + 1);
  };

  const jumpToFilter = (n) => {
    setCurrentFilter(n);
  };

  const reset = () => {
    setCurrentFilter(0);
    setNeeds([]);
    setTimerConfig({});
  };

  const handleComplete = (result) => {
    // Transmet le résultat final (trial/skipped) et la config
    onComplete({
      result,
      needs,
      timerConfig,
    });
  };

  // Dev navigation (visible uniquement en __DEV__)
  const DevBar = () => {
    if (!__DEV__) return null;

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
              goToNextFilter();
            }}
          />
        );
      case 2:
        return (
          <Filter2Creation
            needs={needs}
            onContinue={(config) => {
              setTimerConfig(config);
              goToNextFilter();
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
