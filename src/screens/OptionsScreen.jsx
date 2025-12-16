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
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    header: {
      borderBottomColor: theme.colors.border + '20',
      borderBottomWidth: 1,
      paddingBottom: rs(12),
      paddingHorizontal: rs(20),
      paddingTop: rs(16),
    },
    headerText: {
      color: theme.colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.bold,
      textAlign: 'center',
    },
    scrollContent: {
      paddingBottom: rs(40),
      paddingHorizontal: rs(20),
      paddingTop: rs(60),
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: rs(24),
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(14),
      fontWeight: fontWeights.semibold,
      letterSpacing: 0.5,
      marginBottom: rs(12),
      textTransform: 'uppercase',
    },
    settingsButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.border + '15',
      borderColor: theme.colors.border + '30',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: rs(20),
      marginTop: rs(16),
      paddingHorizontal: rs(20),
      paddingVertical: rs(14),
    },
    settingsButtonText: {
      color: theme.colors.text,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
      marginLeft: rs(10),
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
