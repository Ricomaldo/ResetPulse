// src/components/ExpandableDrawerContent.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import OptionsDrawerContent from './OptionsDrawerContent';
import SettingsDrawerContent from './SettingsDrawerContent';

/**
 * ExpandableDrawerContent - Container qui affiche Options + Settings quand étendu
 * En mode normal: seulement Options
 * En mode étendu: Options + Divider + Settings
 */
export default function ExpandableDrawerContent({
  currentDuration,
  onSelectPreset,
  drawerVisible,
  isExpanded = false,
  onOpenSettings,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: rs(16),
      marginHorizontal: rs(20),
    },
    expandHint: {
      paddingVertical: rs(8),
      alignItems: 'center',
    },
    expandHintText: {
      fontSize: rs(11),
      color: theme.colors.textSecondary,
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      {/* Options - toujours visibles */}
      <OptionsDrawerContent
        currentDuration={currentDuration}
        onSelectPreset={onSelectPreset}
        drawerVisible={drawerVisible}
        onOpenSettings={onOpenSettings}
      />

      {/* Hint pour slider up (seulement si pas étendu) */}
      {!isExpanded && (
        <View style={styles.expandHint}>
          <Text style={styles.expandHintText}>↑ Glissez pour plus d'options</Text>
        </View>
      )}

      {/* Settings - visibles seulement quand étendu */}
      {isExpanded && (
        <>
          <View style={styles.divider} />
          <SettingsDrawerContent />
        </>
      )}
    </View>
  );
}
