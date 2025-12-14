---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: handoff
target: Claude-Engineer
priority: P1
---

# Handoff: Performance Optimizations

> Instructions pour Claude-Engineer — P1 Performance Fixes

## Context

Suite a l'audit #2 Performance (2025-12-14), 2 issues P1 identifies.

**Source**: `_internal/docs/reports/audit-performance-baseline-2025-12.md`

---

## Scope

| Task | Effort | Gain |
|------|--------|------|
| 1. RevenueCat Caching | ~4h | -300ms cold start |
| 2. Basic TTI Monitoring | ~2h | Real-world metrics |

---

## 1. RevenueCat CustomerInfo Caching

### Problem

**Location**: `src/contexts/PurchaseContext.jsx:20-48`

Chaque cold start:
1. `Purchases.configure()` → network fetch
2. Validation receipt App Store/Play
3. **+200-500ms** bloquant

### Solution

Cache `customerInfo` dans AsyncStorage avec timestamp. Afficher status cache immediatement, refresh en background.

### Implementation

```javascript
// src/contexts/PurchaseContext.jsx

const CACHE_KEY = 'revenuecat_customer_info';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

const PurchaseProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePurchases = async () => {
      try {
        // 1. Check cache first (instant)
        const cached = await loadCachedStatus();
        if (cached && !isCacheExpired(cached.timestamp)) {
          setIsPremium(cached.isPremium);
          setIsLoading(false); // ✅ Instant UI
          // Continue to refresh in background...
        }

        // 2. Configure RevenueCat
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        // 3. Get fresh customerInfo
        const customerInfo = await Purchases.getCustomerInfo();
        const freshIsPremium = checkPremiumEntitlement(customerInfo);

        // 4. Update state + cache
        setIsPremium(freshIsPremium);
        await saveCachedStatus(freshIsPremium);

        if (!cached) {
          setIsLoading(false); // First launch
        }
      } catch (error) {
        console.error('[RevenueCat] Init error:', error);
        // Fallback to cached or free
        setIsLoading(false);
      }
    };

    initializePurchases();
  }, []);

  // ... rest of provider
};

// Helper functions
const loadCachedStatus = async () => {
  try {
    const json = await AsyncStorage.getItem(CACHE_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

const saveCachedStatus = async (isPremium) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      isPremium,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('[RevenueCat] Cache save failed:', error);
  }
};

const isCacheExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_TTL;
};

const checkPremiumEntitlement = (customerInfo) => {
  return customerInfo?.entitlements?.active?.premium_access !== undefined;
};
```

### Key Points

- **Instant UI**: Cache valide → `setIsLoading(false)` immédiat
- **Background refresh**: Toujours fetch fresh data après
- **TTL 24h**: Cache expire après 24h (force re-validation)
- **Graceful fallback**: Erreur réseau → utilise cache ou free

### Edge Cases

| Case | Behavior |
|------|----------|
| First launch (no cache) | Normal flow, wait for network |
| Cache valid | Instant premium, refresh background |
| Cache expired | Show loading, fetch fresh |
| Network error + valid cache | Use cache |
| Network error + no cache | Default to free |
| Purchase completed | Invalidate cache, refresh |

### Post-Purchase Cache Invalidation

```javascript
// After successful purchase
const handlePurchaseSuccess = async () => {
  // Invalidate cache to force fresh fetch
  await AsyncStorage.removeItem(CACHE_KEY);

  // Refresh customerInfo
  const customerInfo = await Purchases.getCustomerInfo();
  // ... update state
};
```

---

## 2. Basic TTI Monitoring

### Problem

**Location**: N/A (missing)

Aucune métrique de performance real-world. On ne sait pas si les users ont des cold starts lents.

### Solution

Tracker le Time-To-Interactive (TTI) via Mixpanel.

### Implementation

```javascript
// App.js - At the very top, before imports
const APP_START_TIME = Date.now();

// ... imports ...

// Inside App component, after initial render ready
useEffect(() => {
  if (!isLoading && !isInitializing) {
    // App is interactive
    const tti = Date.now() - APP_START_TIME;

    Analytics.track('app_performance', {
      tti_ms: tti,
      screen: hasCompletedOnboarding ? 'timer' : 'onboarding',
      is_cold_start: true,
      app_version: Constants.expoConfig?.version,
    });

    if (__DEV__) {
      console.log(`[Performance] TTI: ${tti}ms`);
    }
  }
}, [isLoading, isInitializing]);
```

### Alternative: Dedicated Hook

```javascript
// src/hooks/usePerformanceTracking.js
import { useEffect, useRef } from 'react';
import Analytics from '../services/analytics';
import Constants from 'expo-constants';

const APP_START_TIME = Date.now();

export const usePerformanceTracking = (isReady, screenName) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (isReady && !tracked.current) {
      tracked.current = true;

      const tti = Date.now() - APP_START_TIME;

      Analytics.track('app_performance', {
        tti_ms: tti,
        screen: screenName,
        is_cold_start: true,
        app_version: Constants.expoConfig?.version,
        platform: Platform.OS,
      });

      if (__DEV__) {
        console.log(`[Performance] TTI: ${tti}ms (${screenName})`);
      }
    }
  }, [isReady, screenName]);
};

// Usage in App.js
const App = () => {
  const isReady = !isLoading && !isInitializing;
  usePerformanceTracking(isReady, hasCompletedOnboarding ? 'timer' : 'onboarding');

  // ...
};
```

### Mixpanel Dashboard

After deployment, create Mixpanel report:
- **Event**: `app_performance`
- **Metric**: Average `tti_ms`
- **Breakdown**: By `platform`, `app_version`
- **Alert**: If P95 TTI > 2000ms

---

## Verification

```bash
# Run tests
npm test

# Verify no regressions
npm test -- --coverage

# Test on device
npx expo start
# 1. Force quit app
# 2. Cold launch
# 3. Check console for TTI log
# 4. Verify premium status shows instantly (if cached)
```

### Expected Outcomes

- [ ] RevenueCat caching implemented
- [ ] Cold start reduced ~300ms (cached users)
- [ ] TTI tracking via Mixpanel
- [ ] All tests still pass
- [ ] No UI regressions

---

## Testing Checklist

### RevenueCat Caching

- [ ] First launch: Normal loading, then cache saved
- [ ] Second launch: Instant premium status (no loading flicker)
- [ ] After 24h: Cache expired, shows loading
- [ ] Purchase: Cache invalidated, fresh status
- [ ] Airplane mode + valid cache: Uses cache
- [ ] Airplane mode + no cache: Shows free

### TTI Monitoring

- [ ] Cold start: Event tracked with tti_ms
- [ ] Hot start (from background): Not tracked (only cold)
- [ ] Console log shows TTI in dev mode
- [ ] Mixpanel dashboard shows events

---

## Notes

- **Pure optimization** — no feature changes
- **Graceful degradation** — errors fallback safely
- **Test on real device** — simulator timing differs

---

**Generated by**: Atlas/Claude-Architect
**Date**: 2025-12-14
**For**: Claude-Engineer Phase 5
