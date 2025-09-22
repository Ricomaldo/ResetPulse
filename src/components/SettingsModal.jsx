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
import { useTheme } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { responsiveSize } from '../styles/layout';
import PalettePreview from './PalettePreview';
import { PALETTE_NAMES } from '../styles/theme';

export default function SettingsModal({ visible, onClose }) {
  const theme = useTheme();
  const {
    clockwise,
    setClockwise,
    scaleMode,
    setScaleMode
  } = useTimerOptions();

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
      fontSize: responsiveSize(24),
      fontWeight: 'bold',
      color: theme.colors.text,
    },

    closeButton: {
      padding: theme.spacing.xs,
    },

    closeText: {
      fontSize: responsiveSize(20),
      color: theme.colors.text,
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
    },

    section: {
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      fontSize: responsiveSize(16),
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
      fontSize: responsiveSize(14),
      color: theme.colors.text,
      flex: 1,
    },

    optionDescription: {
      fontSize: responsiveSize(11),
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
      fontSize: responsiveSize(12),
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
    },

    paletteItemActive: {
      borderColor: theme.colors.primary,
    },

    paletteName: {
      fontSize: responsiveSize(10),
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.spacing.xs / 2,
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
              <View style={styles.paletteGrid}>
                {PALETTE_NAMES.map((paletteName) => (
                  <TouchableOpacity
                    key={paletteName}
                    style={[
                      styles.paletteItem,
                      theme.currentPalette === paletteName && styles.paletteItemActive
                    ]}
                    onPress={() => theme.setPalette(paletteName)}
                  >
                    <PalettePreview paletteName={paletteName} />
                    <Text style={styles.paletteName}>
                      {paletteName}
                    </Text>
                  </TouchableOpacity>
                ))}
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