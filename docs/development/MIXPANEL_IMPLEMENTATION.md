# Mixpanel Implementation Guide - ResetPulse

**Date**: 18 Octobre 2025
**Version**: 1.1.7 → 1.1.8
**Timeline**: M7.5 (19-20 Oct) - 3h dev + 1h validation
**Status**: 📋 Ready to implement

---

## Overview

**Objectif** : Tracker 6 events critiques avant marketing launch
**Durée estimée** : 3h dev (si zero galère) + 1h validation tests
**Pré-requis** : iOS live, Android pending, RevenueCat opérationnel

**Stratégie complète** : Voir `docs/decisions/analytics-strategy.md`

---

## Phase 1 : Installation SDK (30min)

### 1.1 Créer Compte Mixpanel

**Action** : https://mixpanel.com/register

**Setup** :
- Plan : Free (100k events/mois)
- Email : Ton email perso
- Projet : "ResetPulse"
- Timezone : Europe/Paris
- Industry : Mobile Apps

**Récupère** : Project Token
- Dashboard → Settings (gear icon top right)
- Project Settings → Project Token
- **Format** : `abc123def456...` (40 caractères)
- **Note** : Copie dans Notes app (pas perdu)

---

### 1.2 Installer SDK Expo

**Terminal** :
```bash
cd /Users/irimwebforge/CodeBase/apps/ResetPulse
npx expo install mixpanel-react-native
```

**Vérification** :
```bash
# Vérifie package.json
grep mixpanel package.json
# Devrait afficher : "mixpanel-react-native": "^X.X.X"
```

**Si erreur npm** : Clear cache et retry
```bash
npm cache clean --force
npx expo install mixpanel-react-native
```

---

### 1.3 Créer Config File

**Créer** : `src/config/mixpanel.js`

```javascript
// src/config/mixpanel.js
import { Mixpanel } from 'mixpanel-react-native';
import { Platform } from 'react-native';

// Mixpanel Project Token - ResetPulse Production
const MIXPANEL_TOKEN = '***REMOVED***';

class Analytics {
  constructor() {
    this.mixpanel = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      this.mixpanel = await Mixpanel.init(MIXPANEL_TOKEN);
      this.isInitialized = true;

      if (__DEV__) {
        console.log('✅ Mixpanel initialized successfully');
      }
    } catch (error) {
      console.error('❌ Mixpanel init failed:', error);
      this.isInitialized = false;
    }
  }

  track(eventName, properties = {}) {
    if (!this.isInitialized || !this.mixpanel) {
      if (__DEV__) {
        console.warn('⚠️ Mixpanel not initialized, event ignored:', eventName);
      }
      return;
    }

    // Enrichir avec super properties automatiques
    const enrichedProperties = {
      ...properties,
      platform: Platform.OS,
      app_version: '1.1.8', // ⚠️ Update manuellement à chaque release
      timestamp: new Date().toISOString()
    };

    this.mixpanel.track(eventName, enrichedProperties);

    if (__DEV__) {
      console.log('📊 Mixpanel event:', eventName, enrichedProperties);
    }
  }

  // Helper pour identifier user (après purchase)
  identify(userId) {
    if (!this.isInitialized || !this.mixpanel) return;
    this.mixpanel.identify(userId);
  }

  // Super properties (persistent)
  setSuperProperties(properties) {
    if (!this.isInitialized || !this.mixpanel) return;
    this.mixpanel.registerSuperProperties(properties);
  }
}

export default new Analytics();
```

---

### 1.4 Initialiser dans App.js

**Fichier** : `App.js`

**Ajouter en haut** :
```javascript
import Analytics from './src/config/mixpanel';
```

**Ajouter dans le composant App** (avant return) :
```javascript
export default function App() {
  // ... existing code

  useEffect(() => {
    // Initialize Mixpanel
    Analytics.init();

    // Set super properties
    Analytics.setSuperProperties({
      environment: __DEV__ ? 'development' : 'production'
    });
  }, []);

  // ... reste du code
}
```

**Vérification console** :
- Rebuild app : `npx expo start --clear`
- Ouvre app device
- Console devrait afficher : `✅ Mixpanel initialized successfully`

