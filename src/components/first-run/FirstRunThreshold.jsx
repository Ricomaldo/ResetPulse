/**
 * @fileoverview FirstRunThreshold — ADR-016 §1, le seuil de la Première
 * fois : deux écrans chaleureux, zéro question.
 * @description PAS une restauration d'OnboardingLayout (machinerie 9
 * étapes morte) — un conteneur plein écran léger, deux pages, navigation
 * avant simple : pas de retour, pas de points de progression, pas de skip
 * séparé. Le CTA de la page 2 EST la sortie (onComplete).
 * - Page 1 (l'accueil qui émet) : PulseLogo (SEUL sujet animé de l'écran —
 *   des ondes qui naissent au centre et s'estompent, pas un cadran qui
 *   respire) + phrase + hint discret de progression en bas. Tap n'importe
 *   où fait avancer.
 * - Page 2 (la main tendue) : titre + TimerDialPreview STATIQUE (emoji de
 *   l'activité par défaut réelle, via TimerConfigContext) + PrimaryButton
 *   « Créer mon moment » → onComplete().
 * AUCUNE question, AUCUN choix, AUCUNE demande de permission (ADR-016 §1).
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import PulseLogo from './PulseLogo';
import { PrimaryButton } from '../buttons';
import TimerDialPreview from './TimerDialPreview';

const DIAL_SIZE = rs(220, 'min');
const LOGO_SIZE = rs(120);
const DEFAULT_ACTIVITY_EMOJI = '🧘';

function ThresholdPageOne({ onNext }) {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.lg,
      justifyContent: 'center',
    },
    hint: {
      color: theme.colors.textSecondary,
      fontSize: rs(13),
      textAlign: 'center',
    },
    page: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.light,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={styles.page}
      onPress={onNext}
      activeOpacity={0.9}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t('welcome.title')}
      testID="firstRun.threshold.page1"
    >
      <View style={styles.center}>
        <View style={styles.content}>
          <PulseLogo size={LOGO_SIZE} />
          <Text style={styles.title}>{t('welcome.title')}</Text>
        </View>
        <Text style={styles.hint}>{t('firstRun.thresholdHint')}</Text>
      </View>
    </TouchableOpacity>
  );
}

ThresholdPageOne.propTypes = {
  onNext: PropTypes.func.isRequired,
};

function ThresholdPageTwo({ onComplete }) {
  const theme = useTheme();
  const t = useTranslation();
  const { timer } = useTimerConfig();
  const activityEmoji = timer?.currentActivity?.emoji || DEFAULT_ACTIVITY_EMOJI;

  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.lg,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    cta: {
      marginTop: theme.spacing.lg,
      minWidth: rs(200),
    },
    page: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.light,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.page} testID="firstRun.threshold.page2">
      <View style={styles.center}>
        <Text style={styles.title}>{t('onboarding.v2.filter1.title')}</Text>
        <TimerDialPreview size={DIAL_SIZE} centerEmoji={activityEmoji} />
        <PrimaryButton
          label={t('onboarding.creation.cta')}
          onPress={onComplete}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

ThresholdPageTwo.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default function FirstRunThreshold({ onComplete }) {
  const theme = useTheme();
  const [page, setPage] = useState(1);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
  });

  return (
    <View style={styles.container} testID="firstRun.threshold">
      {page === 1 ? (
        <ThresholdPageOne onNext={() => setPage(2)} />
      ) : (
        <ThresholdPageTwo onComplete={onComplete} />
      )}
    </View>
  );
}

FirstRunThreshold.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
