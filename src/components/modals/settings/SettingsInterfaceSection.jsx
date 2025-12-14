// src/components/modals/settings/SettingsInterfaceSection.jsx
import React from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import haptics from '../../../utils/haptics';

/**
 * Settings section for interface preferences:
 * - Minimal interface toggle
 * - Digital timer display toggle
 * - Pulse animation toggle (with photosensitivity warning)
 */
export default function SettingsInterfaceSection({
  // Values
  useMinimalInterface,
  showDigitalTimer,
  shouldPulse,
  // Setters
  setUseMinimalInterface,
  setShowDigitalTimer,
  setShouldPulse,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  return (
    <View style={styles.sectionCardPrimary}>
      <Text style={styles.sectionTitle}>{t('settings.interface.title')}</Text>

      {/* Interface minimaliste */}
      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.interface.minimalInterface')}</Text>
          <Text style={styles.optionDescription}>
            {useMinimalInterface
              ? t('settings.interface.minimalInterfaceDescriptionOn')
              : t('settings.interface.minimalInterfaceDescriptionOff')}
          </Text>
        </View>
        <Switch
          accessible={true}
          accessibilityLabel={t('accessibility.minimalInterface')}
          accessibilityRole="switch"
          accessibilityState={{ checked: useMinimalInterface }}
          value={useMinimalInterface}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setUseMinimalInterface(value);
          }}
          {...theme.styles.switch(useMinimalInterface)}
        />
      </View>

      {/* Chrono Numérique */}
      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.interface.digitalTimer')}</Text>
          <Text style={styles.optionDescription}>
            {showDigitalTimer
              ? t('settings.interface.digitalTimerDescriptionOn')
              : t('settings.interface.digitalTimerDescriptionOff')}
          </Text>
        </View>
        <Switch
          value={showDigitalTimer}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setShowDigitalTimer(value);
          }}
          {...theme.styles.switch(showDigitalTimer)}
        />
      </View>

      {/* Animation Pulse */}
      <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.interface.pulseAnimation')}</Text>
          <Text style={styles.optionDescription}>
            {shouldPulse
              ? t('settings.interface.pulseAnimationDescriptionOn')
              : t('settings.interface.pulseAnimationDescriptionOff')}
          </Text>
        </View>
        <Switch
          value={shouldPulse}
          onValueChange={(value) => {
            if (value) {
              // Avertissement pour conformité épilepsie/photosensibilité
              Alert.alert(
                t('settings.interface.pulseWarningTitle'),
                t('settings.interface.pulseWarningMessage'),
                [
                  {
                    text: t('common.cancel'),
                    style: 'cancel',
                    onPress: () => {
                      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                    },
                  },
                  {
                    text: t('settings.interface.pulseWarningEnable'),
                    onPress: () => {
                      haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                      setShouldPulse(true);
                    },
                  },
                ],
                { cancelable: true }
              );
            } else {
              haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
              setShouldPulse(false);
            }
          }}
          {...theme.styles.switch(shouldPulse)}
        />
      </View>
    </View>
  );
}
