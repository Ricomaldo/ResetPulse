/**
 * @fileoverview SectionHeader - Lightweight section header for settings groups
 * @created 2025-12-20
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * SectionHeader - Simple header text between settings groups
 *
 * @param {string} label - Section header text
 */
function SectionHeader({ label }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    header: {
      color: theme.colors.brand.primary,
      fontSize: rs(11, 'min'),
      fontWeight: fontWeights.bold,
      letterSpacing: 1.5,
      marginBottom: rs(12),
      marginTop: rs(24),
      textTransform: 'uppercase',
    },
  });

  return <Text style={styles.header}>{label}</Text>;
}

export default SectionHeader;
