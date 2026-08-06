/**
 * @fileoverview PremiumModalContent - surface d'achat Ambiances (BottomSheet)
 * Extracted from PremiumModal.jsx - Pure content component (no Modal wrapper)
 * Lot 3b (frontière gratuit/payant, mandat Eric) : registre passé de
 * « premium » générique à « Ambiances » — mécanique achat/restore/prix
 * RevenueCat inchangée (gestion d'erreurs), seul le CONTENU visible change.
 * Le mot « premium » ne s'affiche plus côté utilisateur.
 * P0-2 (review Claude design) : le CTA n'annonce plus d'essai gratuit — le
 * bouton déclenche un achat unique immédiat (`ambiances.unlock`), le texte
 * le dit désormais explicitement ; son accessibilityHint (même mensonge,
 * porté par VoiceOver/TalkBack) a été retiré plutôt que réécrit — locale
 * gelée, `accessibility.unlockPremiumHint` devient orpheline.
 * @created 2025-12-21
 * @updated 2026-08-04
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';

import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { usePurchases } from '../../contexts/PurchaseContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalStack } from '../../contexts/ModalStackContext';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';
import logger from '../../utils/logger';
import PaywallHero, { resolveHeroCopyKeys, resolveHeroName } from './PaywallHero';

/**
 * PremiumModalContent - Premium paywall UI
 *
 * Business logic:
 * - Fetch dynamic price from RevenueCat
 * - Handle purchase flow (with retry logic)
 * - Handle restore purchases
 * - Track Mixpanel analytics (paywall viewed)
 * - Network error handling with retry buttons (max 3 attempts)
 *
 * @param {Function} onClose - Callback to close modal
 * @param {string} highlightedFeature - Feature that triggered paywall (for analytics)
 * @param {string} modalId - Modal ID in ModalStack (for pop)
 */
// Paywall adaptatif : la ligne du pack correspondant à la porte d'entrée
// passe en tête (cf. vision/gagner-de-largent.md — les trois cerveaux ne
// paient pas pour la même chose). Portes inconnues → ordre par défaut.
const DEFAULT_FEATURE_ORDER = ['palettes', 'rituals', 'sounds'];
const FEATURE_ORDER_BY_SOURCE = {
  rituals_cap: ['rituals', 'palettes', 'sounds'],
  palettes: ['palettes', 'rituals', 'sounds'],
  // Lambda L : miroir de la porte `palettes` — la ligne du pack Sons passe
  // en tête depuis SoundsPanel (même invitation « essai libre », ADR-017 §6).
  sounds: ['sounds', 'palettes', 'rituals'],
  breathe_invitation: ['sounds', 'palettes', 'rituals'],
  // ADR-017 §4/§5 — les deux nouvelles portes du formulaire de rituel
  // (vitrine emojis built-in grisée, création d'activité custom fermée) :
  // même contexte que rituals_cap, rituels en tête.
  activities_vitrine: ['rituals', 'palettes', 'sounds'],
  customActivities: ['rituals', 'palettes', 'sounds'],
};

