/**
 * OnboardingLayout - Standardized layout for onboarding screens
 * Ensures consistent spacing, typography, and structure across all filters
 *
 * @created 2025-12-24
 * @updated 2025-12-24 - Added footer variants support
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { spacing, typography, fontWeights } from '../../theme/tokens';
import { PrimaryButton, SecondaryButton } from '../buttons';

/**
 * SkipButton - Internal component for skip button pattern
 */
const SkipButton = ({ label, onPress, disabled, accessibilityHint }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.skipButton}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * OnboardingLayout - Standardized layout for onboarding screens
 *
 * @param {string} title - Optional title text
 * @param {string} subtitle - Optional subtitle text
 * @param {boolean} scrollable - Whether content should scroll
 * @param {boolean} centerContent - Whether to center content vertically
 * @param {React.ReactNode} children - Main content
 * @param {React.ReactNode} footer - Footer content (legacy, takes precedence over footerVariant)
 * @param {string} footerVariant - Footer variant ('custom'|'single'|'primary-skip'|'primary-secondary')
 * @param {object} primaryButtonProps - Props for primary button
 * @param {object} secondaryButtonProps - Props for secondary button
 * @param {object} skipButtonProps - Props for skip button
 * @param {object} contentStyle - Additional styles for content container
 */
export default function OnboardingLayout({
  title,
  subtitle,
  scrollable = false,
  centerContent = true,
  children,
  footer,
  footerVariant,
  primaryButtonProps,
  secondaryButtonProps,
  skipButtonProps,
  contentStyle = {},
}) {
  const { colors } = useTheme();

  const ContentContainer = scrollable ? ScrollView : View;
  const contentContainerProps = scrollable
    ? {
        contentContainerStyle: [
          styles.scrollContent,
          centerContent && styles.scrollContentCentered,
          contentStyle,
        ],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled', // Allow taps on buttons while keyboard open
        keyboardDismissMode: 'on-drag', // Dismiss keyboard on scroll
      }
    : {
        style: [
          styles.content,
          centerContent && styles.contentCentered,
          contentStyle,
        ],
      };

  // Footer rendering logic
  const renderFooter = () => {
    // Legacy custom footer (backward compatibility)
    if (footer) {
      return <View style={styles.footer}>{footer}</View>;
    }

    // No footer
    if (!footerVariant || footerVariant === 'custom') {
      return null;
    }

    // Single primary button
    if (footerVariant === 'single' && primaryButtonProps) {
      return (
        <View style={styles.footer}>
          <PrimaryButton {...primaryButtonProps} />
        </View>
      );
    }

    // Primary + Skip button
    if (footerVariant === 'primary-skip' && primaryButtonProps && skipButtonProps) {
      return (
        <View style={styles.footer}>
          <PrimaryButton {...primaryButtonProps} />
          <SkipButton {...skipButtonProps} />
        </View>
      );
    }

    // Primary + Secondary buttons
    if (footerVariant === 'primary-secondary' && primaryButtonProps && secondaryButtonProps) {
      return (
        <View style={styles.footer}>
          <PrimaryButton {...primaryButtonProps} />
          <SecondaryButton
            {...secondaryButtonProps}
            style={styles.secondaryButton}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.innerContainer}>
            {/* Fixed Header (title + subtitle) - always outside scroll */}
            {(title || subtitle) && (
              <View style={styles.header}>
                {title && (
                  <Text style={[styles.title, { color: colors.text }]}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}

            {/* Content Area */}
            <ContentContainer {...contentContainerProps}>
              {children}
            </ContentContainer>

            {/* Footer */}
            {renderFooter()}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

OnboardingLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  scrollable: PropTypes.bool,
  centerContent: PropTypes.bool,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  footerVariant: PropTypes.oneOf(['custom', 'single', 'primary-skip', 'primary-secondary']),
  primaryButtonProps: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    accessibilityHint: PropTypes.string,
  }),
  secondaryButtonProps: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    accessibilityHint: PropTypes.string,
  }),
  skipButtonProps: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    accessibilityHint: PropTypes.string,
  }),
  contentStyle: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Keyboard avoiding wrapper
  keyboardAvoidingContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },

  // Fixed header (title + subtitle)
  header: {
    paddingHorizontal: rs(spacing.lg),
    paddingTop: rs(spacing.lg),
  },

  // Non-scrollable content
  content: {
    flex: 1,
    paddingHorizontal: rs(spacing.lg),
  },
  contentCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scrollable content
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: rs(spacing.lg),
  },
  scrollContentCentered: {
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: rs(typography.xl),
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
    marginBottom: rs(spacing.xl),
  },

  // Subtitle
  subtitle: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    marginBottom: rs(spacing.xl),
  },

  // Footer (standard padding + gap for button stacking)
  footer: {
    padding: rs(spacing.lg),
    paddingBottom: rs(spacing.xl),
    gap: rs(spacing.sm),
  },

  // Skip button
  skipButton: {
    alignItems: 'center',
    paddingVertical: rs(spacing.sm),
    marginTop: rs(spacing.xs),
  },
  skipButtonText: {
    fontSize: rs(typography.base),
    fontWeight: fontWeights.medium,
  },

  // Secondary button (additional margin for spacing)
  secondaryButton: {
    marginTop: rs(spacing.sm),
  },
});
