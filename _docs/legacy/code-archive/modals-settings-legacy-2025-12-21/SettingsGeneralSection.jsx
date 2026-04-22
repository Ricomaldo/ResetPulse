// src/components/modals/settings/SettingsGeneralSection.jsx (archived 2025-12-21)
import React from 'react';
import { View, Text, Switch } from 'react-native';
import PropTypes from 'prop-types';
import haptics from '../../../src/utils/haptics';

/**
 * Settings section for general preferences (rotation + keep awake)
 */
const SettingsGeneralSection = React.memo(function SettingsGeneralSection({
  // Values
  clockwise,
  keepAwakeEnabled,
  // Setters
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
      <Text style={styles.sectionTitle}>⚙️ Général</Text>

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

SettingsGeneralSection.propTypes = {
  clockwise: PropTypes.bool.isRequired,
  keepAwakeEnabled: PropTypes.bool.isRequired,
  setClockwise: PropTypes.func.isRequired,
  setKeepAwakeEnabled: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default SettingsGeneralSection;


