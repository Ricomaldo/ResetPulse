// src/screens/onboarding/filters/Filter3Test.jsx
// Filtre 3 : Test expérience (countdown 60 secondes)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import TimerDial from '../../../components/timer/TimerDial';
import { rs } from '../onboardingConstants';
import { fontWeights } from '../../../../theme/tokens';

const TEST_DURATION = 60; // seconds
const UPDATE_INTERVAL = 50; // ms (20 fps)

export default function Filter3Test({ timerConfig, onContinue }) {
  const { colors, spacing } = useTheme();
  const t = useTranslation();
  const [progress, setProgress] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION);
  const [started, setStarted] = useState(false);
  const startTime = useRef(null);
  const vibrated30 = useRef(false);

  useEffect(() => {
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;
    startTime.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const remaining = Math.max(0, TEST_DURATION - elapsed);
      const currentSecond = Math.ceil(remaining);

      setProgress(remaining / TEST_DURATION);
      setSecondsLeft(currentSecond);

      // Vibration à 30 sec
      if (currentSecond <= 30 && !vibrated30.current) {
        vibrated30.current = true;
        Vibration.vibrate(200);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        Vibration.vibrate(500);
        setTimeout(() => onContinue(), 1000);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [started, onContinue]);

  const color = timerConfig?.color || '#4ECDC4';
  const emoji = timerConfig?.activity?.emoji || '\u{1F9D8}';

  const styles = createStyles(colors, spacing);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>{t('onboarding.v2.filter3.title')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding.v2.filter3.subtitle')}
        </Text>

        <View style={styles.testDialContainer}>
          <TimerDial
            progress={progress}
            duration={TEST_DURATION}
            color={color}
            size={rs(240)}
            scaleMode="1min"
            activityEmoji={emoji}
            isRunning={started}
            shouldPulse={true}
            currentActivity={timerConfig?.activity}
            showNumbers={false}
          />
        </View>

        <Text style={styles.testHint}>
          {secondsLeft > 30 ? t('onboarding.v2.filter3.breathe') : t('onboarding.v2.filter3.almostDone')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: rs(spacing.lg),
    },
    title: {
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    subtitle: {
      fontSize: rs(16),
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: rs(spacing.xl),
    },
    testDialContainer: {
      marginVertical: rs(spacing.xl),
      alignItems: 'center',
    },
    testHint: {
      fontSize: rs(18),
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });
