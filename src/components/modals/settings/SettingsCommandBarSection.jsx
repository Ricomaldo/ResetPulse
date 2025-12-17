// src/components/modals/settings/SettingsCommandBarSection.jsx
import React from 'react';
import { View, Text, Switch } from 'react-native';
import PropTypes from 'prop-types';
import haptics from '../../../utils/haptics';

/**
 * Settings section for CommandBar configuration (zone commandes haut)
 */
const SettingsCommandBarSection = React.memo(function SettingsCommandBarSection({
  // Values
  commandBarConfig,
  // Setters
  setCommandBarConfig,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  const toggleCommand = (commandId) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    const isEnabled = commandBarConfig.includes(commandId);
    const newConfig = isEnabled
      ? commandBarConfig.filter((id) => id !== commandId)
      : [...commandBarConfig, commandId];
    setCommandBarConfig(newConfig);
  };

  return (
    <View style={styles.sectionCardPrimary}>
      <Text style={styles.sectionTitle}>🎛️ Zone commandes (haut)</Text>
      <Text style={styles.optionDescription}>
        Choisissez les commandes affichées au-dessus du cadran
      </Text>

      {/* Play/Pause */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Play / Pause</Text>
        <Switch
          value={commandBarConfig.includes('playPause')}
          onValueChange={() => toggleCommand('playPause')}
          {...theme.styles.switch(commandBarConfig.includes('playPause'))}
        />
      </View>

      {/* Reset */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Reset</Text>
        <Switch
          value={commandBarConfig.includes('reset')}
          onValueChange={() => toggleCommand('reset')}
          {...theme.styles.switch(commandBarConfig.includes('reset'))}
        />
      </View>

      {/* Rotation */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Rotation</Text>
        <Switch
          value={commandBarConfig.includes('rotation')}
          onValueChange={() => toggleCommand('rotation')}
          {...theme.styles.switch(commandBarConfig.includes('rotation'))}
        />
      </View>

      {/* Presets cadran */}
      <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.optionLabel}>Presets cadran</Text>
        <Switch
          value={commandBarConfig.includes('presets')}
          onValueChange={() => toggleCommand('presets')}
          {...theme.styles.switch(commandBarConfig.includes('presets'))}
        />
      </View>
    </View>
  );
});

SettingsCommandBarSection.propTypes = {
  commandBarConfig: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCommandBarConfig: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default SettingsCommandBarSection;
