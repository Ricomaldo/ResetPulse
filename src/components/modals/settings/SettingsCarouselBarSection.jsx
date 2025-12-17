// src/components/modals/settings/SettingsCarouselBarSection.jsx
import React from 'react';
import { View, Text, Switch } from 'react-native';
import PropTypes from 'prop-types';
import haptics from '../../../utils/haptics';

/**
 * Settings section for CarouselBar configuration (zone carrousels bas)
 */
const SettingsCarouselBarSection = React.memo(function SettingsCarouselBarSection({
  // Values
  carouselBarConfig,
  // Setters
  setCarouselBarConfig,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  const toggleCarousel = (carouselId) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    const isEnabled = carouselBarConfig.includes(carouselId);

    // Mutually exclusive: only one carousel can be active at a time
    // If toggling ON: replace config with only this carousel
    // If toggling OFF: clear config
    const newConfig = isEnabled
      ? [] // Turn OFF: clear config
      : [carouselId]; // Turn ON: replace with only this carousel (disables other)

    setCarouselBarConfig(newConfig);
  };

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>🎠 Zone carrousels (bas)</Text>
      <Text style={styles.optionDescription}>
        Choisissez le carrousel affiché sous le cadran (1 max)
      </Text>

      {/* Activités */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Activités</Text>
        <Switch
          value={carouselBarConfig.includes('activities')}
          onValueChange={() => toggleCarousel('activities')}
          {...theme.styles.switch(carouselBarConfig.includes('activities'))}
        />
      </View>

      {/* Couleurs */}
      <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.optionLabel}>Couleurs</Text>
        <Switch
          value={carouselBarConfig.includes('palettes')}
          onValueChange={() => toggleCarousel('palettes')}
          {...theme.styles.switch(carouselBarConfig.includes('palettes'))}
        />
      </View>
    </View>
  );
});

SettingsCarouselBarSection.propTypes = {
  carouselBarConfig: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCarouselBarConfig: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default SettingsCarouselBarSection;
