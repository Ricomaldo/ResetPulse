// src/components/onboarding/Tooltip.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { useOnboarding } from './OnboardingContext';
import { TRANSITION } from '../../constants/animations';
import haptics from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Tooltip({
  text,
  subtext,
  position,
  arrowDirection = 'down', // 'up', 'down', 'left', 'right', null (centered)
  isLast = false,
  onNext,
  onSkipAll
}) {
  const theme = useTheme();
  const { isZenModeCompletion } = useOnboarding();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade-in without scale to avoid perceived movement
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: TRANSITION.MEDIUM,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = async () => {
    await haptics.selection();
    onNext();
  };

  const handleSkipAll = async () => {
    await haptics.impact('light');
    onSkipAll();
  };

  // Arrow triangle points based on direction
  const getArrowPoints = () => {
    const arrowSize = 10;
    switch (arrowDirection) {
      case 'up':
        return `${arrowSize},0 0,${arrowSize} ${arrowSize * 2},${arrowSize}`;
      case 'down':
        return `0,0 ${arrowSize * 2},0 ${arrowSize},${arrowSize}`;
      case 'left':
        return `${arrowSize},0 0,${arrowSize} ${arrowSize},${arrowSize * 2}`;
      case 'right':
        return `0,0 ${arrowSize},${arrowSize} 0,${arrowSize * 2}`;
      default:
        return `0,0 ${arrowSize * 2},0 ${arrowSize},${arrowSize}`;
    }
  };

  // Centered tooltip (no arrow, no position)
  const isCentered = arrowDirection === null || !position;

  const styles = StyleSheet.create({
    skipAllButton: {
      position: 'absolute',
      top: theme.spacing.xl + 40,
      right: theme.spacing.xl,
      padding: theme.spacing.sm,
      zIndex: 1000,
    },

    skipAllText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '500',
    },

    tooltipContainer: {
      position: 'absolute',
      ...(isCentered ? {
        // If zen mode completion, position at top; otherwise center
        top: isZenModeCompletion ? 100 : SCREEN_HEIGHT / 2 - 100,
        left: 0,
        right: 0,
      } : {
        top: position.top,
        left: 0,
        right: 0,
      }),
      alignItems: 'center',
      zIndex: 100,
    },

    tooltipBubble: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
      padding: theme.spacing.lg,
      maxWidth: SCREEN_WIDTH - theme.spacing.xl * 2,
      ...theme.shadows.lg,
    },

    tooltipText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: -0.3,
      textAlign: 'center',
    },

    tooltipSubtext: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      gap: theme.spacing.md,
    },

    nextButton: {
      backgroundColor: theme.colors.brand.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },

    nextButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },

    arrowContainer: {
      position: 'absolute',
      ...getArrowPosition(arrowDirection),
    },
  });

  function getArrowPosition(direction) {
    const offset = -10;
    switch (direction) {
      case 'up':
        return { top: offset, alignSelf: 'center' };
      case 'down':
        return { bottom: offset, alignSelf: 'center' };
      case 'left':
        return { left: offset, alignSelf: 'center' };
      case 'right':
        return { right: offset, alignSelf: 'center' };
      default:
        return { bottom: offset, alignSelf: 'center' };
    }
  }

  return (
    <>
      {/* Skip all button */}
      <TouchableOpacity
        style={styles.skipAllButton}
        onPress={handleSkipAll}
        activeOpacity={0.7}
      >
        <Text style={styles.skipAllText}>Passer tout</Text>
      </TouchableOpacity>

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltipContainer,
          {
            opacity: opacityAnim,
          }
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.tooltipBubble}>
          {/* Arrow - Only if not centered */}
          {!isCentered && (
            <View style={styles.arrowContainer}>
              <Svg width="20" height="10">
                <Polygon
                  points={getArrowPoints()}
                  fill={theme.colors.surface}
                />
              </Svg>
            </View>
          )}

          {/* Text */}
          <Text style={styles.tooltipText}>{text}</Text>
          {subtext && (
            <Text style={styles.tooltipSubtext}>{subtext}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLast ? 'Commencer' : 'Suivant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
