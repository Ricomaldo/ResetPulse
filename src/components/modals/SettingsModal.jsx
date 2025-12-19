/**
 * @fileoverview SettingsModal V2 - Bottom sheet avec swipe to dismiss
 * Stack: @gorhom/bottom-sheet (ADR-006)
 * Pattern: BottomSheet detached avec index contrôlé
 * @created 2025-12-18
 * @updated 2025-12-19 (ADR-007: added longPressConfirmDuration setting)
 */
import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Platform, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

// Long press duration presets in milliseconds (ADR-007)
const LONG_PRESS_PRESETS = [
  { label: '1s', value: 1000 },
  { label: '1.5s', value: 1500 },
  { label: '2s', value: 2000 },
  { label: '2.5s', value: 2500 }, // Default
  { label: '3s', value: 3000 },
  { label: '4s', value: 4000 },
  { label: '5s', value: 5000 },
];

export default function SettingsModal({ visible, onClose }) {
  const theme = useTheme();
  const t = useTranslation();
  const { longPressConfirmDuration, setLongPressConfirmDuration } = useTimerOptions();

  // Snap points: Un seul point à 90%
  const snapPoints = useMemo(() => ['90%'], []);

  // Handle preset selection for long press duration
  const handleLongPressPresetSelect = useCallback((value) => {
    haptics.selection().catch(() => {});
    setLongPressConfirmDuration(value);
  }, [setLongPressConfirmDuration]);

  // Gérer la fermeture
  const handleSheetChanges = useCallback((index) => {
    console.log('[SettingsModal] index:', index);
    if (index === -1 && onClose) {
      onClose();
    }
  }, [onClose]);

  // Custom backdrop
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="none"
      />
    ),
    []
  );

  const styles = StyleSheet.create({
    // Alphabetically sorted for react-native/sort-styles
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    handle: {
      alignSelf: 'center',
      backgroundColor: theme.colors.textSecondary,
      borderRadius: rs(2.5),
      height: rs(5),
      marginBottom: theme.spacing.md,
      opacity: 0.8,
      width: rs(50),
    },
    presetButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: rs(60, 'min'),
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    presetButtonActive: {
      backgroundColor: theme.colors.brand.primary + '20',
      borderColor: theme.colors.brand.primary,
    },
    presetText: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },
    presetTextActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },
    presetsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionDescription: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      lineHeight: rs(20, 'min'),
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
    },
    sheetContainer: {
      borderRadius: rs(20),
      marginHorizontal: theme.spacing.md,
      ...theme.shadow('xl'),
    },
  });

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      detached={true}
      bottomInset={46}
      style={styles.sheetContainer}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ display: 'none' }}
      backgroundStyle={{
        backgroundColor: theme.colors.surfaceElevated,
        ...Platform.select({
          ios: {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
          },
          android: {},
        }),
      }}
    >
      <BottomSheetScrollView style={styles.container}>
        {/* Handle custom */}
        <View style={styles.handle} />

        {/* Accessibility Section: Long Press Duration (ADR-007) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.accessibility.stopDuration.title') || 'Stop Confirmation'}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.accessibility.stopDuration.description') ||
              'Adjust how long you need to press to stop the timer. Longer durations prevent accidental stops.'}
          </Text>
          <View style={styles.presetsContainer}>
            {LONG_PRESS_PRESETS.map((preset) => {
              const isActive = longPressConfirmDuration === preset.value;
              return (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.presetButton,
                    isActive && styles.presetButtonActive,
                  ]}
                  onPress={() => handleLongPressPresetSelect(preset.value)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset.label} stop duration`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TODO M3+: Other settings sections (7 more) */}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
