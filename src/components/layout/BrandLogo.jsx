/**
 * @fileoverview BrandLogo - Reusable brand logo/icon
 * Used in SplashScreen and Onboarding Filter-010
 * @created 2025-12-22
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * BrandLogo - Consistent brand visual across app
 *
 * @param {number} size - Logo size (default: 100)
 * @param {Object} style - Additional styles
 * @param {React.Component} children - Optional children (for animations)
 */
export default function BrandLogo({ size = 100, style, children }) {
  const theme = useTheme();

  const logoSize = size;
  const innerSize = size * 0.6;

  const styles = StyleSheet.create({
    logo: {
      alignItems: 'center',
      borderRadius: logoSize * 0.2,
      elevation: 3,
      height: logoSize,
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      width: logoSize,
      backgroundColor: theme.colors.brand.primary,
    },
    logoInner: {
      backgroundColor: theme.colors.fixed.white,
      borderRadius: innerSize * 0.2,
      height: innerSize,
      opacity: 0.3,
      width: innerSize,
    },
  });

  return (
    <View style={[styles.logo, style]}>
      {children || <View style={styles.logoInner} />}
    </View>
  );
}