**Si erreur "module not found"** :
```bash
# Clear metro bundler
rm -rf node_modules/.cache
npx expo start --clear
```

---

## Phase 2 : Events Core (1h30)

### 2.1 Event: app_opened

**Fichier** : `App.js`

**Imports** :
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import Analytics from './src/config/mixpanel';
```

**Ajouter après init Mixpanel** :
```javascript
useEffect(() => {
  // Initialize Mixpanel
  Analytics.init();

  // Track app opened
  const trackAppOpen = async () => {
    try {
      const firstLaunchFlag = await AsyncStorage.getItem('@first_launch');
      const isFirstLaunch = firstLaunchFlag === null;

      Analytics.track('app_opened', {
        is_first_launch: isFirstLaunch,
        source: 'organic' // TODO: Deeplink attribution future
      });

      // Set flag après first launch
      if (isFirstLaunch) {
        await AsyncStorage.setItem('@first_launch', 'false');

        if (__DEV__) {
          console.log('🎉 First launch detected');
        }
      }
    } catch (error) {
      console.error('Error tracking app_opened:', error);
    }
  };

  trackAppOpen();
}, []);
```

**Test** :
1. Delete app device
2. Fresh install
3. Console devrait afficher : `📊 Mixpanel event: app_opened { is_first_launch: true, ... }`
4. Relaunch app
5. Console devrait afficher : `📊 Mixpanel event: app_opened { is_first_launch: false, ... }`

---

### 2.2 Event: onboarding_completed

**Fichier** : `src/components/onboarding/OnboardingController.jsx`

**Import** (en haut) :
```javascript
import Analytics from '../../config/mixpanel';
```

**Trouver la fonction** `completeOnboarding` (cherche "setOnboardingComplete")

**Ajouter avant** `setOnboardingComplete(true)` :
```javascript
const completeOnboarding = async () => {
  // Track onboarding completion
  Analytics.track('onboarding_completed', {
    duration_seconds: Math.round((Date.now() - onboardingStartTime) / 1000),
    steps_completed: tooltips.length,
    skipped: false
  });

  setOnboardingComplete(true);
  // ... reste du code
};
```

**Si variable `onboardingStartTime` n'existe pas** :

Ajouter en haut du composant :
```javascript
const [onboardingStartTime] = useState(Date.now());
```

**Test** :
1. Settings → "Relancer le guide"
2. Complète les 4 tooltips
3. Console devrait afficher : `📊 Mixpanel event: onboarding_completed { duration_seconds: 45, ... }`

---

### 2.3 Event: paywall_viewed

**Fichier** : `src/components/PremiumModal.jsx`

**Import** (en haut) :
```javascript
import Analytics from '../config/mixpanel';
```

**Ajouter useEffect après les useState** :
```javascript
// Track paywall view
useEffect(() => {
  if (visible) {
    Analytics.track('paywall_viewed', {
      source: highlightedFeature || 'unknown',
      trigger: 'manual' // Activity locked, palette locked, settings button
    });
  }
}, [visible, highlightedFeature]);
```

**Test** :
1. Lock une palette premium (ex: "Forêt Brumeuse")
2. Tap dessus
3. Modal s'ouvre
4. Console devrait afficher : `📊 Mixpanel event: paywall_viewed { source: 'palette', ... }`

---

### 2.4 Event: trial_started + purchase_completed + purchase_failed

**Fichier** : `src/components/PremiumModal.jsx`

**Modifier la fonction** `handlePurchase` :

**AVANT** :
```javascript
const handlePurchase = async () => {
  try {
    setIsPurchasing(true);
    // ...
    const result = await purchaseProduct(premiumPackage.product.identifier);

    if (result.success) {
      // Success handling
    }
  } catch (error) {
    // Error handling
  }
}
```

**APRÈS** :
```javascript
const handlePurchase = async () => {
  try {
    setIsPurchasing(true);
    haptics.selection().catch(() => {});

    // Get offerings
    const offerings = await getOfferings();

    // Handle errors (network, no offerings)
    if (!offerings || offerings.error || !offerings.availablePackages || offerings.availablePackages.length === 0) {
      // ... existing error handling

      // Track failed offerings fetch
      Analytics.track('purchase_failed', {
        error_code: offerings?.error || 'no_offerings',
        step_failed: 'offerings_fetch'
      });

      setIsPurchasing(false);
      return;
    }

    const premiumPackage = offerings.availablePackages[0];

    // Track trial start (user intention)
    Analytics.track('trial_started', {
      product_id: premiumPackage.product.identifier,
      trigger_source: highlightedFeature || 'unknown'
    });

    // Initiate purchase
    const result = await purchaseProduct(premiumPackage.product.identifier);

    if (result.success) {
      // Track successful purchase
      Analytics.track('purchase_completed', {
        product_id: premiumPackage.product.identifier,
        price_eur: 4.99,
        revenue_eur: 4.99,
        trial_duration_days: 7
      });

      haptics.success().catch(() => {});
      Alert.alert(
        "Bienvenue Premium ! 🎉",
        "Toutes les palettes et activités sont maintenant débloquées.",
        [{ text: "Super !", onPress: onClose }]
      );
    } else if (result.cancelled) {
      // User cancelled - silent (no event needed)
    } else {
      // Track failed purchase
      Analytics.track('purchase_failed', {
        error_code: result.isNetworkError ? 'NETWORK_ERROR' :
                    result.isStoreError ? 'STORE_ERROR' :
                    result.isPaymentPending ? 'PAYMENT_PENDING' : 'UNKNOWN',
        error_message: result.error || 'Unknown error',
        step_failed: 'purchase_call'
      });

      // Existing error alerts
      if (result.isNetworkError) {
        Alert.alert("Pas de connexion", result.error, [{ text: "OK" }]);
      } else if (result.isPaymentPending) {
        Alert.alert("Paiement en cours", result.error, [{ text: "OK", onPress: onClose }]);
      } else {
        Alert.alert("Erreur", result.error || "Une erreur est survenue lors de l'achat.", [{ text: "OK" }]);
      }
    }
  } catch (error) {
    console.error("[PremiumModal] Purchase error:", error);

    // Track unexpected error
    Analytics.track('purchase_failed', {
      error_code: 'UNEXPECTED_ERROR',
      error_message: error.message || 'Unknown error',
      step_failed: 'unexpected'
    });

    Alert.alert("Erreur", "Une erreur est survenue. Réessayez plus tard.", [{ text: "OK" }]);
  } finally {
    setIsPurchasing(false);
  }
};
```

**Test sandbox iOS** :
1. Ouvre paywall
2. Console : `📊 paywall_viewed`
3. Tap "Essayer 7j"
4. Console : `📊 trial_started`
5. Complète achat sandbox
6. Console : `📊 purchase_completed { price_eur: 4.99, ... }`

**Test cancel** :
1. Ouvre paywall
2. Tap "Essayer 7j"
3. Console : `📊 trial_started`
4. Cancel modal Apple
5. Aucun event supplémentaire (normal)

**Test network error** :
1. Active mode avion
2. Ouvre paywall
3. Tap "Essayer 7j"
4. Console : `📊 trial_started` puis `📊 purchase_failed { error_code: 'NETWORK_ERROR', ... }`

---

## Phase 3 : RevenueCat Webhooks (30min)

### 3.1 Configuration Dashboard RevenueCat

**Navigation** : https://app.revenuecat.com/projects/revenuecat-474510

**Steps** :
1. **Integrations** (menu gauche)
2. **Add Integration** → Cherche "Mixpanel"
3. **Mixpanel Token** : Colle ton project token
4. **Events à activer** :
   - ✅ Initial Purchase
   - ✅ Trial Started
   - ✅ Renewal (non applicable one-time, mais active quand même)
   - ✅ Cancellation
   - ✅ Non Renewing Purchase
5. **Save**

**Important** : Properties mappées automatiquement
- `product_id` → RevenueCat product identifier
- `price` → Store price localized
- `revenue` → Actual revenue (après Apple/Google cut)

---

### 3.2 Test Webhooks

**Sandbox purchase iOS** :
1. Fais achat test
2. Attends 1-5 minutes (délai webhook)
3. Dashboard Mixpanel → Live View
4. Vérifie event `purchase_completed` apparaît **2 fois** :
   - Source `$source: 'app'` (ton code)
   - Source `$source: 'revenuecat'` (webhook)

**Si doublon** : ✅ Normal, garde les deux
- Code = temps réel (UX feedback)
- Webhook = source vérité (Apple/Google confirmed)
- Utile cross-validation fraude

**Si seulement 1 event** :
- Webhook délai peut aller jusqu'à 5min
- Vérifie RevenueCat Dashboard → Webhooks History
- Si erreur 400/500 : vérifie token Mixpanel correct

---

## Phase 4 : ProGuard Android (15min)

### 4.1 Ajouter Rules Mixpanel

**Fichier** : `android/app/proguard-rules.pro`

**Ajouter à la fin** :
```proguard
# Mixpanel SDK
-keep class com.mixpanel.** { *; }
-keep interface com.mixpanel.** { *; }
-dontwarn com.mixpanel.**
```

**Vérification** :
```bash
# Check file existe
cat android/app/proguard-rules.pro

