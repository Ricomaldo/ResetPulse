---
created: '2025-10-03'
updated: '2025-10-17'
status: active
milestone: M5-M6
confidence: high
---

# Configuration iOS Build - ResetPulse

## Stratégie : Build Natif Xcode (depuis v1.1.0)

**Pour iOS, nous utilisons désormais des builds natifs via Xcode :**
- ✅ Build local via Xcode (Product > Archive)
- ✅ Contrôle total sur capabilities et entitlements
- ✅ Upload manuel TestFlight via Xcode Organizer
- ✅ Cohérence avec Android (builds natifs sur les deux plateformes)
- ❌ **EAS Build abandonné** (voir ADR 002: `docs/decisions/eas-to-native-ios-build.md`)

**Raison:** Blocage IAP avec EAS Build - l'entitlement `com.apple.developer.in-app-purchases` n'était pas correctement injecté dans les builds EAS, bloquant l'intégration RevenueCat pour la monétisation.

---

## 📘 Documentation Complète

**Guide détaillé setup build natif:** `docs/devlog/ios-native-build-setup.md`

Ce document couvre:
- Génération workspace Xcode via `expo prebuild`
- Configuration capabilities (In-App Purchase, Background Audio)
- Process build & archive
- Upload vers TestFlight
- Troubleshooting complet

**Voir également:**
- ADR 002: `docs/decisions/eas-to-native-ios-build.md` (décision architecturale)
- Build overview: `docs/development/builds/BUILDS_OVERVIEW.md`

---

## ✅ Configuration FONCTIONNELLE avec SDK 54 (New Architecture)

### Package.json (SDK 54 - NEW ARCHITECTURE)
```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "~2.2.3",
    "expo": "~54.0.10",
    "expo-audio": "~1.0.13",
    "expo-haptics": "~15.0.7",
    "expo-notifications": "~0.32.11",
    "expo-status-bar": "~2.0.8",
    "react": "19.0.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.22.2",
    "react-native-reanimated": "~4.0.1",
    "react-native-safe-area-context": "~5.4.0",
    "react-native-svg": "16.0.9"
  }
}
```

### app.json
```json
{
  "expo": {
    "version": "1.0.4",
    "newArchEnabled": true,
    "userInterfaceStyle": "automatic",
    "ios": {
      "bundleIdentifier": "com.irimwebforge.resetpulse",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "UIBackgroundModes": ["audio"]
      }
    },
    "plugins": []
  }
}
```

**⚠️ Important:** `plugins: []` - Pas besoin du plugin `expo-notifications` pour les notifications locales. Le plugin active les Push Notifications remote qui nécessitent un provisioning profile spécifique.

---

## 🏗️ Workflow Build Natif (v1.1.0+)

### Vue d'ensemble rapide

```bash
# 1. Générer workspace Xcode
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..

# 2. Ouvrir dans Xcode
open ios/ResetPulse.xcworkspace

# 3. Configuration Xcode (première fois)
# - Signing & Capabilities > Team: YNG7STJX5U
# - + Capability > In-App Purchase
# - Vérifier Background Modes > Audio

# 4. Build & Archive
# - Xcode: Product > Archive (⌘⇧B)
# - Organizer: Distribute App > App Store Connect
# - Upload vers TestFlight

# 5. Processing Apple (5-15 minutes)
# - App Store Connect: https://appstoreconnect.apple.com/apps/6752913010/testflight/ios
```

**Guide complet:** `docs/devlog/ios-native-build-setup.md`

---

## Credentials & Identifiants

### App Store Connect
- **ASC App ID**: 6752913010
- **Bundle ID**: com.irimwebforge.resetpulse
- **Apple Team**: YNG7STJX5U (Eric Zuber - Individual)

### Distribution Certificate
- **Serial Number**: 6698EA21A64871CF2DF04DFFB2E0344A
- **Expiration**: 05/07/2026

### Provisioning Profile (Actuel)
- **Developer Portal ID**: UVK2S43525
- **Status**: Active
- **Expiration**: 05/07/2026
- **Capabilities**: In-App Purchase, Background Modes (Audio)

---

## 🎉 Versions Déployées

### v1.0.4 - Build EAS (Dernier avant migration)
- **BuildNumber**: 13
- **SDK 54**: React Native 0.81.5 + New Architecture activée ✅
- **React 19**: Migration complète
- **Method**: EAS Build cloud
- **TestFlight**: Distribué avec succès

### v1.1.0+ - Build Natif Xcode
- **Method**: Build local Xcode
- **Raison migration**: Support In-App Purchase (entitlement manquant avec EAS)
- **Documentation**: `docs/devlog/ios-native-build-setup.md`

