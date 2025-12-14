/**
 * @fileoverview Branded splash screen shown during app launch
 * Improves first impression and prevents blank white screen
 * @created 2025-12-14
 */
import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * SplashScreen - Branded loading screen
 * Displayed while AsyncStorage loads onboarding state
 */
export default function SplashScreen() {
  const theme = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background }
    ]}>
      {/* Logo/Icon placeholder */}
      <View style={styles.logoContainer}>
        <View style={[
          styles.logo,
          { backgroundColor: theme.colors.brand.primary }
        ]}>
          <View style={styles.logoInner} />
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoInner: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  loader: {
    marginTop: 16,
  },
});