# Devrait contenir :
# - RevenueCat rules (déjà présents)
# - Google Play Billing rules (déjà présents)
# - Mixpanel rules (nouveaux)
```

---

### 4.2 Test Build Release Android

**Build release avec ProGuard activé** :
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

**Si erreur build** :
- Vérifie ProGuard rules syntax
- Cherche dans logs : "ClassNotFoundException"
- Si Mixpanel class stripped : rules pas appliquées

**Si build success** :
- AAB généré : `android/app/build/outputs/bundle/release/app-release.aab`
- Taille ~65-70 MB (similar v1.1.7)

---

## Phase 5 : Validation Tests (1h)

### 5.1 Checklist iOS Fresh Install

**Device physique iOS requis** (Expo Go ne suffit pas pour IAP)

**Test Flow** :
```
1. Delete app → Reinstall TestFlight
   ✅ Console: app_opened { is_first_launch: true }

2. Complete onboarding (4 tooltips)
   ✅ Console: onboarding_completed { duration_seconds: X }

3. Tap palette locked (ex: "Forêt Brumeuse")
   ✅ Console: paywall_viewed { source: 'palette' }

4. Tap "Essayer 7j" → Complete sandbox purchase
   ✅ Console: trial_started
   ✅ Console: purchase_completed { price_eur: 4.99 }

