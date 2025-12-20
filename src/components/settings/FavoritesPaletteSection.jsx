/**
 * @fileoverview FavoritesPaletteSection - Palette favorites (max 4)
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { PalettePreview } from '../pickers';
import { TIMER_PALETTES } from '../../config/timer-palettes';
import SettingsCard from './SettingsCard';
import { CardTitle } from './CardTitle';

/**
 * FavoritesPaletteSection - Toggle favorite palettes (max 4)
 *
 * @param {Array} favoritePalettes - List of favorite palette names
 * @param {Function} toggleFavoritePalette - Callback to toggle favorite
 * @param {boolean} isPremiumUser - Whether user is premium
 * @param {Function} setShowMoreColorsModal - Show premium palettes modal
 */
function FavoritesPaletteSection({
  favoritePalettes,
  toggleFavoritePalette,
  isPremiumUser,
  setShowMoreColorsModal,
}) {
  const theme = useTheme();
  const allPaletteNames = Object.keys(TIMER_PALETTES);

  const availablePalettes = isPremiumUser
    ? allPaletteNames
    : allPaletteNames.filter((name) => !TIMER_PALETTES[name].isPremium);

  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs(12),        // Responsive (was theme.spacing.sm)
      marginTop: rs(12),  // Responsive (was theme.spacing.sm)
    },
    itemWrapper: {
      width: '48%', // 2 items per row
    },
    item: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      padding: rs(12),  // Responsive (was theme.spacing.sm)
      ...theme.shadow('sm'),
    },
    itemActive: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.brand.accent,
      borderWidth: 2,
      ...theme.shadow('md'),
    },
    itemDisabled: {
      opacity: 0.5,
    },
    label: {
      color: theme.colors.text,
      fontSize: rs(10, 'min'),
      fontWeight: fontWeights.medium,
      marginTop: rs(4),  // Responsive (was theme.spacing.xs / 2)
      textAlign: 'center',
    },
    labelActive: {
      color: theme.colors.brand.accent, // Selection = accent (orange)
      fontWeight: fontWeights.semibold,
    },
    discoverButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      justifyContent: 'center',
      minHeight: 80,
      padding: rs(12),  // Responsive (was theme.spacing.sm)
      ...theme.shadow('sm'),
    },
    discoverIcon: {
      color: theme.colors.brand.primary,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(4),  // Responsive (was theme.spacing.xs / 2)
    },
    discoverText: {
      color: theme.colors.brand.primary,
      fontSize: rs(10, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
  });

  return (
    <SettingsCard
      title={<CardTitle Icon={Heart} label="Palettes favorites" theme={theme} />}
      description={`Sélectionnez jusqu'à 4 palettes favorites (${favoritePalettes.length}/4)`}
    >
      <View style={styles.grid}>
        {availablePalettes.map((paletteName) => {
          const isFavorite = favoritePalettes.includes(paletteName);
          const canToggle = isFavorite || favoritePalettes.length < 4;
          const paletteInfo = TIMER_PALETTES[paletteName];

          return (
            <View key={paletteName} style={styles.itemWrapper}>
              <TouchableOpacity
                style={[
                  styles.item,
                  isFavorite && styles.itemActive,
                  !canToggle && styles.itemDisabled,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  if (canToggle) toggleFavoritePalette(paletteName);
                }}
                disabled={!canToggle}
                activeOpacity={canToggle ? 0.7 : 1}
              >
                <PalettePreview paletteName={paletteName} />
                <Text
                  style={[
                    styles.label,
                    isFavorite && styles.labelActive,
                  ]}
                >
                  {paletteInfo?.name || paletteName}
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
                setShowMoreColorsModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.discoverIcon}>+</Text>
              <Text style={styles.discoverText}>Plus de palettes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SettingsCard>
  );
}

FavoritesPaletteSection.propTypes = {
  favoritePalettes: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavoritePalette: PropTypes.func.isRequired,
  isPremiumUser: PropTypes.bool.isRequired,
  setShowMoreColorsModal: PropTypes.func.isRequired,
};

export default FavoritesPaletteSection;
