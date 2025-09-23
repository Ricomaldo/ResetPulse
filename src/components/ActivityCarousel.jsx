// src/components/ActivityCarousel.jsx
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, Animated, Platform, TouchableNativeFeedback } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs, getComponentSizes } from '../styles/responsive';
import { getAllActivities } from '../config/activities';
import haptics from '../utils/haptics';
import { isTestPremium } from '../config/testMode';

export default function ActivityCarousel({ isTimerRunning = false }) {
  const theme = useTheme();
  const { currentActivity, setCurrentActivity, setCurrentDuration, favoriteActivities = [] } = useTimerOptions();
  const { setColorByType, currentColor } = useTimerPalette();
  const scrollViewRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Check premium status (test mode or actual premium)
  const isPremiumUser = isTestPremium();

  // Get all activities and sort by favorites
  const allActivities = getAllActivities();

  // Sort activities: 'none' first, then favorites, then others
  const activities = [...allActivities].sort((a, b) => {
    // 'none' (Basique) always comes first
    if (a.id === 'none') return -1;
    if (b.id === 'none') return 1;

    const aIsFavorite = favoriteActivities.includes(a.id);
    const bIsFavorite = favoriteActivities.includes(b.id);

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;

    // If both are favorites, maintain their order in favoriteActivities
    if (aIsFavorite && bIsFavorite) {
      return favoriteActivities.indexOf(a.id) - favoriteActivities.indexOf(b.id);
    }

    return 0;
  });

  // Find current activity index
  const currentIndex = activities.findIndex(a => a.id === currentActivity?.id) || 0;

  // Scroll to current activity on mount
  useEffect(() => {
    if (scrollViewRef.current && currentIndex >= 0) {
      setTimeout(() => {
        const offsetX = currentIndex * rs(80, 'width');
        scrollViewRef.current?.scrollTo({ x: offsetX, animated: false });
      }, 100);
    }
  }, []);

  // Animate selection
  const animateSelection = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Show activity name briefly
  const showActivityName = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleActivityPress = (activity) => {
    if (activity.isPremium && !isPremiumUser) {
      haptics.warning().catch(() => {});
      // TODO: Show premium modal
      return;
    }

    haptics.selection().catch(() => {});
    setCurrentActivity(activity);

    // Update duration based on activity default
    if (activity.defaultDuration) {
      setCurrentDuration(activity.defaultDuration);
    }

    // Don't change color - let user choose their own color

    animateSelection();
    showActivityName();
  };

  // Platform-specific touchable
  const Touchable = Platform.OS === 'android' && TouchableNativeFeedback?.canUseNativeForeground?.()
    ? TouchableNativeFeedback
    : TouchableOpacity;

  const touchableProps = Platform.OS === 'android' && TouchableNativeFeedback?.Ripple ? {
    background: TouchableNativeFeedback.Ripple(theme.colors.brand.primary + '30', true)
  } : {
    activeOpacity: 0.8
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      opacity: isTimerRunning ? 0.3 : 1,
      transform: [{ scale: isTimerRunning ? 0.8 : 1 }],
    },

    scrollView: {
      // Remove fixed height
    },

    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },

    activityButton: {
      width: rs(60, 'min'),
      height: rs(60, 'min'),
      marginHorizontal: rs(4, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rs(30, 'min'),
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xs,
      ...theme.shadow('sm'),
    },

    activityButtonActive: {
      backgroundColor: theme.colors.brand.primary,
      borderWidth: 2,
      borderColor: theme.colors.brand.secondary,
      ...theme.shadow('md'),
      transform: [{ scale: 1.1 }],
    },

    activityEmoji: {
      fontSize: rs(34, 'min'),
      lineHeight: rs(36, 'min'),
      textAlign: 'center',
    },

    activityLabel: {
      fontSize: rs(9, 'min'),
      marginTop: 2,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },

    activityLabelActive: {
      color: theme.colors.background,
      fontWeight: '600',
    },

    premiumBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.colors.semantic.warning,
      width: rs(20, 'min'),
      height: rs(20, 'min'),
      borderRadius: rs(10, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
    },

    lockIcon: {
      fontSize: rs(12, 'min'),
    },

    activityNameBadge: {
      position: 'absolute',
      top: -35,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadow('md'),
    },

    activityNameText: {
      fontSize: rs(14, 'min'),
      fontWeight: '600',
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container}>
      {/* Activity name display */}
      {currentActivity && (
        <Animated.View
          style={[
            styles.activityNameBadge,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 0]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.activityNameText}>
            {currentActivity.label}
          </Text>
        </Animated.View>
      )}

      {/* Scrollable activities */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {activities.map((activity) => {
          const isActive = currentActivity?.id === activity.id;
          const isLocked = activity.isPremium && !isPremiumUser;

          return (
            <Touchable
              key={activity.id}
              accessible={true}
              accessibilityLabel={`Activité ${activity.label}`}
              accessibilityRole="button"
              accessibilityState={{selected: isActive, disabled: isLocked}}
              accessibilityHint={isLocked ? "Activité premium verrouillée" : `Sélectionner ${activity.label}`}
              style={[
                styles.activityButton,
                isActive && styles.activityButtonActive,
                { opacity: isLocked ? 0.5 : 1 }
              ]}
              onPress={() => handleActivityPress(activity)}
              {...touchableProps}
            >
              <Animated.View
                style={[
                  { alignItems: 'center', justifyContent: 'center', width: '100%' },
                  isActive ? { transform: [{ scale: scaleAnim }] } : {}
                ]}
              >
                <Text style={styles.activityEmoji}>
                  {activity.emoji}
                </Text>
              </Animated.View>

              {isLocked && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}