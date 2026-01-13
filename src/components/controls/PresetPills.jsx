/**
 * @fileoverview PresetPills - Presets de durée du timer
 * @description Boutons pour sélectionner une durée prédéfinie
 * Les presets changent uniquement la durée (pas l'échelle du cadran)
 * @created 2025-12-19
 * @updated 2025-12-24 - Disabled auto-scale adaptation
 * @updated 2026-01-13 - Added contextual toast hint when scale is suboptimal
 */
import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import IconButton from '../buttons/IconButton';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

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
 * Calculate optimal scale for a given duration (mirrors ControlBar logic)
 */
const getOptimalScale = (durationMinutes) => {
  if (durationMinutes <= 1) return 1;
  if (durationMinutes <= 5) return 5;
  if (durationMinutes <= 10) return 10;
  if (durationMinutes <= 15) return 15;
  if (durationMinutes <= 25) return 25;
  if (durationMinutes <= 30) return 30;
  if (durationMinutes <= 45) return 45;
  return 60;
};

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
  const { timer: { currentDuration, scaleMode }, setCurrentDuration } = useTimerConfig();
  const [hintVisible, setHintVisible] = useState(false);
  const hintAnim = useRef(new Animated.Value(0)).current;
  const hintTimeoutRef = useRef(null);

  const showHint = useCallback(() => {
    // Clear any existing timeout
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    setHintVisible(true);
    Animated.timing(hintAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    hintTimeoutRef.current = setTimeout(() => {
      Animated.timing(hintAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setHintVisible(false));
    }, 3000);
  }, [hintAnim]);

  const handlePresetSelect = (preset) => {
    // Change duration only (scale mode stays unchanged)
    setCurrentDuration(preset.minutes * 60);

    // Check if current scale is optimal for selected duration
    const currentScaleMinutes = parseInt(scaleMode?.replace('min', '') || '60', 10);
    const optimalScale = getOptimalScale(preset.minutes);

    // Show hint if scale is significantly larger than optimal (not already adapted)
    if (currentScaleMinutes > optimalScale && currentScaleMinutes !== optimalScale) {
      showHint();
    }

    // Notify parent of the change
    onSelectPreset?.({
      durationMinutes: preset.minutes,
      durationSeconds: preset.minutes * 60,
    });
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    hint: {
      position: 'absolute',
      bottom: '100%',
      left: 0,
      right: 0,
      alignItems: 'center',
      marginBottom: rs(8),
    },
    hintBubble: {
      backgroundColor: theme.colors.overlayDark,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      maxWidth: '90%',
    },
    hintText: {
      color: theme.colors.fixed.white,
      fontSize: rs(12),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
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
        accessibilityHint={t('controls.presets.setDurationHint', { minutes: preset.label })}
      />
    );
  };

  // Single row with all presets in ascending order (5, 15, 25, 30, 45, 60)
  return (
    <View style={styles.container}>
      {/* Contextual hint bubble */}
      {hintVisible && (
        <Animated.View
          style={[
            styles.hint,
            {
              opacity: hintAnim,
              transform: [{
                translateY: hintAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.hintBubble}>
            <Text style={styles.hintText}>
              {t('presets.adaptHint')}
            </Text>
          </View>
        </Animated.View>
      )}

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
