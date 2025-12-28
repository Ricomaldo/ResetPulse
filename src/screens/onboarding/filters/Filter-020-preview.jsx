/**
 * Filter-020-preview - Visual timer preview + creation teaser
 * Shows animated timer dial to introduce the visual timer concept
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { PrimaryButton } from '../../../components/buttons';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';
import TimerDialPreview from '../../../components/onboarding/TimerDialPreview';
import { rs } from '../../../styles/responsive';
import { spacing } from '../../../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DIAL_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);

// Logo for center of dial preview
const LOGO = require('../../../../assets/logo/logo-1024-detoured.png');

export default function Filter020Preview({ onContinue }) {
  const t = useTranslation();
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      title={t('onboarding.v2.filter1.title')}
      subtitle={t('onboarding.v2.filter1.subtitle') || undefined}
      centerContent
      footer={
        <PrimaryButton
          label={t('onboarding.v2.filter1.cta')}
          onPress={onContinue}
          accessibilityHint={t('onboarding.v2.filter1.cta')}
        />
      }
    >
      {/* Static Timer Preview - 40% filled with logo */}
      <View style={styles.dialContainer}>
        <TimerDialPreview
          color={colors.brand.secondary}
          size={DIAL_SIZE}
          centerImage={LOGO}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  dialContainer: {
    marginVertical: rs(spacing.xl),
  },
});
