/**
 * @fileoverview SettingsPanel - All application settings
 * @description Complete settings panel (extracted from Layer3Content for reusability)
 * @created 2025-12-19
 */
import React from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  Brain,
  Zap,
  Keyboard,
  Gauge,
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
import PresetPills from '../controls/PresetPills';
import SettingsCard from './SettingsCard';
import SelectionCard from './SelectionCard';
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
    timer: { clockwise, selectedSoundId },
    setClockwise,
    setSelectedSoundId,
    setScaleMode,
    interaction: { interactionProfile },
    setInteractionProfile,
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

  // Interaction profiles (personas)
  const interactionProfiles = [
    {
      id: 'impulsif',
      emoji: '🚀',
      label: 'Impulsif',
      description: 'Je démarre vite, j\'ai besoin de freiner',
    },
    {
      id: 'abandonniste',
      emoji: '🏃',
      label: 'Abandonniste',
      description: 'J\'ai du mal à tenir jusqu\'au bout',
    },
    {
      id: 'ritualiste',
      emoji: '🎯',
      label: 'Ritualiste',
      description: 'J\'aime les actions délibérées',
    },
    {
      id: 'veloce',
      emoji: '⚡',
      label: 'Véloce',
      description: 'Je sais ce que je veux',
    },
  ];

  // Favorite tools modes (mapped from TimerConfigContext values)
  const favoriteTools = [
    {
      id: 'colors',
      emoji: '🎨',
      label: 'Créatif',
      description: 'Carrousel couleurs',
    },
    {
      id: 'none',
      emoji: '☯',
      label: 'Minimaliste',
      description: 'Rien (handle seul)',
    },
    {
      id: 'activities',
      emoji: '🔄',
      label: 'Multi-tâches',
      description: 'Carrousel activités',
    },
    {
      id: 'combo',
      emoji: '⏱',
      label: 'Rationnel',
      description: 'ControlBar (durée + run)',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    grid2x2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs(12),          // Responsive (was theme.spacing.sm)
      marginTop: rs(12),    // Responsive (was theme.spacing.sm)
    },
    gridItem2x2: {
      width: '48%', // ~50% minus gap
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
        {/* Group 1: TOI (You) */}
        <SectionHeader label="TOI" />

        {/* Section 1: Interaction Profile (Comment tu fonctionnes) */}
        <SettingsCard title={<CardTitle Icon={Brain} label="Comment tu fonctionnes" theme={theme} />}>
          <View style={styles.grid2x2}>
            {interactionProfiles.map((profile) => (
              <View key={profile.id} style={styles.gridItem2x2}>
                <SelectionCard
                  emoji={profile.emoji}
                  label={profile.label}
                  description={profile.description}
                  selected={interactionProfile === profile.id}
                  onSelect={() => setInteractionProfile(profile.id)}
                  compact
                />
              </View>
            ))}
          </View>
        </SettingsCard>

        {/* Section 2: Favorite Tool (Ton raccourci préféré) */}
        <SettingsCard title={<CardTitle Icon={Keyboard} label="Ton raccourci préféré" theme={theme} />}>
          <View style={styles.grid2x2}>
            {favoriteTools.map((tool) => (
              <View key={tool.id} style={styles.gridItem2x2}>
                <SelectionCard
                  emoji={tool.emoji}
                  label={tool.label}
                  description={tool.description}
                  selected={favoriteToolMode === tool.id}
                  onSelect={() => setFavoriteToolMode(tool.id)}
                  compact
                />
              </View>
            ))}
          </View>
        </SettingsCard>

        {/* Group 2: TES FAVORIS (Your Favorites) - Premium only */}
        {isPremiumUser && <SectionHeader label="TES FAVORIS" />}

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

        {/* Group 3: TIMER */}
        <SectionHeader label="TIMER" />

        {/* Dial Scale Presets (top) */}
        <SettingsCard title={<CardTitle Icon={Gauge} label="Échelle du cadran" theme={theme} />}>
          <PresetPills
            compact
            onSelectPreset={({ newScaleMode }) => {
              haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
              setScaleMode(newScaleMode);
            }}
          />
        </SettingsCard>

        {/* 1. Timer Options Section */}
        <SettingsCard title={<CardTitle Icon={Clock} label="Options du timer" theme={theme} />}>
          {/* Emoji activité au centre */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>Emoji activité au centre</Text>
              <Text style={styles.optionDescription}>
                {showActivityEmoji
                  ? "L'emoji s'affiche au centre du cadran"
                  : "L'emoji est masqué"}
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
        </SettingsCard>

        {/* 2. Keep Awake Section */}
        <SettingsCard title={<CardTitle Icon={Eye} label="Keep Awake" theme={theme} />}>
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
        </SettingsCard>

        {/* Group 4: AMBIANCE */}
        <SectionHeader label="AMBIANCE" />

        {/* 3. Rotation Direction Section */}
        <SettingsCard title={<CardTitle Icon={RotateCw} label="Sens de rotation" theme={theme} />}>
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
        </SettingsCard>

        {/* 4. Sound Section */}
        <SettingsCard
          title={<CardTitle Icon={Volume2} label="Son de notification" theme={theme} />}
          description={t('settings.timer.soundDescription')}
        >
          <SoundPicker
            selectedSoundId={selectedSoundId}
            onSoundSelect={setSelectedSoundId}
          />
        </SettingsCard>

        {/* 5. Theme Section */}
        <SettingsCard title={<CardTitle Icon={Palette} label="Thème" theme={theme} />}>

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
        </SettingsCard>

        {/* Group 5: INFO */}
        <SectionHeader label="INFO" />

        {/* About Section */}
        <AboutSection
          resetOnboarding={resetOnboarding}
          onClose={onClose}
        />
      </BottomSheetScrollView>
    </View>
  );
}
