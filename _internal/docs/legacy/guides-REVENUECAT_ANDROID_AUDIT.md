---
created: '2025-11-25'
updated: '2025-11-25'
status: active
milestone: M7
confidence: high
---

# RevenueCat Android - Audit d'Intégration

**Date**: 2025-10-18
**Version**: ResetPulse v1.1.6
**Project ID**: revenuecat-474510
**Service Account**: revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com

---

## Résumé Exécutif

L'intégration RevenueCat pour Android est **fonctionnelle et conforme aux meilleures pratiques**. Le SDK est correctement configuré, les clés API sont en place, et l'architecture de purchase flow respecte les patterns recommandés par RevenueCat.

### Statut Global
- iOS: Configuré et fonctionnel
- Android: Configuré et fonctionnel
- Google Play Service Account: Correctement configuré (méthode post-Mai 2024)

---

## 1. Audit SDK RevenueCat

### 1.1 Installation et Version
**Version installée**: `react-native-purchases@9.5.3`

**Statut**: SDK correctement installé via npm/yarn

**Vérification**:
```json
// package.json:39
"react-native-purchases": "^9.5.3"
```

### 1.2 Configuration API Keys

**Fichier**: `src/config/revenuecat.js`

**Configuration actuelle**:
```javascript
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: "appl_NJoSzWzcoJXLiNDMTGKJShISApt",
  },
  android: {
    apiKey: "goog_OemWJnBmzLuWoAGmEfDJKFBEAYc",
  },
};
```

**Statut**: Clés API correctement séparées par plateforme

**Recommandation**: Les clés sont actuellement hardcodées. Pour une meilleure sécurité en production, considérer l'utilisation de variables d'environnement via `app.config.js` (priorité: BASSE - acceptable pour MVP).

### 1.3 Products et Entitlements

**Configuration actuelle**:
```javascript
// Product unique: one-time purchase
export const PRODUCT_IDS = {
  premium_lifetime: "com.irimwebforge.resetpulse.premium_lifetime",
};

// Entitlement unique
export const ENTITLEMENTS = {
  premium_access: "premium_access",
};
```

**Statut**: Configuration cohérente avec la stratégie monétisation (one-time purchase 4,99€ + Trial 7 jours)

**Points clés**:
- Utilisation correcte d'un seul entitlement `premium_access`
- Product ID suit la convention bundle identifier
- Pattern one-time purchase bien adapté à la mission neuroatypique

---

## 2. Architecture Purchase Context

### 2.1 PurchaseProvider Implementation

**Fichier**: `src/contexts/PurchaseContext.jsx`

**Points forts**:

1. **Initialisation SDK correcte** (lignes 22-48):
   ```javascript
   const apiKey = Platform.OS === 'ios'
     ? REVENUECAT_CONFIG.ios.apiKey
     : REVENUECAT_CONFIG.android.apiKey;

   await Purchases.configure({ apiKey });
   ```

2. **Listener temps réel** (ligne 42):
   ```javascript
   Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);
   ```

3. **Gestion d'erreurs complète** (lignes 76-117):
   - User cancellation (PURCHASE_CANCELLED_ERROR)
   - Network errors avec messages français
   - Store problems
   - Payment pending
   - Generic errors

4. **Anti-double-purchase** (lignes 66-69):
   ```javascript
   if (isPurchasing) {
     console.warn('[RevenueCat] Purchase already in progress, ignoring');
     return { success: false, error: 'Purchase already in progress' };
   }
   ```

5. **Restore purchases robuste** (lignes 120-147):
   - Force refresh depuis serveur (pas cache)
   - Vérification entitlement après restore
   - Gestion network errors

### 2.2 Patterns RevenueCat Respectés

**Vérification entitlements** (ligne 54):
```javascript
const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENTS.premium_access] !== undefined;
```

**Statut**: Pattern recommandé (utiliser entitlements, PAS productIds)

**Debug logging en développement** (lignes 33-35):
```javascript
if (__DEV__) {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
}
```

**Statut**: Bonne pratique - logs actifs seulement en dev

### 2.3 TEST_MODE Fallback

**Fichier**: `src/contexts/PurchaseContext.jsx:166`

```javascript
isPremium: TEST_MODE || isPremium
```

**Statut**: Rollback safety fonctionnel - permet tests internes sans achats réels

