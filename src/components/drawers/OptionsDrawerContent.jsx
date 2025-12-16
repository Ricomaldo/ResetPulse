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
  currentDuration = 0,
  onSelectPreset,
  drawerVisible = false,
  onOpenSettings,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingBottom: rs(60), // Extra space for settings button
      flex: 1,
    },
    section: {
      marginBottom: rs(16),
      paddingHorizontal: rs(20),
    },
    sectionLabel: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      marginBottom: rs(8),
      fontWeight: fontWeights.medium,
    },
    settingsButtonContainer: {
      position: 'absolute',
      bottom: rs(16),
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(12),
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(6),
      paddingVertical: rs(8),
      paddingHorizontal: rs(12),
    },
    settingsText: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      fontWeight: fontWeights.medium,
    },
    settingsIcon: {
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Couleur (Palettes) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Couleur</Text>
        <PaletteCarousel isTimerRunning={false} />
      </View>

      {/* Activité */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Activité</Text>
        <ActivityCarousel isTimerRunning={false} drawerVisible={drawerVisible} />
      </View>

      {/* Échelle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Échelle</Text>
        <PresetPills
          currentDuration={currentDuration}
          onSelectPreset={onSelectPreset}
        />
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
