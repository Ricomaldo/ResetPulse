/**
 * @fileoverview AboutSection - About app + Restart guide + Dev tools
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import SettingsCard from './SettingsCard';
import { CardTitle } from './CardTitle';

/**
 * AboutSection - App info + Restart onboarding guide + Dev tools
 *
 * @param {Function} resetOnboarding - Callback to reset onboarding
 * @param {Function} onClose - Callback to close settings
 */
function AboutSection({ resetOnboarding, onClose }) {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    optionRow: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      paddingVertical: rs(16),  // Responsive (was theme.spacing.md)
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    label: {
      color: theme.colors.text,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
      marginBottom: rs(4),  // Responsive (was theme.spacing.xs / 2)
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: rs(11, 'min'),
      lineHeight: rs(16, 'min'),
    },
  });

  const handleRestartGuide = () => {
    haptics.selection().catch(() => {});
    resetOnboarding();
    onClose();
  };

  return (
    <>
      {/* About Section */}
      <SettingsCard title={<CardTitle Icon={Info} label={t('settings.about.title')} theme={theme} />}>
        {/* App info */}
        <View style={styles.optionRow}>
          <Text style={styles.label}>{t('settings.about.appName')}</Text>
          <Text style={styles.description}>
            {t('settings.about.appDescription')}
          </Text>
          <Text style={[styles.description, { marginTop: rs(8) }]}>
            {t('settings.about.version')} 2.1.3
          </Text>
        </View>

        {/* Restart guide */}
        <TouchableOpacity
          style={[styles.optionRow, styles.optionRowLast]}
          onPress={handleRestartGuide}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>{t('onboarding.restartGuide')}</Text>
          <Text style={styles.description}>
            {t('onboarding.restartGuideDescription')}
          </Text>
        </TouchableOpacity>
      </SettingsCard>
    </>
  );
}

AboutSection.propTypes = {
  resetOnboarding: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AboutSection;
