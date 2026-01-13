/**
 * @fileoverview SelectionCard - Reusable card for single-choice selections
 * Used for personas (interaction profiles), favorite tools, etc.
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TouchableNativeFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

/**
 * SelectionCard - Interactive card for single-choice selection
 *
 * @param {string} emoji - Emoji icon (e.g., "🚀")
 * @param {string} label - Primary label (e.g., "Impulsif")
 * @param {string} description - Description text (optional, e.g., "Je démarre vite...")
 * @param {boolean} selected - Whether this card is selected
 * @param {Function} onSelect - Callback when selected
 * @param {boolean} compact - If true, use smaller sizing for grid layouts (default: false)
 */
function SelectionCard({ emoji, label, description, selected, onSelect, compact = false }) {
  const theme = useTheme();

  // Platform-specific touchable
  const Touchable =
    Platform.OS === 'android' && TouchableNativeFeedback?.canUseNativeForeground?.()
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

  const handlePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onSelect();
  };

  const styles = StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: selected ? theme.colors.brand.accent : theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: selected ? 2 : 1,
      justifyContent: 'center',
      padding: compact ? rs(12) : rs(16),  // Responsive (was theme.spacing.sm/md)
      ...(Platform.OS === 'ios' ? theme.shadow(selected ? 'md' : 'sm') : {}),
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: compact ? rs(9, 'min') : rs(11, 'min'),
      fontWeight: fontWeights.regular,
      lineHeight: compact ? rs(12, 'min') : rs(15, 'min'),  // Added for readability
      marginTop: rs(8),                                     // Responsive (was theme.spacing.xs)
      opacity: 0.8,                                         // Added opacity for visual recession
      textAlign: 'center',
    },
    emoji: {
      fontSize: compact ? rs(28, 'min') : rs(36, 'min'),
      marginBottom: rs(8),  // Responsive (was theme.spacing.xs)
    },
    label: {
      color: theme.colors.text,
      fontSize: compact ? rs(12, 'min') : rs(14, 'min'),
      fontWeight: selected ? fontWeights.semibold : fontWeights.medium,
      marginBottom: description ? rs(4) : 0,  // Responsive (was theme.spacing.xs / 2)
      textAlign: 'center',
    },
  });

  return (
    <Touchable onPress={handlePress} {...touchableProps}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </Touchable>
  );
}

SelectionCard.propTypes = {
  emoji: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

SelectionCard.defaultProps = {
  description: undefined,
  compact: false,
};

export default SelectionCard;
