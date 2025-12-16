/**
 * @fileoverview Options drawer content - simplified to 3 core sections
 * Couleur, Activité, Échelle - Settings moved to modal
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { ActivityCarousel, PaletteCarousel, PresetPills } from '../carousels';
import { fontWeights } from '../../theme/tokens';

export default function OptionsDrawerContent({
  onSelectPreset,
  drawerVisible = false,
  onOpenSettings,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: rs(60), // Extra space for settings button
    },
    section: {
      marginBottom: rs(16),
      paddingHorizontal: rs(20),
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(13),
      fontWeight: fontWeights.medium,
      marginBottom: rs(8),
    },
    settingsButton: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: rs(6),
      paddingHorizontal: rs(12),
      paddingVertical: rs(8),
    },
    settingsButtonContainer: {
      alignItems: 'center',
      bottom: rs(16),
      justifyContent: 'center',
      left: 0,
      paddingVertical: rs(12),
      position: 'absolute',
      right: 0,
    },
    settingsIcon: {
      color: theme.colors.textSecondary,
    },
    settingsText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13),
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <View style={styles.container}>
      {/* Couleur (Palettes) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Couleur</Text>
      </View>
      <PaletteCarousel isTimerRunning={false} />

      {/* Activité */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Activité</Text>
      </View>
      <ActivityCarousel isTimerRunning={false} drawerVisible={drawerVisible} />

      {/* Cadran (Scale) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Cadran</Text>
        <PresetPills onSelectPreset={onSelectPreset} />
      </View>

      {/* Settings Button - Discrete bottom button */}
      <View style={styles.settingsButtonContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onOpenSettings}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={rs(16)} style={styles.settingsIcon} />
          <Text style={styles.settingsText}>Réglages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
