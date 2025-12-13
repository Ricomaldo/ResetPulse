// src/screens/onboarding/filters/Filter2Creation.jsx
// Filtre 2 : Création du premier moment (activité, durée, palette)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import TimerDial from '../../../components/timer/TimerDial';
import { TIMER_PALETTES, getFreePalettes } from '../../../config/timerPalettes';
import {
  rs,
  FREE_ACTIVITIES,
  DURATION_OPTIONS,
  getSmartDefaults,
} from '../onboardingConstants';

export default function Filter2Creation({ needs, onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const freePalettes = getFreePalettes();
  const defaults = getSmartDefaults(needs, freePalettes);

  const [selectedActivity, setSelectedActivity] = useState(FREE_ACTIVITIES[2]); // meditation
  const [duration, setDuration] = useState(defaults.duration);
  const [palette, setPalette] = useState(defaults.palette);
  const [colorIndex, setColorIndex] = useState(defaults.colorIndex);

  const currentPalette = TIMER_PALETTES[palette];
  const currentColors = currentPalette?.colors || TIMER_PALETTES.sérénité.colors;
  const currentColor = currentColors[colorIndex];

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setDuration(activity.defaultDuration);
    Vibration.vibrate(10);
  };

  const handleContinue = () => {
    const config = {
      activity: selectedActivity,
      duration,
      palette,
      colorIndex,
      color: currentColor,
    };
    onContinue(config);
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{t('onboarding.v2.filter2.title')}</Text>

        {/* Preview avec TimerDial réel */}
        <View style={styles.previewContainer}>
          <TimerDial
            progress={1}
            duration={duration * 60}
            color={currentColor}
            size={rs(150)}
            scaleMode={duration > 25 ? '60min' : '25min'}
            activityEmoji={selectedActivity.emoji}
            isRunning={false}
            shouldPulse={false}
            showGraduations={false}
            showNumbers={false}
          />
        </View>

        {/* Activité */}
        <Text style={styles.sectionLabel}>{t('onboarding.v2.filter2.activity')}</Text>
        <View style={styles.activityRow}>
          {FREE_ACTIVITIES.map((activity) => {
            const isSelected = selectedActivity.id === activity.id;
            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityPill,
                  isSelected && [
                    styles.activityPillSelected,
                    { backgroundColor: currentColor },
                  ],
                ]}
                onPress={() => handleActivitySelect(activity)}
                activeOpacity={0.7}
              >
                <Text style={styles.activityPillEmoji}>{activity.emoji}</Text>
                <Text
                  style={[
                    styles.activityPillLabel,
                    isSelected && styles.activityPillLabelSelected,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Durée */}
        <Text style={styles.sectionLabel}>{t('onboarding.v2.filter2.duration')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {DURATION_OPTIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.durationChip,
                duration === d && styles.durationChipSelected,
              ]}
              onPress={() => setDuration(d)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === d && styles.durationTextSelected,
                ]}
              >
                {d} {t('onboarding.v2.filter2.minutes')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Palette */}
        <Text style={styles.sectionLabel}>{t('onboarding.v2.filter2.palette')}</Text>
        <View style={styles.paletteRow}>
          {freePalettes.map((key) => {
            const pal = TIMER_PALETTES[key];
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.paletteButton,
                  palette === key && styles.paletteSelected,
                ]}
                onPress={() => {
                  setPalette(key);
                  setColorIndex(0);
                }}
              >
                <View style={styles.palettePreview}>
                  {pal.colors.map((c, i) => (
                    <View
                      key={i}
                      style={[styles.paletteDot, { backgroundColor: c }]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.paletteName,
                    palette === key && styles.paletteNameSelected,
                  ]}
                >
                  {pal.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Couleur */}
        <Text style={styles.sectionLabel}>{t('onboarding.v2.filter2.color')}</Text>
        <View style={styles.colorRow}>
          {currentColors.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                colorIndex === i && styles.colorDotSelected,
              ]}
              onPress={() => setColorIndex(i)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{t('onboarding.v2.filter2.cta')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(spacing.lg),
      paddingTop: rs(spacing.md),
      paddingBottom: rs(100),
    },
    title: {
      fontSize: rs(24),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.md),
    },
    sectionLabel: {
      fontSize: rs(13),
      color: colors.textSecondary,
      marginTop: rs(spacing.md),
      marginBottom: rs(spacing.sm),
      fontWeight: '500',
    },
    previewContainer: {
      alignItems: 'center',
      marginBottom: rs(spacing.sm),
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: rs(spacing.md),
      gap: rs(spacing.sm),
    },
    activityPill: {
      flex: 1,
      width: rs(70),
      height: rs(70),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rs(50),
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    activityPillSelected: {
      borderColor: 'transparent',
    },
    activityPillEmoji: {
      fontSize: rs(22),
      marginBottom: rs(2),
    },
    activityPillLabel: {
      fontSize: rs(9),
      color: colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    activityPillLabelSelected: {
      color: colors.background,
      fontWeight: '600',
    },
    horizontalScroll: {
      marginBottom: rs(spacing.sm),
    },
    durationChip: {
      paddingHorizontal: rs(spacing.lg),
      paddingVertical: rs(spacing.md),
      borderRadius: borderRadius.xxl,
      backgroundColor: colors.surface,
      marginRight: rs(spacing.sm),
    },
    durationChipSelected: {
      backgroundColor: colors.brand.primary,
    },
    durationText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: '500',
    },
    durationTextSelected: {
      color: colors.background,
      fontWeight: '600',
    },
    paletteRow: {
      flexDirection: 'row',
      gap: rs(spacing.md),
    },
    paletteButton: {
      flex: 1,
      padding: rs(spacing.md),
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    paletteSelected: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.surfaceElevated,
    },
    palettePreview: {
      flexDirection: 'row',
      gap: rs(spacing.xs),
      marginBottom: rs(spacing.sm),
    },
    paletteDot: {
      width: rs(16),
      height: rs(16),
      borderRadius: rs(8),
    },
    paletteName: {
      color: colors.textSecondary,
      fontSize: rs(13),
    },
    paletteNameSelected: {
      color: colors.text,
      fontWeight: '600',
    },
    colorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: rs(spacing.lg),
    },
    colorDot: {
      width: rs(52),
      height: rs(52),
      borderRadius: rs(26),
    },
    colorDotSelected: {
      borderWidth: 4,
      borderColor: colors.text,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: rs(spacing.lg),
      paddingBottom: rs(40),
      backgroundColor: colors.background,
    },
    button: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minWidth: rs(200),
      minHeight: rs(56),
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: '600',
    },
  });
