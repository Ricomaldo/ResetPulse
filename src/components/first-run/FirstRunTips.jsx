/**
 * @fileoverview FirstRunTips — La Première fois (SCR-11→14, Lot 2 C7)
 * @description Overlay léger : un tip ancré à l'élément qu'il désigne (le
 * moment 1 vise l'espace ENTRE le cadran et la rangée, avec repli au-dessus
 * du cadran s'il n'y a pas la place — P1-7, cf. topOffsetForFirstMoment ;
 * les moments 2-4 restent au-dessus du disque — cf. useFirstRun), jamais un
 * formulaire. Se dismisse au geste attendu, jamais un bouton « suivant ».
 * « passer » discret en haut à droite, toujours disponible.
 * pointerEvents box-none : l'overlay ne capte aucun tap sauf « passer » —
 * le geste réel se joue sur les vrais éléments de l'écran, dessous.
 * zIndex volontairement sous celui d'AsideZone (50) : si le sheet s'ouvre
 * en plein flow, il recouvre naturellement le tip (cas de bord annoncé au
 * rapport, pas de plomberie dédiée).
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import logger from '../../utils/logger';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const TIP_GAP = rs(14, 'min');
// Fallback avant la première mesure (onLayout) de l'ancre réelle — évite
// un tip invisible le temps d'un frame. Utilisé pour les 4 moments (P1-7 :
// le moment 1 retombe désormais lui aussi sur le cadran, jamais la rangée
// seule — cf. topOffsetForFirstMoment).
const DIAL_FALLBACK_RATIO = 0.32;
// P1-7 (review design) : espace minimal requis entre le bas du cadran et le
// haut de la rangée pour que la bulle du moment 1 tienne ENTRE les deux
// sans mordre sur le cadran (repère 15) ni sur la rangée. Estimation
// généreuse pour un texte sur 1-2 lignes (fontSize 13/lineHeight 18 +
// paddingVertical spacing.sm ×2) — pas une mesure réelle de la bulle (elle
// n'est pas encore montée au moment du calcul), volontairement large pour
// rester du côté sûr.
const MIN_BETWEEN_GAP = rs(64, 'min');

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

// Moment 1 : la bulle vise l'espace ENTRE le bas du cadran et le haut de la
// rangée (CompactRow) — jamais ancrée seulement au haut de la rangée comme
// avant (ancien bug : TIP_GAP au-dessus de la rangée sans vérifier qu'il y
// avait la place, la bulle mordait sur le bas du cadran/repère 15). Ancrée
// au BAS mesuré du cadran (dialAnchor.y + height) : garantit qu'elle ne
// recouvre jamais le disque, quelle que soit sa hauteur réelle. Si l'écart
// mesuré entre les deux ancres est trop court (petit écran), retombe sur
// `null` — l'appelant bascule alors sur le même calcul « au-dessus du
// cadran » que les moments 2-4.
// `overlayTopY` (mesuré via measureInWindow, cf. composant) corrige le
// décalage d'espace de coordonnées : barAnchor/dialAnchor sont en
// coordonnées FENÊTRE (measureInWindow, TimerScreen), mais ce composant
// pose son `top` en coordonnées LOCALES à son parent — un View lui-même
// inséré dans la SafeAreaView de TimerScreen, décalée du haut réel de
// l'écran (~50-60pt sur devices à encoche ; même piège documenté dans
// AsideZone.jsx pour CLOSED_VISIBLE). Sans cette correction, la bulle
// atterrit ~50-60pt plus bas que prévu — vers la rangée, jamais vers le
// cadran (le sens dangereux), mais assez pour la faire toucher la rangée
// sur ces devices. Repli à 0 avant la première mesure (avant montage,
// hypothèse overlay = haut d'écran — cas le plus fréquent en pratique,
// TimerScreen n'a pas de chrome persistant au-dessus de son container).
function topOffsetForFirstMoment(barAnchor, dialAnchor, overlayTopY) {
  if (!dialAnchor) {
    return null;
  }
  const dialBottom = dialAnchor.y + dialAnchor.height;
  const gapAvailable = barAnchor ? barAnchor.y - dialBottom : Infinity;
  if (gapAvailable < MIN_BETWEEN_GAP) {
    return null;
  }
  return dialBottom + TIP_GAP - overlayTopY;
}

export default function FirstRunTips({ moment, barAnchor, dialAnchor, onSkip }) {
  const theme = useTheme();
  const t = useTranslation();

  // Diagnostic (C7) : distingue « le hook dit moment=X » de « le composant
  // ne monte rien » — à retirer une fois le mystère élucidé (cf. useFirstRun).
  useEffect(() => {
    logger.log('[FirstRunTips] render', { moment, hasBarAnchor: !!barAnchor, hasDialAnchor: !!dialAnchor });
  }, [moment, barAnchor, dialAnchor]);

  // P1-7 : position FENÊTRE réelle du haut de cet overlay — corrige le
  // décalage entre les ancres (measureInWindow, TimerScreen) et le repère
  // local de ce composant (cf. commentaire de topOffsetForFirstMoment).
  // Repli 0 avant la première mesure : aucun chrome persistant connu
  // au-dessus du container de TimerScreen à ce stade du flow (seuil).
  const overlayRef = useRef(null);
  const [overlayTopY, setOverlayTopY] = useState(0);
  const handleOverlayLayout = () => {
    overlayRef.current?.measureInWindow((x, y) => {
      setOverlayTopY(y);
    });
  };

  if (!moment) {
    return null;
  }

  // Moment 1 : d'abord la place ENTRE cadran et rangée (P1-7). Sans cette
  // place (petit écran, ou anchors pas encore mesurées), repli identique
  // aux moments 2-4 : au-dessus du cadran (dialAnchor + DIAL_FALLBACK_RATIO)
  // — jamais l'ancien calcul qui ancrait au haut de la rangée sans jamais
  // vérifier la présence du cadran.
  const topBetween = moment === 1 ? topOffsetForFirstMoment(barAnchor, dialAnchor, overlayTopY) : null;
  const tipPositionStyle = topBetween !== null
    ? { top: topBetween }
    : { bottom: bottomOffsetFromAnchor(dialAnchor, DIAL_FALLBACK_RATIO) };

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
    // Couple inversé `text`/`background` (retour Eric 03/08) : en light la
    // bulle reste brun chaud (texte crème) ; en dark `text` est CLAIR → la
    // bulle devient surface claire, texte sombre. L'ancien `fixed.white`
    // donnait blanc sur blanc en dark. Contraste AA dans les deux thèmes.
    tip: {
      alignSelf: 'center',
      backgroundColor: theme.colors.text,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: theme.borderRadius.lg,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      maxWidth: '76%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      position: 'absolute',
      ...theme.shadow('md'),
    },
    tipText: {
      color: theme.colors.background,
      fontSize: rs(13, 'min'),
      lineHeight: rs(18, 'min'),
      textAlign: 'left',
    },
  });

  return (
    <View ref={overlayRef} style={styles.overlay} pointerEvents="box-none" onLayout={handleOverlayLayout}>
      <View style={[styles.tip, tipPositionStyle]} pointerEvents="none">
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
