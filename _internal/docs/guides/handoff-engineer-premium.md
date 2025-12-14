---
created: '2025-12-14'
updated: '2025-12-14'
status: active
priority: P0-CRITICAL
---

# Handoff: Premium Integration Fixes

> Corrections P0 et ameliorations P1 pour l'integration RevenueCat

## Context

Audit #10 revele 2 P0 critiques et 5 P1 importants. L'integration premium est fonctionnelle (95%) mais manque de robustesse et de feedback UX.

**Note**: P0-1 (hardcoded API keys) est traite dans [Security Handoff](handoff-engineer-security.md). Ce document couvre P0-2 et les P1.

---

## Task 1: Add Premium Validation on Startup (P0)

**Effort**: 2h | **Impact**: Prevents false premium status

### Problem

Premium status trusted from AsyncStorage cache only. If cache corrupted, user gets premium without purchase.

```javascript
// Current: Uses cache, syncs RevenueCat in background
// Risk: Cache corruption → false positive premium
```

### Solution: Force Validation on App Launch

**Edit**: `src/contexts/PurchaseContext.jsx`

```javascript
const initializePurchases = async () => {
  setIsLoading(true);

  try {
    // Configure RevenueCat
    const apiKey = Platform.OS === 'ios'
      ? REVENUECAT_CONFIG.ios.apiKey
      : REVENUECAT_CONFIG.android.apiKey;

    await Purchases.configure({ apiKey });

    // ALWAYS validate with RevenueCat (not just cache)
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement = customerInfo?.entitlements?.active?.premium !== undefined;

    // Update local state from server truth
    setIsPremium(hasEntitlement);
    setCustomerInfo(customerInfo);

    // Persist validated status
    await AsyncStorage.setItem(PREMIUM_STATUS_KEY, hasEntitlement.toString());

    if (__DEV__) {
      console.log('[RevenueCat] Premium status validated:', hasEntitlement);
    }
  } catch (error) {
    // On network failure, use cached status but log warning
    console.warn('[RevenueCat] Validation failed, using cache:', error.message);
    const cached = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    setIsPremium(cached === 'true');
  } finally {
    setIsLoading(false);
  }
};
```

### Verification

- [ ] Premium status validated on every app launch
- [ ] Network failure gracefully falls back to cache
- [ ] Cache updated after server validation
- [ ] Test: Set cache to `true` manually, verify reset to `false` on launch

---

## Task 2: Guard Debug Logging (P1)

**Effort**: 5 min | **Impact**: Production performance

### Problem

```javascript
// PurchaseContext.jsx line 57
await Purchases.setLogLevel(Purchases.LogLevel.DEBUG);
// Runs in production → verbose logging → battery drain
```

### Solution

```javascript
// Only enable debug in development
if (__DEV__) {
  await Purchases.setLogLevel(Purchases.LogLevel.DEBUG);
}
```

### Verification

- [ ] Run release build
- [ ] Check Logcat/Console for RevenueCat logs (should be minimal)

---

## Task 3: Move Restore Button to Settings (P1)

**Effort**: 1h | **Impact**: Cleaner paywall UI

### Problem

Restore Purchases button always visible in PremiumModal. Clutters UI for new users.

### Solution: Remove from PremiumModal, Add to Settings

**Edit**: `src/components/modals/PremiumModal.jsx`

```javascript
// REMOVE from PremiumModal (around line 363)
// <SecondaryButton
//   label={t('premium.restorePurchases')}
//   onPress={handleRestorePurchases}
// />
```

**Edit**: `src/components/modals/SettingsModal.jsx`

```javascript
// ADD to Account section
<SettingsSection title={t('settings.account')}>
  <SettingsRow
    icon="refresh"
    label={t('premium.restorePurchases')}
    onPress={handleRestorePurchases}
    description={t('premium.restoreDescription')}
  />
</SettingsSection>
```

**Add i18n key**:

```json
{
  "premium": {
    "restoreDescription": "Restore previous purchases on this device"
  }
}
```

### Verification

- [ ] Restore button NOT in PremiumModal
- [ ] Restore button visible in Settings > Account
- [ ] Restore functionality still works

---

## Task 4: Fix Trial Button Language (P1)

**Effort**: 30 min | **Impact**: Reduces purchase confusion

### Problem

Button says "Start Trial" but product is one-time purchase (not subscription).

### Solution

**Edit**: `src/components/modals/PremiumModal.jsx`

```javascript
// BEFORE
<PrimaryButton
  label={t('premium.startTrial')}
  onPress={handlePurchase}
/>

// AFTER
<PrimaryButton
  label={t('premium.tryFree')}
  onPress={handlePurchase}
/>

// Add subtitle below button
<Text style={styles.pricingSubtitle}>
  {t('premium.pricingExplainer')}
</Text>
```

**Update i18n**:

