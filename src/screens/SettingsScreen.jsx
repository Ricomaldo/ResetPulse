// src/screens/SettingsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs } from '../styles/responsive';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    shouldPulse,
    setShouldPulse,
    showDigitalTimer,
    setShowDigitalTimer,
    clockwise,
    setClockwise,
    useMinimalInterface,
    setUseMinimalInterface,
  } = useTimerOptions();

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
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: rs(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    settingInfo: {
      flex: 1,
      marginRight: rs(16),
    },
    settingLabel: {
      fontSize: rs(17),
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: rs(4),
    },
    settingDescription: {
      fontSize: rs(14),
      color: theme.colors.textSecondary,
      lineHeight: rs(20),
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Réglages</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Chrono numérique</Text>
            <Text style={styles.settingDescription}>
              Afficher le temps restant en chiffres
            </Text>
          </View>
          <Switch
            value={showDigitalTimer}
            onValueChange={setShowDigitalTimer}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Animation de pulsation</Text>
            <Text style={styles.settingDescription}>
              Effet visuel pendant que le timer tourne
            </Text>
          </View>
          <Switch
            value={shouldPulse}
            onValueChange={setShouldPulse}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sens horaire</Text>
            <Text style={styles.settingDescription}>
              Le timer tourne dans le sens des aiguilles d'une montre
            </Text>
          </View>
          <Switch
            value={clockwise}
            onValueChange={setClockwise}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Interface minimale</Text>
            <Text style={styles.settingDescription}>
              Masquer les options pendant que le timer tourne
            </Text>
          </View>
          <Switch
            value={useMinimalInterface}
            onValueChange={setUseMinimalInterface}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.brand.primary
            }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
