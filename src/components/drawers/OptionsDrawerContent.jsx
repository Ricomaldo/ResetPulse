/**
 * @fileoverview Options drawer content with carousels for activities, palettes, and presets
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { ActivityCarousel, PaletteCarousel, PresetPills } from '../carousels';
import { Icons } from '../layout';
import { fontWeights } from '../../theme/tokens';

export default function OptionsDrawerContent({
  currentDuration = 0,
  onSelectPreset,
  onOpenSettings,
  drawerVisible = false,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingBottom: rs(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: rs(8),
      paddingHorizontal: rs(20),
    },
    section: {
      marginBottom: rs(16),
      paddingHorizontal: rs(20),
    },
    sectionFullWidth: {
      marginBottom: rs(16),
      paddingHorizontal: rs(20),
    },
    sectionLabel: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      marginBottom: rs(8),
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <View style={styles.container}>
      {/* Settings Icon - en haut à droite */}
      {onOpenSettings && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onOpenSettings} activeOpacity={0.6}>
            <Icons name="settings" size={rs(20)} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Palettes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Couleur</Text>
        <PaletteCarousel isTimerRunning={false} />
      </View>

      {/* Activités */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Activité</Text>
        <ActivityCarousel isTimerRunning={false} drawerVisible={drawerVisible} />
      </View>

      {/* Durées */}
      <View style={styles.sectionFullWidth}>
        <Text style={styles.sectionLabel}>Durée</Text>
        <PresetPills
          currentDuration={currentDuration}
          onSelectPreset={onSelectPreset}
        />
      </View>
    </View>
  );
}
