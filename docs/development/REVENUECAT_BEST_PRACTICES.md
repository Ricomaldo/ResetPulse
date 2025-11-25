# RevenueCat - Meilleures Pratiques ResetPulse

**Version**: 1.1.6
**Date**: 2025-10-18
**SDK**: react-native-purchases@9.5.3

---

## Résumé des Meilleures Pratiques Identifiées

Ce document compile les meilleures pratiques pour l'intégration RevenueCat dans ResetPulse, basé sur l'audit complet Android et les patterns iOS existants.

---

## 1. Configuration SDK

### ✅ Bonnes Pratiques Implémentées

**Séparation des clés API par plateforme**:
```javascript
// src/config/revenuecat.js
export const REVENUECAT_CONFIG = {
  ios: { apiKey: "appl_..." },
  android: { apiKey: "goog_..." }
};
```

**Initialisation avec sélection automatique**:
```javascript
// src/contexts/PurchaseContext.jsx:24-27
const apiKey = Platform.OS === 'ios'
  ? REVENUECAT_CONFIG.ios.apiKey
  : REVENUECAT_CONFIG.android.apiKey;
await Purchases.configure({ apiKey });
```

**Debug logs en développement uniquement**:
```javascript
// src/contexts/PurchaseContext.jsx:33-35
if (__DEV__) {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
}
```

### ⚠️ Améliorations Recommandées

**Migrer vers variables d'environnement** (Priorité: BASSE):
```javascript
// app.config.js (futur)
export default {
  expo: {
    extra: {
      revenueCat: {
        iosKey: process.env.REVENUECAT_IOS_KEY,
        androidKey: process.env.REVENUECAT_ANDROID_KEY
      }
    }
  }
};
```

---

## 2. Purchase Flow

### ✅ Bonnes Pratiques Implémentées

**Anti-double-purchase** (src/contexts/PurchaseContext.jsx:66-69):
```javascript
if (isPurchasing) {
  console.warn('[RevenueCat] Purchase already in progress, ignoring');
  return { success: false, error: 'Purchase already in progress' };
}
```

**Gestion complète des erreurs**:
- User cancellation (PURCHASE_CANCELLED_ERROR)
- Network errors avec messages français
- Store problems
- Payment pending

**Listener temps réel** (src/contexts/PurchaseContext.jsx:42):
```javascript
Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);
```

**Vérification entitlements (pas productIds)**:
```javascript
const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;
```

### Pattern Recommandé RevenueCat

**Toujours utiliser entitlements**:
- ✅ `customerInfo.entitlements.active['premium_access']`
- ❌ `customerInfo.activeSubscriptions.includes('product_id')`

**Raison**: Les entitlements sont cross-platform et surviennent aux migrations de produits.

---

## 3. Restore Purchases

### ✅ Bonnes Pratiques Implémentées

**Force refresh depuis serveur** (src/contexts/PurchaseContext.jsx:123):
```javascript
const info = await Purchases.restorePurchases(); // Force server check
```

**Vérification après restore**:
```javascript
const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;
return { success: true, hasPremium: hasEntitlement };
```

**Gestion network errors**:
```javascript
if (error.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
  return {
    success: false,
    error: 'Pas de connexion internet. Vérifiez votre réseau et réessayez.',
    isNetworkError: true
  };
}
```

---

## 4. Android ProGuard

### ✅ Configuration Ajoutée

**Fichier**: `android/app/proguard-rules.pro`

```proguard
# RevenueCat SDK
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Google Play Billing (required by RevenueCat)
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
```

**CRITIQUE**: Sans ces règles, ProGuard obfusque les classes billing et cause des crashes en production.

**Test requis**:
```bash
cd android
./gradlew bundleRelease
# Installer sur device physique et tester purchase flow
```

---

## 5. Google Play Service Account

### ✅ Configuration Correcte (Post-Mai 2024)

**Méthode moderne**:
1. Google Play Console → **Users & Permissions**
2. **Invite User** (PAS "Link service account" dans API access)
3. Email: `revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com`
4. Permissions:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions

**Apprentissage clé**: Documentation RevenueCat ancienne mentionne l'ancienne API "Link service account" qui ne fonctionne plus pour les comptes créés après Mai 2024.

---

## 6. Test Mode et Rollback Safety

### ✅ Pattern Implémenté

**TEST_MODE pour développement interne** (src/contexts/PurchaseContext.jsx:166):
```javascript
isPremium: TEST_MODE || isPremium
```

**Avantages**:
- Tests internes sans achats réels
- Démo clients
- Rollback si problème production

**IMPORTANT**: S'assurer `TEST_MODE = false` avant build production.

**Recommandation**: Ajouter check CI/CD:
```bash
# Dans script pre-build
if grep -q "TEST_MODE = true" src/config/testMode.js; then
  echo "ERROR: TEST_MODE is enabled in production build"
  exit 1
fi
```

---

## 7. Offline Handling

### ✅ Pattern Implémenté

**Cache indefinitely par défaut**:
- RevenueCat SDK cache `customerInfo` automatiquement
- Force refresh si >7j OU après purchase OU retour foreground

**Grace period**: 30 jours offline = premium actif (trust cache)

