// src/components/modals/settings/SettingsTimerSection.jsx
import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { SoundPicker } from '../../pickers';
import haptics from '../../../utils/haptics';

/**
 * Settings section for timer configuration:
 * - Sound picker for completion alerts
 * - Dial mode selection (1min/5min/10min/25min/45min/60min)
 * - Rotation direction toggle (clockwise/counter-clockwise)
 * - Keep awake toggle (screen stays on during timer)
 */
const SettingsTimerSection = React.memo(function SettingsTimerSection({
  // Values
  selectedSoundId,
  scaleMode,
  clockwise,
  keepAwakeEnabled,
  // Setters
  setSelectedSoundId,
  setScaleMode,
  setClockwise,
  setKeepAwakeEnabled,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{t('settings.timer.title')}</Text>

      {/* Sons du Timer */}
      <Text style={styles.optionDescription}>
        {t('settings.timer.soundDescription')}
      </Text>
      <SoundPicker
        selectedSoundId={selectedSoundId}
        onSoundSelect={setSelectedSoundId}
      />

      {/* Mode Cadran */}
      <View style={[styles.optionRow, { marginTop: theme.spacing.md, flexDirection: 'column', alignItems: 'stretch' }]}>
        <View>
          <Text style={styles.optionLabel}>{t('settings.timer.dialMode')}</Text>
          <Text style={styles.optionDescription}>
            {scaleMode === '1min' && t('settings.timer.dialMode1')}
            {scaleMode === '5min' && t('settings.timer.dialMode5')}
            {scaleMode === '10min' && t('settings.timer.dialMode10')}
            {scaleMode === '25min' && t('settings.timer.dialMode25')}
            {scaleMode === '45min' && t('settings.timer.dialMode45')}
            {scaleMode === '60min' && t('settings.timer.dialMode60')}
          </Text>
        </View>
        <View style={styles.dialModeGrid}>
          {['1min', '5min', '10min', '25min', '45min', '60min'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.dialModeButton,
                scaleMode === mode && styles.dialModeButtonActive,
              ]}
              onPress={() => {
                haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
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
      </View>

      {/* Sens de Rotation */}
      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.timer.rotationDirection')}</Text>
          <Text style={styles.optionDescription}>
            {clockwise ? t('settings.timer.rotationClockwise') : t('settings.timer.rotationCounterClockwise')}
          </Text>
        </View>
        <Switch
          accessible={true}
          accessibilityLabel={t('accessibility.rotationDirection')}
          accessibilityRole="switch"
          accessibilityState={{ checked: clockwise }}
          value={clockwise}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setClockwise(value);
          }}
          {...theme.styles.switch(clockwise)}
        />
      </View>

      {/* Écran Toujours Allumé */}
      <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.timer.keepAwake')}</Text>
          <Text style={styles.optionDescription}>
            {keepAwakeEnabled
              ? t('settings.timer.keepAwakeDescriptionOn')
              : t('settings.timer.keepAwakeDescriptionOff')}
          </Text>
        </View>
        <Switch
          accessible={true}
          accessibilityLabel={t('accessibility.keepAwake')}
          accessibilityRole="switch"
          accessibilityState={{ checked: keepAwakeEnabled }}
          value={keepAwakeEnabled}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setKeepAwakeEnabled(value);
          }}
          {...theme.styles.switch(keepAwakeEnabled)}
        />
      </View>
    </View>
  );
});

export default SettingsTimerSection;
