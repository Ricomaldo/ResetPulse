// src/components/DrawerPager.jsx
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import OptionsDrawerContent from './OptionsDrawerContent';
import SettingsDrawerContent from './SettingsDrawerContent';

/**
 * DrawerPager - Container avec swipe horizontal Options ↔ Settings
 */
export default function DrawerPager({
  currentDuration,
  onSelectPreset,
  drawerVisible,
}) {
  const theme = useTheme();
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const goToPage = (page) => {
    pagerRef.current?.setPage(page);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      paddingHorizontal: rs(20),
      paddingVertical: rs(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: rs(8),
    },
    tabText: {
      fontSize: rs(15),
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.brand.primary,
      fontWeight: '600',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 1,
    },
    pager: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Tabs Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => goToPage(0)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, currentPage === 0 && styles.tabTextActive]}>
            Options
          </Text>
          {currentPage === 0 && (
            <View style={[styles.tabIndicator, { left: 0, right: 0 }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => goToPage(1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, currentPage === 1 && styles.tabTextActive]}>
            Réglages
          </Text>
          {currentPage === 1 && (
            <View style={[styles.tabIndicator, { left: 0, right: 0 }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* Page 0: Options */}
        <View key="0">
          <OptionsDrawerContent
            currentDuration={currentDuration}
            onSelectPreset={onSelectPreset}
            drawerVisible={drawerVisible}
            hideSettingsIcon={true}
          />
        </View>

        {/* Page 1: Settings */}
        <View key="1">
          <SettingsDrawerContent />
        </View>
      </PagerView>
    </View>
  );
}
