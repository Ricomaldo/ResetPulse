// src/components/CircularToggle.jsx
import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import haptics from '../utils/haptics';

/**
 * CircularToggle - Toggle circulaire pour changer le sens de rotation
 * Affiche deux flèches circulaires : sens horaire / anti-horaire
 */
export default function CircularToggle({ clockwise, onToggle, size = 60 }) {
  const theme = useTheme();

  const handlePress = () => {
    haptics.selection().catch(() => {});
    onToggle(!clockwise);
  };

  const styles = StyleSheet.create({
    container: {
      width: rs(size, 'min'),
      height: rs(size, 'min'),
      borderRadius: rs(size / 2, 'min'),
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow('sm'),
    },
    icon: {
      fontSize: rs(size * 0.5, 'min'),
      color: theme.colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: clockwise }}
      accessibilityLabel={clockwise ? 'Sens horaire' : 'Sens anti-horaire'}
    >
      <Text style={styles.icon}>
        {clockwise ? '↻' : '↺'}
      </Text>
    </TouchableOpacity>
  );
}
