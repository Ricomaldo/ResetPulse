// src/components/modals/settings/SettingsThemeSection.jsx
import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import haptics from '../../../utils/haptics';

/**
 * Settings section for theme selection (light/dark/auto)
 */
const SettingsThemeSection = React.memo(function SettingsThemeSection({
  // Theme
  theme,
  // i18n
  t,
  // Styles
  styles,
  // Platform touchable
  Touchable,
  touchableProps,
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>🎨 Thème</Text>

      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionLabel}>{t('settings.appearance.theme')}</Text>
          <Text style={styles.optionDescription}>
            {theme.mode === 'auto'
              ? t('settings.appearance.themeDescriptionAuto')
              : theme.mode === 'dark'
                ? t('settings.appearance.themeDescriptionDark')
                : t('settings.appearance.themeDescriptionLight')}
          </Text>
        </View>
        <View style={styles.segmentedControl}>
          <Touchable
            style={[
              styles.segmentButton,
              theme.mode === 'light' && styles.segmentButtonActive,
            ]}
            onPress={() => {
              haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
              theme.setTheme('light');
            }}
            {...touchableProps}
          >
            <Text
              style={[
                styles.segmentText,
                theme.mode === 'light' && styles.segmentTextActive,
              ]}
            >
              {t('settings.appearance.themeLight')}
            </Text>
          </Touchable>
          <Touchable
            style={[
              styles.segmentButton,
              theme.mode === 'dark' && styles.segmentButtonActive,
            ]}
            onPress={() => {
              haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
              theme.setTheme('dark');
            }}
            {...touchableProps}
          >
            <Text
              style={[
                styles.segmentText,
                theme.mode === 'dark' && styles.segmentTextActive,
              ]}
            >
              {t('settings.appearance.themeDark')}
            </Text>
          </Touchable>
          <Touchable
            style={[
              styles.segmentButton,
              theme.mode === 'auto' && styles.segmentButtonActive,
            ]}
            onPress={() => {
              haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
              theme.setTheme('auto');
            }}
            {...touchableProps}
          >
            <Text
              style={[
                styles.segmentText,
                theme.mode === 'auto' && styles.segmentTextActive,
              ]}
            >
              {t('settings.appearance.themeAuto')}
            </Text>
          </Touchable>
        </View>
      </View>
    </View>
  );
});

SettingsThemeSection.propTypes = {
  theme: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    spacing: PropTypes.object.isRequired,
    setTheme: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
  Touchable: PropTypes.func.isRequired,
  touchableProps: PropTypes.object.isRequired,
};

export default SettingsThemeSection;
