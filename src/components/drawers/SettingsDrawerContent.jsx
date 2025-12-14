/**
 * @fileoverview Settings drawer content with toggle options for timer behavior
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SoundPicker } from '../pickers';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

export default function SettingsDrawerContent() {
  const theme = useTheme();
  const t = useTranslation();
  const {
    shouldPulse,
    setShouldPulse,
    showDigitalTimer,
    setShowDigitalTimer,
    showActivityEmoji,
    setShowActivityEmoji,
    clockwise,
    setClockwise,
    useMinimalInterface,
    setUseMinimalInterface,
    scaleMode,
    setScaleMode,
    selectedSoundId,
    setSelectedSoundId,
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
    sectionLabel: {
      fontSize: rs(14),
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: rs(16),
      marginBottom: rs(8),
    },
    dialModeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs(8),
      marginTop: rs(12),
      justifyContent: 'space-between',
    },
    dialModeButton: {
      width: '31%',
      paddingVertical: rs(10),
      paddingHorizontal: rs(8),
      borderRadius: rs(8),
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    dialModeButtonActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    dialModeText: {
      fontSize: rs(12),
      color: theme.colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    dialModeTextActive: {
      color: theme.colors.background,
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
            <Text style={styles.settingLabel}>Emoji d'activité</Text>
            <Text style={styles.settingDescription}>Afficher l'emoji au centre du timer</Text>
          </View>
          <Switch
            value={showActivityEmoji}
            onValueChange={setShowActivityEmoji}
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
            onValueChange={(value) => {
              if (value) {
                // ⚠️ CRITICAL: Avertissement épilepsie/photosensibilité (conformité légale)
                Alert.alert(
                  t('settings.interface.pulseWarningTitle'),
                  t('settings.interface.pulseWarningMessage'),
                  [
                    {
                      text: t('common.cancel'),
                      style: "cancel",
                      onPress: () => {
                        haptics.selection().catch(() => {});
                      },
                    },
                    {
                      text: t('settings.interface.pulseWarningEnable'),
                      onPress: () => {
                        haptics.switchToggle().catch(() => {});
                        setShouldPulse(true);
                      },
                    },
                  ],
                  { cancelable: true }
                );
              } else {
                haptics.switchToggle().catch(() => {});
                setShouldPulse(false);
              }
            }}
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

      {/* Sons du Timer */}
      <Text style={styles.sectionLabel}>Sons du timer</Text>
      <Text style={styles.settingDescription}>
        Choisir le son de fin de timer
      </Text>
      <SoundPicker
        selectedSoundId={selectedSoundId}
        onSoundSelect={setSelectedSoundId}
      />

      {/* Mode Cadran */}
      <Text style={styles.sectionLabel}>Mode Cadran</Text>
      <Text style={styles.settingDescription}>
        Échelle maximale du minuteur
      </Text>
      <View style={styles.dialModeGrid}>
        {['1min', '5min', '10min', '25min', '45min', '60min'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.dialModeButton,
              scaleMode === mode && styles.dialModeButtonActive,
            ]}
            onPress={() => {
              haptics.selection().catch(() => {});
              setScaleMode(mode);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dialModeText,
                scaleMode === mode && styles.dialModeTextActive,
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
