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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loader: {
    marginTop: 16,
  },
  logo: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 3,
    height: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 100,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    height: 60,
    width: 60,
  },
});
