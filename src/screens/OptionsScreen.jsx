// src/screens/OptionsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import { ActivityCarousel, PaletteCarousel, PresetPills } from '../components/carousels';
import { Icons } from '../components/layout';
import { fontWeights } from '../../theme/tokens';

export default function OptionsScreen({
  currentDuration = 0,
  onSelectPreset,
  onNavigateToSettings,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(20),
      paddingTop: rs(60),
      paddingBottom: rs(40),
    },
    header: {
      paddingHorizontal: rs(20),
      paddingTop: rs(16),
      paddingBottom: rs(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    headerText: {
      fontSize: rs(24),
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    section: {
      marginBottom: rs(24),
    },
    sectionLabel: {
      fontSize: rs(14),
      color: theme.colors.textSecondary,
      marginBottom: rs(12),
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(14),
      paddingHorizontal: rs(20),
      marginTop: rs(16),
      marginHorizontal: rs(20),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.border + '15',
      borderWidth: 1,
      borderColor: theme.colors.border + '30',
    },
    settingsButtonText: {
      fontSize: rs(16),
      color: theme.colors.text,
      marginLeft: rs(10),
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Options</Text>
      </View>

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

        {/* Taille du cadran */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Taille du cadran</Text>
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
      </ScrollView>

      {/* Settings Button */}
      {onNavigateToSettings && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onNavigateToSettings}
          activeOpacity={0.7}
        >
          <Icons name="settings" size={rs(22)} color={theme.colors.text} />
          <Text style={styles.settingsButtonText}>Réglages</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