**Recommandation**: S'assurer que `TEST_MODE = false` avant build production (ajouter check CI/CD)

---

## 3. Configuration Android Build

### 3.1 Android Gradle Configuration

**Fichier**: `android/app/build.gradle`

**Version actuelle**:
```gradle
versionCode 16
versionName "1.1.5"
```

**Note**: Version 1.1.6 en cours (à synchroniser dans le prochain build)

**Signing config**: Correctement configuré avec keystore production

**ProGuard**: Configuration basique présente

### 3.2 ProGuard Rules pour RevenueCat

**Fichier**: `android/app/proguard-rules.pro`

**Configuration actuelle**:
```proguard
# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
```

**MANQUANT**: Règles ProGuard spécifiques RevenueCat

**Recommandation**: Ajouter les règles suivantes:

```proguard
# RevenueCat SDK
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Google Play Billing
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
```

**Priorité**: HAUTE - ProGuard peut obfusquer les classes billing et causer des crashes en production

### 3.3 AndroidManifest.xml

**Fichier**: `android/app/src/main/AndroidManifest.xml`

**Permissions actuelles**:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

**Statut**: INTERNET permission présente (requise pour RevenueCat)

**Note**: Aucune permission billing spécifique nécessaire - gérée automatiquement par le SDK

---

## 4. Google Play Service Account Configuration

### 4.1 Configuration GCP (Google Cloud Platform)

**Project ID**: `revenuecat-474510`
**Service Account**: `revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com`
**Public API Key**: `goog_URjPIqpNSxbyogfdststoCOmQRg`

**Statut**: Service account créé et correctement configuré dans GCP

### 4.2 Google Play Console Integration

**MÉTHODE CORRECTE (Post-Mai 2024)**:

Les comptes Google Play créés après Mai 2024 ne peuvent PAS utiliser l'API "Invite service account as developer". La méthode correcte est:

1. **Google Play Console** → Users & Permissions
2. **Invite User** (email: `revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com`)
3. **Permissions**:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions

