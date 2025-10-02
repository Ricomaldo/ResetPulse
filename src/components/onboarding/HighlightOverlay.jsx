// src/components/onboarding/HighlightOverlay.jsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HighlightOverlay({ highlightedElement, targetBounds }) {
  const theme = useTheme();

  if (!highlightedElement || !targetBounds) return null;

  const { top, height } = targetBounds;
  const bottom = top + height;

  const styles = StyleSheet.create({
    topOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: top,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
    },
    bottomOverlay: {
      position: 'absolute',
      top: bottom,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT - bottom,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
    },
  });

  return (
    <>
      <View style={styles.topOverlay} />
      <View style={styles.bottomOverlay} />
    </>
  );
}
