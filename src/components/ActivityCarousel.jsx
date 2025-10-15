// src/components/ActivityCarousel.jsx
import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Animated, TouchableOpacity, Platform, Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useOnboarding } from './onboarding/OnboardingController';
import { rs, getComponentSizes } from '../styles/responsive';
import { getAllActivities } from '../config/activities';
import haptics from '../utils/haptics';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import PremiumModal from './PremiumModal';

export default function ActivityCarousel({ isTimerRunning = false }) {
  const theme = useTheme();
  const {
    currentActivity,
    setCurrentActivity,
    setCurrentDuration,
    favoriteActivities = [],
    activityDurations = {}
  } = useTimerOptions();
  const { setColorByType, currentColor } = useTimerPalette();
  const { onboardingCompleted, currentTooltip } = useOnboarding();
  const scrollViewRef = useRef(null);
  const scaleAnims = useRef({}).current; // Store animation values for each activity
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check premium status (test mode or actual premium)
  const { isPremium: isPremiumUser } = usePremiumStatus();

  // Mode DEMO: pendant l'onboarding, pas de modal premium (toast léger à la place)
  const isOnboardingActive = !onboardingCompleted && currentTooltip !== null;

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

  // Find current activity index (default to 0 if not found, which is 'none')
  const currentIndex = activities.findIndex(a => a.id === currentActivity?.id);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

  // Scroll to current activity on mount
  useEffect(() => {
    if (scrollViewRef.current && validIndex >= 0) {
      setTimeout(() => {
        const offsetX = validIndex * rs(80, 'width');
        scrollViewRef.current?.scrollTo({ x: offsetX, animated: false });
      }, 100);
    }
  }, []);

  // Get or create animation value for an activity
  const getScaleAnim = (activityId) => {
    if (!scaleAnims[activityId]) {
      scaleAnims[activityId] = new Animated.Value(1);
    }
    return scaleAnims[activityId];
  };

  // Animate selection for specific activity
  const animateSelection = (activityId) => {
    const anim = getScaleAnim(activityId);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
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

  // Show toast message for onboarding
  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(''));
  };

  const handleActivityPress = (activity) => {
    if (activity.isPremium && !isPremiumUser) {
      haptics.warning().catch(() => {});

      // Pendant l'onboarding: toast léger au lieu de modal
      if (isOnboardingActive) {
        showToast('Terminez le guide pour découvrir les activités premium !');
        return;
      }

      // Après l'onboarding: modal normale
      setShowPremiumModal(true);
      return;
    }

    haptics.selection().catch(() => {});
    setCurrentActivity(activity);

    // Use saved duration if available, otherwise use activity default
    const savedDuration = activityDurations[activity.id];
    if (savedDuration) {
      setCurrentDuration(savedDuration);
    } else if (activity.defaultDuration) {
      setCurrentDuration(activity.defaultDuration);
    }

    // Don't change color - let user choose their own color

    animateSelection(activity.id);
    showActivityName();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      // L'affichage en mode zen est maintenant géré par TimerScreen + useMinimalInterface
    },

    scrollView: {
      flexGrow: 0,
    },

    scrollContent: {
      paddingHorizontal: rs(30, 'width'), // Show peek of adjacent items
      alignItems: 'center',
      gap: theme.spacing.md,
    },

    activityWrapper: {
      width: rs(60, 'min'),
      height: rs(60, 'min'),
      borderRadius: rs(30, 'min'),
      overflow: 'visible',
      backgroundColor: 'transparent',
    },

    activityButtonInner: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rs(30, 'min'),
      backgroundColor: theme.colors.surface,
      ...(Platform.OS === 'ios' ? theme.shadow('sm') : {}),
    },

    activityButtonActive: {
      backgroundColor: currentColor || theme.colors.brand.primary,
      borderWidth: 2,
      borderColor: currentColor || theme.colors.brand.secondary,
      ...(Platform.OS === 'ios' ? theme.shadow('md') : {}),
    },

    activityInner: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },

    activityEmoji: {
      fontSize: rs(34, 'min'),
      lineHeight: rs(36, 'min'),
      textAlign: 'center',
    },

    activityIcon: {
      width: rs(34, 'min'),
      height: rs(34, 'min'),
      // Pas de tintColor pour garder les couleurs originales de l'icône
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
      top: -2,
      right: -2,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },

    lockIcon: {
      fontSize: rs(16, 'min'),
      opacity: 0.75,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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

    onboardingToast: {
      position: 'absolute',
      bottom: rs(50, 'height'),
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      maxWidth: '80%',
      ...theme.shadow('lg'),
    },

    onboardingToastText: {
      fontSize: rs(13, 'min'),
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
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
            <View key={activity.id} style={[
              styles.activityWrapper,
              { opacity: isLocked ? 0.5 : 1 }
            ]}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={`Activité ${activity.label}`}
                accessibilityRole="button"
                accessibilityState={{selected: isActive, disabled: isLocked}}
                accessibilityHint={isLocked ? "Activité premium verrouillée" : `Sélectionner ${activity.label}`}
                style={[
                  styles.activityButtonInner,
                  isActive && styles.activityButtonActive
                ]}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
                disabled={false}
              >
                <Animated.View
                  style={[
                    styles.activityInner,
                    { transform: [{ scale: getScaleAnim(activity.id) }] }
                  ]}
                >
                  <Text style={styles.activityEmoji}>
                    {activity.id === 'none' ? '⏱️' : activity.emoji}
                  </Text>
                </Animated.View>

                {isLocked && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.lockIcon}>✨</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature="activités premium"
      />

      {/* Onboarding Toast */}
      {toastMessage !== '' && (
        <Animated.View
          style={[
            styles.onboardingToast,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.onboardingToastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}