```json
{
  "premium": {
    "tryFree": "Try free for 7 days",
    "pricingExplainer": "Then 4,99€ once — yours forever"
  }
}
```

### Verification

- [ ] Button says "Try free for 7 days"
- [ ] Subtitle explains one-time purchase
- [ ] All supported languages updated

---

## Task 5: Add Post-Purchase Celebration (P1)

**Effort**: 1h | **Impact**: Better purchase feedback

### Problem

Purchase succeeds silently. User may not realize it worked.

### Solution: Show Celebration Toast

**Edit**: `src/contexts/PurchaseContext.jsx`

```javascript
import Toast from 'react-native-toast-message'; // or your toast library

const purchaseProduct = async (productIdentifier) => {
  // ... existing purchase logic ...

  if (purchaseSuccess) {
    // Show celebration
    Toast.show({
      type: 'success',
      text1: t('premium.welcomeTitle'),
      text2: t('premium.welcomeMessage'),
      visibilityTime: 4000,
      topOffset: 60,
    });

    // Track analytics
    analytics.trackPurchaseCompleted({
      product: productIdentifier,
      source: purchaseSource,
    });
  }
};
```

**Add i18n**:

```json
{
  "premium": {
    "welcomeTitle": "Welcome to Premium!",
    "welcomeMessage": "All activities and palettes are now unlocked"
  }
}
```

### Verification

- [ ] Toast appears after successful purchase
- [ ] Message is celebratory ("Welcome!" not just "Success")
- [ ] Works on both iOS and Android

---

## Task 6: Add Pending Payment Status (P1)

**Effort**: 2h | **Impact**: Prevents double-charge confusion

### Problem

"Paiement en attente" message shown, but user can't check status later. May retry and risk double-charge.

### Solution: Track Pending State

**Edit**: `src/contexts/PurchaseContext.jsx`

```javascript
const [hasPendingPurchase, setHasPendingPurchase] = useState(false);

const handlePurchase = async () => {
  // ... existing logic ...

  try {
    const result = await Purchases.purchasePackage(pkg);
    // Success
  } catch (error) {
    if (error.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
      setHasPendingPurchase(true);
      await AsyncStorage.setItem(PENDING_PURCHASE_KEY, 'true');

      Alert.alert(
        t('purchase.pendingTitle'),
        t('purchase.pendingMessage'),
        [
          { text: t('common.ok') },
          {
            text: t('purchase.checkStatus'),
            onPress: () => checkPendingPurchase(),
          },
        ]
      );
    }
  }
};

const checkPendingPurchase = async () => {
  const info = await Purchases.getCustomerInfo();
  const hasEntitlement = info?.entitlements?.active?.premium !== undefined;

  if (hasEntitlement) {
    setHasPendingPurchase(false);
    await AsyncStorage.removeItem(PENDING_PURCHASE_KEY);
    setIsPremium(true);

    Toast.show({
      type: 'success',
      text1: t('purchase.pendingResolved'),
    });
  } else {
    Toast.show({
      type: 'info',
      text1: t('purchase.stillPending'),
    });
  }
};
```

**Show in Settings if pending**:

```javascript
// SettingsModal.jsx
{hasPendingPurchase && (
  <SettingsRow
    icon="clock"
    label={t('settings.pendingPurchase')}
    onPress={checkPendingPurchase}
    rightElement={<ActivityIndicator size="small" />}
  />
)}
```

### Verification

- [ ] Pending purchase state tracked
- [ ] Settings shows pending status when applicable
- [ ] Check Status button validates with RevenueCat
- [ ] State clears when purchase completes

---

## Testing Checklist

### Purchase Flow
- [ ] New purchase works end-to-end
- [ ] Trial starts correctly
- [ ] Post-purchase toast shows
- [ ] Premium features immediately available

### Restore Flow
- [ ] Restore works from Settings
- [ ] Shows success/failure toast
- [ ] Updates premium status

### Pending Purchase
- [ ] Pending state tracked on payment pending error
- [ ] Settings shows pending indicator
- [ ] Check Status works
- [ ] State clears on resolution

### Validation
- [ ] Premium validated on app launch
- [ ] Network failure uses cache gracefully
- [ ] Manual cache tampering doesn't bypass validation

---

## Priority Order

1. **Task 1** (Validation) — Security/integrity critical
2. **Task 2** (Debug logging) — 5 min quick fix
3. **Task 4** (Trial language) — Prevents confusion
4. **Task 5** (Celebration) — Better UX
5. **Task 3** (Restore button) — UI cleanup
6. **Task 6** (Pending status) — Edge case handling

---

## References

- [Premium Report](../reports/premium.md)
- [Security Handoff](handoff-engineer-security.md) (for API keys P0)
- [ADR Monetization v11](../legacy/decisions-adr-monetization-v11.md)
- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_10-premium-integration.md`

---

**Total Effort**: ~6.5h (excluding API keys from Security handoff)
**Target**: Robust premium validation + better purchase UX
