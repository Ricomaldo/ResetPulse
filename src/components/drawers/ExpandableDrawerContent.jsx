/**
 * @fileoverview Expandable drawer that shows options and settings when expanded
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
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
      backgroundColor: theme.colors.border,
      height: 1,
      marginHorizontal: rs(20),
      marginVertical: rs(16),
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

ExpandableDrawerContent.propTypes = {
  currentDuration: PropTypes.number,
  onSelectPreset: PropTypes.func,
  drawerVisible: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onOpenSettings: PropTypes.func,
};
