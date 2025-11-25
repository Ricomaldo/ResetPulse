// src/contexts/PurchaseContext.jsx
// Phase 2 - Implementation RevenueCat core

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { REVENUECAT_CONFIG, ENTITLEMENTS } from '../config/revenuecat';
import { TEST_MODE } from '../config/testMode';
import Analytics from '../services/analytics';

const PurchaseContext = createContext();

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
      // Configuration SDK selon la plateforme
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_CONFIG.ios.apiKey
        : REVENUECAT_CONFIG.android.apiKey;

      // Initialiser RevenueCat
      await Purchases.configure({ apiKey });

      // Log level DEBUG pour diagnostiquer
      // TODO: Remettre ERROR après test
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      // Récupérer le customerInfo initial
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);

      // Listener pour les mises à jour en temps réel
      Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);

    } catch (error) {
      console.error('[RevenueCat] Initialization error:', error);
      setIsLoading(false);
    }
  };

  const updateCustomerInfo = (info) => {
    setCustomerInfo(info);

    // Vérifier si l'entitlement premium est actif
    const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;
    setIsPremium(hasEntitlement);
    setIsLoading(false);
    // Premium status logs removed - use React DevTools if needed
  };

  const purchaseProduct = async (productIdentifier) => {
    // Prevent double-purchase race condition
    if (isPurchasing) {
      console.warn('[RevenueCat] Purchase already in progress, ignoring');
      return { success: false, error: 'Purchase already in progress' };
    }

    try {
      setIsPurchasing(true);
      const { customerInfo: info } = await Purchases.purchaseProduct(productIdentifier);
      updateCustomerInfo(info);

      // Get transaction details for analytics
      const latestTransaction = info.nonSubscriptionTransactions?.[0] || info.latestExpirationDate;
      const transactionId = latestTransaction?.transactionIdentifier || 'unknown';
      const price = latestTransaction?.price || 4.99; // Default price

      // Track trial started (M7.5)
      Analytics.trackTrialStarted(productIdentifier);

      // Track purchase completed (M7.5)
      Analytics.trackPurchaseCompleted(productIdentifier, price, transactionId);

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
        console.error('[RevenueCat] Network error during purchase:', error);
        return {
          success: false,
          error: 'Pas de connexion internet. Vérifiez votre réseau et réessayez.',
          isNetworkError: true
        };
      }

      // Handle store errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR) {
        console.error('[RevenueCat] Store problem:', error);
        return {
          success: false,
          error: 'Problème avec le store. Réessayez plus tard.',
          isStoreError: true
        };
      }

      // Handle payment errors
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        console.error('[RevenueCat] Payment pending:', error);
        return {
          success: false,
          error: 'Paiement en attente. Vérifiez vos achats dans quelques minutes.',
          isPaymentPending: true
        };
      }

      // Generic error
      console.error('[RevenueCat] Purchase error:', error);
      return { success: false, error: error.message || 'Une erreur est survenue' };
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
        console.error('[RevenueCat] Network error during restore:', error);
        return {
          success: false,
          error: 'Pas de connexion internet. Vérifiez votre réseau et réessayez.',
          isNetworkError: true
        };
      }

      console.error('[RevenueCat] Restore error:', error);
      return { success: false, error: error.message || 'Erreur de restauration' };
    }
  };

  const getOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      // Handle network errors when fetching offerings
      if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        console.error('[RevenueCat] Network error fetching offerings:', error);
        return { error: 'network', message: 'Pas de connexion internet' };
      }

      console.error('[RevenueCat] Get offerings error:', error);
      return { error: 'unknown', message: error.message || 'Erreur inconnue' };
    }
  };

  const value = {
    isPremium: TEST_MODE || isPremium, // TEST_MODE force premium en dev
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

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within PurchaseProvider');
  }
  return context;
};