5. Attends 5min → Check Mixpanel Dashboard
   ✅ Live View: 5 events visibles
   ✅ purchase_completed apparaît 2x (code + webhook)
```

---

### 5.2 Checklist Android Build

**Device physique Android requis** (ProGuard seulement en release)

**Test Flow** :
```
1. Build release AAB
   ✅ ./gradlew bundleRelease succès
   ✅ Aucun ClassNotFoundException logs

2. Install release APK sur device
   (Extract APK from AAB ou upload Internal Test)

3. Fresh install → app_opened event
   ✅ Console: app_opened { is_first_launch: true, platform: 'android' }

4. Complete onboarding
   ✅ Console: onboarding_completed

5. Open paywall
   ✅ Console: paywall_viewed

6. Mixpanel Dashboard
   ✅ Events Android visibles
   ✅ Property "platform: android" correct
```

**Si crash Android au launch** :
- Vérification ProGuard logs : `android/app/build/outputs/mapping/release/mapping.txt`
- Cherche "com.mixpanel" classes stripped
- Si oui : rules ProGuard mal appliquées

---

### 5.3 Dashboard Mixpanel Validation

**Live View** : https://mixpanel.com/report/YOUR_PROJECT/live

**Vérifie events real-time** :
- `app_opened` avec property `is_first_launch`
- `onboarding_completed` avec `duration_seconds`
- `paywall_viewed` avec `source`
- `trial_started`
- `purchase_completed` avec `price_eur: 4.99`
- `purchase_failed` (test mode avion)

**Si events manquent** :
1. Check console logs app (init success ?)
2. Network inspector device (POST mixpanel.com ?)
3. Token Mixpanel correct (copié sans espace) ?
4. Rebuild app après changes code

---

### 5.4 Créer Funnel Dashboard

**Mixpanel → Funnels → New Funnel**

**Configuration** :
- Name : "Conversion Funnel Complet"
- Step 1 : `app_opened` where `is_first_launch = true`
- Step 2 : `onboarding_completed`
- Step 3 : `paywall_viewed`
- Step 4 : `trial_started`
- Step 5 : `purchase_completed`
- Conversion window : 30 days
- Group by : `platform`

**Save** → Pin to dashboard

**Lecture** :
```
100 installs
├─ 70 onboarding (70%)
   ├─ 35 paywall (50%)
      ├─ 7 trial (20%)
         └─ 2 paid (28%)
