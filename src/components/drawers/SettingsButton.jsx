/**
 * @fileoverview Settings button for drawer footer
 * Discrete hint to access settings modal
 * @created 2025-12-17
 * @updated 2025-12-17
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';

export default function SettingsButton({ onPress }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: rs(6),
      paddingHorizontal: rs(12),
      paddingVertical: rs(8),
    },
    icon: {
      color: theme.colors.textSecondary,
    },
    text: {
      color: theme.colors.textSecondary,
      fontSize: rs(13),
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="settings-outline" size={rs(16)} style={styles.icon} />
      <Text style={styles.text}>Réglages</Text>
    </TouchableOpacity>
  );
}

SettingsButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};
