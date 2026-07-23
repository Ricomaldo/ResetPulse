/**
 * @fileoverview AsideZone - Sheet léger custom Reanimated 4 (SCR-10, ADR-014)
 * V3 (2026-05-01) : migration @gorhom/bottom-sheet → Gesture.Pan + Reanimated 4.
 * Recentrage (2026-07-23) : 3 snaps / 7 sections → 2 états (fermé / ouvert
 * au swipe up) et 4 blocs — segmenté Mode (structure seule au Lot 1),
 * 3 toggles, Mes rituels, Palettes.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Switch } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import { MessageZone } from '../messaging';
import { ActivityCarousel, PaletteCarousel } from '../carousels';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 2 snaps : fermé (handle visible) / ouvert (sheet 80%)
const SNAP_Y_CLOSED = SCREEN_HEIGHT * 0.92;
const SNAP_Y_OPEN = SCREEN_HEIGHT * 0.2;

// Libellés SCR-10 hardcodés FR — batch i18n 15 langues au Lot 3 (src/i18n/TODO.md)
const MODE_LABELS = ['Mixte', 'Focus', 'Complet'];
const RITUALS_LABEL = 'Mes rituels';
const PALETTES_LABEL = 'Palettes';

export default function AsideZone({ timerState, isTimerRunning, displayMessage, isCompleted, flashActivity }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { currentActivity, clockwise },
    setClockwise,
    display: { showActivityEmoji },
    setShowActivityEmoji,
    system: { keepAwakeEnabled },
    setKeepAwakeEnabled,
  } = useTimerConfig();

  const activityCarouselRef = useRef(null);
  const paletteCarouselRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const translateY = useSharedValue(SNAP_Y_CLOSED);
  const startY = useSharedValue(SNAP_Y_CLOSED);

  const snapTo = (open) => {
    translateY.value = withSpring(open ? SNAP_Y_OPEN : SNAP_Y_CLOSED, {
      damping: 80,
      stiffness: 450,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
    setIsOpen(open);
  };

  // Auto-collapse when timer starts
  useEffect(() => {
    if (isTimerRunning && isOpen) {
      snapTo(false);
    }
  }, [isTimerRunning]); // volontairement limité : réagit au seul démarrage du timer

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-15, 15])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newY = startY.value + e.translationY;
      translateY.value = Math.max(SNAP_Y_OPEN, Math.min(SNAP_Y_CLOSED, newY));
    })
    .onEnd((e) => {
      const midpoint = (SNAP_Y_OPEN + SNAP_Y_CLOSED) / 2;
      let open = translateY.value < midpoint;
      if (e.velocityY > 500) { open = false; }
      if (e.velocityY < -500) { open = true; }
      translateY.value = withSpring(open ? SNAP_Y_OPEN : SNAP_Y_CLOSED, {
        damping: 80,
        stiffness: 450,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
      runOnJS(setIsOpen)(open);
    }),
  [translateY, startY]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_Y_OPEN, SNAP_Y_CLOSED],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const styles = StyleSheet.create({
    asideContainer: {
      bottom: 0,
      left: 0,
      pointerEvents: 'box-none',
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 50,
    },
    content: {
      flex: 1,
    },
    drawer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      height: SCREEN_HEIGHT,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    handleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    handleIndicator: {
      borderRadius: 3,
      height: 5,
      width: 50,
    },
    labelOverlay: {
      alignItems: 'center',
      bottom: SCREEN_HEIGHT * 0.35,
      justifyContent: 'center',
      pointerEvents: 'none',
      position: 'absolute',
      width: '100%',
      zIndex: 0,
    },
    optionLabel: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    optionRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: rs(12),
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    scrollContent: {
      paddingBottom: rs(24),
      paddingHorizontal: rs(16),
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.semibold,
      letterSpacing: 0.5,
      marginBottom: rs(8),
      marginTop: rs(16),
      textTransform: 'uppercase',
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      paddingVertical: rs(8),
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.brand.accent,
    },
    segmentText: {
      color: theme.colors.text,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    segmentTextActive: {
      color: theme.colors.fixed.white,
    },
    segmentedControl: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      flexDirection: 'row',
      marginTop: rs(4),
      padding: rs(2),
    },
    togglesCard: {
      marginTop: rs(16),
    },
  });

  const toggles = [
    {
      key: 'keepAwake',
      label: t('accessibility.keepAwake'),
      value: keepAwakeEnabled,
      onChange: setKeepAwakeEnabled,
    },
    {
      key: 'clockwise',
      label: t('accessibility.rotationDirection'),
      value: clockwise,
      onChange: setClockwise,
    },
    {
      key: 'activityEmoji',
      label: t('settings.options.activityEmoji'),
      value: showActivityEmoji,
      onChange: setShowActivityEmoji,
    },
  ];

  return (
    <View style={styles.asideContainer}>
      {currentActivity && (
        <View style={styles.labelOverlay}>
          <MessageZone
            timerState={timerState}
            label={currentActivity.label}
            displayMessage={displayMessage}
            isCompleted={isCompleted}
            flashActivity={flashActivity}
            isTimerRunning={isTimerRunning}
          />
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawer, drawerAnimatedStyle, theme.shadow('xl')]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleIndicator, { backgroundColor: theme.colors.textSecondary }]} />
          </View>

          {/* SCR-10 : 4 blocs */}
          <Animated.View style={[styles.content, contentAnimatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              scrollEnabled={isOpen}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Bloc 1 : segmenté Mode — structure seule au Lot 1 (non fonctionnel) */}
              <View style={styles.segmentedControl}>
                {MODE_LABELS.map((label, index) => (
                  <View
                    key={label}
                    style={[styles.segmentButton, index === 0 && styles.segmentButtonActive]}
                  >
                    <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Bloc 2 : 3 toggles */}
              <View style={styles.togglesCard}>
                {toggles.map((toggle, index) => (
                  <View
                    key={toggle.key}
                    style={[styles.optionRow, index === toggles.length - 1 && styles.optionRowLast]}
                  >
                    <Text style={styles.optionLabel}>{toggle.label}</Text>
                    <Switch
                      accessible={true}
                      accessibilityLabel={toggle.label}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: toggle.value }}
                      value={toggle.value}
                      onValueChange={(value) => {
                        haptics.switchToggle().catch(() => {});
                        toggle.onChange(value);
                      }}
                      {...theme.styles.switch(toggle.value)}
                    />
                  </View>
                ))}
              </View>

              {/* Bloc 3 : Mes rituels */}
              <Text style={styles.sectionLabel}>{RITUALS_LABEL}</Text>
              <ActivityCarousel ref={activityCarouselRef} isRunning={isTimerRunning} />

              {/* Bloc 4 : Palettes */}
              <Text style={styles.sectionLabel}>{PALETTES_LABEL}</Text>
              <PaletteCarousel ref={paletteCarouselRef} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

