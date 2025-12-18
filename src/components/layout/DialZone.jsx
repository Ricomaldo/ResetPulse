/**
 * @fileoverview DialZone - Zone haute permanente pour le dial visuel
 * @created 2025-12-17
 * @updated 2025-12-17
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { devColors } from '../../theme/colors';

export default function DialZone({ children, style }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    height: '62%', // 62% pour accommoder le dial + nombres + digitalTimer
    alignItems: 'center',
    justifyContent: 'flex-start', // Layout vertical du haut vers le bas
    flexDirection: 'column', // Empilement vertical explicite
  },
});
