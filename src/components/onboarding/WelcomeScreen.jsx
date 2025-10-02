// src/components/onboarding/WelcomeScreen.jsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { TRANSITION } from '../../constants/animations';
import haptics from '../../utils/haptics';

export default function WelcomeScreen({ visible, onDiscover, onSkip }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: TRANSITION.MEDIUM,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDiscover = async () => {
    await haptics.impact('light');
    onDiscover();
  };

  const handleSkip = async () => {
    await haptics.selection();
    onSkip();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },

    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },

    skipButton: {
      position: 'absolute',
      top: theme.spacing.xl,
      right: theme.spacing.xl,
      padding: theme.spacing.sm,
    },

    skipText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      fontSize: 16,
    },

    logoContainer: {
      marginBottom: theme.spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
    },

    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
    },

    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },

    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
      lineHeight: 24,
    },

    discoverButton: {
      backgroundColor: theme.colors.brand.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl * 2,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },

    discoverButtonText: {
      ...theme.typography.body,
      color: theme.colors.textOnPrimary,
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim }
          ]}
        >
          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Bienvenue sur ResetPulse</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Choisissez une activité, ajustez la durée, lancez.
          </Text>

          {/* Discover button */}
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={handleDiscover}
            activeOpacity={0.8}
          >
            <Text style={styles.discoverButtonText}>Découvrir</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}
