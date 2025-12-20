/**
 * @fileoverview SettingsCard - Reusable card component for settings sections
 * Encapsulates common styling and layout for settings options
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * SettingsCard - Container for a settings section
 *
 * @param {string} title - Section title (e.g., "⭐ Outil favori")
 * @param {string} description - Optional description text under title
 * @param {React.ReactNode} children - Content to display inside card
 */
function SettingsCard({ title, description, children }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: rs(16),  // Responsive (was theme.spacing.md)
      padding: rs(16),       // Responsive (was theme.spacing.md)
      ...theme.shadow('sm'),
    },
    description: {
      color: theme.colors.textLight,
      fontSize: rs(11, 'min'),
      marginTop: rs(4),  // Responsive (was theme.spacing.xs / 2)
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(12),  // Responsive (was theme.spacing.sm)
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children}
    </View>
  );
}

SettingsCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

SettingsCard.defaultProps = {
  description: undefined,
};

export default SettingsCard;
