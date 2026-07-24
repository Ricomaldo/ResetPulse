/**
 * @fileoverview TimerScreen — écran principal, modes Mixte + Focus (ADR-014)
 * Reconstruction Lot 2 (2026-07-23) : écran neuf, construit depuis
 * `_docs/specs/recentrage.md`. Récolte des primitives prouvées (TimeTimer,
 * ActivityItem, activities.js, timer-palettes.js) — pas de layout hérité.
 * Cycle 1 : état repos (SCR-1). Cycle 2 : séance + fin (SCR-2/3) — tap sur le
 * disque pilote start/stop(rembobinage)/reset via la state machine récoltée
 * (useTimer, ADR-007) — aucune logique neuve, juste le branchement écran.
 * Cycle 3 : sheet SCR-10 (`AsideZone`, adopté — né de la spec) monté en swipe
 * up depuis Mixte.
 * Cycle 4 (SCR-4/5/6) : mode Focus branché sur le réglage global `mode`.
 * `TimeTimer` reste monté en continu quel que soit le mode (state machine
 * ADR-007 intouchable au changement de mode) — seul le chrome autour
 * (rangée, 🎲, chiffre, message de fin) est conditionné par le mode. Focus
 * n'ajoute qu'un hint discret au repos ; la fin ✨ plein-vert est déjà portée
 * par le dial (`DialCenter`), pas par ce fichier.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from '../hooks/useTranslation';
import { useFirstRun } from '../hooks/useFirstRun';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import AsideZone from '../components/layout/AsideZone';
import FirstRunTips from '../components/first-run/FirstRunTips';
import { getFreeActivities } from '../config/activities';
import { COLORS } from '../components/dial/timerConstants';
import haptics from '../utils/haptics';

const FREE_ACTIVITIES = getFreeActivities();
const ACTIVITY_SIZE = rs(40, 'min');
const COLOR_DOT_SIZE = rs(26, 'min');

function CompactRow({ onActivityTouch, onColorTouch }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { currentActivity },
    palette: { currentColor, paletteColors },
    setCurrentActivity,
    setColorIndex,
  } = useTimerConfig();

  const styles = StyleSheet.create({
    activityButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.chipBorder,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: ACTIVITY_SIZE,
      justifyContent: 'center',
      width: ACTIVITY_SIZE,
    },
    activityButtonActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    activityEmoji: {
      fontSize: rs(20, 'min'),
    },
    colorDot: {
      borderColor: theme.colors.shadow,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: COLOR_DOT_SIZE,
      padding: 3,
      width: COLOR_DOT_SIZE,
    },
    colorDotActive: {
      borderColor: theme.colors.text,
      borderWidth: 2,
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
              onActivityTouch?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.separator} />

      {paletteColors.map((color, index) => (
        <TouchableOpacity
          key={color}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.colorNumber', { number: index + 1 })}
          accessibilityState={{ selected: currentColor === color }}
          style={[
            styles.colorDot,
            currentColor === color && styles.colorDotActive,
          ]}
          onPress={() => {
            haptics.selection().catch(() => {});
            setColorIndex(index);
            onColorTouch?.();
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

function formatTime(totalSecondsRaw) {
  const totalSeconds = Math.floor(totalSecondsRaw);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// C6.2 (fidélité au rendu) : temps digital toujours monté EN HAUT d'écran,
// hors du bloc centré — le start ne déplace plus rien sous le disque
// (remplace l'ancien DigitalTimer conditionnel sur `running`, seule source
// du saut de layout repos→séance).
function TopTime({ seconds }) {
  const theme = useTheme();
  const t = useTranslation();
  const { display: { showTime }, setShowTime } = useTimerConfig();

  const styles = StyleSheet.create({
    text: {
      // brand.neutral donnait 2.37:1 sur le fond crème (#F4EFE7) — bien sous
      // WCAG AA (4.5:1), quasi illisible à 13px (trouvé en retest Eric,
      // rapporté comme "timer invisible"). textSecondary : 5.41:1.
      color: theme.colors.textSecondary,
      fontSize: rs(17, 'min'), // 13px était timide — maquette SCR-8 : chiffre affirmé
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    wrap: {
      alignItems: 'center',
      paddingTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={() => {
          haptics.selection().catch(() => {});
          setShowTime(!showTime);
        }}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={showTime
          ? t('controls.digitalTimer.timeLabel', { time: formatTime(seconds) })
          : t('controls.digitalTimer.showTime')}
        accessibilityHint={showTime ? t('controls.digitalTimer.tapToHide') : t('controls.digitalTimer.tapToShow')}
      >
        <Text style={styles.text}>{showTime ? formatTime(seconds) : '••:••'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Focus, affûté C6.2 (fidélité au rendu) : hint discret ANCRÉ EN BAS
// d'écran (plus centré sous le disque — hors du bloc centré `content`,
// donc son montage/démontage ne déplace jamais le dial), i18n (fin de
// l'exception hardcode C4).
function FocusHint() {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    hint: {
      // Même correctif que TopTime : brand.neutral = 2.37:1 sur le fond
      // crème, sous WCAG AA. textSecondary = 5.41:1.
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      textAlign: 'center',
    },
    wrap: {
      alignItems: 'center',
      bottom: theme.spacing.lg,
      left: 0,
      position: 'absolute',
      right: 0,
    },
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.hint}>{t('focus.hint')}</Text>
    </View>
  );
}

function TimerScreenContent() {
  const theme = useTheme();
  const {
    mode: { current: currentMode },
    timer: { currentDuration },
  } = useTimerConfig();
  const isFocus = currentMode === 'focus';

  // Première fois (Lot 2, C7) — flag persisté + moment dérivé de la
  // progression réelle du rituel en construction (cf. useFirstRun).
  const firstRun = useFirstRun();
  const [barAnchor, setBarAnchor] = useState(null);
  const [dialAnchor, setDialAnchor] = useState(null);
  const initialDurationRef = useRef(currentDuration);
  const hasCompletedFirstRunRef = useRef(false);
  const barRef = useRef(null);

  const handleBarLayout = useCallback(() => {
    barRef.current?.measureInWindow((x, y, width, height) => {
      setBarAnchor({ x, y, width, height });
    });
  }, []);

  const handleDialRef = useCallback((node) => {
    if (!node) {
      return;
    }
    // measureInWindow juste après le layout initial (dial monté en continu,
    // cf. header) — mesure approximative, suffisante pour un tip ancré.
    requestAnimationFrame(() => {
      node.measureInWindow?.((x, y, width, height) => {
        setDialAnchor({ x, y, width, height });
      });
    });
  }, []);

  // Cadran touché (moment 2 → 3) : détecté via l'écart à la durée observée
  // au montage — pas de plomberie neuve sur le geste de drag (TimerDial
  // intouché). Repli permissif : une couleur choisie saute direct au
  // moment 4 (cf. useFirstRun), donc cette détection reste secondaire.
  useEffect(() => {
    if (currentDuration !== initialDurationRef.current) {
      firstRun.markDialTouched();
    }
  }, [currentDuration]);

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

  // ADR-014 : ne bloque jamais rien — démarrer le timer complète la
  // Première fois à N'IMPORTE QUEL moment (pas seulement au moment 4).
  useEffect(() => {
    if (snapshot.running && !hasCompletedFirstRunRef.current && !firstRun.hasSeenFirstRun) {
      hasCompletedFirstRunRef.current = true;
      firstRun.completeFirstRun();
    }
  }, [snapshot.running]);

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
      textAlign: 'center',
    },
    completionMessageHidden: {
      opacity: 0,
    },
    completionMessageWrap: {
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
      minHeight: rs(24, 'min'),
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

  // Temps digital (top bar) : restant en séance/fin, durée réglée au repos —
  // toujours le même élément, seuls les chiffres changent (zéro saut).
  const topTimeSeconds = snapshot.running || snapshot.isCompleted
    ? snapshot.remaining
    : currentDuration;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {!isFocus && <TopTime seconds={topTimeSeconds} />}
      <View style={styles.content}>
        <TimeTimer onDialTap={handleDialTap} onTimerRef={handleTimerRef} onDialRef={handleDialRef} />
        {!isFocus && (
          <View style={styles.completionMessageWrap}>
            <Text
              style={[styles.completionMessage, !snapshot.isCompleted && styles.completionMessageHidden]}
              numberOfLines={1}
            >
              {snapshot.displayMessage || ' '}
            </Text>
          </View>
        )}
        {!isFocus && (
          <View ref={barRef} onLayout={handleBarLayout}>
            <CompactRow
              onActivityTouch={firstRun.markActivityTouched}
              onColorTouch={firstRun.markColorTouched}
            />
          </View>
        )}
        {!isFocus && <DistractionButton />}
      </View>
      {isFocus && !snapshot.running && !snapshot.isCompleted && <FocusHint />}
      <AsideZone isTimerRunning={snapshot.running} />
      {!isFocus && (
        <FirstRunTips
          moment={firstRun.moment}
          barAnchor={barAnchor}
          dialAnchor={dialAnchor}
          onSkip={firstRun.skipFirstRun}
        />
      )}
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
