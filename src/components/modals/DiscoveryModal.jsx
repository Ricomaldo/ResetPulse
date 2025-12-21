/**
 * @fileoverview DiscoveryModal - Generic premium discovery UI (React Native <Modal>)
 * @deprecated Use BottomSheet pattern instead: modalStack.push('discovery', { title, children, ... })
 * @see DiscoveryModalContent.jsx - New BottomSheet implementation
 * @see BottomSheetModal.jsx - Reusable BottomSheet wrapper
 * @see ModalStackRenderer.jsx - Type-based modal rendering
 *
 * BACKWARD COMPATIBILITY ONLY - Will be removed after migration of:
 * - MoreActivitiesModal.jsx (uses DiscoveryModal internally)
 * - MoreColorsModal.jsx (uses DiscoveryModal internally)
 *
 * Migration path:
 * - Before: <DiscoveryModal visible={show} title="..." children={<Grid />} />
 * - After: modalStack.push('discovery', { title: '...', children: <Grid /> })
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalStack } from '../../contexts/ModalStackContext';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';
import PremiumModal from './PremiumModal';

export default function DiscoveryModal({
  visible,
  onClose,
  onUnlock,
  title,
  subtitle,
  tagline,
  children,
  ctaText,
  dismissText,
  modalId,
  highlightedFeature,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const modalStack = useModalStack();

  // Use i18n defaults if not provided
  const ctaTextFinal = ctaText || t('discovery.defaultCta');
  const dismissTextFinal = dismissText || t('discovery.defaultDismiss');

  const handleUnlock = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Push PremiumModal to the stack
    modalStack.push(PremiumModal, {
      onClose: () => {
        // When premium modal closes, it will pop itself
        // No need to do anything here
      },
      highlightedFeature: highlightedFeature || 'discovery',
    });

    // Also call legacy onUnlock if provided (for backward compatibility)
    if (onUnlock) {
      onUnlock();
    }
  };

  const handleClose = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // If this modal is in the stack, pop it
    if (modalId) {
      modalStack.popById(modalId);
    }

    // Always call onClose for backward compatibility
    if (onClose) {
      onClose();
    }
  };

  const styles = StyleSheet.create({
    childrenContainer: {
      marginBottom: theme.spacing.lg,
    },

    modalContainer: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: Platform.select({
        ios: 20,
        android: 16,
      }),
      maxWidth: 380,
      padding: theme.spacing.xl,
      width: '85%',
      ...theme.shadow('xl'),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.brand.primary + '30',
        },
        android: {},
      }),
    },

    overlay: {
      alignItems: 'center',
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'center',
    },

    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 12,
      justifyContent: 'center',
      minHeight: 52,
      padding: theme.spacing.lg,
      ...theme.shadow('md'),
    },

    primaryButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },

    secondaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      borderRadius: 12,
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
    },

    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },

    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },

    tagline: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
      fontStyle: 'italic',
      lineHeight: rs(22, 'min'),
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },

    title: {
      color: theme.colors.text,
      fontSize: rs(24, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
          accessible={false}
          importantForAccessibility="no"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            accessible={false}
          >
            <View
              style={styles.modalContainer}
              accessible={true}
              accessibilityRole="dialog"
              accessibilityLabel={title}
              accessibilityHint={t('accessibility.discoveryModalHint')}
            >
              {/* Title */}
              <Text
                style={styles.title}
                accessibilityRole="header"
              >
                {title}
              </Text>

              {/* Subtitle */}
              {subtitle && (
                <Text
                  style={styles.subtitle}
                  accessibilityRole="text"
                >
                  {subtitle}
                </Text>
              )}

              {/* Children (grille d'emojis, palettes, etc.) */}
              <View style={styles.childrenContainer}>{children}</View>

              {/* Tagline */}
              {tagline && <Text style={styles.tagline}>{tagline}</Text>}

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUnlock}
                activeOpacity={0.8}
                accessibilityLabel={ctaTextFinal}
                accessibilityRole="button"
                accessibilityHint={t('accessibility.unlockPremiumHint')}
              >
                <Text style={styles.primaryButtonText}>{ctaTextFinal}</Text>
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
                activeOpacity={0.7}
                accessibilityLabel={dismissTextFinal}
                accessibilityRole="button"
                accessibilityHint={t('accessibility.closeModalHint')}
              >
                <Text style={styles.secondaryButtonText}>{dismissTextFinal}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
