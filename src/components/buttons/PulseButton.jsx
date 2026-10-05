/**
 * @fileoverview PulseButton - Centre visuel du disque ResetPulse
 * Purement visuel depuis C6.2 (fidélité au rendu) : le tap appartient au
 * disque entier (`TimerDial.handleTapOnGraduation`, seule autorité — évite
 * le double-déclenchement start→stop d'un ancien second `TouchableOpacity`
 * ici). Petit disque discret dans la couleur courante (`color`), jamais
 * translucide — le fantôme play-button (fond fixe + ombre marquée) meurt.
 *
 * Mouvements MOT-a→e via useEmojiMovement (Lot 3a) + halo qui respire
 * (useBreathingHalo — le pulse originel de l'app, restauré sur retour Eric ;
 * la trotteuse legacy reste abandonnée, hors spec recentrage).
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import PropTypes from 'prop-types';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import useEmojiMovement from '../dial/movements/useEmojiMovement';
import useBreathingHalo from '../dial/movements/useBreathingHalo';
import { ENOW_HALO_WAVE, ENOW_HUB_PIVOT, ENOW_HUB_TRANSPARENT, ENOW_SWAP_INK, ENOW_FURNITURE_INK } from '../../config/enow-sketch';
import HubFrontEmoji from '../dial/dial/HubFrontEmoji';

const DEFAULT_TEMPO = 800; // repli si l'activité ne porte pas de pulseDuration
const HALO_TEMPO = 1100; // rythme UNIQUE du halo (période 2,2s = HALO_TEMPO×2, useBreathingHalo) — indépendant du pulseDuration de l'Activité (verdict Eric hotfix-porte-1 B1/D1)

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PulseButton = React.memo(function PulseButton({
  state = 'rest',
  emoji = null,
  activity = null,
  color = null,
  size = 72,
  compact = false,
  shouldPulse = false,
  clockwise = false,   // reserved — dial rotation direction, no movement use yet
  distraction = null,
  haloPeriod = 1000,   // T3-2 : période de l'onde (ms)
  haloRipple = false,  // T3-2 : onde creuse (display.haloRipple)
  haloMaxScale = 3,    // T3-2 : scale du halo à la bordure du cadran
  emojiMotion = true,  // T3-2 : mouvements de l'emoji (réglage display.emojiMotion)
  frontProgress = null, // T3-2 : si non null, l'emoji est traversé par le front
}) {
  const theme = useTheme();

  // === MOUVEMENT ===
  // Lambda R2 Q1 (verdict Eric 05/08) : « le mouvement au repos est
  // trompeur, il dit que ça tourne » — le breathe ne vit plus QU'EN SÉANCE
  // (running). L'ancien verdict porte-3 V1 (« repos ET séance, même souffle
  // partout ») est caduc : au repos l'emoji reste immobile, jamais de
  // breathe même quand `shouldPulse` est vrai (le paramètre reste porté par
  // les appelants — cf. propTypes — mais ne pilote plus rien ici). La table
  // mouvement-par-activité ne pilote plus l'ambiance ; les 5 mouvements
  // MOT-a→e ne vivent plus que dans le dé (Distraction), où la variété est
  // une joie. Le champ `movement` des activités reste en données (choix
  // libre par rituel, parqué Ambiances). COMPLETE : aucun mouvement (le
  // bloom du dial porte la fin). La Distraction (`{ movement, variant }`)
  // override quand active, au tempo de l'Activité — `useEmojiMovement`
  // coupe tout si reduce motion.
  const activityTempo = activity?.pulseDuration || DEFAULT_TEMPO;
  let movement = null;
  let movementActive = false;
  let tempo = activityTempo;
  if (distraction?.movement) {
    movement = distraction.movement;
    movementActive = true;
  } else if (state === 'running') {
    // Halo (ci-dessous) et breathe de l'emoji ne coexistent plus QU'EN
    // running désormais (Q1 a tué le breathe au repos) — la synchro de
    // phase par demi-période (cf. useBreathingHalo) reste valide telle
    // quelle : les deux widgets partagent HALO_TEMPO dans ce seul état.
    movement = 'breathe';
    movementActive = true;
    tempo = HALO_TEMPO;
  }
  const emojiAnimatedStyle = useEmojiMovement({
    movement,
    tempo,
    active: movementActive,
    variant: distraction?.variant ?? null,
  });

  // === HALO (le pouls de la séance, restauré — retour Eric) ===
  // Anneau couleur courante qui s'étend et s'estompe autour du hub : il se
  // lance au tap start et bat tant que le temps s'écoule — la preuve visible
  // que le timer vit. RUNNING uniquement, piloté par `shouldPulse`
  // (optionnel mais standard), jamais en compact.
  // Rythme UNIQUE (hotfix-porte-1 B1/D1, verdict Eric) : le halo bat au pouls
  // de la SÉANCE, pas de l'Activité — HALO_TEMPO fixe, jamais `tempo`. Le
  // mouvement de l'emoji (useEmojiMovement ci-dessus) garde son tempo propre.
  const haloActive = state === 'running' && shouldPulse && !compact;
  const { style: haloAnimatedStyle, animatedProps: haloRippleProps } = useBreathingHalo({
    tempo: HALO_TEMPO,
    active: haloActive,
    wavePeriod: haloPeriod,
    waveMaxScale: haloMaxScale,
    ripple: haloRipple,
    rippleRadius: (buttonSize / 2) * haloMaxScale,
  });

  // === DIMENSIONS ===
  // Hub structurel (verdicts CD 25/07) : Ø = 34 % du cadran (fourni par
  // TimerDial via `size`), emoji = 20 % du cadran → 0.59 × hub.
  const buttonSize = compact ? rs(48, 'min') : size;
  const iconSize   = compact ? rs(20, 'min') : buttonSize * 0.42;
  const emojiSize  = compact ? rs(24, 'min') : buttonSize * 0.59;
  const badgeSize  = emojiSize * 0.35; // badge ✨ fin de séance (hotfix-porte-1 B4/D2)

  // === COLOR ===
  // Hub = CLAIRIÈRE DU CADRAN (verdicts CD Q1) : fond crème #F4EFE7 — pas un
  // sticker blanc. Plat, liseré interne discret, zéro ombre portée.
  // Dark (retour Eric 04/08) : `background` (#1A1A1A) creusait un trou
  // noir pur au centre du disque — `surface` (anthracite plus chaud) garde
  // la clairière lisible sans dureté. Light : clairière crème inchangée
  // (verdicts CD Q1).
  const bgColor = theme.isDark ? theme.colors.surface : theme.colors.background;

  // === STYLES ===
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
    button: {
      alignItems: 'center',
      // Liseré interne 1px, ZÉRO ombre portée (verdicts CD Q1 : hub plat,
      // « clairière », pas d'effet autocollant).
      borderColor: 'rgba(0,0,0,0.06)',
      borderRadius: buttonSize / 2,
      borderWidth: 1,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
    emoji: {
      textAlign: 'center',
    },
    halo: {
      borderRadius: buttonSize / 2,
      height: buttonSize,
      position: 'absolute',
      width: buttonSize,
    },
    completionBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    completionBadgeEmoji: {
      textAlign: 'center',
    },
  });

  // === CONTENT ===
  const renderContent = () => {
    const displayEmoji = emoji || activity?.emoji;
    if (displayEmoji && frontProgress != null) {
      return (
        <Animated.View style={emojiMotion ? emojiAnimatedStyle : undefined}>
          <HubFrontEmoji
            emoji={displayEmoji}
            size={buttonSize}
            clockwise={clockwise}
            frontProgress={frontProgress}
          />
        </Animated.View>
      );
    }
    if (displayEmoji) {
      return (
        <Animated.View style={emojiMotion ? emojiAnimatedStyle : undefined}>
          <Text style={[styles.emoji, { fontSize: emojiSize }]}>{displayEmoji}</Text>
        </Animated.View>
      );
    }
    if (ENOW_HUB_PIVOT) {
      // Pivot d'aiguille : puce ronde dans les trois états.
      const pivot = buttonSize * 0.14;
      return (
        <View
          style={{
            width: pivot,
            height: pivot,
            borderRadius: pivot / 2,
            backgroundColor: ENOW_SWAP_INK ? theme.colors[ENOW_FURNITURE_INK] : (color || theme.colors.text),
          }}
        />
      );
    }
    const iconColor = color || theme.colors.text; // fond surface désormais — icône sombre ou couleur courante
    switch (state) {
    case 'running':  return <StopIcon  size={iconSize} color={iconColor} />;
    case 'complete': return <ResetIcon size={iconSize} color={iconColor} />;
    default:         return <PlayIcon  size={iconSize} color={iconColor} />;
    }
  };

  // === RENDER ===
  // Décoratif : le disque entier (TimerDial) porte l'accessibilité (rôle
  // 'adjustable'/'timer' + action 'activate') — ce View ne doit pas être un
  // arrêt VoiceOver séparé.
  const haloColor = color || theme.colors.text;
  const rippleR = (buttonSize / 2) * haloMaxScale;
  return (
    <View style={styles.container} accessible={false} importantForAccessibility="no">
      {ENOW_HALO_WAVE && haloRipple ? (
        // Onde creuse en SVG (borderWidth animé : rien à l'écran en New Arch).
        // Carré de côté 2R centré sur le moyeu, jamais coupé (overflow visible).
        haloActive && (
          <Svg
            pointerEvents="none"
            width={2 * rippleR}
            height={2 * rippleR}
            overflow="visible"
            style={{ position: 'absolute', left: buttonSize / 2 - rippleR, top: buttonSize / 2 - rippleR }}
            accessible={false}
            importantForAccessibility="no"
          >
            <AnimatedCircle
              cx={rippleR}
              cy={rippleR}
              fill="none"
              stroke={haloColor}
              opacity={0.18}
              animatedProps={haloRippleProps}
            />
          </Svg>
        )
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[styles.halo, { backgroundColor: haloColor }, haloAnimatedStyle]}
        />
      )}
      <View
        style={[
          styles.button,
          ENOW_HUB_TRANSPARENT
            ? { backgroundColor: 'transparent', borderWidth: 0 }
            : { backgroundColor: bgColor },
        ]}
      >
        {renderContent()}
        {/* ✨ fin de séance = badge superposé, coin haut-droit du hub — l'emoji
            d'activité reste SEUL plein cadre dans le Text (hotfix-porte-1
            B4/D2 : la concaténation `${emoji}✨` débordait le Text pensé pour
            UN caractère). pointerEvents none, aucun impact accessibilité (le
            hub est déjà `accessible={false}` ci-dessus). */}
        {state === 'complete' && (
          <View
            pointerEvents="none"
            style={[
              styles.completionBadge,
              { width: badgeSize, height: badgeSize, top: -badgeSize * 0.15, right: -badgeSize * 0.15 },
            ]}
          >
            <Text style={[styles.completionBadgeEmoji, { fontSize: badgeSize }]}>✨</Text>
          </View>
        )}
      </View>
    </View>
  );
});

PulseButton.displayName = 'PulseButton';

PulseButton.propTypes = {
  activity:            PropTypes.shape({
    emoji: PropTypes.string,
    movement: PropTypes.string,
    pulseDuration: PropTypes.number,
  }),
  clockwise:           PropTypes.bool,
  color:               PropTypes.string,
  compact:             PropTypes.bool,
  distraction:         PropTypes.shape({
    movement: PropTypes.string,
    variant: PropTypes.object,
  }),
  emoji:               PropTypes.string,
  emojiMotion:         PropTypes.bool,
  haloMaxScale:        PropTypes.number,
  haloRipple:          PropTypes.bool,
  haloPeriod:          PropTypes.number,
  frontProgress:       PropTypes.number,
  shouldPulse:         PropTypes.bool,
  size:                PropTypes.number,
  state:               PropTypes.oneOf(['rest', 'running', 'complete']),
};

export default PulseButton;
