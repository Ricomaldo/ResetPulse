/**
 * @fileoverview PulseButton - Centre visuel du disque ResetPulse
 * Purement visuel depuis C6.2 (fidélité au rendu) : le tap appartient au
 * disque entier (`TimerDial.handleTapOnGraduation`, seule autorité — évite
 * le double-déclenchement start→stop d'un ancien second `TouchableOpacity`
 * ici). Petit disque discret dans la couleur courante (`color`), jamais
 * translucide — le fantôme play-button (fond fixe + ombre marquée) meurt.
 *
 * Base simplifiée — couches d'animation à réajouter :
 *   [ ] breathing pulse (REST, shouldPulse)
 *   [ ] halos × 2 (RUNNING, shouldPulse)
 *   [ ] second hand + trail dots (RUNNING)
 *   [ ] interpolateColor + bounce (state transition)
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';

const PulseButton = React.memo(function PulseButton({
  state = 'rest',
  emoji = null,
  activity = null,
  color = null,
  size = 72,
  compact = false,
  shouldPulse = false, // reserved — animation layer not yet wired
  clockwise = false,   // reserved — animation layer not yet wired
}) {
  const theme = useTheme();

  // === DIMENSIONS ===
  // Hub structurel (verdicts CD 25/07) : Ø = 34 % du cadran (fourni par
  // TimerDial via `size`), emoji = 20 % du cadran → 0.59 × hub.
  const buttonSize = compact ? rs(48, 'min') : size;
  const iconSize   = compact ? rs(20, 'min') : buttonSize * 0.42;
  const emojiSize  = compact ? rs(24, 'min') : buttonSize * 0.59;

  // === COLOR ===
  // Hub = CLAIRIÈRE DU CADRAN (verdicts CD Q1) : fond crème #F4EFE7 — pas un
  // sticker blanc. Plat, liseré interne discret, zéro ombre portée.
  const bgColor = theme.colors.background;

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
  });

  // === CONTENT ===
  const renderContent = () => {
    const displayEmoji = emoji || activity?.emoji;
    if (displayEmoji) {
      return <Text style={[styles.emoji, { fontSize: emojiSize }]}>{displayEmoji}</Text>;
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
  return (
    <View style={styles.container} accessible={false} importantForAccessibility="no">
      <View style={[styles.button, { backgroundColor: bgColor }]}>
        {renderContent()}
      </View>
    </View>
  );
});

PulseButton.displayName = 'PulseButton';

PulseButton.propTypes = {
  activity:    PropTypes.shape({ emoji: PropTypes.string }),
  clockwise:   PropTypes.bool,
  color:       PropTypes.string,
  compact:     PropTypes.bool,
  emoji:       PropTypes.string,
  shouldPulse: PropTypes.bool,
  size:        PropTypes.number,
  state:       PropTypes.oneOf(['rest', 'running', 'complete']),
};

export default PulseButton;
