/**
 * @fileoverview AsideZone V2 - BottomSheet 3-snap (ADR-005 v2)
 * Migration: PanResponder custom → @gorhom/bottom-sheet
 * Stack: @gorhom/bottom-sheet + react-native-reanimated (ADR-006)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { devColors } from '../../theme/colors';

/**
 * FavoriteTool Wrapper (Snap 1 - 15%)
 * Contenu: Un seul bouton/action favorite configurable
 */
function FavoriteTool() {
  return <View style={[styles.wrapperFavorite, { backgroundColor: devColors.debug1 }]} />;
}

/**
 * BaseCommands Wrapper (Snap 2 - 38%)
 * Contenu: CommandBar + CarouselBar (Toolbox)
 */
function BaseCommands() {
  return <View style={[styles.wrapperBaseFixed, { backgroundColor: devColors.debug2 }]} />;
}

/**
 * AllOptions Wrapper (Snap 3 - 90%)
 * Contenu: Scrollable avec Settings inline + About
 */
function AllOptions() {
  return <View style={[styles.wrapperAll, { backgroundColor: devColors.debug3 }]} />;
}

/**
 * AsideZone - BottomSheet 4-snap (0=closed, 1=favorite, 2=toolbox, 3=all)
 */
export default function AsideZone({ isTimerRunning, onOpenSettings }) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  // 4 snap points: 5% (closed) / 15% (favorite) / 38% (toolbox) / 90% (all)
  const snapPoints = useMemo(() => ['5%', '15%', '38%', '90%'], []);

  // Track current snap index (0=closed, 1=favorite, 2=toolbox, 3=all)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1); // Default: 15% (favorite)

  // Auto-collapse to snap 0 (closed) when timer is running
  useEffect(() => {
    if (isTimerRunning && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // Collapse to 5% (closed)
    }
  }, [isTimerRunning]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1} // Start at 15% (favorite)
      enablePanDownToClose={false} // Always visible (snap 0 = closed state)
      enableDynamicSizing={false} // Force snap points to be respected
      onChange={(index) => {
        console.log('[AsideZone] Snap changed to index:', index);
        setCurrentSnapIndex(index);
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.textSecondary,
        width: 50,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.surface,
      }}
      style={{
        ...theme.shadow('xl'),
      }}
    >
      {/* Single ScrollView with all content - snap points handle visibility naturally */}
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: FavoriteTool (visible at snap 1 - 15%) */}
        <FavoriteTool />

        {/* Section 2: BaseCommands (visible at snap 2+ - 38% and above) */}
        <BaseCommands />

        {/* Section 3: AllOptions (visible at snap 3 - 90%, scrollable) */}
        <AllOptions />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  wrapperFavorite: {
    height: 60, // Snap 1 (15%): turquoise visible
    borderRadius: 12,
    marginBottom: 12,
  },
  wrapperBaseFixed: {
    height: 200, // Snap 2 (38%): pourpre visible / Snap 3 (90%): pourpre + scroll
    borderRadius: 12,
    marginBottom: 12,
  },
  wrapperAll: {
    height: 400, // Snap 3 (90%): mandarine scrollable
    borderRadius: 12,
  },
});