```

**Si funnel vide** : Attends 24h (Mixpanel compute retardé parfois)

---

## Phase 6 : Version Bump (15min)

### 6.1 Update Version 1.1.8

**Script automatique** :
```bash
npm run version:set 1.1.8
```

**Vérifie changes** :
```bash
git diff

# Devrait montrer :
# - package.json: "version": "1.1.8"
# - app.json: "version": "1.1.8"
# - android/app/build.gradle: versionCode 18, versionName "1.1.8"
# - src/components/SettingsModal.jsx: Version 1.1.8
```

**Manual fallback si script fail** :
- `package.json` → `"version": "1.1.8"`
- `app.json` → `"version": "1.1.8"`
- `android/app/build.gradle` → `versionCode 18`, `versionName "1.1.8"`
- `src/components/SettingsModal.jsx` → `<Text>Version 1.1.8</Text>`
- `src/config/mixpanel.js` → `app_version: '1.1.8'`

---

### 6.2 Commit Changes

```bash
git add .
git status

# Vérifie fichiers modifiés :
# - src/config/mixpanel.js (nouveau)
# - App.js (init + app_opened)
# - src/components/onboarding/OnboardingController.jsx (onboarding_completed)
# - src/components/PremiumModal.jsx (3 events paywall)
# - android/app/proguard-rules.pro (Mixpanel rules)
# - Version bump files (package.json, app.json, etc.)
```

**Commit message** :
```bash
git commit -m "feat(analytics): implement Mixpanel tracking v1.1.8

- Add Mixpanel SDK integration (6 core events)
- Track: app_opened, onboarding_completed, paywall_viewed
- Track: trial_started, purchase_completed, purchase_failed
- Configure RevenueCat webhooks cross-validation
- Add ProGuard rules Mixpanel Android
- Bump version 1.1.8 (versionCode 18)

Related: M7.5 analytics setup before marketing launch
Docs: docs/decisions/analytics-strategy.md"
```

---

## Troubleshooting Common Issues

### ❌ "Mixpanel not initialized"

**Symptôme** : Console warning quand track event

**Causes possibles** :
1. `Analytics.init()` pas appelé avant `Analytics.track()`
2. Token Mixpanel invalide
3. Network error device (pas internet)

**Solution** :
```javascript
// App.js - Vérifie useEffect dependencies
useEffect(() => {
  Analytics.init(); // Sans dependencies = run once only
}, []); // ⚠️ Empty array critique
```

**Test** : Rebuild app, vérifie console log `✅ Mixpanel initialized successfully`

---

### ❌ Events manquent Dashboard Mixpanel

**Symptôme** : Code track events mais Dashboard vide

**Debug steps** :
1. **Check token** : Copy-paste depuis Mixpanel settings (sans espace)
2. **Network inspector** :
   - iOS : Xcode → Debug → Network Inspector
   - Android : `adb logcat | grep mixpanel`
   - Cherche POST requests vers `api.mixpanel.com`
3. **Console logs** : Vérifie `📊 Mixpanel event: ...` apparaît
4. **Délai** : Attends 5-10min (pas toujours real-time)

**Si POST requests fail** : Firewall device ou VPN peut bloquer

---

### ❌ Double events purchase_completed

**Symptôme** : Mixpanel montre 2x purchase_completed par achat

**Explication** : ✅ **Normal et voulu**
- Event 1 : Ton code (PremiumModal.jsx)
- Event 2 : RevenueCat webhook

**Avantages** :
- Cross-validation (si code rate, webhook catch)
- Détection fraude (event code sans webhook = suspicious)
- Source vérité Apple/Google (webhook = confirmed payment)

**Action** : Garde les deux. Filter dashboard par `$source` si besoin.

---

### ❌ Android crash "ClassNotFoundException: com.mixpanel"

**Symptôme** : App crash au launch build release Android

**Cause** : ProGuard strip Mixpanel classes

**Solution** :
1. Vérifie `android/app/proguard-rules.pro` contient :
```proguard
-keep class com.mixpanel.** { *; }
```
2. Rebuild :
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```
3. Check mapping file : `android/app/build/outputs/mapping/release/mapping.txt`
   - Cherche "com.mixpanel" → devrait être preserved

