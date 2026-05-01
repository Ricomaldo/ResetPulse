/**
 * @fileoverview PulseButton - Bouton principal ResetPulse
 *
 * Base simplifiée — couches d'animation à réajouter :
 *   [ ] breathing pulse (REST, shouldPulse)
 *   [ ] halos × 2 (RUNNING, shouldPulse)
 *   [ ] second hand + trail dots (RUNNING)
 *   [ ] interpolateColor + bounce (state transition)
 *   [ ] long-press progress circle (Reanimated useAnimatedProps + SVG)
 */
import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const DEFAULT_LONG_PRESS_DURATION = 2500;

const PulseButton = React.memo(function PulseButton({
  state = 'rest',
  emoji = null,
  activity = null,
  onTap,
  onLongPressComplete,
  size = 72,
  compact = false,
  stopRequiresLongPress = true,
  startRequiresLongPress = false,
  shouldPulse = false, // reserved — animation layer not yet wired
  clockwise = false,   // reserved — progress circle layer not yet wired
}) {
  const theme = useTheme();
  const t = useTranslation();
  const timerConfig = useTimerConfig();
  const longPressConfirmDuration = timerConfig?.longPressConfirmDuration ?? DEFAULT_LONG_PRESS_DURATION;
  const longPressStartDuration   = timerConfig?.longPressStartDuration   ?? DEFAULT_LONG_PRESS_DURATION;

  // === DIMENSIONS ===
  const buttonSize = compact ? rs(48, 'min') : rs(size, 'min');
  const iconSize   = compact ? rs(20, 'min') : rs(28, 'min');
  const emojiSize  = compact ? rs(24, 'min') : rs(48, 'min');

  // === COLOR ===
  const bgColor = state === 'running'
    ? theme.colors.brand.secondary + 'D9'
    : theme.colors.brand.primary + 'D9';

  // === CALLBACKS ===
  const completedRef = useRef(false);

  const handleTap = useCallback(() => {
    haptics.selection().catch(() => {});
    onTap?.();
  }, [onTap]);

  const handleLongPressStop = useCallback((event) => {
    if (event.nativeEvent.state !== State.ACTIVE) return;
    if (completedRef.current) return;
    completedRef.current = true;
    haptics.notification('warning').catch(() => {});
    onLongPressComplete?.();
  }, [onLongPressComplete]);

  const handleLongPressStart = useCallback((event) => {
    if (event.nativeEvent.state !== State.ACTIVE) return;
    if (completedRef.current) return;
    completedRef.current = true;
    haptics.notification('success').catch(() => {});
    onTap?.();
  }, [onTap]);

  const resetCompletion = useCallback(() => {
    completedRef.current = false;
  }, []);

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
  const buttonView = (
    <View style={[styles.button, { backgroundColor: bgColor }]}>
      {renderContent()}
    </View>
  );

  const renderSimpleButton = () => (
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

  const renderLongPressStop = () => (
    <LongPressGestureHandler
      minDurationMs={longPressConfirmDuration}
      onHandlerStateChange={handleLongPressStop}
      onBegan={resetCompletion}
    >
      <View style={styles.container}>
        {buttonView}
      </View>
    </LongPressGestureHandler>
  );

  const renderLongPressStart = () => (
    <LongPressGestureHandler
      minDurationMs={longPressStartDuration}
      onHandlerStateChange={handleLongPressStart}
      onBegan={resetCompletion}
    >
      <View style={styles.container}>
        {buttonView}
      </View>
    </LongPressGestureHandler>
  );

  if (state === 'rest') {
    return startRequiresLongPress ? renderLongPressStart() : renderSimpleButton();
  }
  if (state === 'running') {
    return stopRequiresLongPress ? renderLongPressStop() : renderSimpleButton();
  }
  return renderSimpleButton();
});

PulseButton.displayName = 'PulseButton';

PulseButton.propTypes = {
  activity:               PropTypes.shape({ emoji: PropTypes.string }),
  clockwise:              PropTypes.bool,
  compact:                PropTypes.bool,
  emoji:                  PropTypes.string,
  onLongPressComplete:    PropTypes.func,
  onTap:                  PropTypes.func,
  shouldPulse:            PropTypes.bool,
  size:                   PropTypes.number,
  startRequiresLongPress: PropTypes.bool,
  state:                  PropTypes.oneOf(['rest', 'running', 'complete']),
  stopRequiresLongPress:  PropTypes.bool,
};

export default PulseButton;
