// src/dev/components/DevFab.jsx
// FAB wrench avec mini-menu — dev only. 3.0 minimaliste (Lambda C, mandat
// Eric 31/07) : 5 commandes, plus de legacy (Favorite Tool, Tooltip, → App,
// Reset Timer — ère carrousels/onboarding 9 écrans, morts).
//
// Piège central (mandat) : les contextes partagés (RitualsContext,
// SessionCountContext, CustomActivitiesContext, TimerConfigContext) sont
// montés AU-DESSUS d'AppContent dans App.js — le remount par clé
// (resetTrigger) ne les atteint pas, effacer AsyncStorage seul ne suffit
// pas pour un effet visible immédiat. DevFab est rendu SOUS ces providers
// (cf. App.js) : il peut donc consommer leurs hooks directement et appeler
// leurs setters pour un effet live, en complément des callbacks App.js
// (AsyncStorage + remount) pour l'état qui vit sous AppContent.

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
import { useRituals } from '../../hooks/useRituals';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useSessionCount } from '../../hooks/useSessionCount';
import { useTimerConfig } from '../../contexts/TimerConfigContext';

/**
 * Dev FAB component for dev tools during testing
 * @param {Function} onReplayFirstRun - Callback: efface le seuil + la Première fois
 * @param {Function} onReplayDiscovery - Callback: efface les one-shots de découverte (hors compteur séances)
 * @param {Function} onResetToVanilla - Callback: reset ALL app data to vanilla state
 */
export default function DevFab({
  onReplayFirstRun,
  onReplayDiscovery,
  onResetToVanilla,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));
  const { devPremiumOverride, setDevPremiumOverride } = useDevPremium();
  const { resetRituals } = useRituals();
  const { resetActivities } = useCustomActivities();
  const { resetSessionCount } = useSessionCount();
  const { resetToDefaults } = useTimerConfig();

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

  const handleReplayFirstRun = () => {
    onReplayFirstRun?.();
  };

  // completedSessions vit dans SessionCountContext (Provider au-dessus
  // d'AppContent) : onReplayDiscovery (App.js) vide l'AsyncStorage des
  // one-shots sous AppContent + remonte, resetSessionCount() ici donne
  // l'effet immédiat sur le compteur.
  const handleReplayDiscovery = () => {
    onReplayDiscovery?.();
    resetSessionCount();
  };

  // Rituels & activités custom vivent tous les deux dans des contextes
  // au-dessus d'AppContent : purement local, pas de callback App.js requis.
  const handleResetRitualsAndActivities = () => {
    resetRituals();
    resetActivities();
  };

  // Vanilla reste « gardé tel quel » côté App.js (AsyncStorage + remount) —
  // on y ajoute les mêmes resets de contexte que ci-dessus pour que la clé
  // ajoutée à sa liste (rituels/activités/séances) ait un effet visible
  // immédiat, pas seulement au prochain redémarrage.
  // resetToDefaults() (07/08) : le timer (activité/durée/couleur) vit AUSSI
  // dans un Provider au-dessus d'AppContent — sans cet appel, Vanilla laissait
  // la durée et la couleur d'avant (bug constaté passe 3).
  const handleResetToVanilla = () => {
    onResetToVanilla?.();
    resetRituals();
    resetActivities();
    resetSessionCount();
    resetToDefaults();
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

        {/* Dev Tools - 4 commandes de reset */}
        <View style={styles.menuSection}>
          <Text style={styles.menuLabel}>Dev Tools</Text>

          <View style={styles.buttonColumn}>
            <TouchableOpacity
              style={[styles.actionButton, styles.firstRunButton]}
              onPress={() => handleOptionPress(handleReplayFirstRun)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>🚪 Rejouer la Première fois</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.discoveryButton]}
              onPress={() => handleOptionPress(handleReplayDiscovery)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>✨ Rejouer la découverte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.ritualsButton]}
              onPress={() => handleOptionPress(handleResetRitualsAndActivities)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>🗑 Reset rituels & activités</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.resetVanillaButton]}
              onPress={() => handleOptionPress(handleResetToVanilla)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>🧨 Vanilla</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  actionText: {
    color: devColors.white,
    fontSize: 13,
    fontWeight: fontWeights.semibold,
  },

  buttonColumn: {
    gap: 8,
  },

  container: {
    alignItems: 'flex-start',
    left: 20,
    position: 'absolute',
    top: 60,
    zIndex: 9999,
  },

  discoveryButton: {
    backgroundColor: '#1E90FF', // Bleu
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

  firstRunButton: {
    backgroundColor: devColors.danger, // Rouge
  },

  menu: {
    backgroundColor: devColors.devBg,
    borderColor: devColors.devBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    marginTop: 12,
    minWidth: 220,
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

  resetVanillaButton: {
    backgroundColor: '#9932CC', // Violet foncé - action destructive majeure
  },

  ritualsButton: {
    backgroundColor: '#FF8C00', // Orange
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
  onReplayFirstRun: PropTypes.func,
  onReplayDiscovery: PropTypes.func,
  onResetToVanilla: PropTypes.func,
};
