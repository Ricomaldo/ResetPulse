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
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Static display, no animation
 * Fully accessible with live region announcements
 */
const DigitalTimer = React.memo(function DigitalTimer({
  remaining,
  isRunning,
  color,
  mini,
  showIcon,
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

  // Pill style: icon-only when mini, icon+time when expanded
  const pillHeight = mini ? rs(40) : rs(44);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      gap: mini ? 0 : rs(10),
      height: pillHeight,
      justifyContent: 'center',
      paddingHorizontal: mini ? rs(12) : rs(16),
    },
    icon: {
      color: theme.colors.brand.primary,
    },
    timeText: {
      color: color || theme.colors.primary,
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
      {showIcon && (
        <Ionicons name="settings-outline" size={rs(26)} color={theme.colors.brand.primary} />
      )}
      {!mini && <Text style={[styles.timeText, { opacity: textOpacity }]}>{formattedTime}</Text>}
    </View>
  );
});

DigitalTimer.propTypes = {
  color: PropTypes.string,
  isRunning: PropTypes.bool.isRequired,
  mini: PropTypes.bool,
  remaining: PropTypes.number.isRequired,
  showIcon: PropTypes.bool,
};

DigitalTimer.defaultProps = {
  color: undefined,
  mini: false,
  showIcon: false,
};

export default DigitalTimer;
