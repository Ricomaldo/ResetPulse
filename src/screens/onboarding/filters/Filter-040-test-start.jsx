import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';
import { spacing, typography, fontWeights } from '../../../theme/tokens';
import haptics from '../../../utils/haptics';

export default function Filter040TestStart({ onContinue }) {
  const t = useTranslation();
  const { colors } = useTheme();
  const pressStartRef = useRef(null);

  const handlePressIn = useCallback(() => {
    pressStartRef.current = Date.now();
    haptics.impact('light').catch(() => {});
  }, []);

  const handlePressOut = useCallback(() => {
    if (pressStartRef.current) {
      const pressDuration = Date.now() - pressStartRef.current;
      haptics.impact('medium').catch(() => {});

      // Pass measured timing to next filter
      onContinue({ startTiming: pressDuration });
    }
  }, [onContinue]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.testStart.title')}
        </Text>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.brand.primary },
            pressed && styles.buttonPressed,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Press and release to measure your interaction speed"
          accessibilityHint="Press when ready, release when you want"
        >
          <View style={styles.buttonInner} accessible={false} />
        </Pressable>

        {t('onboarding.testStart.hint') && (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('onboarding.testStart.hint')}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const BUTTON_SIZE = rs(120, 'min');

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
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: rs(spacing.xl),
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonInner: {
    width: BUTTON_SIZE * 0.6,
    height: BUTTON_SIZE * 0.6,
    borderRadius: (BUTTON_SIZE * 0.6) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  hint: {
    fontSize: rs(typography.base),
    textAlign: 'center',
    marginTop: rs(spacing.xxl),
    opacity: 0.7,
  },
});
