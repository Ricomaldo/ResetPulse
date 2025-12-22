/**
 * @fileoverview BrandLogo - Reusable brand logo/icon
 * Used in SplashScreen and Onboarding Filter-010
 * @created 2025-12-22
 */
import React from 'react';
import { Image, StyleSheet } from 'react-native';

/**
 * BrandLogo - Consistent brand visual across app
 * Uses circular PNG logo (763 × 758)
 *
 * @param {number} size - Logo size (default: 100)
 * @param {Object} style - Additional styles
 */
export default function BrandLogo({ size = 100, style }) {
  const logoSize = size;

  const styles = StyleSheet.create({
    logo: {
      height: logoSize,
      width: logoSize,
    },
  });

  return (
    <Image
      source={require('../../../assets/logo/logo-1024-detoured.png')}
      style={[styles.logo, style]}
      resizeMode="contain"
    />
  );
}
