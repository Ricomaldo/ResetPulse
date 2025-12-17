// src/dev/components/DevFab.jsx
// FAB wrench avec mini-menu pour switcher le mode premium (dev only)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { SHOW_DEV_FAB } from '../../config/test-mode';
import { fontWeights } from '../../theme/tokens';
import { devColors } from '../../theme/colors';

/**
 * Dev FAB component for toggling premium mode during testing
 * @param {boolean} isPremiumMode - Current premium mode state
 * @param {Function} onPremiumChange - Callback to change premium mode
 * @param {Function} onResetOnboarding - Callback to reset onboarding
 * @param {Function} onGoToApp - Callback to go to app
 */
export default function DevFab({
  isPremiumMode,
  onPremiumChange,
  onResetOnboarding,
  onGoToApp,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));

  if (!SHOW_DEV_FAB) {return null;}

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(menuAnim, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleOptionPress = (action) => {
    action();
    toggleMenu();
  };

  const menuTranslateY = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>{isOpen ? '✕' : '🔧'}</Text>
      </TouchableOpacity>

      {/* Menu popup (below FAB) */}
      <Animated.View
        style={[
          styles.menu,
          {
            opacity: menuOpacity,
            transform: [{ translateY: menuTranslateY }],
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Premium toggle */}
        <View style={styles.menuSection}>
          <Text style={styles.menuLabel}>Mode</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isPremiumMode && styles.toggleButtonActive,
              ]}
              onPress={() => handleOptionPress(() => onPremiumChange(false))}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isPremiumMode && styles.toggleTextActive,
                ]}
              >
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isPremiumMode && styles.toggleButtonActive,
              ]}
              onPress={() => handleOptionPress(() => onPremiumChange(true))}
            >
              <Text
                style={[
                  styles.toggleText,
                  isPremiumMode && styles.toggleTextActive,
                ]}
              >
                Premium
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {isPremiumMode ? '⭐ Premium' : '🆓 Free'}
          </Text>
        </View>

        {/* Onboarding Controls */}
        {(onResetOnboarding || onGoToApp) && (
          <View style={styles.menuSection}>
            <Text style={styles.menuLabel}>Onboarding</Text>
            <View style={styles.buttonRow}>
              {onResetOnboarding && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.resetButton]}
                  onPress={() => handleOptionPress(onResetOnboarding)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>🔄 Reset</Text>
                </TouchableOpacity>
              )}
              {onGoToApp && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.goToAppButton]}
                  onPress={() => handleOptionPress(onGoToApp)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>→ App</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  actionText: {
    color: devColors.white,
    fontSize: 13,
    fontWeight: fontWeights.semibold,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  container: {
    alignItems: 'flex-start',
    left: 20,
    position: 'absolute',
    top: 60,
    zIndex: 9999,
  },

  fab: {
    alignItems: 'center',
    backgroundColor: devColors.devBg,
    borderColor: devColors.devBorder,
    borderRadius: 28,
    borderWidth: 2,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    shadowColor: devColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },

  fabIcon: {
    fontSize: 24,
  },

  fabOpen: {
    backgroundColor: devColors.devBorderLight,
    borderColor: devColors.devBorderDark,
  },

  goToAppButton: {
    backgroundColor: devColors.success,
  },

  menu: {
    backgroundColor: devColors.devBg,
    borderColor: devColors.devBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    marginTop: 12,
    minWidth: 180,
    padding: 16,
    shadowColor: devColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  menuLabel: {
    color: devColors.textSecondary,
    fontSize: 11,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  menuSection: {
    marginBottom: 12,
  },

  resetButton: {
    backgroundColor: devColors.danger,
  },

  statusRow: {
    alignItems: 'center',
    borderTopColor: devColors.devBorder,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 8,
  },

  statusText: {
    color: devColors.textTertiary,
    fontSize: 14,
  },

  toggleButton: {
    alignItems: 'center',
    backgroundColor: devColors.devBgSecondary,
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  toggleButtonActive: {
    backgroundColor: devColors.primary,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },

  toggleText: {
    color: devColors.textSecondary,
    fontSize: 13,
    fontWeight: fontWeights.semibold,
  },

  toggleTextActive: {
    color: devColors.white,
  },
});

DevFab.propTypes = {
  isPremiumMode: PropTypes.bool.isRequired,
  onPremiumChange: PropTypes.func.isRequired,
  onResetOnboarding: PropTypes.func,
  onGoToApp: PropTypes.func,
};
