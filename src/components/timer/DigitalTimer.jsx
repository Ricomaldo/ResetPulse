/**
 * @fileoverview Digital timer display showing MM:SS format
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Static display, no animation
 * Fully accessible with live region announcements
 */
const DigitalTimer = React.memo(function DigitalTimer({ remaining, isRunning, color, mini }) {
  const theme = useTheme();
  const t = useTranslation();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const totalSeconds = Math.floor(seconds); // Ensure integer
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.dialFill,
      borderColor: theme.colors.brand.neutral,
      borderRadius: mini ? rs(12) : rs(35),
      borderWidth: mini ? 2 : 1,
      justifyContent: 'center',
      minHeight: mini ? rs(12) : undefined,
      minWidth: mini ? rs(32) : undefined,
      paddingHorizontal: mini ? rs(12) : rs(20),
      paddingVertical: mini ? rs(4) : rs(8),
    },
    timeText: {
      color: color || theme.colors.brand.primary,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: mini ? rs(1) : rs(32, 'min'),
      fontWeight: fontWeights.semibold,
      includeFontPadding: false,
      lineHeight: mini ? undefined : rs(40, 'min'),
      opacity: mini ? 0 : 1,
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

  const accessibilityLabel = `${t('accessibility.timer.timeRemaining', { time: formattedTime })}, ${timerStatus}`;

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
      <Text style={[styles.timeText, { opacity: textOpacity }]}>
        {formattedTime}
      </Text>
    </View>
  );
});

DigitalTimer.propTypes = {
  color: PropTypes.string,
  isRunning: PropTypes.bool.isRequired,
  mini: PropTypes.bool,
  remaining: PropTypes.number.isRequired,
};

DigitalTimer.defaultProps = {
  color: undefined,
  mini: false,
};

export default DigitalTimer;