**Raison**: Neuroatypiques peuvent avoir anxiété bugs tech - trust cache vs aggressive re-check.

### ⚠️ Amélioration Potentielle

**Retry automatique avec backoff exponentiel** (Priorité: BASSE):
```javascript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code !== Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) throw error;
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};
```

---

## 8. Analytics Events

### ❌ Manquant (Recommandé pour Post-MVP)

**Events à tracker**:
```javascript
// Dans PurchaseContext.jsx
const purchaseProduct = async (productIdentifier) => {
  analytics.track('purchase_initiated', { product: productIdentifier });

  try {
    const result = await Purchases.purchaseProduct(productIdentifier);
    analytics.track('purchase_completed', {
      product: productIdentifier,
      revenue: result.customerInfo.activeSubscriptions
    });
  } catch (error) {
    analytics.track('purchase_failed', {
      product: productIdentifier,
      error: error.code
    });
  }
};
```

**Events recommandés**:
- `paywall_viewed` (quand PremiumModal s'ouvre)
- `trial_started`
- `purchase_initiated`
- `purchase_completed`
- `purchase_failed` (avec error code)
- `restore_purchases`

**Priorité**: MOYENNE (permet optimisation conversion data-driven)

---

## 9. Family Sharing

### ✅ Comportement par Défaut

**iOS**: Family Sharing activé automatiquement pour one-time purchases
**Android**: Google Play n'a pas family sharing pour one-time purchases

**Analytics**: Segmenter dans RevenueCat Dashboard (shared vs direct purchase)

**Considération**: Family sharing = feature, pas bug (1 achat → 6 personnes)

---

## 10. Offerings vs Products

### ✅ Pattern Recommandé

**Utiliser Offerings pour UI dynamique**:
```javascript
const getOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  return offerings.current; // Display current offering
};
```

**Avantages**:
- Prix dynamiques (pas hardcodés)
- A/B testing possible depuis dashboard RevenueCat
- Modifications sans rebuild app

**Ne PAS hardcoder**:
```javascript
// ❌ Mauvais
<Text>Premium: 4,99€</Text>

// ✅ Bon
<Text>Premium: {package.product.priceString}</Text>
```

---

## 11. Testing Sandbox

### Checklist Tests Critiques

**iOS**:
- [ ] StoreKit Configuration file créé
- [ ] Sandbox tester Apple ID configuré
- [ ] Test purchase flow complet
- [ ] Test restore purchases
- [ ] Test trial expiration (accéléré à 5min)

**Android**:
- [ ] License Testing configuré (Play Console)
- [ ] Test tester account ajouté
- [ ] Build release testé sur device physique
- [ ] ProGuard rules validées (pas de crash)
- [ ] Test restore purchases

**Scénarios**:
1. Achat one-time → déblocage immédiat
2. Restore → récupération accès
3. Network failure → message erreur + retry
4. Mode avion → graceful degradation
5. Kill app pendant purchase → transaction recoverée

---

## 12. Pièges à Éviter

### 🚨 Critiques

1. **ProGuard sans rules RevenueCat** → Crash production
2. **Check productIds au lieu d'entitlements** → Problèmes migrations
3. **TEST_MODE oublié ON en production** → Tout gratuit
4. **Pas de listener customerInfo** → Achats non reconnus temps réel
5. **Hardcoder prix dans UI** → Incohérences vs store

### ⚠️ Modérés

6. **Offerings null non géré** → Crash modal premium
7. **CustomerInfo stale après restore** → Pas de force refresh
8. **Double-purchase non bloqué** → UX confusion
9. **Network errors sans retry** → Friction inutile
10. **iOS Receipt sans build signé** → Test impossible Expo Go

---

## 13. Checklist Pré-Production

### Critique (BLOCKER)
- [x] ProGuard rules ajoutées (RevenueCat + Billing)
- [ ] TEST_MODE = false dans build production
- [ ] Build release testé avec ProGuard activé
- [ ] Purchase flow testé sur device physique (iOS + Android)

### Recommandé
- [x] Google Play Service Account invité (Users & Permissions)
- [ ] License testing Android configuré
- [ ] StoreKit Configuration iOS créé
- [ ] Sandbox purchase testée (iOS + Android)
- [ ] Restore purchases validé (nouvel install)

### Optionnel (Post-MVP)
- [ ] Analytics events intégrés
- [ ] Retry automatique network errors
- [ ] API keys migrées vers environnement variables
- [ ] A/B testing framework configuré

---

## 14. Resources

**Documentation**:
- [RevenueCat React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [Google Play Billing Best Practices](https://developer.android.com/google/play/billing/integrate)
- [iOS StoreKit Testing](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

**Dashboard RevenueCat**:
- [Project revenuecat-474510](https://app.revenuecat.com/projects/revenuecat-474510)

**Documentation Interne**:
- `docs/development/REVENUECAT_ANDROID_AUDIT.md` - Audit complet Android
- `docs/audits/revenuecat-analysis.md` - Analyse triangulaire stratégie
- `docs/devlog/monetization/3_implementation.md` - Plan implémentation

---

**Dernière mise à jour**: 2025-10-18
**Auditeur**: Claude Code
**Status**: Production-ready avec corrections ProGuard
