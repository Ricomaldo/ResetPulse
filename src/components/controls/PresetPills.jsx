/**
 * @fileoverview PresetPills - Presets de durée du timer
 * @description Boutons pour sélectionner une durée prédéfinie
 * Les presets changent uniquement la durée (pas l'échelle du cadran)
 * @created 2025-12-19
 * @updated 2025-12-24 - Disabled auto-scale adaptation
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import IconButton from '../buttons/IconButton';

// Displayed presets in BottomSheet (curated selection)
const PRESETS = [
  { minutes: 5, label: '5' },
  { minutes: 15, label: '15' },
  { minutes: 25, label: '25' },
  { minutes: 30, label: '30' },
  { minutes: 45, label: '45' },
  { minutes: 60, label: '60' },
];

/**
 * PresetPills - Presets de durée du timer
 * Sélectionne une durée prédéfinie (sans changer l'échelle)
 *
 * @param {function} [onSelectPreset] - Callback optionnel appelé lors de la sélection
 * @param {boolean} [compact=false] - Mode compact
 */
const PresetPills = React.memo(function PresetPills({ onSelectPreset, compact = false }) {
  const theme = useTheme();
  const { timer: { currentDuration }, setCurrentDuration } = useTimerConfig();

  const handlePresetSelect = (preset) => {
    // Change duration only (scale mode stays unchanged)
    setCurrentDuration(preset.minutes * 60); // Convert to seconds

    // Notify parent of the change
    onSelectPreset?.({
      durationMinutes: preset.minutes,
      durationSeconds: preset.minutes * 60,
    });
  };

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
  });

  const renderPreset = (preset) => {
    // Button is active when its duration matches the current duration
    const isActive = currentDuration === preset.minutes * 60;

    return (
      <IconButton
        key={preset.minutes}
        label={preset.label}
        variant={isActive ? 'accent' : 'selection'} // Selection state: accent (active) / selection (inactive)
        size={compact ? 'small' : 'medium'}
        shape="rounded"
        active={isActive}
        onPress={() => handlePresetSelect(preset)}
        accessibilityLabel={`${preset.label} minutes`}
        accessibilityHint={`Définit la durée à ${preset.label} minutes`}
      />
    );
  };

  // Single row with all presets in ascending order (5, 25, 45, 60)
  return (
    <View style={styles.row}>
      {PRESETS.map(renderPreset)}
    </View>
  );
});

PresetPills.displayName = 'PresetPills';

PresetPills.propTypes = {
  compact: PropTypes.bool,
  onSelectPreset: PropTypes.func,
};

export default PresetPills;
