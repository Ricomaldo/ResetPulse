// src/screens/onboarding/filters/Filter0Opening.jsx
// Filtre 0 : Animation de respiration d'introduction

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../onboardingConstants';

const BREATH_CYCLES = 5;
const BREATH_DURATION = 1500;

export default function Filter0Opening({ onContinue }) {
  const { colors, spacing } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cycleCount = useRef(0);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cycleCount.current += 1;
        if (cycleCount.current < BREATH_CYCLES) {
          pulse();
        } else {
          onContinue();
        }
      });
    };
    pulse();
  }, [onContinue, scaleAnim]);

  const styles = createStyles(colors, spacing);

  return (
    <TouchableOpacity
      style={styles.fullScreen}
      onPress={onContinue}
      activeOpacity={1}
    >
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        />
        <Text style={styles.breathingText}>
          Respire.{'\n'}Ton temps t'appartient.
        </Text>
        <Text style={styles.tapHint}>Touche pour continuer</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: rs(spacing.lg),
    },
    breathingCircle: {
      width: rs(160),
      height: rs(160),
      borderRadius: rs(80),
      backgroundColor: colors.primary,
      marginBottom: rs(spacing.xl),
    },
    breathingText: {
      fontSize: rs(26),
      color: colors.text,
      textAlign: 'center',
      lineHeight: rs(38),
      fontWeight: '300',
    },
    tapHint: {
      position: 'absolute',
      bottom: rs(100),
      color: colors.textTertiary,
      fontSize: rs(14),
    },
  });
