/**
 * @fileoverview PulseButton - Bouton principal ResetPulse
 * Tap franc sur les 3 états (ADR-014 recentrage — la pression sensible sort).
 *
 * Base simplifiée — couches d'animation à réajouter :
 *   [ ] breathing pulse (REST, shouldPulse)
 *   [ ] halos × 2 (RUNNING, shouldPulse)
 *   [ ] second hand + trail dots (RUNNING)
 *   [ ] interpolateColor + bounce (state transition)
 */
import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const PulseButton = React.memo(function PulseButton({
  state = 'rest',
  emoji = null,
  activity = null,
  onTap,
  size = 72,
  compact = false,
  shouldPulse = false, // reserved — animation layer not yet wired
  clockwise = false,   // reserved — animation layer not yet wired
}) {
  const theme = useTheme();
  const t = useTranslation();

  // === DIMENSIONS ===
  const buttonSize = compact ? rs(48, 'min') : rs(size, 'min');
  const iconSize   = compact ? rs(20, 'min') : rs(28, 'min');
  const emojiSize  = compact ? rs(24, 'min') : rs(48, 'min');

  // === COLOR ===
  const bgColor = state === 'running'
    ? theme.colors.brand.secondary + 'D9'
    : theme.colors.brand.primary + 'D9';

  const handleTap = useCallback(() => {
    haptics.selection().catch(() => {});
    onTap?.();
  }, [onTap]);

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
      borderRadius: buttonSize / 2,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
      ...theme.shadow('md'),
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
    const iconColor = theme.colors.fixed.white;
    switch (state) {
      case 'running':  return <StopIcon  size={iconSize} color={iconColor} />;
      case 'complete': return <ResetIcon size={iconSize} color={iconColor} />;
      default:         return <PlayIcon  size={iconSize} color={iconColor} />;
    }
  };

  const getAccessibilityLabel = () => {
    switch (state) {
      case 'running':  return t('accessibility.timer.stopTimer');
      case 'complete': return t('accessibility.timer.resetTimer');
      default:         return t('accessibility.timer.startTimer');
    }
  };

  // === RENDER ===
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={handleTap}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
      >
        {renderContent()}
      </TouchableOpacity>
    </View>
  );
});

PulseButton.displayName = 'PulseButton';

PulseButton.propTypes = {
  activity:    PropTypes.shape({ emoji: PropTypes.string }),
  clockwise:   PropTypes.bool,
  compact:     PropTypes.bool,
  emoji:       PropTypes.string,
  onTap:       PropTypes.func,
  shouldPulse: PropTypes.bool,
  size:        PropTypes.number,
  state:       PropTypes.oneOf(['rest', 'running', 'complete']),
};

export default PulseButton;
