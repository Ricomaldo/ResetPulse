/**
 * @fileoverview SettingsModal V2 - Bottom sheet avec swipe to dismiss
 * Stack: @gorhom/bottom-sheet (ADR-006)
 * Pattern: BottomSheet detached avec index contrôlé
 * @created 2025-12-18
 */
import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

export default function SettingsModal({ visible, onClose }) {
  const theme = useTheme();

  // Snap points: Un seul point à 90%
  const snapPoints = useMemo(() => ['90%'], []);

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
    sheetContainer: {
      marginHorizontal: theme.spacing.md,
      borderRadius: rs(20),
      ...theme.shadow('xl'),
    },
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
      width: rs(50),
      opacity: 0.8,
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
        backgroundColor: theme.colors.surface,
        ...Platform.select({
          ios: {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
          },
          android: {},
        }),
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* Handle custom */}
        <View style={styles.handle} />

        {/* TODO M3+: Contenu settings (8 sections) */}
      </BottomSheetView>
    </BottomSheet>
  );
}
