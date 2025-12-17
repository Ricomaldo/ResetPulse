// src/components/modals/settings/SettingsFavoritesSection.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { PalettePreview } from '../../pickers';
import { TIMER_PALETTES } from '../../../config/timer-palettes';
import haptics from '../../../utils/haptics';

/**
 * Settings section for favorites (activities + palettes, max 4 each)
 */
const SettingsFavoritesSection = React.memo(function SettingsFavoritesSection({
  // Activities
  favoriteActivities,
  toggleFavoriteActivity,
  allActivities,
  isPremiumUser,
  setShowMoreActivitiesModal,
  // Palettes
  favoritePalettes,
  toggleFavoritePalette,
  setShowMoreColorsModal,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
  // Platform touchable
  Touchable,
  touchableProps,
}) {
  const allPaletteNames = Object.keys(TIMER_PALETTES);
  const availablePalettes = isPremiumUser
    ? allPaletteNames
    : allPaletteNames.filter(name => !TIMER_PALETTES[name].isPremium);

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>⭐ Favoris</Text>
      <Text style={styles.optionDescription}>
        Sélectionnez jusqu&apos;à 4 activités et 4 couleurs favorites (affichées en premier)
      </Text>

      {/* Activités favorites */}
      <Text style={[styles.optionLabel, { marginTop: theme.spacing.md }]}>
        Activités favorites ({favoriteActivities.length}/4)
      </Text>
      <View style={styles.favoritesGrid}>
        {allActivities
          .filter(activity => isPremiumUser || !activity.isPremium)
          .map((activity) => {
            const isFavorite = favoriteActivities.includes(activity.id);
            const canToggle = isFavorite || favoriteActivities.length < 4;

            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  isFavorite && styles.activityItemFavorite,
                  !canToggle && styles.activityItemDisabled,
                ]}
                onPress={() => canToggle && toggleFavoriteActivity(activity.id)}
                activeOpacity={canToggle ? 0.7 : 1}
                disabled={!canToggle}
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
            <Text style={styles.discoverActivityText}>Plus{'\n'}d&apos;activités</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Palettes favorites */}
      <Text style={[styles.optionLabel, { marginTop: theme.spacing.lg }]}>
        Couleurs favorites ({favoritePalettes.length}/4)
      </Text>
      <View style={styles.paletteGrid}>
        {availablePalettes.map((paletteName) => {
          const isFavorite = favoritePalettes.includes(paletteName);
          const canToggle = isFavorite || favoritePalettes.length < 4;
          const paletteInfo = TIMER_PALETTES[paletteName];

          return (
            <TouchableOpacity
              key={paletteName}
              style={[
                styles.paletteItem,
                isFavorite && styles.paletteItemActive,
                !canToggle && styles.paletteItemDisabled,
              ]}
              onPress={() => canToggle && toggleFavoritePalette(paletteName)}
              activeOpacity={canToggle ? 0.7 : 1}
              disabled={!canToggle}
            >
              <PalettePreview paletteName={paletteName} />
              <Text
                style={[
                  styles.paletteName,
                  isFavorite && styles.paletteNameActive,
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
    </View>
  );
});

SettingsFavoritesSection.propTypes = {
  favoriteActivities: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavoriteActivity: PropTypes.func.isRequired,
  allActivities: PropTypes.arrayOf(PropTypes.object).isRequired,
  isPremiumUser: PropTypes.bool.isRequired,
  setShowMoreActivitiesModal: PropTypes.func.isRequired,
  favoritePalettes: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavoritePalette: PropTypes.func.isRequired,
  setShowMoreColorsModal: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
  Touchable: PropTypes.func.isRequired,
  touchableProps: PropTypes.object.isRequired,
};

export default SettingsFavoritesSection;