### Liens Utiles
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6752913010/testflight/ios
- **Developer Portal**: https://developer.apple.com/account
- **Xcode Organizer**: ⌘⇧O dans Xcode

---

## ⚠️ Migration EAS → Build Natif (Historique)

### Problème Rencontré (v1.1.0)
**Symptôme:** Tests RevenueCat IAP échouent avec "Purchases are disabled for this app"

**Root cause:** L'entitlement `com.apple.developer.in-app-purchases` n'était pas injecté dans les IPA générés par EAS Build.

**Vérification:**
```bash
codesign -d --entitlements - ResetPulse.ipa
# Entitlement IAP absent ❌
```

**Temps perdu:** 3 jours de debugging, multiples rebuilds.

### Solution : Build Natif Xcode
**Contrôle total sur capabilities/entitlements via Xcode UI**
- Signing & Capabilities tab
- + Capability > In-App Purchase
- Entitlement garanti présent dans IPA final

**Décision documentée:** ADR 002 (`docs/decisions/eas-to-native-ios-build.md`)

**Guide complet setup:** `docs/devlog/ios-native-build-setup.md`

---

## Troubleshooting Courants

### Build Natif : "No such module 'ExpoModulesCore'"
**Solution:**
```bash
cd ios/
rm -rf Pods/ Podfile.lock
pod install
cd ..
```

### Build Natif : "Provisioning profile doesn't match entitlements"
**Solution:**
- Xcode Preferences > Accounts > Download Manual Profiles
- Ou: Automatic signing (Xcode gère)
- Ou: Developer Portal > Regenerate profile avec capabilities à jour

### RevenueCat : "Purchases disabled" malgré entitlement présent
**Vérifier:**
1. App Store Connect: Agreements, Tax, Banking complets
2. RevenueCat Dashboard: Bundle ID + Shared secret OK
3. Device: Sandbox account logged in (Settings > App Store)
4. Clean install: Delete app + rebuild

**Voir guide troubleshooting complet:** `docs/devlog/ios-native-build-setup.md`

---

## Architecture Technique

### New Architecture Enabled
```json
"newArchEnabled": true
```
- Fabric renderer activé
- TurboModules activés
- Bridge legacy en interop pour compatibilité
- Performances améliorées

### Background Audio
```json
"UIBackgroundModes": ["audio"]
```
- Son joue même app en arrière-plan
- Essentiel pour timer avec son de fin

### BuildNumber Management (Build Natif)
**Manual increment dans app.json:**
```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "15"  // Incrementer manuellement à chaque build
    }
  }
}
```

**Automation optionnelle:**
```bash
# Script increment-build.js
node scripts/increment-build.js
```

Voir `docs/devlog/ios-native-build-setup.md` pour script complet.

---

## Cycle de Build & Test (v1.1.0+)

### Workflow Build Natif

1. **Increment buildNumber** : Éditer `app.json`
2. **Prebuild** : `npx expo prebuild --platform ios` (si modifications natives)
3. **Build & Archive** : Xcode > Product > Archive (⌘⇧B)
4. **Upload TestFlight** : Xcode Organizer > Distribute App
5. **Apple Processing** : 5-15 minutes
6. **Distribute** : TestFlight > Add build to test group
7. **Feedback** → Fix → Rebuild

### Quand regenerer workspace (prebuild)
- ✅ Après ajout plugin expo dans app.json
- ✅ Après modification capabilities/entitlements
- ✅ Après update SDK Expo majeur
- ❌ PAS pour modifications code JS uniquement (src/)
- ❌ PAS pour modifications assets (images, fonts)

---

## Commandes Utiles

### Build Natif
```bash
# Générer workspace Xcode
npx expo prebuild --platform ios

# Installer pods
cd ios/ && pod install && cd ..

# Ouvrir Xcode
open ios/ResetPulse.xcworkspace

# Clean build artifacts
cd ios/ && rm -rf build/ Pods/ Podfile.lock && cd ..

# Vérifier entitlements dans IPA
codesign -d --entitlements - path/to/ResetPulse.ipa
```

### Historique EAS (référence v1.0.4)
```bash
# Builds EAS (plus utilisé v1.1.0+)
# eas build --platform ios --profile production
# eas submit --platform ios --latest
# eas credentials --platform ios
```

## Notes SDK 54

### Compatibilité
- **React Native 0.81.5** - Dernière version stable
- **React 19** - Migration réussie
- **Expo SDK 54** - Support complet New Architecture
- **iOS Deployment Target**: 13.4 minimum

### Future-Proof
Cette configuration est prête pour:
- SDK 55+ (New Architecture obligatoire)
- Futures features natives
- MoodCycle app architecture
