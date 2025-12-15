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
import { SHOW_DEV_FAB } from '../../config/test-mode';
import { fontWeights } from '../../theme/tokens';

export default function DevFab({
  isPremiumMode,
  onPremiumChange,
  onResetOnboarding,
  onGoToApp,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));

  if (!SHOW_DEV_FAB) return null;

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
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 9999,
    alignItems: 'flex-start',
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#333',
  },

  fabOpen: {
    backgroundColor: '#333',
    borderColor: '#555',
  },

  fabIcon: {
    fontSize: 24,
  },

  menu: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
  },

  menuSection: {
    marginBottom: 12,
  },

  menuLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: fontWeights.semibold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#2d2d3d',
    alignItems: 'center',
  },

  toggleButtonActive: {
    backgroundColor: '#4a6fa5',
  },

  toggleText: {
    fontSize: 13,
    color: '#888',
    fontWeight: fontWeights.semibold,
  },

  toggleTextActive: {
    color: '#fff',
  },

  statusRow: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 4,
  },

  statusText: {
    fontSize: 14,
    color: '#ccc',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  resetButton: {
    backgroundColor: '#d9534f',
  },

  goToAppButton: {
    backgroundColor: '#5cb85c',
  },

  actionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: fontWeights.semibold,
  },
});
