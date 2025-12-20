/**
 * @fileoverview FavoritesActivitySection - Activity favorites (max 4)
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { getAllActivities } from '../../config/activities';
import SettingsCard from './SettingsCard';

/**
 * FavoritesActivitySection - Toggle favorite activities (max 4)
 *
 * @param {Array} favoriteActivities - List of favorite activity IDs
 * @param {Function} toggleFavoriteActivity - Callback to toggle favorite
 * @param {boolean} isPremiumUser - Whether user is premium
 * @param {Function} setShowMoreActivitiesModal - Show premium activities modal
 */
function FavoritesActivitySection({
  favoriteActivities,
  toggleFavoriteActivity,
  isPremiumUser,
  setShowMoreActivitiesModal,
}) {
  const theme = useTheme();
  const allActivities = getAllActivities();

  const availableActivities = isPremiumUser
    ? allActivities
    : allActivities.filter((activity) => !activity.isPremium);

  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs(12),        // Responsive (was theme.spacing.sm)
      marginTop: rs(12),  // Responsive (was theme.spacing.sm)
    },
    itemWrapper: {
      width: '23%', // 4 items per row
    },
    item: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: theme.colors.background, // Cards use background (not surface)
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      justifyContent: 'center',
      padding: rs(8),  // Responsive (was theme.spacing.xs)
      ...theme.shadow('sm'),
    },
    itemActive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.brand.accent, // Selection = accent (orange)
      borderWidth: 2,
      ...theme.shadow('md'),
    },
    itemDisabled: {
      opacity: 0.5,
    },
    emoji: {
      fontSize: rs(18, 'min'),
      marginBottom: rs(2),  // Responsive (was theme.spacing.xs / 4)
    },
    label: {
      color: theme.colors.text,
      fontSize: rs(8, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    labelActive: {
      color: theme.colors.brand.accent, // Selection = accent (orange)
      fontWeight: fontWeights.semibold,
    },
    discoverButton: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: theme.colors.background, // Cards use background (not surface)
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      justifyContent: 'center',
      padding: rs(12),  // Responsive (was theme.spacing.sm)
      ...theme.shadow('sm'),
    },
    discoverIcon: {
      color: theme.colors.brand.primary,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(2),  // Responsive (was theme.spacing.xs / 4)
    },
    discoverText: {
      color: theme.colors.brand.primary,
      fontSize: rs(7, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    countLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.medium,
      marginBottom: rs(12),  // Responsive (was theme.spacing.sm)
    },
  });

  return (
    <SettingsCard
      title="⭐ Activités favorites"
      description={`Sélectionnez jusqu'à 4 activités favorites (${favoriteActivities.length}/4)`}
    >
      <View style={styles.grid}>
        {availableActivities.map((activity) => {
          const isFavorite = favoriteActivities.includes(activity.id);
          const canToggle = isFavorite || favoriteActivities.length < 4;

          return (
            <View key={activity.id} style={styles.itemWrapper}>
              <TouchableOpacity
                style={[
                  styles.item,
                  isFavorite && styles.itemActive,
                  !canToggle && styles.itemDisabled,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  if (canToggle) toggleFavoriteActivity(activity.id);
                }}
                disabled={!canToggle}
                activeOpacity={canToggle ? 0.7 : 1}
              >
                <Text style={styles.emoji}>{activity.emoji}</Text>
                <Text
                  style={[
                    styles.label,
                    isFavorite && styles.labelActive,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Discovery button for free users */}
        {!isPremiumUser && (
          <View style={styles.itemWrapper}>
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => {
                haptics.selection().catch(() => {});
                setShowMoreActivitiesModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.discoverIcon}>+</Text>
              <Text style={styles.discoverText}>Plus</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SettingsCard>
  );
}

FavoritesActivitySection.propTypes = {
  favoriteActivities: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavoriteActivity: PropTypes.func.isRequired,
  isPremiumUser: PropTypes.bool.isRequired,
  setShowMoreActivitiesModal: PropTypes.func.isRequired,
};

export default FavoritesActivitySection;
