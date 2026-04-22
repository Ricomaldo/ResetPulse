/**
 * @fileoverview Toggle button for digital timer visibility
 * @created 2025-12-14
 * @updated 2025-12-14
 * @deprecated This component is no longer used - kept for reference
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import Svg, { Path } from 'react-native-svg';

function EyeIcon({ size = 24, color, isVisible }) {
  if (isVisible) {
    // Eye open
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
          fill={color}
        />
        <Path
          d="M12 9.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          fill={color}
        />
      </Svg>
    );
  } else {
    // Eye closed
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
          fill={color}
        />
      </Svg>
    );
  }
}

export default function DigitalTimerToggle() {
  const theme = useTheme();
  const { showDigitalTimer, setShowDigitalTimer } = useTimerOptions();

  const styles = StyleSheet.create({
    button: {
      width: rs(40),
      height: rs(40),
      borderRadius: rs(20),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: showDigitalTimer ? theme.colors.brand.primary : theme.colors.border,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowDigitalTimer(!showDigitalTimer)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={showDigitalTimer ? 'Masquer le chrono' : 'Afficher le chrono'}
      accessibilityRole="button"
    >
      <EyeIcon
        size={20}
        color={showDigitalTimer ? theme.colors.brand.primary : theme.colors.textSecondary}
        isVisible={showDigitalTimer}
      />
    </TouchableOpacity>
  );
}
