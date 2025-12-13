// src/components/ControlButtons.jsx
import React, { forwardRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';
import { rs } from '../styles/responsive';
import { BUTTON, TOUCH } from './timer/timerConstants';

const ControlButtons = forwardRef(({ isRunning, onToggleRunning, onReset }, ref) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButton: {
      backgroundColor: theme.colors.brand.deep,
      width: rs(60, 'min'),
      height: rs(60, 'min'),
      borderRadius: rs(30, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow('lg'),
    },
  });

  return (
    <View ref={ref} style={styles.container}>
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            opacity: isRunning ? BUTTON.RUNNING_OPACITY : BUTTON.IDLE_OPACITY,
          },
        ]}
        onPress={onToggleRunning}
        activeOpacity={TOUCH.ACTIVE_OPACITY}
      >
        {isRunning ? (
          <PauseIcon size={24} color="white" />
        ) : (
          <PlayIcon size={24} color="white" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            backgroundColor: theme.colors.brand.neutral,
            transform: [{ scale: BUTTON.RESET_SCALE }],
          },
        ]}
        onPress={onReset}
        activeOpacity={TOUCH.ACTIVE_OPACITY}
      >
        <ResetIcon size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
});

ControlButtons.displayName = 'ControlButtons';

export default ControlButtons;
