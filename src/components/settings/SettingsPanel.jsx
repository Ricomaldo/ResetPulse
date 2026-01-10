/**
 * @fileoverview SettingsPanel - All application settings
 * @description Complete settings panel (extracted from Layer3Content for reusability)
 * @created 2025-12-19
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import { SoundPicker } from '../pickers';

/**
 * SettingsPanel - All settings sections (scrollable)
 */
export default function SettingsPanel() {
  const theme = useTheme();
  const t = useTranslation();
  const {
    shouldPulse,
    setShouldPulse,
    showActivityEmoji,
    setShowActivityEmoji,
    keepAwakeEnabled,
    setKeepAwakeEnabled,
    clockwise,
    setClockwise,
    selectedSoundId,
    setSelectedSoundId,
    favoriteToolMode,
    setFavoriteToolMode,
  } = useTimerConfig();

  // Platform-specific touchable component
  const Touchable =
    Platform.OS === 'android' &&
    TouchableNativeFeedback?.canUseNativeForeground?.()
      ? TouchableNativeFeedback
      : TouchableOpacity;

  const touchableProps =
    Platform.OS === 'android' && TouchableNativeFeedback?.Ripple
      ? {
        background: TouchableNativeFeedback.Ripple(
          theme.colors.brand.primary + '20',
          false
        ),
      }
      : {
        activeOpacity: 0.7,
      };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    favoriteToolGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    favoriteToolIcon: {
      fontSize: rs(24, 'min'),
      marginBottom: theme.spacing.xs / 2,
      textAlign: 'center',
    },
    favoriteToolItem: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.fixed.transparent,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      justifyContent: 'center',
      padding: theme.spacing.sm,
      width: '22%',
      ...theme.shadow('sm'),
    },
    favoriteToolItemActive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.brand.primary,
      ...theme.shadow('md'),
    },
    favoriteToolLabel: {
      color: theme.colors.textLight,
      fontSize: rs(9, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      width: '100%',
    },
    favoriteToolLabelActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },
    optionDescription: {
      color: theme.colors.textLight,
      fontSize: rs(11, 'min'),
      marginTop: theme.spacing.xs / 2,
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
      paddingVertical: theme.spacing.sm,
    },
    scrollContent: {
      paddingBottom: theme.spacing.md,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      ...theme.shadow('sm'),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      minWidth: 60,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.brand.primary,
    },
    segmentText: {
      color: theme.colors.text,
      fontSize: rs(11, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    segmentTextActive: {
      color: theme.colors.fixed.white,
    },
    segmentedControl: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      padding: 2,
    },
  });

  const favoriteTools = [
    { id: 'combo', icon: '🎛️', label: 'Combo' },
    { id: 'colors', icon: '🎨', label: 'Colors' },
    { id: 'activities', icon: '⚡', label: 'Activities' },
    { id: 'none', icon: '∅', label: 'None' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Favorite Tool Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⭐ Outil favori</Text>
          <Text style={styles.optionDescription}>
            Choisissez l&apos;outil qui s&apos;affiche au premier snap (15%)
          </Text>
          <View style={styles.favoriteToolGrid}>
            {favoriteTools.map((tool) => (
              <Touchable
                key={tool.id}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  setFavoriteToolMode(tool.id);
                }}
                {...touchableProps}
              >
                <View
                  style={[
                    styles.favoriteToolItem,
                    favoriteToolMode === tool.id && styles.favoriteToolItemActive,
                  ]}
                >
                  <Text style={styles.favoriteToolIcon}>{tool.icon}</Text>
                  <Text
                    style={[
                      styles.favoriteToolLabel,
                      favoriteToolMode === tool.id && styles.favoriteToolLabelActive,
                    ]}
                  >
                    {tool.label}
                  </Text>
                </View>
              </Touchable>
            ))}
          </View>
        </View>

        {/* 2. Timer Options Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⏱️ Options du timer</Text>

          {/* Emoji activité au centre */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>Emoji activité au centre</Text>
              <Text style={styles.optionDescription}>
                {showActivityEmoji
                  ? 'L&apos;emoji s&apos;affiche au centre du cadran'
                  : 'L&apos;emoji est masqué'}
              </Text>
            </View>
            <Switch
              value={showActivityEmoji}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setShowActivityEmoji(value);
              }}
              {...theme.styles.switch(showActivityEmoji)}
            />
          </View>

          {/* Animation Pulse */}
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>Animation pulse</Text>
              <Text style={styles.optionDescription}>
                {shouldPulse
                  ? t('settings.interface.pulseAnimationDescriptionOn')
                  : t('settings.interface.pulseAnimationDescriptionOff')}
              </Text>
            </View>
            <Switch
              value={shouldPulse}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setShouldPulse(value);
              }}
              {...theme.styles.switch(shouldPulse)}
            />
          </View>
        </View>

        {/* 3. Keep Awake Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>💡 Keep Awake</Text>

          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.timer.keepAwake')}</Text>
              <Text style={styles.optionDescription}>
                {keepAwakeEnabled
                  ? t('settings.timer.keepAwakeDescriptionOn')
                  : t('settings.timer.keepAwakeDescriptionOff')}
              </Text>
            </View>
            <Switch
              accessible={true}
              accessibilityLabel={t('accessibility.keepAwake')}
              accessibilityRole="switch"
              accessibilityState={{ checked: keepAwakeEnabled }}
              value={keepAwakeEnabled}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setKeepAwakeEnabled(value);
              }}
              {...theme.styles.switch(keepAwakeEnabled)}
            />
          </View>
        </View>

        {/* 4. Rotation Direction Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔄 Sens de rotation</Text>

          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.timer.rotationDirection')}</Text>
              <Text style={styles.optionDescription}>
                {clockwise ? t('settings.timer.rotationClockwise') : t('settings.timer.rotationCounterClockwise')}
              </Text>
            </View>
            <Switch
              accessible={true}
              accessibilityLabel={t('accessibility.rotationDirection')}
              accessibilityRole="switch"
              accessibilityState={{ checked: clockwise }}
              value={clockwise}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setClockwise(value);
              }}
              {...theme.styles.switch(clockwise)}
            />
          </View>
        </View>

        {/* 5. Sound Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔊 Son de notification</Text>
          <Text style={styles.optionDescription}>
            {t('settings.timer.soundDescription')}
          </Text>
          <SoundPicker
            selectedSoundId={selectedSoundId}
            onSoundSelect={setSelectedSoundId}
          />
        </View>

        {/* 6. Theme Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎨 Thème</Text>

          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.appearance.theme')}</Text>
              <Text style={styles.optionDescription}>
                {theme.mode === 'auto'
                  ? t('settings.appearance.themeDescriptionAuto')
                  : theme.mode === 'dark'
                    ? t('settings.appearance.themeDescriptionDark')
                    : t('settings.appearance.themeDescriptionLight')}
              </Text>
            </View>
            <View style={styles.segmentedControl}>
              <Touchable
                style={[
                  styles.segmentButton,
                  theme.mode === 'light' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('light');
                }}
                {...touchableProps}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'light' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeLight')}
                </Text>
              </Touchable>
              <Touchable
                style={[
                  styles.segmentButton,
                  theme.mode === 'dark' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('dark');
                }}
                {...touchableProps}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'dark' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeDark')}
                </Text>
              </Touchable>
              <Touchable
                style={[
                  styles.segmentButton,
                  theme.mode === 'auto' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('auto');
                }}
                {...touchableProps}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'auto' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeAuto')}
                </Text>
              </Touchable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
