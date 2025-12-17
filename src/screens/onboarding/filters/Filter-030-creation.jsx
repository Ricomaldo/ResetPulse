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
import TimerDial from '../../../components/dial/TimerDial';
import { TIMER_PALETTES, getFreePalettes } from '../../../config/timer-palettes';
import {
  rs,
  FREE_ACTIVITIES,
  DURATION_OPTIONS,
  getSmartDefaults,
} from '../onboardingConstants';
import { fontWeights } from '../../../theme/tokens';

export default function Filter030Creation({ needs, onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const freePalettes = getFreePalettes();
  const defaults = getSmartDefaults(needs, freePalettes);

  const [selectedActivity, setSelectedActivity] = useState(FREE_ACTIVITIES[2]); // meditation
  const [duration, setDuration] = useState(defaults.duration);
  const [palette, setPalette] = useState(defaults.palette);
  const [colorIndex, setColorIndex] = useState(defaults.colorIndex);

  const currentPalette = TIMER_PALETTES[palette];
  const currentColors = currentPalette?.colors || TIMER_PALETTES.serenity.colors;
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
    activityPill: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: rs(50),
      borderWidth: 2,
      flex: 1,
      height: rs(70),
      justifyContent: 'center',
      width: rs(70),
    },
    activityPillEmoji: {
      fontSize: rs(22),
      marginBottom: rs(2),
    },
    activityPillLabel: {
      color: colors.textSecondary,
      fontSize: rs(9),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    activityPillLabelSelected: {
      color: colors.background,
      fontWeight: fontWeights.semibold,
    },
    activityPillSelected: {
      borderColor: 'transparent',
    },
    activityRow: {
      flexDirection: 'row',
      gap: rs(spacing.sm),
      justifyContent: 'space-between',
      marginBottom: rs(spacing.md),
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      minHeight: rs(56),
      minWidth: rs(200),
      paddingHorizontal: rs(spacing.xl),
      paddingVertical: rs(spacing.md),
    },
    buttonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    colorDot: {
      borderRadius: rs(26),
      height: rs(52),
      width: rs(52),
    },
    colorDotSelected: {
      borderColor: colors.text,
      borderWidth: 4,
    },
    colorRow: {
      flexDirection: 'row',
      gap: rs(spacing.lg),
      justifyContent: 'center',
    },
    durationChip: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xxl,
      marginRight: rs(spacing.sm),
      paddingHorizontal: rs(spacing.lg),
      paddingVertical: rs(spacing.md),
    },
    durationChipSelected: {
      backgroundColor: colors.brand.primary,
    },
    durationText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
    },
    durationTextSelected: {
      color: colors.background,
      fontWeight: fontWeights.semibold,
    },
    footer: {
      backgroundColor: colors.background,
      bottom: 0,
      left: 0,
      padding: rs(spacing.lg),
      paddingBottom: rs(40),
      position: 'absolute',
      right: 0,
    },
    horizontalScroll: {
      marginBottom: rs(spacing.sm),
    },
    paletteButton: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      flex: 1,
      padding: rs(spacing.md),
    },
    paletteDot: {
      borderRadius: rs(8),
      height: rs(16),
      width: rs(16),
    },
    paletteName: {
      color: colors.textSecondary,
      fontSize: rs(13),
    },
    paletteNameSelected: {
      color: colors.text,
      fontWeight: fontWeights.semibold,
    },
    palettePreview: {
      flexDirection: 'row',
      gap: rs(spacing.xs),
      marginBottom: rs(spacing.sm),
    },
    paletteRow: {
      flexDirection: 'row',
      gap: rs(spacing.md),
    },
    paletteSelected: {
      backgroundColor: colors.surface,
      borderColor: colors.brand.primary,
    },
    previewContainer: {
      alignItems: 'center',
      marginBottom: rs(spacing.sm),
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rs(100),
      paddingHorizontal: rs(spacing.lg),
      paddingTop: rs(spacing.md),
    },
    scrollView: {
      flex: 1,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: rs(13),
      fontWeight: fontWeights.medium,
      marginBottom: rs(spacing.sm),
      marginTop: rs(spacing.md),
    },
    title: {
      color: colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.md),
      textAlign: 'center',
    },
  });
