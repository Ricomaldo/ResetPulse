---
created: '2025-10-08'
updated: '2025-10-17'
status: active
milestone: M5-M7
confidence: high
---

# ResetPulse - Vue d'ensemble des Builds

## Stratégie : Builds Natifs sur les 2 Plateformes (v1.1.0+)

Ce projet utilise désormais des builds natifs sur Android et iOS pour un contrôle total.

| Plateforme | Méthode | Raison | Upload |
|------------|---------|--------|--------|
| **Android** | Gradle local (`./gradlew`) | Autonomie, contrôle versionCode, pas de quotas | Manuel vers Google Play Console |
| **iOS** | Xcode natif (Archive) | Contrôle capabilities IAP, cohérence avec Android | Manuel vers TestFlight via Xcode Organizer |

**Historique:** iOS utilisait EAS Build jusqu'à v1.0.4. Migration vers build natif pour v1.1.0+ suite à blocage entitlement In-App Purchase (voir ADR 002).

---

## 📱 Android : Workflow Local

### Commandes rapides
```bash
# 1. Préparer l'environnement
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
cp @irim__resetPulse.jks android/app/

# 2. Build
cd android
./gradlew clean
./gradlew bundleRelease

# 3. Récupérer le AAB
ls -lh app/build/outputs/bundle/release/app-release.aab
```

### Avantages
- ✅ Pas de dépendance à EAS (quotas limités sur plan gratuit)
- ✅ Build instantané (5-7 minutes)
- ✅ Contrôle total du versionCode et signing
- ✅ Workflow déjà validé (v1.0.4 déployé avec succès)

### Prérequis
- Android SDK installé (`$HOME/Library/Android/sdk`)
- Keystore `@irim__resetPulse.jks` à la racine du projet
- `local.properties` créé après chaque prebuild

### Documentation détaillée
→ [ANDROID_BUILD_CONFIG.md](./ANDROID_BUILD_CONFIG.md)

---

## 🍎 iOS : Workflow Build Natif Xcode (v1.1.0+)

### Commandes rapides
```bash
# 1. Générer workspace Xcode (si modifs natives)
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..

# 2. Ouvrir Xcode
open ios/ResetPulse.xcworkspace

# 3. Build & Archive (dans Xcode)
# - Product > Archive (⌘⇧B)
# - Organizer > Distribute App > App Store Connect
```

### Avantages
- ✅ Contrôle total capabilities iOS (In-App Purchase, etc.)
- ✅ Debugging local possible (attach Xcode debugger)
- ✅ Visibilité complète configuration build
- ✅ Cohérence Android (natif sur les 2 plateformes)

### Prérequis
- macOS avec Xcode installé (v16+)
- Apple Developer Program actif
- Certificat Distribution dans Keychain

### Documentation détaillée
→ [IOS_BUILD_CONFIG.md](./IOS_BUILD_CONFIG.md)
→ [ios-native-build-setup.md](../../devlog/ios-native-build-setup.md) (guide complet)

### Migration EAS → Natif
**Raison:** Entitlement `com.apple.developer.in-app-purchases` manquant dans builds EAS, bloquant RevenueCat.
**Décision:** ADR 002 (`docs/decisions/eas-to-native-ios-build.md`)

---

## 🔄 Cycle de Release Complet

### 1. Mise à jour de version
```bash
# Increment version (1.0.5 → 1.0.6)
npm run version:patch

# OU version custom
npm run version:set 1.1.0
```

**Note iOS:** Incrementer aussi `buildNumber` manuellement dans `app.json` (ou script automation).

### 2. Build Android (local)
```bash
cd android
./gradlew clean && ./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Build iOS (natif Xcode)
```bash
# Si modifications natives (plugins, capabilities)
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..

# Ouvrir Xcode
open ios/ResetPulse.xcworkspace

# Dans Xcode:
# - Product > Archive (⌘⇧B)
# - Organizer > Distribute App > App Store Connect
```

**Note:** Pour code JS uniquement (src/), pas besoin de prebuild, rebuild directement dans Xcode.

### 4. Upload
- **Android** : Upload manuel AAB vers Google Play Console → Internal Testing
- **iOS** : Upload via Xcode Organizer → TestFlight automatique après processing (5-15min)

### 5. Tests
- **Android** : Lien de test interne Google Play
- **iOS** : TestFlight distribué aux testeurs

---

## 📋 Checklist Pre-Build

### Android
- [ ] `android/local.properties` existe avec bon SDK path
- [ ] `@irim__resetPulse.jks` copié dans `android/app/`
- [ ] `android/app/build.gradle` contient versionCode et versionName corrects
- [ ] `android/app/build.gradle` contient signingConfigs release

### iOS (v1.1.0+ natif)
- [ ] `app.json` contient version ET buildNumber à jour
- [ ] Xcode installé (v16+)
- [ ] Certificat Distribution dans Keychain
- [ ] Workspace généré : `ios/ResetPulse.xcworkspace` existe
- [ ] Xcode > Signing & Capabilities > Team sélectionné (YNG7STJX5U)
- [ ] Xcode > Signing & Capabilities > Capability "In-App Purchase" ajoutée (v1.1.0+)

---

## 🆘 Troubleshooting

### Android : "SDK location not found"
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Android : "Wrong signing key"
```bash
cp @irim__resetPulse.jks android/app/
# Vérifier SHA1 : DB:51:C1:76:49:DB:2E:34:0B:6A:AE:0D:03:2A:DB:0A:05:25:E4:58
```

### iOS : "No such module 'ExpoModulesCore'"
```bash
cd ios/
rm -rf Pods/ Podfile.lock
pod install
cd ..
```

### iOS : "Provisioning profile doesn't match entitlements"
- Xcode Preferences > Accounts > Download Manual Profiles
- Ou: Passer en Automatic signing (Xcode gère)

### iOS : RevenueCat "Purchases disabled"
- Vérifier capability In-App Purchase ajoutée dans Xcode
- Vérifier entitlement : `codesign -d --entitlements - path/to/ResetPulse.ipa`
- Voir guide complet : `docs/devlog/ios-native-build-setup.md`

---

## 🎯 Historique des Versions Déployées

| Version | versionCode | buildNumber | Android | iOS | iOS Method | Date |
|---------|-------------|-------------|---------|-----|------------|------|
| 1.0.4 | 10 | 13 | ✅ Play Store | ✅ TestFlight | EAS Build | 2025-10-05 |
| 1.1.0+ | TBD | TBD | 🔄 Prochaine | 🔄 Prochaine | **Xcode Natif** | 2025-10 |

**Note migration iOS:** v1.1.0 marque le passage d'EAS Build à Xcode natif pour support IAP (RevenueCat).

---

## 📚 Ressources

### Documentation Build
- [Android Build Config](./ANDROID_BUILD_CONFIG.md) - Build Gradle complet
- [iOS Build Config](./IOS_BUILD_CONFIG.md) - Build natif Xcode (v1.1.0+)
- [iOS Native Build Setup](../../devlog/ios-native-build-setup.md) - Guide pas-à-pas Xcode

### Documentation Projet
- [Guide Versioning](../VERSIONING.md) - Script automatisé de bump version
- [Deployment Info](../DEPLOYMENT_INFO.md) - Credentials et infos Apple

### Décisions Architecturales
- [ADR 002: EAS → Natif iOS](../../decisions/eas-to-native-ios-build.md) - Décision migration build
