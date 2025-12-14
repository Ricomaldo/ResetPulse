// src/hooks/usePerformanceTracking.js
// Phase 5 - TTI Performance Monitoring

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Analytics from '../services/analytics';
import { DEV_MODE } from '../config/test-mode';

// Module-level timestamp to capture app start time
const APP_START_TIME = Date.now();

/**
 * Hook to track Time To Interactive (TTI) performance metric
 *
 * TTI = Time from app start until the app is fully interactive
 *
 * Usage:
 * const trackTTI = usePerformanceTracking();
 *
 * // When app becomes interactive:
 * trackTTI({ screen: 'TimerScreen' });
 *
 * @returns {Function} trackTTI - Function to call when app is interactive
 */
export const usePerformanceTracking = () => {
  const hasTrackedRef = useRef(false);

  const trackTTI = ({ screen = 'unknown', isColdStart = true }) => {
    // Only track once per app lifecycle
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    // Calculate TTI
    const ttiMs = Date.now() - APP_START_TIME;

    // Gather metrics
    const metrics = {
      tti_ms: ttiMs,
      screen,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version || 'unknown',
      is_cold_start: isColdStart,
    };

    // Track to Mixpanel
    Analytics.track('app_performance', metrics);

    // Dev mode: Log to console
    if (DEV_MODE) {
      // eslint-disable-next-line no-console
      console.log('📊 [Performance] TTI tracked:', {
        ...metrics,
        tti_seconds: (ttiMs / 1000).toFixed(2),
      });
    }
  };

  return trackTTI;
};

/**
 * Hook variant that automatically tracks TTI when component mounts
 *
 * Usage:
 * useAutoPerformanceTracking({ screen: 'TimerScreen', isLoading });
 *
 * @param {Object} options
 * @param {string} options.screen - Screen name
 * @param {boolean} options.isLoading - Loading state (tracks when becomes false)
 */
export const useAutoPerformanceTracking = ({ screen, isLoading = false }) => {
  const trackTTI = usePerformanceTracking();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Only track when loading completes and not already tracked
    if (!isLoading && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackTTI({ screen });
    }
  }, [isLoading, screen, trackTTI]);
};
