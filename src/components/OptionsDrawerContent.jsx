// src/components/OptionsDrawerContent.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import ActivityCarousel from './ActivityCarousel';
import PresetPills from './PresetPills';
import PaletteCarousel from './PaletteCarousel';
import Icons from './Icons';

export default function OptionsDrawerContent({
  currentDuration = 0,
  onSelectPreset,
  onOpenSettings,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(20),
      paddingTop: rs(8),
      paddingBottom: rs(20),
    },
    section: {
      marginBottom: rs(16),
    },
    sectionLabel: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      marginBottom: rs(12),
      fontWeight: '500',
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(12),
      paddingHorizontal: rs(20),
      marginTop: rs(12),
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.border + '20', // 20% opacity
    },
    settingsButtonText: {
      fontSize: rs(15),
      color: theme.colors.textSecondary,
      marginLeft: rs(8),
      fontWeight: '500',
    },
  });

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
        {/* Activités */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Activité</Text>
          <ActivityCarousel isTimerRunning={false} />
        </View>

        {/* Durées */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Durée</Text>
          <PresetPills
            currentDuration={currentDuration}
            onSelectPreset={onSelectPreset}
          />
        </View>

        {/* Palettes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Couleur</Text>
          <PaletteCarousel isTimerRunning={false} />
        </View>

      {/* Settings Button */}
      {onOpenSettings && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Icons name="settings" size={rs(20)} color={theme.colors.textSecondary} />
          <Text style={styles.settingsButtonText}>Réglages</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
