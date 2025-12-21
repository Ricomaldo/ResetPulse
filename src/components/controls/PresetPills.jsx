/**
 * @fileoverview PresetPills - Presets de durée du timer
 * @description Boutons pour sélectionner une durée prédéfinie et son scale associé
 * Chaque preset change à la fois la durée ET le scale du cadran
 * @created 2025-12-19
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import IconButton from '../buttons/IconButton';

// Displayed presets in BottomSheet (curated selection)
const PRESETS = [
  { minutes: 5, scaleMode: '5min', label: '5' },
  { minutes: 15, scaleMode: '15min', label: '15' },
  { minutes: 25, scaleMode: '25min', label: '25' },
  { minutes: 30, scaleMode: '30min', label: '30' },
  { minutes: 45, scaleMode: '45min', label: '45' },
  { minutes: 60, scaleMode: '60min', label: '60' },
];

/**
 * PresetPills - Presets de durée du timer
 * Sélectionne une durée prédéfinie et son scale associé
 *
 * @param {function} [onSelectPreset] - Callback optionnel appelé lors de la sélection
 * @param {boolean} [compact=false] - Mode compact
 */
const PresetPills = React.memo(function PresetPills({ onSelectPreset, compact = false }) {
  const theme = useTheme();
  const { timer: { scaleMode }, setScaleMode, setCurrentDuration } = useTimerConfig();

  const handlePresetSelect = (preset) => {
    // Change both duration and scale mode
    setCurrentDuration(preset.minutes * 60); // Convert to seconds
    setScaleMode(preset.scaleMode);

    // Notify parent of the change
    onSelectPreset?.({
      durationMinutes: preset.minutes,
      durationSeconds: preset.minutes * 60,
      newScaleMode: preset.scaleMode,
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
    // Button is active when its scale mode matches the current scale mode
    const isActive = scaleMode === preset.scaleMode;

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
        accessibilityHint={`Définit la durée à ${preset.label} minutes et adapte l'échelle du cadran`}
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
