import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { PrimaryButton } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';
import { spacing, typography, fontWeights } from '../../../theme/tokens';
import haptics from '../../../utils/haptics';
import {
  STOP_ANIMATION_DURATION,
  detectPersona,
} from '../personaConstants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circle dimensions
const CIRCLE_SIZE = rs(200, 'min');
const STROKE_WIDTH = rs(12);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Filter050TestStop({ onContinue, startTiming }) {
  const t = useTranslation();
  const { colors } = useTheme();
  const { setInteractionProfile } = useTimerConfig();

  const [phase, setPhase] = useState('test'); // 'test' | 'reveal'
  const [detectedPersona, setDetectedPersona] = useState(null);
  const [stopTiming, setStopTiming] = useState(null);

  const pressStartRef = useRef(null);
  const animationStartRef = useRef(null);
  const progress = useSharedValue(0);

  // Start animation when component mounts
  useEffect(() => {
    if (phase === 'test') {
      animationStartRef.current = Date.now();
      progress.value = withTiming(1, {
        duration: STOP_ANIMATION_DURATION,
        easing: Easing.linear,
      });
    }
  }, [phase, progress]);

  const handlePressIn = useCallback(() => {
    pressStartRef.current = Date.now();
    haptics.impact('light').catch(() => {});
  }, []);

  const handlePressOut = useCallback(() => {
    if (animationStartRef.current && phase === 'test') {
      const measuredStopTiming = Date.now() - animationStartRef.current;
      setStopTiming(measuredStopTiming);

      // Detect persona
      const persona = detectPersona(startTiming, measuredStopTiming);
      setDetectedPersona(persona);

      // Persist to context
      setInteractionProfile(persona.id);

      // Haptic feedback
      haptics.success().catch(() => {});

      // Transition to reveal phase
      setPhase('reveal');
    }
  }, [startTiming, phase, setInteractionProfile]);

  const handleContinue = useCallback(() => {
    onContinue({
      stopTiming,
      persona: detectedPersona,
    });
  }, [onContinue, stopTiming, detectedPersona]);

  // Animated circle style
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Test Phase
  if (phase === 'test') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('onboarding.testStop.title')}
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.circleContainer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tap to stop the circle animation when ready"
            accessibilityHint="Release when you want to reveal your interaction profile"
          >
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} accessible={false}>
              {/* Background circle */}
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Progress circle */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.brand.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedCircleProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            </Svg>
          </Pressable>

          {t('onboarding.testStop.hint') && (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('onboarding.testStop.hint')}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Reveal Phase
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.revealTitle, { color: colors.text }]}>
          {t('onboarding.testStop.revealTitle')}
        </Text>

        <View style={styles.personaCard}>
          <Text style={styles.personaEmoji}>{detectedPersona?.emoji}</Text>
          <Text style={[styles.personaLabel, { color: colors.text }]}>
            {t(detectedPersona?.labelKey)}
          </Text>
        </View>

        <Text style={[styles.personaDescription, { color: colors.textSecondary }]}>
          {t(detectedPersona?.descriptionKey)}
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('common.continue')}
          onPress={handleContinue}
          accessibilityHint="Continue with your detected interaction profile"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(spacing.lg),
  },
  title: {
    fontSize: rs(typography.xl),
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
    marginBottom: rs(spacing.xxl),
  },
  circleContainer: {
    marginVertical: rs(spacing.xl),
  },
  hint: {
    fontSize: rs(typography.base),
    textAlign: 'center',
    marginTop: rs(spacing.xxl),
    opacity: 0.7,
  },
  // Reveal phase
  revealTitle: {
    fontSize: rs(typography.lg),
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    marginBottom: rs(spacing.xl),
  },
  personaCard: {
    alignItems: 'center',
    marginVertical: rs(spacing.lg),
  },
  personaEmoji: {
    fontSize: rs(64),
    marginBottom: rs(spacing.md),
  },
  personaLabel: {
    fontSize: rs(28),
    fontWeight: fontWeights.bold,
  },
  personaDescription: {
    fontSize: rs(typography.md),
    textAlign: 'center',
    marginTop: rs(spacing.lg),
    paddingHorizontal: rs(spacing.lg),
    lineHeight: rs(24),
  },
  footer: {
    padding: rs(spacing.lg),
    paddingBottom: rs(spacing.xl),
  },
});
