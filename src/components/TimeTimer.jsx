// src/components/TimeTimer.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { responsiveSize, getGoldenDimensions } from '../styles/layout';
import useTimer from '../hooks/useTimer';
import TimerCircle from './TimerCircle';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';

export default function TimeTimer() {
  const theme = useTheme();
  const { currentColor, clockwise, scaleMode } = useTimerOptions();
  
  // Initialize timer with 4 minutes default
  const timer = useTimer(4 * 60);
  
  // Get responsive dimensions using golden ratio
  const containerSize = responsiveSize(340);
  const circleSize = containerSize * 0.8; // 80% of container for circle
  const { width: buttonWidth, height: buttonHeight } = getGoldenDimensions(
    containerSize * 0.2,
    'rectangle'
  );
  
  const styles = StyleSheet.create({
    container: {
      width: containerSize,
      height: containerSize,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.md,
    },
    
    timerWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    
    messageOverlay: {
      position: 'absolute',
      top: '75%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    messageText: {
      fontSize: responsiveSize(16),
      fontWeight: 'bold',
      color: currentColor,
      textAlign: 'center',
    },
    
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    
    presetButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      minWidth: buttonWidth * 0.8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    presetButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    
    presetButtonText: {
      color: theme.colors.text,
      fontSize: responsiveSize(12),
      fontWeight: '500',
    },
    
    presetButtonTextActive: {
      color: 'black',
    },
    
    controlButton: {
      backgroundColor: theme.colors.surface,
      width: buttonWidth,
      height: buttonHeight,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
  });
  
  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View style={styles.timerWrapper}>
        <TimerCircle
          progress={timer.progress}
          color={currentColor}
          size={circleSize}
          clockwise={clockwise}
          scaleMode={scaleMode}
          duration={timer.duration}
        />
        
        {/* Message Overlay */}
        {timer.displayMessage && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>
              {timer.displayMessage}
            </Text>
          </View>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controlsRow}>
        {/* Preset Buttons */}
        <TouchableOpacity 
          style={[
            styles.presetButton,
            timer.duration === 240 && styles.presetButtonActive
          ]}
          onPress={() => timer.setPresetDuration(4)}
        >
          <Text style={[
            styles.presetButtonText,
            timer.duration === 240 && styles.presetButtonTextActive
          ]}>
            4m
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.presetButton,
            timer.duration === 1200 && styles.presetButtonActive
          ]}
          onPress={() => timer.setPresetDuration(20)}
        >
          <Text style={[
            styles.presetButtonText,
            timer.duration === 1200 && styles.presetButtonTextActive
          ]}>
            20m
          </Text>
        </TouchableOpacity>
        
        {/* Control Buttons */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={timer.toggleRunning}
        >
          {timer.running ? <PauseIcon size={20} color="white" /> : <PlayIcon size={20} color="white" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={timer.resetTimer}
        >
          <ResetIcon size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}