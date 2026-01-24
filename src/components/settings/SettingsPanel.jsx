/**
 * @fileoverview SettingsPanel - All application settings
 * @description Complete settings panel (extracted from Layer3Content for reusability)
 * @created 2025-12-19
 */
import React from 'react';
import { View, Text, StyleSheet, Switch, Platform, Alert } from 'react-native';
import { BottomSheetScrollView, TouchableOpacity } from '@gorhom/bottom-sheet';
import {
  Zap,
  Keyboard,
  Clock,
  Eye,
  RotateCw,
  Volume2,
  Palette,
  Info,
  Star,
  Heart,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import { SoundPicker } from '../pickers';
import SettingsCard from './SettingsCard';
import SectionHeader from './SectionHeader';
import { CardTitle } from './CardTitle';
import FavoritesActivitySection from './FavoritesActivitySection';
import FavoritesPaletteSection from './FavoritesPaletteSection';
import AboutSection from './AboutSection';

/**
 * SettingsPanel - All settings sections (scrollable)
 *
 * @param {Function} onClose - Callback when closing settings (optional)
 * @param {Function} resetOnboarding - Callback to reset onboarding (optional)
 * @param {boolean} isPremiumUser - Whether user is premium (optional, defaults to false)
 */
export default function SettingsPanel({ onClose = () => {}, resetOnboarding = () => {}, isPremiumUser = false }) {
  const theme = useTheme();
  const t = useTranslation();
  const [showMoreActivitiesModal, setShowMoreActivitiesModal] = React.useState(false);
  const [showMoreColorsModal, setShowMoreColorsModal] = React.useState(false);
  const {
    display: { shouldPulse, showActivityEmoji },
    setShouldPulse,
    setShowActivityEmoji,
    system: { keepAwakeEnabled },
    setKeepAwakeEnabled,
    timer: { clockwise, selectedSoundId, scaleMode },
    setClockwise,
    setSelectedSoundId,
    setScaleMode,
    // interaction: { customStartLongPress, customStopLongPress }, // ❌ SUSPENDED ADR-012
    // setCustomInteraction, // ❌ SUSPENDED ADR-012
    favorites: { favoriteActivities, favoritePalettes },
    setFavoriteActivities,
    toggleFavoritePalette,
    layout: { favoriteToolMode },
    setFavoriteToolMode,
  } = useTimerConfig();

  // Helper to toggle favorite activity
  const toggleFavoriteActivity = (activityId) => {
    const current = favoriteActivities || [];
    const isFavorite = current.includes(activityId);
    const updated = isFavorite
      ? current.filter((id) => id !== activityId)
      : [...current, activityId];
    setFavoriteActivities(updated);
  };

  // Favorite tools modes - 3 options mutuellement exclusives
  const favoriteTools = [
    {
      id: 'activities',
      label: t('settings.tool.multitask.label'),
      description: t('settings.tool.multitask.description'),
    },
    {
      id: 'colors',
      label: t('settings.tool.creative.label'),
      description: t('settings.tool.creative.description'),
    },
    {
      id: 'commands',
      label: t('settings.tool.precision.label'),
      description: t('settings.tool.precision.description'),
    },
  ];

  // Handler pour toggles mutuellement exclusifs
  const handleToolToggle = (toolId) => {
    haptics.switchToggle().catch(() => {});
    // Si on active un tool, on le set. Si on désactive, impossible (un doit toujours être actif)
    if (favoriteToolMode !== toolId) {
      setFavoriteToolMode(toolId);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    optionLabel: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    optionDescription: {
      color: theme.colors.textSecondary,
      fontSize: rs(10, 'min'),           // Reduced from rs(11, 'min') for hierarchy
      lineHeight: rs(14, 'min'),         // Added for readability
      marginTop: rs(6),                  // Increased spacing
      opacity: 0.75,                     // Added opacity for visual recession
    },
    optionRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: rs(12),  // Responsive (was theme.spacing.sm)
    },
    scrollContent: {
      paddingBottom: rs(16),  // Responsive (was theme.spacing.md)
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      minWidth: 60,
      paddingHorizontal: rs(8),  // Responsive (was theme.spacing.xs)
      paddingVertical: rs(8),    // Responsive (was theme.spacing.xs)
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.brand.accent, // Selection = accent (orange)
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
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      flexDirection: 'row',
      padding: rs(2),  // Responsive
    },
  });

  return (
    <View style={styles.container}>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Group 1: CONFIGURATION */}
        <SectionHeader label={t('settings.sections.configuration')} />


        {/* Section 2: Timer Options */}
        <SettingsCard title={<CardTitle Icon={Clock} label={t('settings.sections.timerOptions')} theme={theme} />}>
          {/* Dial Scale (Range) */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1, marginBottom: rs(12) }}>
              <Text style={styles.optionLabel}>{t('settings.timer.dialScale')}</Text>
              <Text style={styles.optionDescription}>
                {t('settings.timer.dialScaleDescription')}
              </Text>
            </View>
          </View>
          <View style={[styles.segmentedControl, { marginBottom: rs(12) }]}>
            {['5min', '15min', '30min', '45min', '60min'].map((scale) => (
              <TouchableOpacity
                key={scale}
                style={[
                  styles.segmentButton,
                  scaleMode === scale && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  setScaleMode(scale);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${scale} scale`}
                accessibilityState={{ selected: scaleMode === scale }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    scaleMode === scale && styles.segmentTextActive,
                  ]}
                >
                  {scale.replace('min', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Emoji activité au centre */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.options.activityEmoji')}</Text>
              <Text style={styles.optionDescription}>
                {showActivityEmoji
                  ? t('settings.options.activityEmojiDescriptionOn')
                  : t('settings.options.activityEmojiDescriptionOff')}
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
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.options.pulseAnimation')}</Text>
              <Text style={styles.optionDescription}>
                {shouldPulse
                  ? t('settings.interface.pulseAnimationDescriptionOn')
                  : t('settings.interface.pulseAnimationDescriptionOff')}
              </Text>
            </View>
            <Switch
              value={shouldPulse}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => {});
                if (value) {
                  Alert.alert(
                    t('settings.interface.pulseWarningTitle'),
                    t('settings.interface.pulseWarningMessage'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('settings.interface.pulseWarningEnable'), onPress: () => setShouldPulse(true) }
                    ]
                  );
                } else {
                  setShouldPulse(false);
                }
              }}
              {...theme.styles.switch(shouldPulse)}
            />
          </View>

          {/* ❌ SUSPENDED in v2.1.6 - ADR-012
              Feature Long Tap instable, désactivée temporairement
              Voir _internal/docs/decisions/ADR-012-long-tap-suspension.md */}

          {/* Long Press Start - COMMENTED OUT
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.timer.longPressStart')}</Text>
              <Text style={styles.optionDescription}>
                {customStartLongPress
                  ? t('settings.timer.longPressStartDescriptionOn')
                  : t('settings.timer.longPressStartDescriptionOff')}
              </Text>
            </View>
            <Switch
              value={customStartLongPress}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => {});
                setCustomInteraction(value, customStopLongPress);
              }}
              {...theme.styles.switch(customStartLongPress)}
            />
          </View>
          */}

          {/* Long Press Stop - COMMENTED OUT
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.timer.longPressStop')}</Text>
              <Text style={styles.optionDescription}>
                {customStopLongPress
                  ? t('settings.timer.longPressStopDescriptionOn')
                  : t('settings.timer.longPressStopDescriptionOff')}
              </Text>
            </View>
            <Switch
              value={customStopLongPress}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => {});
                setCustomInteraction(customStartLongPress, value);
              }}
              {...theme.styles.switch(customStopLongPress)}
            />
          </View>
          */}
        </SettingsCard>

        {/* Section 3: Keep Awake */}
        <SettingsCard title={<CardTitle Icon={Eye} label={t('settings.sections.keepAwake')} theme={theme} />}>
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('accessibility.keepAwake')}</Text>
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
        </SettingsCard>

        {/* Section 4: Minimal Display Mode */}
        <SettingsCard title={<CardTitle Icon={Keyboard} label={t('settings.tool.sectionTitle')} theme={theme} />}>
          {favoriteTools.map((tool, index) => (
            <View
              key={tool.id}
              style={[
                styles.optionRow,
                index === favoriteTools.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{tool.label}</Text>
                <Text style={styles.optionDescription}>
                  {tool.description}
                </Text>
              </View>
              <Switch
                value={favoriteToolMode === tool.id}
                onValueChange={() => handleToolToggle(tool.id)}
                {...theme.styles.switch(favoriteToolMode === tool.id)}
              />
            </View>
          ))}
        </SettingsCard>

        {/* Group 2: TES FAVORIS (Your Favorites) - Premium only */}
        {isPremiumUser && <SectionHeader label={t('settings.sections.favorites')} />}

        {/* Section 3: Favorite Activities (Premium only) */}
        {isPremiumUser && (
          <FavoritesActivitySection
            favoriteActivities={favoriteActivities || []}
            toggleFavoriteActivity={toggleFavoriteActivity}
            isPremiumUser={isPremiumUser}
            setShowMoreActivitiesModal={setShowMoreActivitiesModal}
          />
        )}

        {/* Section 4: Favorite Palettes (Premium only) */}
        {isPremiumUser && (
          <FavoritesPaletteSection
            favoritePalettes={favoritePalettes || []}
            toggleFavoritePalette={toggleFavoritePalette}
            isPremiumUser={isPremiumUser}
            setShowMoreColorsModal={setShowMoreColorsModal}
          />
        )}

        {/* Group 3: AMBIANCE */}
        <SectionHeader label={t('settings.sections.ambiance')} />

        {/* 3. Rotation Direction Section */}
        <SettingsCard title={<CardTitle Icon={RotateCw} label={t('accessibility.rotationDirection')} theme={theme} />}>
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('accessibility.rotationDirection')}</Text>
              <Text style={styles.optionDescription}>
                {clockwise ? t('controls.rotation.clockwise') : t('controls.rotation.counterClockwise')}
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
        </SettingsCard>

        {/* 4. Sound Section */}
        <SettingsCard
          title={<CardTitle Icon={Volume2} label={t('settings.sections.notificationSound')} theme={theme} />}
          description={t('settings.timer.soundDescription')}
        >
          <SoundPicker
            selectedSoundId={selectedSoundId}
            onSoundSelect={setSelectedSoundId}
          />
        </SettingsCard>

        {/* 5. Theme Section */}
        <SettingsCard title={<CardTitle Icon={Palette} label={t('settings.sections.theme')} theme={theme} />}>

          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.sections.theme')}</Text>
              <Text style={styles.optionDescription}>
                {theme.mode === 'auto'
                  ? t('settings.appearance.themeDescriptionAuto')
                  : theme.mode === 'dark'
                    ? t('settings.appearance.themeDescriptionDark')
                    : t('settings.appearance.themeDescriptionLight')}
              </Text>
            </View>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  theme.mode === 'light' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('light');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'light' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeLight')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  theme.mode === 'dark' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('dark');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'dark' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeDark')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  theme.mode === 'auto' && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  theme.setTheme('auto');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme.mode === 'auto' && styles.segmentTextActive,
                  ]}
                >
                  {t('settings.appearance.themeAuto')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SettingsCard>

        {/* Group 5: INFO */}
        <SectionHeader label={t('settings.sections.info')} />

        {/* About Section */}
        <AboutSection
          resetOnboarding={resetOnboarding}
          onClose={onClose}
        />
      </BottomSheetScrollView>
    </View>
  );
}