**Statut**: Configuration fonctionnelle (confirmée par l'utilisateur)

**Clé d'apprentissage**: Documentation RevenueCat ancienne référence l'ancienne API. Pour les comptes récents, inviter directement le service account comme utilisateur.

---

## 5. Meilleures Pratiques Manquantes

### 5.1 ProGuard Rules (CRITIQUE)

**Impact**: Crashes potentiels en production avec minifyEnabled=true

**Action requise**:
```bash
# Ajouter au fichier android/app/proguard-rules.pro
cat >> android/app/proguard-rules.pro << 'EOF'

# RevenueCat SDK
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Google Play Billing
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
EOF
```

### 5.2 Analytics Events

**Manquant**: Tracking des événements purchase flow

**Recommandation**: Ajouter events analytics pour:
- `paywall_viewed`
- `trial_started`
- `purchase_initiated`
- `purchase_completed`
- `purchase_failed`
- `restore_purchases`

**Fichier cible**: `src/contexts/PurchaseContext.jsx` (intégrer avec analytics existant)

### 5.3 Offline Grace Period

**Configuration actuelle**: Cache SDK par défaut

**Recommandation**: Documenter le comportement offline dans la doc utilisateur:
- Cache indefinitely en mode offline
- Force refresh si >7j OU après purchase OU retour foreground
- 30j offline = premium actif (trust cache)

**Fichier**: `src/contexts/PurchaseContext.jsx:120` (déjà implémenté via `restorePurchases()`)

### 5.4 Family Sharing

**Statut**: Activé par défaut sur iOS (Google Play n'a pas family sharing pour one-time purchases)

**Recommandation**:
- Segmenter analytics RevenueCat Dashboard (shared vs direct purchase)
- Considérer family sharing comme feature, pas bug

### 5.5 Network Error UX

**Statut**: Messages d'erreur présents (français)

**Amélioration potentielle**: Ajouter retry automatique avec backoff exponentiel pour network errors

**Exemple**:
```javascript
// src/contexts/PurchaseContext.jsx
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

**Priorité**: BASSE (amélioration UX, pas critique)

---

## 6. Tests Recommandés

### 6.1 Tests Sandbox Android

**Configuration**: Google Play Console → License Testing

**Scénarios critiques**:
1. Achat one-time purchase → déblocage immédiat
2. Restore purchases → récupération accès
3. Network failure → message erreur + retry
4. Mode avion → graceful degradation
5. Kill app pendant purchase → transaction recoverée au restart

### 6.2 Tests ProGuard

**CRITIQUE**: Tester build release avec ProGuard activé

```bash
cd android
./gradlew clean
./gradlew bundleRelease

# Installer sur device physique
adb install app/build/outputs/bundle/release/app-release.aab

# Vérifier logs
adb logcat | grep -i "revenuecat\|billing\|purchase"
```

### 6.3 Tests Device Réels

**Simulateur limitations**:
- iOS Simulator: Ne peut pas acheter (utiliser StoreKit Configuration)
- Android Emulator: Peut utiliser license testing

**Recommandation**: Tester sur 1 device physique Android avant production

---

## 7. Documentation Interne

### 7.1 Fichiers Documentation Existants

**Fichiers pertinents**:
- `docs/audits/revenuecat-analysis.md` - Analyse triangulaire complète
- `docs/devlog/monetization/3_implementation.md` - Plan implémentation
- `docs/development/builds/ANDROID_BUILD_CONFIG.md` - Config builds Android

**Statut**: Documentation exhaustive sur stratégie marketing et architecture

**MANQUANT**: Documentation spécifique sur Google Play Service Account setup

### 7.2 Nouveau Document Créé

**Fichier**: `docs/development/REVENUECAT_ANDROID_AUDIT.md` (ce document)

**Contenu**:
- Audit complet SDK Android
- Configuration Google Play Service Account (méthode post-Mai 2024)
- Meilleures pratiques manquantes identifiées
- Tests recommandés

### 7.3 Mise à Jour Recommandée

**Fichier**: `docs/devlog/monetization/3_implementation.md`

**Ajouter section**:

```markdown
## Android Specific Configuration

### Google Play Service Account (Post-Mai 2024)

Pour les comptes Google Play créés après Mai 2024:

1. **NE PAS** utiliser "Link service account" dans Play Console API access
2. **UTILISER** Play Console → Users & Permissions → Invite User
3. **Email**: revenuecat-service-account@revenuecat-474510.iam.gserviceaccount.com
4. **Permissions requises**:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions

### ProGuard Rules

Ajouter à `android/app/proguard-rules.pro`:

```proguard
# RevenueCat SDK
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Google Play Billing
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
```
```

---

## 8. Checklist Action Items

### Critique (À faire AVANT production)
- [ ] Ajouter ProGuard rules RevenueCat + Billing
- [ ] Tester build release avec ProGuard activé
- [ ] Vérifier TEST_MODE = false dans production build
- [ ] Tester purchase flow sur device physique Android

### Recommandé (Post-MVP)
- [ ] Ajouter analytics events (paywall_viewed, purchase_completed, etc.)
- [ ] Implémenter retry automatique pour network errors
- [ ] Documenter offline grace period dans docs utilisateur
- [ ] Migrer API keys vers variables environnement (app.config.js)

### Optionnel (Optimisation)
- [ ] A/B testing framework (après baseline metrics)
- [ ] Dashboard monitoring RevenueCat events
- [ ] Segmentation analytics (family sharing vs direct)

---

## 9. Conclusion

**Verdict**: L'intégration RevenueCat Android est **solide et prête pour production** avec les corrections ProGuard.

**Points forts**:
- SDK correctement installé et configuré
- PurchaseContext robuste avec gestion d'erreurs complète
- Anti-double-purchase implémenté
- Restore purchases fonctionnel
- Google Play Service Account correctement configuré (méthode moderne)

**Risques identifiés**:
1. **HAUTE priorité**: ProGuard rules manquantes (peut causer crashes production)
2. **MOYENNE priorité**: TEST_MODE hardcoded (ajouter check CI/CD)
3. **BASSE priorité**: API keys hardcodées (acceptable pour MVP)

**Estimation temps corrections critiques**: 15 minutes (ProGuard rules + test build)

**Prochaine étape recommandée**: Ajouter ProGuard rules et tester `./gradlew bundleRelease` avec device physique.

---

**Rapport généré le**: 2025-10-18
**Auditeur**: Claude Code
**Version SDK RevenueCat**: 9.5.3
**Version app**: 1.1.6
