// src/components/SettingsModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs } from '../styles/responsive';
import PalettePreview from './PalettePreview';
import { getAllActivities } from '../config/activities';
import { TIMER_PALETTES, isPalettePremium } from '../config/timerPalettes';

export default function SettingsModal({ visible, onClose }) {
  const theme = useTheme();
  const { currentPalette, setPalette } = useTimerPalette();
  const {
    clockwise,
    setClockwise,
    scaleMode,
    setScaleMode,
    favoriteActivities,
    setFavoriteActivities
  } = useTimerOptions();

  const allActivities = getAllActivities();

  const toggleFavorite = (activityId) => {
    const newFavorites = favoriteActivities.includes(activityId)
      ? favoriteActivities.filter(id => id !== activityId)
      : [...favoriteActivities, activityId];
    setFavoriteActivities(newFavorites);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      width: '90%',
      maxHeight: '80%',
      padding: theme.spacing.lg,
      ...theme.shadows.lg,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    title: {
      fontSize: rs(24, 'min'),
      fontWeight: 'bold',
      color: theme.colors.text,
    },

    closeButton: {
      padding: theme.spacing.xs,
    },

    closeText: {
      fontSize: rs(20, 'min'),
      color: theme.colors.text,
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
    },

    section: {
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      fontSize: rs(16, 'min'),
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },

    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },

    optionLabel: {
      fontSize: rs(14, 'min'),
      color: theme.colors.text,
      flex: 1,
    },

    optionDescription: {
      fontSize: rs(11, 'min'),
      color: theme.colors.textLight,
      marginTop: theme.spacing.xs / 2,
    },

    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 2,
    },

    segmentButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md - 2,
      alignItems: 'center',
    },

    segmentButtonActive: {
      backgroundColor: theme.colors.primary,
    },

    segmentText: {
      fontSize: rs(12, 'min'),
      color: theme.colors.text,
      fontWeight: '500',
    },

    segmentTextActive: {
      color: theme.colors.background,
    },

    paletteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    paletteItem: {
      width: '30%',
      aspectRatio: 1.5,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },

    paletteItemActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadows.md,
    },

    paletteItemLocked: {
      opacity: 0.6,
    },

    paletteName: {
      fontSize: rs(10, 'min'),
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.spacing.xs / 2,
      fontWeight: '500',
    },

    paletteNameActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    paletteLockBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: theme.colors.warning,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },

    lockIcon: {
      fontSize: 11,
    },

    colorRow: {
      flexDirection: 'row',
      height: 16,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },

    colorSegment: {
      flex: 1,
    },

    favoritesSection: {
      marginTop: theme.spacing.md,
    },

    favoritesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    activityItem: {
      width: '22%',
      aspectRatio: 1,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      ...theme.shadows.sm,
    },

    activityItemFavorite: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadows.md,
    },

    activityEmoji: {
      fontSize: rs(24, 'min'),
      marginBottom: 2,
    },

    activityItemLabel: {
      fontSize: rs(9, 'min'),
      color: theme.colors.textLight,
      fontWeight: '500',
    },

    activityItemLabelFavorite: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    premiumBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: theme.colors.warning,
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },

    lockMini: {
      fontSize: 10,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Paramètres</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Timer Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options du Timer</Text>

              {/* Scale Mode */}
              <View style={styles.optionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Mode Cadran</Text>
                  <Text style={styles.optionDescription}>
                    {scaleMode === '60min' ? 'Échelle 60 minutes' : 'Durée complète'}
                  </Text>
                </View>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      scaleMode === '60min' && styles.segmentButtonActive
                    ]}
                    onPress={() => setScaleMode('60min')}
                  >
                    <Text style={[
                      styles.segmentText,
                      scaleMode === '60min' && styles.segmentTextActive
                    ]}>
                      60min
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      scaleMode === 'full' && styles.segmentButtonActive
                    ]}
                    onPress={() => setScaleMode('full')}
                  >
                    <Text style={[
                      styles.segmentText,
                      scaleMode === 'full' && styles.segmentTextActive
                    ]}>
                      Full
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Direction */}
              <View style={styles.optionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Sens de Rotation</Text>
                  <Text style={styles.optionDescription}>
                    {clockwise ? 'Sens horaire' : 'Sens anti-horaire'}
                  </Text>
                </View>
                <Switch
                  value={clockwise}
                  onValueChange={setClockwise}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
            </View>

            {/* Color Palettes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Palettes de Couleurs</Text>
              <Text style={styles.optionDescription}>
                Version gratuite : Terre et Laser disponibles
              </Text>
              <View style={styles.paletteGrid}>
                {Object.keys(TIMER_PALETTES).map((paletteName) => {
                  const isPremium = isPalettePremium(paletteName);
                  const isActive = currentPalette === paletteName;
                  const paletteInfo = TIMER_PALETTES[paletteName];

                  return (
                    <TouchableOpacity
                      key={paletteName}
                      style={[
                        styles.paletteItem,
                        isActive && styles.paletteItemActive,
                        isPremium && styles.paletteItemLocked
                      ]}
                      onPress={() => {
                        if (!isPremium) {
                          setPalette(paletteName);
                        }
                      }}
                      activeOpacity={isPremium ? 1 : 0.7}
                    >
                      <PalettePreview paletteName={paletteName} />
                      <Text style={[
                        styles.paletteName,
                        isActive && styles.paletteNameActive
                      ]}>
                        {paletteInfo?.name || paletteName}
                      </Text>
                      {isPremium && (
                        <View style={styles.paletteLockBadge}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Favorites Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activités favorites</Text>
              <Text style={styles.optionDescription}>
                Sélectionnez vos favoris pour les voir en premier
              </Text>
              <View style={styles.favoritesGrid}>
                {allActivities.map((activity) => {
                  const isFavorite = favoriteActivities.includes(activity.id);
                  return (
                    <TouchableOpacity
                      key={activity.id}
                      style={[
                        styles.activityItem,
                        isFavorite && styles.activityItemFavorite
                      ]}
                      onPress={() => toggleFavorite(activity.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                      <Text style={[
                        styles.activityItemLabel,
                        isFavorite && styles.activityItemLabelFavorite
                      ]}>
                        {activity.label}
                      </Text>
                      {activity.isPremium && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.lockMini}>🔒</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionLabel}>ResetPulse</Text>
                  <Text style={styles.optionDescription}>
                    Timer visuel pour utilisateurs neuroatypiques
                  </Text>
                  <Text style={[styles.optionDescription, { marginTop: theme.spacing.xs }]}>
                    Version 1.0.0
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}