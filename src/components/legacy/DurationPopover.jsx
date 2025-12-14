/**
 * @fileoverview Duration selection popover modal
 * @created 2025-12-14
 * @updated 2025-12-14
 * @deprecated This component is no longer used - kept for reference
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const DURATION_PRESETS = [5, 10, 15, 20, 25, 30, 45, 60];

export default function DurationPopover({ visible, onClose, onSelectDuration, currentColor }) {
  const theme = useTheme();
  const t = useTranslation();

  const handleSelect = (minutes) => {
    haptics.selection().catch(() => {});
    onSelectDuration(minutes * 60); // Convert to seconds
    onClose();
  };

  const handleClose = () => {
    haptics.selection().catch(() => {});
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Platform.select({
        ios: 'rgba(0, 0, 0, 0.3)',
        android: 'rgba(0, 0, 0, 0.4)',
      }),
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: rs(120, 'height'), // Position below digital timer
    },

    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: Platform.select({
        ios: 20,
        android: 16,
      }),
      width: '80%',
      maxWidth: 320,
      padding: theme.spacing.lg,
      ...theme.shadow('xl'),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border + '30',
        },
        android: {
          elevation: 8,
        },
      }),
    },

    title: {
      fontSize: rs(18, 'min'),
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },

    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      maxHeight: rs(300, 'height'),
    },

    presetButton: {
      width: '28%',
      aspectRatio: 1.2,
      backgroundColor: theme.isDark ? theme.colors.brand.deep : theme.colors.brand.neutral,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: currentColor || theme.colors.brand.primary,
      ...theme.shadow('sm'),
    },

    presetNumber: {
      fontSize: rs(24, 'min'),
      fontWeight: 'bold',
      color: currentColor || theme.colors.brand.primary,
      marginBottom: 2,
    },

    presetLabel: {
      fontSize: rs(10, 'min'),
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },

    closeButton: {
      marginTop: theme.spacing.md,
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },

    closeButtonText: {
      fontSize: rs(14, 'min'),
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalContainer}>
            {/* Title */}
            <Text style={styles.title}>{t('timer.durationPopover.title')}</Text>

            {/* Presets Grid */}
            <ScrollView
              contentContainerStyle={styles.presetsGrid}
              showsVerticalScrollIndicator={false}
            >
              {DURATION_PRESETS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.presetButton}
                  onPress={() => handleSelect(minutes)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetNumber}>{minutes}</Text>
                  <Text style={styles.presetLabel}>{t('timer.durationPopover.minutes')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>{t('timer.durationPopover.close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
