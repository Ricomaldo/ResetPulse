/**
 * @fileoverview PresetPills - Presets de durée du timer
 * @description Boutons pour sélectionner une durée prédéfinie
 * Double tap: 1er tap = set duration, 2ème tap = adapt scale
 * @created 2025-12-19
 * @updated 2025-12-24 - Disabled auto-scale adaptation
 * @updated 2026-01-13 - Added contextual toast hint when scale is suboptimal
 * @updated 2026-01-15 - Replaced long press with double tap for scale adaptation
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import IconButton from '../buttons/IconButton';
import haptics from '../../utils/haptics';
import { getOptimalScale, scaleToMode, modeToScale } from '../../utils/scaleHelpers';

// Displayed presets in BottomSheet (aligned with 5 active scales)
const PRESETS = [
  { minutes: 5, label: '5' },
  { minutes: 15, label: '15' },
  { minutes: 30, label: '30' },
  { minutes: 45, label: '45' },
  { minutes: 60, label: '60' },
];

/**
 * PresetPills - Presets de durée du timer
 * Sélectionne une durée prédéfinie (sans changer l'échelle)
 * Shows contextual hint when scale doesn't match optimal for duration
 *
 * @param {function} [onSelectPreset] - Callback optionnel appelé lors de la sélection
 * @param {boolean} [compact=false] - Mode compact
 */
const PresetPills = React.memo(function PresetPills({ onSelectPreset, compact = false }) {
  const theme = useTheme();
  const t = useTranslation();
  const { timer: { currentDuration, scaleMode }, setCurrentDuration, setScaleMode } = useTimerConfig();

  // Double tap state
  const [doubleTapTarget, setDoubleTapTarget] = useState(null);
  const doubleTapTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
      }
    };
  }, []);

  // Handle preset tap: double tap system (1st tap = duration, 2nd tap = scale)
  const handlePresetPress = useCallback((preset) => {
    const currentScaleMinutes = modeToScale(scaleMode);
    const optimalScale = getOptimalScale(preset.minutes);

    // Check if this is a 2nd tap (double tap)
    if (doubleTapTarget === preset.minutes) {
      // Clear double tap timeout
      if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = null;
      }
      setDoubleTapTarget(null);

      // 2nd tap: Force scale to optimal (or reset to 60min if already optimal)
      const isDurationAndScaleMatched = currentDuration === preset.minutes * 60 && currentScaleMinutes === preset.minutes;

      if (isDurationAndScaleMatched) {
        // Edge case: Duration AND scale already match → Reset to scale 60min (escape hatch)
        setScaleMode('60min');
        haptics.impact('medium'); // Strong feedback for reset
      } else {
        // Normal 2nd tap: Adapt scale to optimal
        setScaleMode(scaleToMode(optimalScale));
        setCurrentDuration(preset.minutes * 60);
        haptics.impact('medium'); // Strong feedback for scale adaptation
      }

      // Notify parent
      onSelectPreset?.({
        durationMinutes: preset.minutes,
        durationSeconds: preset.minutes * 60,
      });

      return;
    }

    // 1st tap: Set duration + auto-reset to 60min if needed
    // Edge case: Si preset > current scale, reset to 60min (universal reference)
    if (preset.minutes > currentScaleMinutes) {
      setScaleMode('60min'); // Always reset to 60min (not optimal)
      setCurrentDuration(preset.minutes * 60);
      haptics.selection(); // Light feedback
    } else {
      // Normal: set duration, scale unchanged
      setCurrentDuration(preset.minutes * 60);
      haptics.selection(); // Light feedback
    }

    // Start double tap window (400ms)
    setDoubleTapTarget(preset.minutes);
    doubleTapTimeoutRef.current = setTimeout(() => {
      setDoubleTapTarget(null); // Expire double tap window
    }, 400);

    // Notify parent of the change
    onSelectPreset?.({
      durationMinutes: preset.minutes,
      durationSeconds: preset.minutes * 60,
    });
  }, [scaleMode, currentDuration, doubleTapTarget, setCurrentDuration, setScaleMode, onSelectPreset]);

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
  });

  const renderPreset = (preset) => {
    // Determine visual state
    const isDurationActive = currentDuration === preset.minutes * 60;
    const isDoubleTapTarget = doubleTapTarget === preset.minutes;
    const isScaleActive = modeToScale(scaleMode) === preset.minutes;

    // Variant priority: accent > selection-pulse > selection-border > selection
    let variant = 'selection';
    if (isDurationActive) {
      variant = 'accent'; // Duration matches (orange background)
    } else if (isDoubleTapTarget) {
      variant = 'selection-pulse'; // Double tap window active (pulsing border)
    } else if (isScaleActive) {
      variant = 'selection-border'; // Scale matches but duration doesn't (blue border)
    }

    return (
      <IconButton
        key={preset.minutes}
        label={preset.label}
        variant={variant}
        size="medium" // Always medium for better tap affordance
        shape="rounded"
        active={isDurationActive}
        onPress={() => handlePresetPress(preset)}
        accessibilityLabel={`${preset.label} minutes`}
        accessibilityHint={t('controls.presets.setDurationHint', { minutes: preset.label })}
      />
    );
  };

  // Single row with all presets in ascending order (5, 15, 30, 45, 60)
  return (
    <View style={styles.container}>
      {/* Preset buttons */}
      <View style={styles.row}>
        {PRESETS.map(renderPreset)}
      </View>
    </View>
  );
});

PresetPills.displayName = 'PresetPills';

PresetPills.propTypes = {
  compact: PropTypes.bool,
  onSelectPreset: PropTypes.func,
};

export default PresetPills;
