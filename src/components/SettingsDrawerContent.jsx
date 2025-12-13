// src/components/SettingsDrawerContent.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs } from '../styles/responsive';

export default function SettingsDrawerContent() {
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(20),
      paddingTop: rs(8),
      paddingBottom: rs(20),
      flexGrow: 1,
    },
    title: {
      fontSize: rs(20),
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: rs(24),
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: rs(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingLabel: {
      fontSize: rs(16),
      color: theme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: rs(13),
      color: theme.colors.textSecondary,
      marginTop: rs(4),
    },
  });

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
        <Text style={styles.title}>Réglages</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Chrono numérique</Text>
            <Text style={styles.settingDescription}>Afficher le temps restant</Text>
          </View>
          <Switch
            value={showDigitalTimer}
            onValueChange={setShowDigitalTimer}
            trackColor={{ false: theme.colors.border, true: theme.colors.brand.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Animation de pulsation</Text>
            <Text style={styles.settingDescription}>Pulse visuel pendant le timer</Text>
          </View>
          <Switch
            value={shouldPulse}
            onValueChange={setShouldPulse}
            trackColor={{ false: theme.colors.border, true: theme.colors.brand.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Sens horaire</Text>
            <Text style={styles.settingDescription}>Timer tourne dans le sens des aiguilles</Text>
          </View>
          <Switch
            value={clockwise}
            onValueChange={setClockwise}
            trackColor={{ false: theme.colors.border, true: theme.colors.brand.primary }}
          />
        </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Interface minimale</Text>
          <Text style={styles.settingDescription}>Masquer les options pendant le timer</Text>
        </View>
        <Switch
          value={useMinimalInterface}
          onValueChange={setUseMinimalInterface}
          trackColor={{ false: theme.colors.border, true: theme.colors.brand.primary }}
        />
      </View>
    </ScrollView>
  );
}
