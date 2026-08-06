// src/contexts/PurchaseContext.jsx
// Phase 2 - Implementation RevenueCat core
// Phase 5 - Performance optimizations (caching)

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { REVENUECAT_CONFIG, ENTITLEMENTS } from '../config/revenuecat';
// TEST_MODE removed: dev override now handled by DevPremiumContext + usePremiumStatus
import Analytics from '../services/analytics';
import logger from '../utils/logger';
import i18n from '../i18n';

const PurchaseContext = createContext();

// Cache configuration
const CACHE_KEY = 'revenuecat_customer_info';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache helper functions
const loadCachedStatus = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      return null;
    }

    let isPremium, timestamp;
    try {
      ({ isPremium, timestamp } = JSON.parse(cachedData));
    } catch (parseError) {
      logger.warn('[RevenueCat Cache] Failed to parse cached data:', parseError.message);
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if cache is expired
    if (isCacheExpired(timestamp)) {
      logger.log('[RevenueCat Cache] Cache expired, clearing');
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    logger.boot.step('purchases', `cache HIT → premium=${isPremium}`);
    return isPremium;
  } catch (error) {
    logger.error('[RevenueCat Cache] Error loading cache:', error);
    return null;
  }
};

const saveCachedStatus = async (isPremium) => {
  try {
    const cacheData = {
      isPremium,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    logger.error('[RevenueCat Cache] Error saving cache:', error);
  }
};

const isCacheExpired = (timestamp) => {
  return (Date.now() - timestamp) > CACHE_TTL;
};

const checkPremiumEntitlement = (customerInfo) => {
  return customerInfo?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;
};

export const PurchaseProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false); // Prevent double-purchase

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // Step 1: Check cache first for instant UI feedback
      const cachedStatus = await loadCachedStatus();
      if (cachedStatus !== null) {
        // Set cached status immediately (non-blocking)
        setIsPremium(cachedStatus);
        setIsLoading(false);
        logger.boot.step('purchases', 'cache HIT → background refresh started');
      }

      // Step 2: Configure SDK
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_CONFIG.ios.apiKey
        : REVENUECAT_CONFIG.android.apiKey;

      Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
      await Purchases.configure({ apiKey });

      // Enable Apple Search Ads attribution collection (iOS only)
      // This collects AdServices tokens automatically - no extra SDK needed
      // Data appears in RevenueCat dashboard under Attribution
      if (Platform.OS === 'ios') {
        try {
          await Purchases.enableAdServicesAttributionTokenCollection();
          logger.boot.step('purchases', 'ads attribution OK');
        } catch (attrError) {
          // Non-blocking - attribution is nice-to-have
          logger.warn('[RevenueCat] Attribution collection failed:', attrError.message);
        }
      }

      // Step 3: Fetch fresh data in background
      const info = await Purchases.getCustomerInfo();
      const freshPremiumStatus = checkPremiumEntitlement(info);
      logger.boot.step('purchases', `network → premium=${freshPremiumStatus}`);

      // Update UI with fresh data (also saves to cache)
      updateCustomerInfo(info);

      logger.boot.complete();

      // Listener pour les mises à jour en temps réel
      Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);

    } catch (error) {
      logger.error('[RevenueCat] Initialization error:', error);

      // Fallback strategy: If we have cache, use it; otherwise default to free
      const cachedStatus = await loadCachedStatus();
      if (cachedStatus !== null) {
        logger.log('[RevenueCat] Network error, using cached status:', cachedStatus);
        setIsPremium(cachedStatus);
      } else {
        logger.log('[RevenueCat] Network error, no cache, defaulting to free');
        setIsPremium(false);
      }

      setIsLoading(false);
    }
  };

  const updateCustomerInfo = async (info) => {
    setCustomerInfo(info);

    // Vérifier si l'entitlement premium est actif
    const hasEntitlement = checkPremiumEntitlement(info);
    setIsPremium(hasEntitlement);
    setIsLoading(false);

    // Save to cache
    await saveCachedStatus(hasEntitlement);
    // Premium status logs removed - use React DevTools if needed
  };

  const purchaseProduct = async (productIdentifier) => {
    // Prevent double-purchase race condition
    // Retour TYPÉ (correctif audit fiabilité 06/08) : avant, cette garde
    // renvoyait { success: false, error: '...' } — un shape indiscernable
    // d'une vraie erreur générique côté PremiumModalContent.handlePurchase,
    // qui affichait une Alert d'échec pendant que le PREMIER achat (celui
    // en vol) pouvait très bien réussir. `reason: 'already_in_flight'`
    // permet à l'appelant de rester silencieux, comme pour un cancel.
    if (isPurchasing) {
      logger.warn('[RevenueCat] Purchase already in progress, ignoring');
      return { success: false, reason: 'already_in_flight' };
    }

    try {
      setIsPurchasing(true);

      // Invalidate cache before purchase to ensure fresh data after
      await AsyncStorage.removeItem(CACHE_KEY);
      logger.log('[RevenueCat] Cache invalidated before purchase');

      // WORKAROUND for RevenueCat bug with non-consumable products
      // Try to get the package instead of using product directly
      logger.log('[RevenueCat] 🔍 Attempting purchase with product ID:', productIdentifier);

      // First try to get offerings to find the package
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const targetPackage = offerings.current.availablePackages.find(
          pkg => pkg.product.identifier === productIdentifier
        );

        if (targetPackage) {
          logger.log('[RevenueCat] 📦 Found package, using purchasePackage:', targetPackage.identifier);
          const { customerInfo: info, transaction } = await Purchases.purchasePackage(targetPackage);
          updateCustomerInfo(info);

          // Prix + devise RÉELS (correctif audit fiabilité 06/08) : avant,
          // lus depuis info.nonSubscriptionTransactions[0] (toujours vide
          // ici) avec repli sur info.latestExpirationDate (une date, pas
          // une transaction) — le fallback 4.99/'unknown' était donc TOUJOURS
          // celui qui partait, y compris hors zone euro. Source correcte :
          // le package RevenueCat effectivement acheté (product.price /
          // product.currencyCode, même source que le prix affiché au
          // paywall) et le transaction du résultat d'achat lui-même
          // (MakePurchaseResult.transaction.transactionIdentifier).
          const transactionId = transaction?.transactionIdentifier ?? null;
          const price = targetPackage.product.price ?? null;
          const currency = targetPackage.product.currencyCode ?? null;

          // Track purchase completed (M7.5)
          Analytics.trackPurchaseCompleted(productIdentifier, price, transactionId, currency);

          // L'alerte de bienvenue vit dans PremiumModalContent.handlePurchase
          // (elle porte onClose) — un doublon ici affichait deux Alert.alert
          // successives à chaque achat réussi.

          return { success: true };
        }
      }

      // Fallback to purchaseProduct if package not found
      logger.log('[RevenueCat] ⚠️ Package not found, falling back to purchaseProduct');
      const { customerInfo: info, transaction } = await Purchases.purchaseProduct(productIdentifier);
      updateCustomerInfo(info);

      // Pas de package RevenueCat dans ce chemin (repli sans offering) : pas
      // de source fiable pour price/currency — null explicite plutôt que le
      // faux 4.99 d'avant (cf. commentaire du chemin purchasePackage
      // ci-dessus pour le détail du correctif).
      const transactionId = transaction?.transactionIdentifier ?? null;
      const price = null;
      const currency = null;

      // Track purchase completed (M7.5)
      Analytics.trackPurchaseCompleted(productIdentifier, price, transactionId, currency);

      // L'alerte de bienvenue vit dans PremiumModalContent.handlePurchase
      // (elle porte onClose) — un doublon ici affichait deux Alert.alert
      // successives à chaque achat réussi.

      return { success: true };
    } catch (error) {
      // Handle user cancellation (not an error)
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { success: false, cancelled: true };
      }

      // Track purchase failed (M7.5) - All error types
      const errorCode = error.code || 'UNKNOWN';
      const errorMessage = error.message || 'Unknown error';
      Analytics.trackPurchaseFailed(errorCode, errorMessage, productIdentifier);

      // Handle network errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        logger.error('[RevenueCat] Network error during purchase:', error);
        return {
          success: false,
          error: i18n.t('premium.errorNetwork'),
          isNetworkError: true
        };
      }

      // Handle store errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR) {
        logger.error('[RevenueCat] Store problem:', error);
        return {
          success: false,
          error: i18n.t('premium.errorStore'),
          isStoreError: true
        };
      }

      // Handle payment errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        logger.error('[RevenueCat] Payment pending:', error);
        return {
          success: false,
          error: i18n.t('premium.errorPaymentPending'),
          isPaymentPending: true
        };
      }

      // Generic error
      logger.error('[RevenueCat] Purchase error:', error);
      return { success: false, error: error.message || i18n.t('premium.errorGeneric') };
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    try {
      // Force refresh customerInfo from server (not cache)
      const info = await Purchases.restorePurchases();
      updateCustomerInfo(info);

      // Check if premium was actually restored
      const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;

      return {
        success: true,
        hasPremium: hasEntitlement
      };
    } catch (error) {
      // Handle network errors during restore
      if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        logger.error('[RevenueCat] Network error during restore:', error);
        return {
          success: false,
          error: i18n.t('premium.errorNetwork'),
          isNetworkError: true
        };
      }

      logger.error('[RevenueCat] Restore error:', error);
      return { success: false, error: error.message || i18n.t('premium.errorRestoreGeneric') };
    }
  };

  const getOfferings = async () => {
    try {
      logger.log('[RevenueCat] 🔍 Fetching offerings...');
      const offerings = await Purchases.getOfferings();

      // DEBUG: Log complete offerings structure
      logger.log('[RevenueCat] 📦 Raw offerings object:', {
        hasAll: !!offerings.all,
        allKeys: offerings.all ? Object.keys(offerings.all) : [],
        hasCurrent: !!offerings.current,
        currentIdentifier: offerings.current?.identifier,
        currentPackages: offerings.current?.availablePackages?.length || 0
      });

      // Log current offering details if available
      if (offerings.current) {
        logger.log('[RevenueCat] ✅ Current offering found:', {
          identifier: offerings.current.identifier,
          packagesCount: offerings.current.availablePackages?.length,
          packages: offerings.current.availablePackages?.map(pkg => ({
            identifier: pkg.identifier,
            productIdentifier: pkg.product?.identifier,
            productType: pkg.product?.productType,
            price: pkg.product?.priceString
          }))
        });
      } else {
        logger.warn('[RevenueCat] ⚠️ No current offering found');
      }

      return offerings.current;
    } catch (error) {
      // Handle network errors when fetching offerings
      if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        logger.error('[RevenueCat] Network error fetching offerings:', error);
        return { error: 'network', message: 'Pas de connexion internet' };
      }

      logger.error('[RevenueCat] Get offerings error:', error);
      return { error: 'unknown', message: error.message || 'Erreur inconnue' };
    }
  };

  const value = {
    isPremium, // Dev override handled by usePremiumStatus via DevPremiumContext
    isLoading,
    isPurchasing, // Expose purchasing state
    customerInfo,
    purchaseProduct,
    restorePurchases,
    getOfferings,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};

PurchaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within PurchaseProvider');
  }
  return context;
};
