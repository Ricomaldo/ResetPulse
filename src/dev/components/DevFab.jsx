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
import { useDevPremium } from '../DevPremiumContext';
import { useTimerConfig } from '../../contexts/TimerConfigContext';

/**
 * Dev FAB component for dev tools during testing
 * @param {boolean} isPremiumMode - Current premium mode state
 * @param {Function} onPremiumChange - Callback to change premium mode
 * @param {Function} onResetOnboarding - Callback to reset onboarding
 * @param {Function} onGoToApp - Callback to skip to app
 * @param {Function} onResetTimerConfig - Callback to reset timer config
 * @param {Function} onResetTooltip - Callback to reset drawer tooltip
 * @param {Function} onResetToVanilla - Callback to reset ALL app data to vanilla state
 */
const FAVORITE_TOOL_OPTIONS = [
  { value: 'commands', label: '⚡ Commandes' },
  { value: 'activities', label: '💻 Activités' },
  { value: 'colors', label: '🎨 Couleurs' },
  { value: 'none', label: '∅ Rien' },
];

export default function DevFab({
  onResetOnboarding,
  onGoToApp,
  onResetTimerConfig,
  onResetTooltip,
  onResetToVanilla,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));
  const { devPremiumOverride, setDevPremiumOverride: setDevPremiumOverrideOriginal } = useDevPremium();
  const { layout: { favoriteToolMode }, setFavoriteToolMode } = useTimerConfig();

  // Wrapper for setting premium override
  const setDevPremiumOverride = (value) => {
    setDevPremiumOverrideOriginal(value);
  };

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
                !devPremiumOverride && styles.toggleButtonActive,
              ]}
              onPress={() => handleOptionPress(() => setDevPremiumOverride(false))}
            >
              <Text
                style={[
                  styles.toggleText,
                  !devPremiumOverride && styles.toggleTextActive,
                ]}
              >
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                devPremiumOverride && styles.toggleButtonActive,
              ]}
              onPress={() => handleOptionPress(() => setDevPremiumOverride(true))}
            >
              <Text
                style={[
                  styles.toggleText,
                  devPremiumOverride && styles.toggleTextActive,
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
            {devPremiumOverride ? '⭐ Premium' : '🆓 Free'}
          </Text>
        </View>

        {/* Dev Tools - All resets & shortcuts */}
        {(onResetOnboarding || onResetTimerConfig || onResetTooltip || onGoToApp || onResetToVanilla) && (
          <View style={styles.menuSection}>
            <Text style={styles.menuLabel}>Dev Tools</Text>

            {/* Row 1: Onboarding + Timer */}
            {(onResetOnboarding || onResetTimerConfig) && (
              <View style={styles.buttonRow}>
                {onResetOnboarding && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resetOnboardingButton]}
                    onPress={() => handleOptionPress(onResetOnboarding)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionText}>🔄 Onboarding</Text>
                  </TouchableOpacity>
                )}
                {onResetTimerConfig && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.timerResetButton]}
                    onPress={() => handleOptionPress(onResetTimerConfig)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionText}>⏱️ Timer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Row 2: Tooltip + Go to App */}
            {(onResetTooltip || onGoToApp) && (
              <View style={[styles.buttonRow, styles.buttonRowMargin]}>
                {onResetTooltip && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.tooltipResetButton]}
                    onPress={() => handleOptionPress(onResetTooltip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionText}>💬 Tooltip</Text>
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
            )}

            {/* Row 3: Reset to Vanilla (Full Reset) */}
            {onResetToVanilla && (
              <View style={[styles.buttonRow, styles.buttonRowMargin]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resetVanillaButton]}
                  onPress={() => handleOptionPress(onResetToVanilla)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>🔄 Reset to Vanilla</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Favorite Tool Selector */}
        <View style={styles.menuSection}>
          <Text style={styles.menuLabel}>Favorite Tool</Text>
          <View style={styles.selectRow}>
            {FAVORITE_TOOL_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  favoriteToolMode === option.value && styles.selectOptionActive
                ]}
                onPress={() => handleOptionPress(() => setFavoriteToolMode(option.value))}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.selectText,
                  favoriteToolMode === option.value && styles.selectTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

  buttonRowMargin: {
    marginTop: 8,
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

  resetOnboardingButton: {
    backgroundColor: devColors.danger, // Rouge
  },

  resetVanillaButton: {
    backgroundColor: '#9932CC', // Violet foncé - action destructive majeure
  },

  selectOption: {
    backgroundColor: devColors.devBgSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  selectOptionActive: {
    backgroundColor: devColors.primary,
  },

  selectRow: {
    flexDirection: 'column',
    gap: 6,
  },

  selectText: {
    color: devColors.textSecondary,
    fontSize: 13,
  },

  selectTextActive: {
    color: devColors.white,
    fontWeight: fontWeights.semibold,
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

  timerResetButton: {
    backgroundColor: '#FF8C00', // Orange
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

  tooltipResetButton: {
    backgroundColor: '#1E90FF', // Bleu
  },
});

DevFab.propTypes = {
  onResetOnboarding: PropTypes.func,
  onGoToApp: PropTypes.func,
  onResetTimerConfig: PropTypes.func,
  onResetTooltip: PropTypes.func,
  onResetToVanilla: PropTypes.func,
};
