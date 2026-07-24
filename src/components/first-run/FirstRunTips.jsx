/**
 * @fileoverview FirstRunTips — La Première fois (SCR-11→14, Lot 2 C7)
 * @description Overlay léger : un tip ancré à l'élément qu'il désigne (la
 * barre pour le moment 1, le disque pour les moments 2-4 — cf. useFirstRun),
 * jamais un formulaire. Se dismisse au geste attendu, jamais un bouton
 * « suivant ». « passer » discret en haut à droite, toujours disponible.
 * pointerEvents box-none : l'overlay ne capte aucun tap sauf « passer » —
 * le geste réel se joue sur les vrais éléments de l'écran, dessous.
 * zIndex volontairement sous celui d'AsideZone (50) : si le sheet s'ouvre
 * en plein flow, il recouvre naturellement le tip (cas de bord annoncé au
 * rapport, pas de plomberie dédiée).
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import logger from '../../utils/logger';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const TIP_GAP = rs(14, 'min');
// Fallbacks avant la première mesure (onLayout) des ancres réelles — évite
// un tip invisible le temps d'un frame.
const BAR_FALLBACK_RATIO = 0.62;
const DIAL_FALLBACK_RATIO = 0.32;

const MOMENT_KEYS = {
  1: 'firstRun.welcome',
  2: 'firstRun.companion',
  3: 'firstRun.dialColor',
  4: 'firstRun.ready',
};

function bottomOffsetFromAnchor(anchor, fallbackRatio) {
  const anchorTop = anchor ? anchor.y : WINDOW_HEIGHT * fallbackRatio;
  return WINDOW_HEIGHT - anchorTop + TIP_GAP;
}

export default function FirstRunTips({ moment, barAnchor, dialAnchor, onSkip }) {
  const theme = useTheme();
  const t = useTranslation();

  // Diagnostic (C7) : distingue « le hook dit moment=X » de « le composant
  // ne monte rien » — à retirer une fois le mystère élucidé (cf. useFirstRun).
  useEffect(() => {
    logger.log('[FirstRunTips] render', { moment, hasBarAnchor: !!barAnchor, hasDialAnchor: !!dialAnchor });
  }, [moment, barAnchor, dialAnchor]);

  if (!moment) {
    return null;
  }

  const anchor = moment === 1 ? barAnchor : dialAnchor;
  const fallbackRatio = moment === 1 ? BAR_FALLBACK_RATIO : DIAL_FALLBACK_RATIO;
  const bottom = bottomOffsetFromAnchor(anchor, fallbackRatio);

  const styles = StyleSheet.create({
    overlay: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 40, // sous AsideZone (50) : occulté si le sheet s'ouvre
    },
    // Pill « passer » : lisible (fond surface + ombre), sous la status bar —
    // l'ancien texte gris nu se perdait sous la batterie (porte Eric 25/07).
    skip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 999,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      position: 'absolute',
      right: theme.spacing.md,
      top: rs(58, 'min'),
      ...theme.shadow('sm'),
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
    },
    // Bulle CD (SCR-11) : brun chaud, coins arrondis avec une QUEUE vers
    // l'élément désigné (coin bas-gauche quasi net), largeur contenue —
    // jamais une barre pleine largeur (porte Eric 25/07).
    tip: {
      alignSelf: 'center',
      backgroundColor: theme.colors.text,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: theme.borderRadius.lg,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      bottom,
      maxWidth: '76%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      position: 'absolute',
      ...theme.shadow('md'),
    },
    tipText: {
      color: theme.colors.fixed.white,
      fontSize: rs(13, 'min'),
      lineHeight: rs(18, 'min'),
      textAlign: 'left',
    },
  });

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.tip} pointerEvents="none">
        <Text style={styles.tipText} accessible accessibilityRole="text">
          {t(MOMENT_KEYS[moment])}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.skip}
        onPress={onSkip}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t('firstRun.skip')}
        activeOpacity={0.6}
      >
        <Text style={styles.skipText}>{t('firstRun.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}
