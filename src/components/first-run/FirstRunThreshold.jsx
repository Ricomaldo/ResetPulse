/**
 * @fileoverview FirstRunThreshold — ADR-016 §1, le seuil de la Première
 * fois : deux écrans chaleureux, zéro question.
 * @description PAS une restauration d'OnboardingLayout (machinerie 9
 * étapes morte) — un conteneur plein écran léger, deux pages, navigation
 * avant simple : pas de retour, pas de points de progression, pas de skip
 * séparé. Le CTA de la page 2 EST la sortie (onComplete).
 * - Page 1 (l'accueil qui respire) : reprend l'esprit visuel de l'ancien
 *   Filter-010 (BrandLogo + phrase, TimerDialPreview qui respire) — tap
 *   n'importe où fait avancer.
 * - Page 2 (la main tendue) : titre + TimerDialPreview (emoji 🧘) +
 *   PrimaryButton « Créer mon moment » → onComplete().
 * AUCUNE question, AUCUN choix, AUCUNE demande de permission (ADR-016 §1).
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import BrandLogo from '../layout/BrandLogo';
import { PrimaryButton } from '../buttons';
import TimerDialPreview from './TimerDialPreview';

const BREATH_SCALE = 1.06;
const BREATH_DURATION = 1800;
const DIAL_SIZE = rs(220, 'min');

// Respiration douce du cadran (esprit Filter-010) — respecte reduce-motion
// (public TDAH/TSA, cf. useReducedMotion) : figé à l'échelle 1 si actif.
function useBreathingScale() {
  const reduceMotionEnabled = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotionEnabled) {
      scaleAnim.setValue(1);
      return undefined;
    }
    let cancelled = false;
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: BREATH_SCALE,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!cancelled) {
          pulse();
        }
      });
    };
    pulse();
    return () => {
      cancelled = true;
    };
  }, [reduceMotionEnabled, scaleAnim]);

  return scaleAnim;
}

function ThresholdPageOne({ onNext }) {
  const theme = useTheme();
  const t = useTranslation();
  const scaleAnim = useBreathingScale();

  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.lg,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    logo: {
      opacity: 0.9,
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
        <BrandLogo size={rs(120)} style={styles.logo} />
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }} accessible={false}>
          <TimerDialPreview size={DIAL_SIZE} />
        </Animated.View>
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
        <TimerDialPreview size={DIAL_SIZE} centerEmoji="🧘" />
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
