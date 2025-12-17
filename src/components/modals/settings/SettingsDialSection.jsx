// src/components/modals/settings/SettingsDialSection.jsx
import React from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import PropTypes from 'prop-types';
import haptics from '../../../utils/haptics';

/**
 * Settings section for dial preferences (emoji + pulse)
 */
const SettingsDialSection = React.memo(function SettingsDialSection({
  // Values
  showActivityEmoji,
  shouldPulse,
  // Setters
  setShowActivityEmoji,
  setShouldPulse,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>⏱️ Dial</Text>

      {/* Emoji activité au centre */}
      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>Emoji activité au centre</Text>
          <Text style={styles.optionDescription}>
            {showActivityEmoji
              ? 'L\'emoji s\'affiche au centre du cadran'
              : 'L\'emoji est masqué'}
          </Text>
        </View>
        <Switch
          value={showActivityEmoji}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
            setShowActivityEmoji(value);
          }}
          {...theme.styles.switch(showActivityEmoji)}
        />
      </View>

      {/* Animation Pulse */}
      <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>Animation pulse</Text>
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
});

SettingsDialSection.propTypes = {
  showActivityEmoji: PropTypes.bool.isRequired,
  shouldPulse: PropTypes.bool.isRequired,
  setShowActivityEmoji: PropTypes.func.isRequired,
  setShouldPulse: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default SettingsDialSection;
