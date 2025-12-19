/**
 * @fileoverview DurationPresets - 4 boutons presets durée (ADR-004 révisé)
 * @description Presets de durée [5][15][30][60] minutes
 * @created 2025-12-19
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const PRESETS = [5, 15, 30, 60]; // minutes

/**
 * DurationPresets - 4 presets de durée
 *
 * @param {number} currentDuration - Durée actuelle en secondes
 * @param {function} onSelectDuration - Callback avec (durationSeconds)
 * @param {boolean} compact - Mode compact
 */
const DurationPresets = React.memo(function DurationPresets({
  currentDuration,
  onSelectDuration,
  compact = false,
}) {
  const theme = useTheme();

  // Convert current duration to minutes for comparison
  const currentMinutes = Math.round(currentDuration / 60);

  const handlePresetPress = (minutes) => {
    const durationSeconds = minutes * 60;
    onSelectDuration(durationSeconds);
    haptics.selection();
  };

  // Sizes
  const buttonMinWidth = compact ? rs(36) : rs(44);
  const paddingH = compact ? rs(8) : rs(12);
  const paddingV = compact ? rs(6) : rs(8);
  const fontSize = compact ? rs(13) : rs(15);
  const gap = compact ? rs(6) : rs(8);

  const styles = StyleSheet.create({
    activeButton: {
      backgroundColor: theme.colors.brand.primary + '15',
      borderColor: theme.colors.brand.primary,
    },
    activeText: {
      color: theme.colors.brand.primary,
      fontWeight: '700',
    },
    container: {
      flexDirection: 'row',
      gap: gap,
      justifyContent: 'center',
    },
    presetButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: rs(8),
      borderWidth: 1.5,
      justifyContent: 'center',
      minWidth: buttonMinWidth,
      paddingHorizontal: paddingH,
      paddingVertical: paddingV,
    },
    presetText: {
      color: theme.colors.textSecondary,
      fontSize: fontSize,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {PRESETS.map((minutes) => {
        const isActive = currentMinutes === minutes;
        return (
          <TouchableOpacity
            key={minutes}
            style={[styles.presetButton, isActive && styles.activeButton]}
            onPress={() => handlePresetPress(minutes)}
            activeOpacity={0.7}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${minutes} minutes`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.presetText, isActive && styles.activeText]}>
              {minutes}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

DurationPresets.displayName = 'DurationPresets';
DurationPresets.propTypes = {
  compact: PropTypes.bool,
  currentDuration: PropTypes.number.isRequired,
  onSelectDuration: PropTypes.func.isRequired,
};

export default DurationPresets;