---

### ❌ Property "platform" undefined

**Symptôme** : Events Mixpanel sans property `platform`

**Cause** : Import React Native Platform oublié

**Solution** :
```javascript
// src/config/mixpanel.js
import { Platform } from 'react-native'; // ⚠️ Add this

// Dans track()
const enrichedProperties = {
  ...properties,
  platform: Platform.OS, // 'ios' ou 'android'
  // ...
};
```

---

## Go Live Checklist

### Pre-Submission (Avant build final)

- [ ] Mixpanel token production (pas test project)
- [ ] `__DEV__` logs conservés (debug future si needed)
- [ ] ProGuard rules Mixpanel ajoutées Android
- [ ] Version 1.1.8 bumpée partout (package.json, app.json, build.gradle)
- [ ] Fresh install test iOS → 5 events visibles Live View
- [ ] Build release Android → no crash launch
- [ ] RevenueCat webhooks configurés dashboard

### Post-Submission (Après Android upload)

- [ ] Google Sheets quotidien créé (backup data)
- [ ] Mixpanel funnel "Conversion Complet" sauvegardé
- [ ] Screenshot Live View (proof events working)
- [ ] Notification Slack/Discord setup (optional)
- [ ] Baseline 7j start date notée (pour M8 analysis)

---

## Next Steps

### Semaine 1 (M7.5) : Implémentation
- **Samedi 19 oct** : Phase 1-2 (SDK + events code)
- **Dimanche 20 oct** : Phase 3-4 (webhooks + Android ProGuard)

### Semaine 2 (M8) : Baseline Organique
- **Lundi 21 oct** : Submit Android v1.1.8
- **Lundi-Dimanche** : 7j observation (Google Sheets quotidien 5min/jour)

### Semaine 3 (M8.5) : Optimisation
- **Analyse baseline** : Quelles métriques < benchmarks ?
- **Itération** : Onboarding rallongé si completion < 65%
- **A/B test** : Paywall copy si trial start < 18%

### Semaine 4 (M10) : Go/No-Go Marketing
- **Décision** : Apple Search Ads 50-200€ ?
- **Si GO** : Budget test 7j + monitoring ROAS quotidien

---

## Support Resources

### Documentation
- [Mixpanel React Native SDK](https://github.com/mixpanel/mixpanel-react-native)
- [Mixpanel Dashboard Guide](https://help.mixpanel.com/)
- `docs/decisions/analytics-strategy.md` (stratégie complète)

### Discord
- **Format question** :
  > "Setup Mixpanel ResetPulse (timer TDAH iOS live). Events trackés mais Dashboard vide. [logs + code snippet]. Cherché historique mais pas trouvé Expo SDK 54. Help 🙏"
- **Timing** : 9-11h (Harry/Kévin répondent après-midi)

### Internal Docs
- `docs/development/REVENUECAT_BEST_PRACTICES.md` (purchase flow)
- `docs/ROADMAP.md` (M7.5/M8/M10 timeline)

---

## Changelog

**18 Oct 2025** - Guide initial
- SDK installation steps
- 6 events core implementation
- RevenueCat webhooks setup
- Android ProGuard rules
- Validation tests checklist

---

**Status** : ✅ Ready to code (Samedi 19 oct matin)

**Estimated time** : 3h dev + 1h validation = **4h total**

**Success metric** : Screenshot Mixpanel Live View avec 6 events visibles
