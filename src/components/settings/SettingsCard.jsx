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
 * @param {string|React.ReactNode} title - Section title (string or JSX with icon)
 * @param {string} description - Optional description text under title
 * @param {React.ReactNode} children - Content to display inside card
 */
function SettingsCard({ title, description, children }) {
  const theme = useTheme();
  const isStringTitle = typeof title === 'string';

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: rs(16),  // Responsive (was theme.spacing.md)
      padding: rs(16),       // Responsive (was theme.spacing.md)
      ...theme.shadow('sm'),
    },
    titleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: rs(12),
      marginBottom: rs(12),
    },
    titleText: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      flex: 1,
    },
    titleString: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(12),
    },
    description: {
      color: theme.colors.textLight,
      fontSize: rs(10, 'min'),           // Reduced from rs(11, 'min') for hierarchy
      lineHeight: rs(14, 'min'),         // Added for readability
      marginTop: rs(8),                  // Increased from rs(4) for better spacing
      opacity: 0.8,                      // Added opacity for visual recession
    },
  });

  return (
    <View style={styles.card}>
      {isStringTitle ? (
        <>
          <Text style={styles.titleString}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </>
      ) : (
        <View style={styles.titleRow}>
          {title}
        </View>
      )}
      {children}
    </View>
  );
}

SettingsCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

SettingsCard.defaultProps = {
  description: undefined,
};

export default SettingsCard;
