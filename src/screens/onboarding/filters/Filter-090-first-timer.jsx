// src/screens/onboarding/filters/Filter-090-first-timer.jsx
/**
 * Filter 9: First Timer Experience
 * Phase 1: Summary (profile, tool, moment)
 * Phase 2: Guided 60s timer with created activity
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { PrimaryButton } from '../../../components/buttons/Button';
import { TimerDial } from '../../../components/dial';
import useTimer from '../../../hooks/useTimer';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';
import { rs } from '../../../styles/responsive';
import { getPersonaById } from '../personaConstants';
import haptics from '../../../utils/haptics';
import { spacing, typography, fontWeights, borderRadius } from '../../../theme/tokens';

const FIRST_TIMER_DURATION = 60; // 60 seconds

const TOOL_LABELS = {
  colors: { emoji: '🎨', labelKey: 'onboarding.tool.creative' },
  none: { emoji: '☯', labelKey: 'onboarding.tool.minimalist' },
  activities: { emoji: '🔄', labelKey: 'onboarding.tool.multitask' },
  commands: { emoji: '⏱', labelKey: 'onboarding.tool.rational' },
};

export default function Filter090FirstTimer({
  onContinue,
  customActivity,
  persona,
  favoriteToolMode,
}) {
  const t = useTranslation();
  const { colors } = useTheme();

  const [phase, setPhase] = useState('summary'); // 'summary' | 'timer'

  // Resolve persona
  const personaData = typeof persona === 'string' ? getPersonaById(persona) : persona;

  // Tool info
  const toolInfo = TOOL_LABELS[favoriteToolMode] || TOOL_LABELS.commands;

  // Timer hook for phase 'timer'
  const {
    remaining,
    running: isRunning,
    isCompleted,
    startTimer,
  } = useTimer(FIRST_TIMER_DURATION, () => {
    haptics.success().catch(() => {});
    // Small delay before continuing
    setTimeout(() => {
      onContinue({ firstTimerCompleted: true });
    }, 2000);
  });

  const handleStartTimer = useCallback(() => {
    haptics.impact('medium').catch(() => {});
    setPhase('timer');
    // Start timer after short delay for transition
    setTimeout(() => {
      startTimer();
    }, 500);
  }, [startTimer]);

  // Summary Phase
  if (phase === 'summary') {
    return (
      <OnboardingLayout
        title={t('onboarding.firstTimer.title')}
        centerContent
        footer={
          <PrimaryButton
            label={t('onboarding.firstTimer.startButton')}
            onPress={handleStartTimer}
            accessibilityHint="Start your first 60-second guided timer session"
          />
        }
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          {/* Persona */}
          {personaData && (
            <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={styles.summaryIcon}>👤</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('onboarding.firstTimer.profile')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {personaData.emoji} {t(personaData.labelKey)}
              </Text>
            </View>
          )}

          {/* Tool */}
          <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={styles.summaryIcon}>🛠</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('onboarding.firstTimer.tool')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {toolInfo.emoji} {t(toolInfo.labelKey)}
            </Text>
          </View>

          {/* Custom Activity */}
          {customActivity && (
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryIcon}>⏱</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('onboarding.firstTimer.moment')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {customActivity.emoji} {customActivity.name || customActivity.label}
              </Text>
            </View>
          )}
        </View>
      </OnboardingLayout>
    );
  }

  // Timer Phase
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.timerContainer}>
        {/* Timer Dial */}
        <View style={styles.dialWrapper}>
          <TimerDial
            duration={FIRST_TIMER_DURATION}
            remaining={remaining}
            isRunning={isRunning}
            currentActivity={customActivity}
            size={Math.min(280, rs(280))}
            isCompleted={isCompleted}
            showNumbers={true}
            showGraduations={true}
          />
        </View>

        {/* Simple message */}
        {isCompleted && (
          <Text style={[styles.completionMessage, { color: colors.text }]}>
            {t('onboarding.firstTimer.completionMessage')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Summary card
  summaryCard: {
    width: '100%',
    maxWidth: rs(320),
    borderRadius: rs(borderRadius.xl),
    padding: rs(spacing.lg),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(spacing.md),
    borderBottomWidth: 1,
  },
  summaryIcon: {
    fontSize: rs(20),
    width: rs(32),
  },
  summaryLabel: {
    fontSize: rs(typography.sm),
    flex: 1,
  },
  summaryValue: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.semibold,
  },
  // Timer phase (custom layout, not using OnboardingLayout)
  container: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialWrapper: {
    marginBottom: rs(spacing.xl),
  },
  completionMessage: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    paddingHorizontal: rs(spacing.lg),
  },
});
