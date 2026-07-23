/**
 * @fileoverview TimerScreen — écran principal, Mode Mixte (SCR-1/2/3, ADR-014)
 * Reconstruction Lot 2 (2026-07-23) : écran neuf, construit depuis
 * `_docs/specs/recentrage.md`. Récolte des primitives prouvées (TimeTimer,
 * ActivityItem, activities.js, timer-palettes.js) — pas de layout hérité.
 * Cycle 1 : état repos (SCR-1). Cycle 2 : séance + fin (SCR-2/3) — tap sur le
 * disque pilote start/stop(rembobinage)/reset via la state machine récoltée
 * (useTimer, ADR-007) — aucune logique neuve, juste le branchement écran.
 * Cycle 3 : sheet SCR-10 (`AsideZone`, adopté — né de la spec) monté en swipe
 * up depuis Mixte.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from '../hooks/useTranslation';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import DigitalTimer from '../components/controls/DigitalTimer';
import Icons from '../components/layout/Icons';
import AsideZone from '../components/layout/AsideZone';
import { getFreeActivities } from '../config/activities';
import { getPaletteColors } from '../config/timer-palettes';
import { COLORS } from '../components/dial/timerConstants';
import haptics from '../utils/haptics';

const FREE_ACTIVITIES = getFreeActivities();
const SERENITY_COLORS = getPaletteColors('serenity');
const ACTIVITY_SIZE = rs(40, 'min');
const COLOR_DOT_SIZE = rs(26, 'min');

function CompactRow() {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { currentActivity },
    palette: { currentColor },
    setCurrentActivity,
    setColorIndex,
  } = useTimerConfig();

  const styles = StyleSheet.create({
    activityButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.round,
      height: ACTIVITY_SIZE,
      justifyContent: 'center',
      width: ACTIVITY_SIZE,
    },
    activityButtonActive: {
      backgroundColor: theme.colors.brand.accent,
    },
    activityEmoji: {
      fontSize: rs(20, 'min'),
    },
    colorDot: {
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      height: COLOR_DOT_SIZE,
      padding: 3,
      width: COLOR_DOT_SIZE,
    },
    colorDotActive: {
      transform: [{ scale: 1.15 }],
    },
    colorDotInner: {
      borderRadius: theme.borderRadius.round,
      flex: 1,
    },
    row: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      ...theme.shadow('sm'),
    },
    separator: {
      backgroundColor: theme.colors.border,
      height: rs(24, 'min'),
      marginHorizontal: theme.spacing.xxs,
      width: StyleSheet.hairlineWidth * 2,
    },
  });

  return (
    <View style={styles.row}>
      {FREE_ACTIVITIES.map((activity) => {
        const isActive = currentActivity?.id === activity.id;
        return (
          <TouchableOpacity
            key={activity.id}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.activity', {
              name: activity.label,
            })}
            accessibilityState={{ selected: isActive }}
            style={[styles.activityButton, isActive && styles.activityButtonActive]}
            onPress={() => {
              haptics.selection().catch(() => {});
              setCurrentActivity(activity);
            }}
            activeOpacity={0.7}
          >
            {activity.id === 'none' ? (
              <Icons
                name="timer"
                size={rs(18, 'min')}
                color={isActive ? theme.colors.fixed.white : theme.colors.textSecondary}
              />
            ) : (
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={styles.separator} />

      {SERENITY_COLORS.map((color, index) => (
        <TouchableOpacity
          key={color}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.colorNumber', { number: index + 1 })}
          accessibilityState={{ selected: currentColor === color }}
          style={[
            styles.colorDot,
            { borderColor: color },
            currentColor === color && styles.colorDotActive,
          ]}
          onPress={() => {
            haptics.selection().catch(() => {});
            setColorIndex(index);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.colorDotInner, { backgroundColor: color }]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DistractionButton() {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      height: rs(48, 'min'),
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      width: rs(48, 'min'),
      ...theme.shadow('sm'),
    },
    emoji: {
      fontSize: rs(22, 'min'),
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t('accessibility.distraction')}
      activeOpacity={0.7}
      onPress={() => {}}
    >
      <Text style={styles.emoji}>🎲</Text>
    </TouchableOpacity>
  );
}

function TimerScreenContent() {
  const theme = useTheme();

  // Pont écran ↔ state machine récoltée (useTimer, via TimeTimer.onTimerRef).
  // Aucune logique de séance neuve : on lit running/isCompleted/remaining tels
  // que la machine ADR-007 les produit déjà, pour piloter l'affichage sous le
  // disque et le tap (start / stop-rembobinage / reset).
  const timerRef = useRef(null);
  const [snapshot, setSnapshot] = useState({
    running: false,
    remaining: 0,
    isCompleted: false,
    displayMessage: '',
  });

  const handleTimerRef = useCallback((timer) => {
    timerRef.current = timer;
    setSnapshot((prev) => {
      if (
        prev.running === timer.running &&
        prev.remaining === timer.remaining &&
        prev.isCompleted === timer.isCompleted &&
        prev.displayMessage === timer.displayMessage
      ) {
        return prev;
      }
      return {
        running: timer.running,
        remaining: timer.remaining,
        isCompleted: timer.isCompleted,
        displayMessage: timer.displayMessage,
      };
    });
  }, []);

  const handleDialTap = useCallback(() => {
    const timer = timerRef.current;
    if (!timer) {
      return;
    }
    if (timer.isCompleted) {
      timer.resetTimer();
    } else if (timer.running) {
      timer.stopTimer(); // ADR-007 : tap pendant la séance = rembobinage
    } else {
      timer.startTimer();
    }
  }, []);

  const styles = StyleSheet.create({
    completionMessage: {
      color: COLORS.COMPLETION_GREEN,
      fontSize: rs(18, 'min'),
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    container: {
      flex: 1,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <TimeTimer onDialTap={handleDialTap} onTimerRef={handleTimerRef} />
        {snapshot.running && (
          <DigitalTimer remaining={snapshot.remaining} isRunning compact />
        )}
        {snapshot.isCompleted && (
          <Text style={styles.completionMessage}>{snapshot.displayMessage}</Text>
        )}
        <CompactRow />
        <DistractionButton />
      </View>
      <AsideZone isTimerRunning={snapshot.running} />
    </SafeAreaView>
  );
}

export default function TimerScreen() {
  return (
    <SafeAreaProvider>
      <TimerScreenContent />
    </SafeAreaProvider>
  );
}
