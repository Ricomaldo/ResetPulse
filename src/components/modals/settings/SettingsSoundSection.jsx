// src/components/modals/settings/SettingsSoundSection.jsx
import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { SoundPicker } from '../../pickers';

/**
 * Settings section for sound configuration
 */
const SettingsSoundSection = React.memo(function SettingsSoundSection({
  // Values
  selectedSoundId,
  // Setters
  setSelectedSoundId,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>🔊 Son</Text>
      <Text style={styles.optionDescription}>
        {t('settings.timer.soundDescription')}
      </Text>
      <SoundPicker
        selectedSoundId={selectedSoundId}
        onSoundSelect={setSelectedSoundId}
      />
    </View>
  );
});

SettingsSoundSection.propTypes = {
  selectedSoundId: PropTypes.string.isRequired,
  setSelectedSoundId: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default SettingsSoundSection;
