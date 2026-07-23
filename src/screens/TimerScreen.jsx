/**
 * @fileoverview TimerScreen — écran principal, Mode Mixte (SCR-1, ADR-014)
 * Reconstruction Lot 2 (2026-07-23) : écran neuf, construit depuis
 * `_docs/specs/recentrage.md`. Récolte des primitives prouvées (TimeTimer,
 * ActivityItem, activities.js, timer-palettes.js) — pas de layout hérité.
 * Cycle 1 : état repos uniquement. Pas de logique de séance (Cycle 2).
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from '../hooks/useTranslation';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import Icons from '../components/layout/Icons';
import { getFreeActivities } from '../config/activities';
import { getPaletteColors } from '../config/timer-palettes';
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

  const styles = StyleSheet.create({
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
        <TimeTimer />
        <CompactRow />
        <DistractionButton />
      </View>
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
