// src/components/modals/settings/SettingsAppearanceSection.jsx
import React from 'react';
import { View, Text, Switch, TouchableOpacity, Platform, TouchableNativeFeedback } from 'react-native';
import { PalettePreview } from '../../pickers';
import { TIMER_PALETTES, isPalettePremium } from '../../../config/timer-palettes';
import haptics from '../../../utils/haptics';

/**
 * Settings section for appearance customization:
 * - Theme selection (light/dark/auto)
 * - Palette visibility toggle + palette grid with discovery button
 * - Activities visibility toggle + favorites grid with discovery button
 */
export default function SettingsAppearanceSection({
  // Theme
  theme,
  // Palette
  currentPalette,
  setPalette,
  showPalettes,
  setShowPalettes,
  // Activities
  showActivities,
  setShowActivities,
  favoriteActivities,
  toggleFavorite,
  allActivities,
  setCurrentActivity,
  // Premium
  isPremiumUser,
  // Modals
  setShowMoreColorsModal,
  setShowMoreActivitiesModal,
  // i18n
  t,
  // Styles
  styles,
  // Platform touchable
  Touchable,
  touchableProps,
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{t('settings.appearance.title')}</Text>

      {/* Thème */}
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

      {/* Palettes de couleurs */}
      <View style={[styles.optionRow, { marginTop: theme.spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.appearance.showPalettes')}</Text>
          <Text style={styles.optionDescription}>
            {showPalettes
              ? t('settings.appearance.showPalettesDescriptionOn')
              : t('settings.appearance.showPalettesDescriptionOff')}
          </Text>
        </View>
        <Switch
          accessible={true}
          accessibilityLabel={t('accessibility.showPalettes')}
          accessibilityRole="switch"
          accessibilityState={{ checked: showPalettes }}
          value={showPalettes}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setShowPalettes(value);
          }}
          {...theme.styles.switch(showPalettes)}
        />
      </View>

      {showPalettes && (
        <>
          <Text style={[styles.optionDescription, { marginTop: theme.spacing.sm }]}>
            {t('settings.appearance.palettesDescription')}
          </Text>
          <View style={styles.paletteGrid}>
            {/* Show only free palettes if user is not premium */}
            {Object.keys(TIMER_PALETTES)
              .filter(paletteName => isPremiumUser || !isPalettePremium(paletteName))
              .map((paletteName) => {
                const isActive = currentPalette === paletteName;
                const paletteInfo = TIMER_PALETTES[paletteName];

                return (
                  <TouchableOpacity
                    key={paletteName}
                    style={[
                      styles.paletteItem,
                      isActive && styles.paletteItemActive,
                    ]}
                    onPress={() => setPalette(paletteName)}
                    activeOpacity={0.7}
                  >
                    <PalettePreview paletteName={paletteName} />
                    <Text
                      style={[
                        styles.paletteName,
                        isActive && styles.paletteNameActive,
                      ]}
                    >
                      {paletteInfo?.name || paletteName}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            {/* Discovery button for free users */}
            {!isPremiumUser && (
              <TouchableOpacity
                style={styles.discoverButton}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  setShowMoreColorsModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.discoverIconContainer}>
                  <Text style={styles.discoverIcon}>+</Text>
                </View>
                <Text style={styles.discoverText}>Plus de{'\n'}palettes</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Activités favorites */}
      <View style={[styles.optionRow, { marginTop: theme.spacing.md, borderBottomWidth: 0 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.appearance.showActivities')}</Text>
          <Text style={styles.optionDescription}>
            {showActivities
              ? t('settings.appearance.showActivitiesDescriptionOn')
              : t('settings.appearance.showActivitiesDescriptionOff')}
          </Text>
        </View>
        <Switch
          accessible={true}
          accessibilityLabel={t('accessibility.showActivities')}
          accessibilityRole="switch"
          accessibilityState={{ checked: showActivities }}
          value={showActivities}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setShowActivities(value);

            // Si on masque les activités, remettre à "none" (Basique)
            if (!value) {
              const noneActivity = allActivities.find(
                (activity) => activity.id === 'none'
              );
              if (noneActivity) {
                setCurrentActivity(noneActivity);
              }
            }
          }}
          {...theme.styles.switch(showActivities)}
        />
      </View>

      {showActivities && (
        <>
          <Text style={[styles.optionDescription, { marginTop: theme.spacing.sm }]}>
            {t('settings.appearance.activitiesDescription')}
          </Text>
          <View style={styles.favoritesGrid}>
            {/* Show only free activities if user is not premium */}
            {allActivities
              .filter(activity => isPremiumUser || !activity.isPremium)
              .map((activity) => {
                const isFavorite = favoriteActivities.includes(
                  activity.id
                );
                return (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.activityItem,
                      isFavorite && styles.activityItemFavorite,
                    ]}
                    onPress={() => toggleFavorite(activity.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activityEmoji}>
                      {activity.id === 'none' ? '⏱️' : activity.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.activityItemLabel,
                        isFavorite && styles.activityItemLabelFavorite,
                      ]}
                    >
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            {/* Discovery button for free users */}
            {!isPremiumUser && (
              <TouchableOpacity
                style={styles.discoverActivityButton}
                onPress={() => {
                  haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                  setShowMoreActivitiesModal(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.discoverActivityIcon}>+</Text>
                <Text style={styles.discoverActivityText}>Plus{'\n'}d'activités</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}
