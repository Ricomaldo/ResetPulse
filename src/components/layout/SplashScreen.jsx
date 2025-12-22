/**
 * @fileoverview Branded splash screen shown during app launch
 * Improves first impression and prevents blank white screen
 * @created 2025-12-14
 */
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import BrandLogo from './BrandLogo';

/**
 * SplashScreen - Branded loading screen
 * Displayed while AsyncStorage loads onboarding state
 */
export default function SplashScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    loader: {
      marginTop: 16,
    },
    logoContainer: {
      marginBottom: 32,
    },
  });

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background }
    ]}>
      {/* Brand Logo */}
      <View style={styles.logoContainer}>
        <BrandLogo size={100} />
      </View>

      {/* Loading indicator */}
      <ActivityIndicator
        size="small"
        color={theme.colors.brand.primary}
        style={styles.loader}
      />
    </View>
  );
}