export default function PremiumModalContent({ onClose, highlightedFeature, source, hero, modalId }) {
  const modalStack = useModalStack();
  const theme = useTheme();
  // Lambda U (2a/2b/2c) : zone héros optionnelle au-dessus du titre, propre
  // à la porte d'entrée (`hero`, transmis via modalStack.push). Absente
  // (guichet, pieds de section 1b du lambda T) → header générique inchangé
  // (décision CD, cf. PaywallHero.jsx en tête).
  // `ambiances.hook.*`/`ambiances.hookSub.*` : clés neuves FLAGGÉES — textes
  // des maquettes CD 2a/2b/2c recopiés tels quels, fr/en seulement (13
  // locales gelées retombent sur l'anglais, i18n `enableFallback`, même
  // statut que les libellés Standard/Focus d'AsideZone). La passe copies CD
  // les repassera avec le reste (brief `2026-08-04_brief-cd-frontiere-paywall.md`).
  const heroCopyKeys = resolveHeroCopyKeys(hero);
  const heroName = resolveHeroName(hero);
  const analytics = useAnalytics();
  const t = useTranslation();
  const {
    purchaseProduct,
    restorePurchases,
    getOfferings,
    isPurchasing: contextPurchasing,
  } = usePurchases();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasTrackedPaywall, setHasTrackedPaywall] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [purchaseAttempts, setPurchaseAttempts] = useState(0);

  // Track paywall viewed once per session (M7.5)
  // Lambda T : `source` explicite prioritaire sur `highlightedFeature` —
  // le guichet (AsideZone) pousse sans feature (pas de héros, décision CD)
  // mais reste distinguable de 'unknown' dans l'analytics ('counter').
  // N'affecte pas FEATURE_ORDER_BY_SOURCE (toujours clé sur highlightedFeature).
  useEffect(() => {
    if (!hasTrackedPaywall) {
      const paywallSource = source || highlightedFeature || 'unknown';
      analytics.trackPaywallViewed(paywallSource);
      setHasTrackedPaywall(true);
    }
  }, [hasTrackedPaywall, source, highlightedFeature, analytics]);

  // Fetch dynamic price from RevenueCat when component mounts
  useEffect(() => {
    const fetchPrice = async () => {
      if (dynamicPrice) {return;}

      setIsLoadingPrice(true);
      try {
        const offerings = await getOfferings();
        if (offerings?.availablePackages?.[0]?.product?.priceString) {
          setDynamicPrice(offerings.availablePackages[0].product.priceString);
        }
      } catch (error) {
        logger.warn('Could not fetch dynamic price', error.message);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [dynamicPrice, getOfferings]);

  // Combined loading state (local + context)
  const isAnyOperationInProgress =
    isPurchasing || isRestoring || contextPurchasing;

  const handlePurchase = async () => {
    try {
      logger.log('🚀 IAP purchase flow started');
      setIsPurchasing(true);
      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

      const offerings = await getOfferings();

      if (__DEV__) {
        logger.log('📦 IAP offerings', {
          hasOfferings: !!offerings,
          errorType: offerings?.error || 'none',
          packagesCount: offerings?.availablePackages?.length || 0,
        });
      }

      // Handle network error from getOfferings
      if (offerings?.error === 'network') {
        logger.warn('IAP network error while fetching offerings');
        Alert.alert(
          t('premium.noConnection'),
          t('premium.noConnectionMessage'),
          [{ text: t('common.ok') }]
        );
        setIsPurchasing(false);
        return;
      }

      // Handle other errors or missing offerings
      if (
        !offerings ||
        offerings.error ||
        !offerings.availablePackages ||
        offerings.availablePackages.length === 0
      ) {
        logger.warn('IAP no offerings available', { error: offerings?.error, packagesLength: offerings?.availablePackages?.length });
        Alert.alert(
          t('premium.error'),
          t('premium.errorOfferings'),
          [{ text: t('common.ok') }]
        );
        setIsPurchasing(false);
        return;
      }

      // Get the first package (should be our premium_lifetime)
      const premiumPackage = offerings.availablePackages[0];

      // Log package details
      logger.log('💳 IAP package selected', { productId: premiumPackage.product.identifier, price: premiumPackage.product.priceString });
      const result = await purchaseProduct(premiumPackage.product.identifier);

      logger.log('✅ IAP purchase result', { success: result.success, cancelled: result.cancelled, error: result.error || 'none' });

      if (result.success) {
        // Reset attempts on success
        setPurchaseAttempts(0);
        haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
        Alert.alert(
          t('premium.welcomeTitle'),
          t('premium.welcomeMessage'),
          [{ text: t('premium.welcomeButton'), onPress: onClose }]
        );
      } else if (result.cancelled) {
        // User cancelled, silent
      } else if (result.reason === 'already_in_flight') {
        // Un achat est déjà en vol (garde purchaseProduct, correctif audit
        // fiabilité 06/08) — silencieux comme un cancel : afficher une
        // Alert d'échec ici serait un FAUX négatif pendant que l'achat
        // premier peut très bien réussir.
      } else if (result.isNetworkError) {
        // Network error - show retry button
        const newAttempts = purchaseAttempts + 1;
        setPurchaseAttempts(newAttempts);

        const buttons = [
          { text: t('common.cancel'), style: 'cancel' }
        ];

        // Show retry button if less than 3 attempts
        if (newAttempts < 3) {
          buttons.unshift({
            text: t('common.retry'),
            onPress: handlePurchase
          });
        } else {
          // After 3 failed attempts, show support link
          buttons.unshift({
            text: t('premium.contactSupport'),
            onPress: () => {
              // Future: open support email or link
              logger.log('Contact support requested after 3 failed attempts');
            }
          });
        }

        Alert.alert(
          t('premium.noConnection'),
          result.error + (newAttempts >= 3 ? '\n\n' + t('premium.tooManyAttempts') : ''),
          buttons
        );
      } else if (result.isPaymentPending) {
        // Payment pending - informative message
        Alert.alert(t('premium.paymentPending'), result.error, [
          { text: t('common.ok'), onPress: onClose },
        ]);
      } else {
        // Generic error - show retry button
        const newAttempts = purchaseAttempts + 1;
        setPurchaseAttempts(newAttempts);

        const buttons = [
          { text: t('common.cancel'), style: 'cancel' }
        ];

        // Show retry button if less than 3 attempts
        if (newAttempts < 3) {
          buttons.unshift({
            text: t('common.retry'),
            onPress: handlePurchase
          });
        } else {
          // After 3 failed attempts, show support link
          buttons.unshift({
            text: t('premium.contactSupport'),
            onPress: () => {
              logger.log('Contact support requested after 3 failed attempts');
            }
          });
        }

        Alert.alert(
          t('premium.error'),
          (result.error || t('premium.errorPurchase')) + (newAttempts >= 3 ? '\n\n' + t('premium.tooManyAttempts') : ''),
          buttons
        );
      }
    } catch (error) {
      logger.error('IAP purchase error', error.message);
      Alert.alert(t('premium.error'), t('premium.errorOfferings'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

      const result = await restorePurchases();

      if (result.success) {
        if (result.hasPremium) {
          haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
          Alert.alert(
            t('premium.restoreSuccess'),
            t('premium.restoreSuccessMessage'),
            [{ text: t('premium.welcomeButton'), onPress: onClose }]
          );
        } else {
          Alert.alert(
            t('premium.restoreNone'),
            t('premium.restoreNoneMessage'),
            [{ text: t('common.ok') }]
          );
        }
      } else if (result.isNetworkError) {
        // Network error during restore
        Alert.alert(t('premium.noConnection'), result.error, [{ text: t('common.ok') }]);
      } else {
        // Generic restore error
        Alert.alert(
          t('premium.error'),
          result.error || t('premium.restoreError'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      logger.error('IAP restore error', error.message);
      Alert.alert(t('premium.error'), t('premium.unexpectedError'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    // Prevent closing during operations
    if (isAnyOperationInProgress) {
      return;
    }
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Call onClose (ModalStackRenderer handles animation delay + popById)
    if (onClose) {
      onClose();
    }
  };

  const styles = StyleSheet.create({
    body: {
      marginBottom: theme.spacing.xl,
    },

    bodyText: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
      lineHeight: rs(24, 'min'),
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },

    buttons: {
      gap: theme.spacing.md,
    },

    container: {
      padding: theme.spacing.xl,
    },

    features: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
    },

    // Lot 3b : 3 lignes fixes, contenus réels du pack à la 3.0 — pas de
    // mapping (mission : « simplifie, 3 lignes fixes suffisent »).
    featureLine: {
      color: theme.colors.text,
      fontSize: rs(15, 'min'),
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },

    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },

    // Hiérarchie hero (mandat Lambda U) : sur-titre 11px espacé, accroche
    // 23px gras, sous-titre 14px — même registre que closedLabelText
    // (AsideZone) pour le sur-titre.
    eyebrow: {
      color: theme.colors.textLight,
      fontSize: rs(11, 'min'),
      fontWeight: '600',
      letterSpacing: rs(11, 'min') * 0.14,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },

    headline: {
      color: theme.colors.text,
      fontSize: rs(23, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },

    subheadline: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      textAlign: 'center',
    },

    loader: {
      marginLeft: theme.spacing.sm,
    },

    priceText: {
      color: theme.colors.brand.primary,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
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

    primaryButtonDisabled: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(17, 'min'),
      fontWeight: fontWeights.semibold,
    },

    restoreButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.sm,
    },

    restoreButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      textDecorationLine: 'underline',
    },

    secondaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      borderRadius: 12,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.md,
    },

    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.medium,
    },

    title: {
      color: theme.colors.text,
      fontSize: rs(26, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header — générique (t('ambiances.title') en titre) SANS hero, ou
          hiérarchie sur-titre/accroche/sous-titre au-dessus d'une zone
          visuelle QUAND une porte transmet un hero (2a/2b/2c). */}
      <View style={styles.header}>
        {hero && heroCopyKeys ? (
          <>
            <PaywallHero hero={hero} />
            <Text style={styles.eyebrow}>{t('ambiances.title')}</Text>
            <Text style={styles.headline} accessibilityRole="header">
              {t(heroCopyKeys.headlineKey)}
            </Text>
            <Text style={styles.subheadline}>
              {t(heroCopyKeys.subtitleKey, { name: heroName || '' })}
            </Text>
          </>
        ) : (
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {t('ambiances.title')}
          </Text>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>
          {t('ambiances.pitch')}
        </Text>

        {/* Contenus réels du pack (3.0) — 3 lignes, ORDONNÉES par la porte
            d'entrée (paywall adaptatif, stratégie gagner-de-largent) : les
            trois cerveaux ne paient pas pour la même chose — celui qui
            arrive par le cap rituels voit « rituels illimités » en premier,
            par les palettes voit les palettes, par la fin de séance voit
            les sons. highlightedFeature = la porte, déjà tracée. */}
        <View style={styles.features}>
          {(FEATURE_ORDER_BY_SOURCE[highlightedFeature] || DEFAULT_FEATURE_ORDER).map((featureKey) => (
            <Text key={featureKey} style={styles.featureLine}>· {t(`ambiances.features.${featureKey}`)}</Text>
          ))}
          <Text style={styles.priceText}>
            {t('ambiances.price', { price: dynamicPrice || '4,99€' })}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {/* P0-2 (review Claude design) : accessibilityHint retiré — il valait
            `accessibility.unlockPremiumHint` = « Start 7-day free trial,
            then one-time payment » (×15 locales), le même mensonge que
            l'ancien CTA visible, porté cette fois par VoiceOver/TalkBack sur
            CE bouton. Locale gelée (seule ambiances.unlock est autorisée en
            écriture) → pas de réécriture possible, la clé devient orpheline
            (comme ambiances.startTrial). Le accessibilityLabel juste en
            dessous reste annoncé et dit déjà le prix + « une fois ». */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isAnyOperationInProgress && styles.primaryButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.8}
          accessibilityLabel={t('accessibility.unlockPremium', { price: dynamicPrice || '4,99€' })}
          accessibilityRole="button"
          accessibilityState={{ disabled: isAnyOperationInProgress }}
        >
          {isPurchasing ? (
            <ActivityIndicator color={theme.colors.fixed.white} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {t('ambiances.unlock', { price: dynamicPrice || '4,99€' })}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleClose}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.closePremiumModal')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.closeModalHint')}
        >
          <Text style={styles.secondaryButtonText}>
            {t('premium.dismiss')}
          </Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.restorePurchases')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.restorePurchasesHint')}
          accessibilityState={{ disabled: isAnyOperationInProgress }}
        >
          {isRestoring ? (
            <ActivityIndicator
              color={theme.colors.textSecondary}
              size="small"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.restoreButtonText}>
              {t('premium.restore')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

PremiumModalContent.propTypes = {
  onClose: PropTypes.func.isRequired,
  highlightedFeature: PropTypes.string,
  source: PropTypes.string,
  hero: PropTypes.shape({
    type: PropTypes.oneOf(['emoji', 'plus', 'ritualSlots', 'palette', 'sound']).isRequired,
    emoji: PropTypes.string,
    emojis: PropTypes.arrayOf(PropTypes.string),
    paletteKey: PropTypes.string,
    soundId: PropTypes.string,
  }),
  modalId: PropTypes.string,
};
