/**
 * @fileoverview AsideZone V2 - Zone basse interactive avec drawer intégré
 * Architecture: Drawer vit DANS AsideZone (ADR-005), pas overlay global
 * Stack: react-native-gesture-handler + reanimated (ADR-006)
 * @created 2025-12-17
 * @updated 2025-12-17
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { SettingsIcon } from './Icons';

const SWIPE_THRESHOLD = 50; // px minimum pour déclencher swipe
const TOOLTIP_STORAGE_KEY = '@ResetPulse:hasSeenDrawerHint';
const TOOLTIP_AUTO_HIDE_DELAY = 3000; // 3 secondes

export default function AsideZone({
  children, // ActivityLabel (visible quand drawer fermé)
  drawerVisible, // State drawer (depuis TimerScreen)
  onDrawerClose, // Callback fermeture
  onDrawerOpen, // Callback ouverture
  onOpenSettings, // Callback pour ouvrir settings modal
  style,
}) {
  const theme = useTheme();

  // Mesure la hauteur du container pour animation en pixels
  const [containerHeight, setContainerHeight] = useState(0);

  // Tooltip hint (premier lancement uniquement)
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useSharedValue(0);

  // Reanimated shared value: 0 = ouvert, 1 = fermé
  const translateY = useSharedValue(drawerVisible ? 0 : 1);
  const startY = useSharedValue(0); // Position au début du drag

  // Cacher le tooltip et sauvegarder qu'il a été vu
  const hideTooltip = useCallback(async () => {
    tooltipOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => setShowTooltip(false), 300);
    try {
      await AsyncStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('[AsideZone] Failed to save tooltip seen state:', error);
    }
  }, [tooltipOpacity]);

  // Charger état tooltip depuis AsyncStorage au montage
  useEffect(() => {
    const loadTooltipState = async () => {
      try {
        const hasSeenTooltip = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
        if (!hasSeenTooltip) {
          setShowTooltip(true);
          // Fade in après un court délai
          setTimeout(() => {
            tooltipOpacity.value = withTiming(1, { duration: 500 });
          }, 500);
          // Auto-hide après 3 secondes
          setTimeout(() => {
            hideTooltip();
          }, TOOLTIP_AUTO_HIDE_DELAY + 500);
        }
      } catch (error) {
        console.warn('[AsideZone] Failed to load tooltip state:', error);
      }
    };
    loadTooltipState();
  }, [hideTooltip, tooltipOpacity]);

  // Update animation quand drawerVisible change
  React.useEffect(() => {
    if (containerHeight === 0) return;

    translateY.value = withSpring(drawerVisible ? 0 : 1, {
      damping: 40,
      stiffness: 100,
    });
  }, [drawerVisible, containerHeight]);

  // Gesture Pan pour swipe up/down + suivre le doigt
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Capturer position au début du drag
      startY.value = translateY.value;

      // Cacher tooltip dès qu'on commence à swiper
      if (showTooltip) {
        runOnJS(hideTooltip)();
      }
    })
    .onUpdate((event) => {
      // Suivre le doigt en temps réel
      const progress = startY.value + event.translationY / containerHeight;
      // Clamp entre 0 (ouvert) et 1 (fermé)
      translateY.value = Math.max(0, Math.min(1, progress));
    })
    .onEnd((event) => {
      const dy = event.translationY;
      const finalPosition = translateY.value;

      // Déterminer snap target basé sur position finale + vélocité
      if (dy < -SWIPE_THRESHOLD || (finalPosition < 0.5 && !drawerVisible)) {
        // Ouvrir
        translateY.value = withSpring(0, { damping: 40, stiffness: 100 });
        if (!drawerVisible && onDrawerOpen) {
          runOnJS(onDrawerOpen)();
        }
      } else if (dy > SWIPE_THRESHOLD || (finalPosition >= 0.5 && drawerVisible)) {
        // Fermer
        translateY.value = withSpring(1, { damping: 40, stiffness: 100 });
        if (drawerVisible && onDrawerClose) {
          runOnJS(onDrawerClose)();
        }
      } else {
        // Snap back à l'état actuel
        translateY.value = withSpring(drawerVisible ? 0 : 1, { damping: 40, stiffness: 100 });
      }
    });

  // Animated style pour drawer
  const drawerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value * containerHeight, // 0 = visible, containerHeight = caché
        },
      ],
    };
  });

  // Animated style pour handle (fade out quand drawer s'ouvre)
  const handleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateY.value * 0.8, // 0.8 quand fermé (translateY=1), 0 quand ouvert (translateY=0)
    };
  });

  // Animated style pour tooltip
  const tooltipAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: tooltipOpacity.value,
    };
  });

  const styles = StyleSheet.create({
    container: {
      height: '38%', // 38% pour AsideZone (Fibonacci golden ratio)
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden', // Clip drawer quand fermé
    },
    backgroundContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    handle: {
      position: 'absolute',
      top: theme.spacing.sm, // 8px du haut de l'AsideZone
      width: rs(50), // Plus large (was 40px)
      height: rs(5), // Plus épais (was 4px)
      borderRadius: rs(2.5),
      backgroundColor: theme.colors.textSecondary,
      zIndex: 10, // Au-dessus du drawer
    },
    tooltip: {
      position: 'absolute',
      top: theme.spacing.sm + rs(16), // Juste en dessous du handle
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: rs(20),
      zIndex: 11, // Au-dessus du handle
      ...theme.shadow('md'),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        android: {},
      }),
    },
    tooltipText: {
      fontSize: rs(13),
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: rs(20),
      borderTopRightRadius: rs(20),
      alignItems: 'center',
      ...theme.shadow('xl'),
      // Brand-first border for visual distinction (iOS only)
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        android: {}, // Android relies on elevation/shadow only
      }),
    },
    settingsIcon: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 10,
      padding: theme.spacing.sm,
    },
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[styles.container, style]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        {/* Handle visuel (affordance) - Visible quand drawer fermé */}
        <Animated.View style={[styles.handle, handleAnimatedStyle]} />

        {/* Tooltip hint (premier lancement uniquement) */}
        {showTooltip && (
          <Animated.View style={[styles.tooltip, tooltipAnimatedStyle]}>
            <Text style={styles.tooltipText}>↑ Balayer vers le haut</Text>
          </Animated.View>
        )}

        {/* Background content - ActivityLabel visible quand drawer fermé */}
        <View style={styles.backgroundContent}>
          {children}
        </View>

        {/* Drawer animé - monte/descend avec translateY */}
        <Animated.View
          style={[styles.drawer, drawerAnimatedStyle]}
          pointerEvents={drawerVisible ? 'auto' : 'none'}
        >
          {/* Settings gear icon (top right) */}
          {onOpenSettings && (
            <TouchableOpacity
              style={styles.settingsIcon}
              onPress={onOpenSettings}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SettingsIcon
                size={rs(24)}
                color={theme.colors.brand.primary}
              />
            </TouchableOpacity>
          )}

          {/* TODO M3: CommandBar + CarouselBar ici */}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
