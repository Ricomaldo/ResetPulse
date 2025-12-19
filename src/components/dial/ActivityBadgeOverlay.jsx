/**
 * @fileoverview ActivityBadgeOverlay - Badge d'activité sélectionnée
 * @description Affiche le label de l'activité sélectionnée en bas de DialZone
 * Positionné avec marge négative pour chevaucher l'AsideZone
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * ActivityBadgeOverlay - Badge de l'activité sélectionnée
 * Positionné en bas de DialZone avec marge négative (-marginTop)
 */
const ActivityBadgeOverlay = ({ flashActivity }) => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animer le badge quand flashActivity change
  useEffect(() => {
    if (flashActivity) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800), // 2s total (200 + 1800 + 0 = 2000ms)
      ]).start(() => {
        fadeAnim.setValue(0); // Reset pour prochain cycle
      });
    } else {
      fadeAnim.setValue(0); // Reset quand flashActivity devient null
    }
  }, [flashActivity, fadeAnim]);

  if (!flashActivity || flashActivity.id === 'none') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 0],
              }),
            },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.brand.accent },
        ]}
      >
        <Text style={[styles.badgeText, { color: theme.colors.fixed.white }]}>
          {flashActivity.label}
        </Text>
      </View>
    </Animated.View>
  );
};

ActivityBadgeOverlay.propTypes = {
  flashActivity: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
  }),
};

ActivityBadgeOverlay.defaultProps = {
  flashActivity: null,
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rs(-35), // Chevauche l'AsideZone en haut
    width: '100%',
  },
  badgeText: {
    fontSize: rs(14, 'min'),
    fontWeight: fontWeights.semibold,
  },
});

export default ActivityBadgeOverlay;
