/**
 * @fileoverview AboutSection - About app
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import SettingsCard from './SettingsCard';
import { CardTitle } from './CardTitle';

/**
 * AboutSection - App info
 */
function AboutSection() {
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

  return (
    <>
      {/* About Section */}
      <SettingsCard title={<CardTitle Icon={Info} label={t('settings.about.title')} theme={theme} />}>
        {/* App info */}
        <View style={[styles.optionRow, styles.optionRowLast]}>
          <Text style={styles.label}>{t('settings.about.appName')}</Text>
          <Text style={styles.description}>
            {t('settings.about.appDescription')}
          </Text>
          <Text style={[styles.description, { marginTop: rs(8) }]}>
            {t('settings.about.version')} 2.1.6
          </Text>
        </View>
      </SettingsCard>
    </>
  );
}

export default AboutSection;
