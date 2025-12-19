/**
 * @fileoverview Digital timer display showing MM:SS format
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - 2-state display
 * Expanded: Shows "MM:SS" time (tap = collapse)
 * Collapsed: Shows "⏱" icon (tap = expand)
 * Fully accessible with live region announcements
 */
const DigitalTimer = React.memo(function DigitalTimer({
  color,
  isCollapsed,
  isRunning,
  remaining,
  _pulseDuration, // Reserved for future use
}) {
  const theme = useTheme();
  const t = useTranslation();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const totalSeconds = Math.floor(seconds); // Ensure integer
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Pill dimensions
  const pillHeight = isCollapsed ? rs(40) : rs(44);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      gap: 0,
      height: pillHeight,
      justifyContent: 'center',
      paddingHorizontal: isCollapsed ? rs(12) : rs(16),
    },
    icon: {
      color: theme.colors.brand.secondary,
    },
    timeText: {
      color: theme.colors.brand.secondary,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: rs(24),
      fontWeight: '600',
      includeFontPadding: false,
      lineHeight: rs(28),
      textAlign: 'center',
      textAlignVertical: 'center',
    },
  });

  // Format time for display
  const formattedTime = formatTime(remaining);

  // Build accessibility label with time and status
  const timerStatus = isRunning
    ? t('accessibility.timer.timerRunning')
    : t('accessibility.timer.timerPaused');

  const accessibilityLabel = `${t('accessibility.timer.timeRemaining', {
    time: formattedTime,
  })}, ${timerStatus}`;

  const textOpacity = isRunning ? 1 : 0.7;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      accessibilityValue={{
        min: 0,
        max: remaining,
        now: remaining,
        text: formattedTime,
      }}
    >
      {isCollapsed ? (
        <Ionicons name="time-outline" size={rs(24)} style={styles.icon} />
      ) : (
        <Text style={[styles.timeText, { opacity: textOpacity }]}>{formattedTime}</Text>
      )}
    </View>
  );
});

DigitalTimer.propTypes = {
  color: PropTypes.string,
  isCollapsed: PropTypes.bool,
  isRunning: PropTypes.bool.isRequired,
  remaining: PropTypes.number.isRequired,
  _pulseDuration: PropTypes.number,
};

DigitalTimer.defaultProps = {
  color: undefined,
  isCollapsed: false,
  _pulseDuration: 800,
};

export default DigitalTimer;
