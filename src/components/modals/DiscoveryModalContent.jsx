/**
 * @fileoverview DiscoveryModalContent - Generic premium discovery content (BottomSheet)
 * Extracted from DiscoveryModal.jsx - Pure content component (no Modal wrapper)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalStack } from '../../contexts/ModalStackContext';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';

/**
 * DiscoveryModalContent - Generic premium discovery UI
 *
 * Purpose:
 * - Show premium features preview (activities, colors, etc.)
 * - Push PremiumModal to stack when user clicks "unlock"
 *
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onUnlock - Legacy callback when unlock pressed (optional)
 * @param {string} title - Modal title
 * @param {string} subtitle - Optional subtitle
 * @param {string} tagline - Optional tagline (italic)
 * @param {React.Node} children - Content (emoji grid, palette grid, etc.)
 * @param {string} ctaText - CTA button text (default: i18n 'discovery.defaultCta')
 * @param {string} dismissText - Dismiss button text (default: i18n 'discovery.defaultDismiss')
 * @param {string} modalId - Modal ID in ModalStack (for pop)
 * @param {string} highlightedFeature - Feature that triggered discovery (for analytics)
 */
export default function DiscoveryModalContent({
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

    // Push PremiumModal to the stack (using type 'premium' instead of component)
    modalStack.push('premium', {
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
    console.log('[DiscoveryModalContent] handleClose called');
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Call onClose (ModalStackRenderer handles animation delay + popById)
    if (onClose) {
      console.log('[DiscoveryModalContent] Calling onClose');
      onClose();
    } else {
      console.warn('[DiscoveryModalContent] No onClose provided!');
    }
  };

  const styles = StyleSheet.create({
    childrenContainer: {
      marginBottom: theme.spacing.lg,
    },

    container: {
      padding: theme.spacing.xl,
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
    <BottomSheetView style={styles.container}>
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
    </BottomSheetView>
  );
}

DiscoveryModalContent.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUnlock: PropTypes.func,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  tagline: PropTypes.string,
  children: PropTypes.node,
  ctaText: PropTypes.string,
  dismissText: PropTypes.string,
  modalId: PropTypes.string,
  highlightedFeature: PropTypes.string,
};
