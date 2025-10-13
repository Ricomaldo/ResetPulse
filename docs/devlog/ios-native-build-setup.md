# Devlog - Setup Build Natif iOS via Xcode

**Date:** 13 Octobre 2025
**Context:** Migration EAS Build → Xcode natif pour support In-App Purchases
**Related:** `docs/decisions/eas-to-native-ios-build.md` (ADR 002)

---

## Vue d'ensemble

Ce guide couvre le setup complet pour builder ResetPulse iOS via Xcode après abandon d'EAS Build.

**Prérequis:**
- macOS avec Xcode installé (version 16+)
- Node.js + npm
- Compte Apple Developer actif
- Certificats/provisioning profiles déjà créés (via EAS ou manuellement)

**Temps estimé:** 30-45 minutes (première fois)

---

## Partie 1 : Génération du Workspace Xcode

### Étape 1 : Clean Previous Build Artifacts

```bash
# Se placer à la racine du projet
cd /Users/irimwebforge/CodeBase/apps/ResetPulse

# Supprimer le dossier ios s'il existe
rm -rf ios/

# Nettoyer le cache Expo (optionnel mais recommandé)
npx expo start --clear
```

**Pourquoi:** Le dossier `ios/` est généré automatiquement par `expo prebuild`. Partir d'une base propre évite les conflits de config.

### Étape 2 : Générer le Projet Natif

```bash
npx expo prebuild --platform ios
```

**Ce que ça fait:**
- Lit `app.json` et génère le projet Xcode correspondant
- Crée `ios/ResetPulse.xcworkspace` et `ios/ResetPulse.xcodeproj`
- Configure automatiquement:
  - Bundle Identifier
  - Version et Build Number
  - Info.plist avec les permissions
  - Podfile avec les dépendances natives

**Output attendu:**
```
✔ Created native files
› ios/ResetPulse.xcworkspace
› ios/ResetPulse.xcodeproj
› ios/Podfile
```

**Durée:** 30-60 secondes

### Étape 3 : Installer les Pods

```bash
cd ios/
pod install
cd ..
```

**Pourquoi:** Installe les dépendances natives iOS (équivalent npm install pour native modules).

**Note:** Si `pod install` échoue avec des erreurs de version:
```bash
# Update CocoaPods repo
pod repo update

# Réessayer
pod install
```

---

## Partie 2 : Configuration Xcode

### Étape 4 : Ouvrir le Workspace

```bash
# Depuis la racine du projet
open ios/ResetPulse.xcworkspace
```

**IMPORTANT:** Toujours ouvrir le `.xcworkspace`, JAMAIS le `.xcodeproj` (sinon les pods ne sont pas linkés).

### Étape 5 : Sélectionner le Target

Dans Xcode:
1. Sidebar gauche: Cliquer sur "ResetPulse" (icône bleue en haut)
2. Section TARGETS: Sélectionner "ResetPulse"
3. Onglet "Signing & Capabilities"

### Étape 6 : Configuration Signing

**Team:**
- Sélectionner: "Eric Zuber (Individual)" - YNG7STJX5U

**Bundle Identifier:**
- Vérifier: `com.irimwebforge.resetpulse`

**Provisioning Profile:**
- Option 1: "Automatically manage signing" (recommandé)
  - Xcode gère les profiles automatiquement
  - Nécessite identifiants Apple Developer dans Xcode Preferences

- Option 2: "Manual signing"
  - Sélectionner le profile existant: UVK2S43525 (expiration 05/07/2026)
  - Certificat: Distribution Certificate 6698EA21A64871CF2DF04DFFB2E0344A

**Signing Certificate:**
- Pour TestFlight: "iOS Distribution"
- Xcode devrait auto-détecter le certificat dans le Keychain

### Étape 7 : Ajouter la Capability In-App Purchase

**C'est le cœur du problème EAS résolu ici.**

1. Onglet "Signing & Capabilities"
2. Cliquer le bouton "+ Capability" en haut à gauche
3. Rechercher "In-App Purchase"
4. Double-cliquer pour ajouter

**Résultat:**
- Une nouvelle section "In-App Purchase" apparaît dans l'onglet
- L'entitlement `com.apple.developer.in-app-purchases` est ajouté au fichier `ResetPulse.entitlements`

**Vérification:**
- Sidebar gauche: Développer le groupe "ResetPulse"
- Ouvrir `ResetPulse.entitlements`
- Vérifier la présence de:
```xml
<key>com.apple.developer.in-app-purchases</key>
<array></array>
```

### Étape 8 : Vérifier les Other Capabilities

**Background Modes:**
- Doit déjà être configuré (via app.json UIBackgroundModes)
- Cocher "Audio, AirPlay, and Picture in Picture"

**Si absent:**
1. + Capability > Background Modes
2. Cocher "Audio, AirPlay, and Picture in Picture"

**Push Notifications:**
- NE PAS ajouter si pas nécessaire
- Requiert configuration serveur supplémentaire
- Pour notifications locales uniquement: pas besoin

### Étape 9 : Vérifier Info.plist

Sidebar gauche: `ResetPulse/Info.plist`

**Vérifier présence de:**
```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

**Ajusté automatiquement par expo prebuild**, normalement rien à changer.

---

## Partie 3 : Build & Archive

### Étape 10 : Sélectionner la Destination

En haut de la fenêtre Xcode, dropdown à gauche du bouton Play:
- Sélectionner: "Any iOS Device (arm64)"

**Ne pas sélectionner** un simulateur spécifique, sinon Archive sera grisé.

### Étape 11 : Build

**Raccourci:** ⌘B

Ou: Menu > Product > Build

**Durée première build:** 3-5 minutes (compilation React Native + dépendances natives)

**Builds suivants:** 30-60 secondes (incrémentaux)

**Vérifier succès:**
- En haut à droite: Indicateur "Build Succeeded" vert
- Pas d'erreurs rouges dans le navigateur Issues (⌘5)

**Erreurs courantes:**

**"Signing requires a development team":**
- Retour Signing & Capabilities
- Sélectionner Team

**"Provisioning profile doesn't include signing certificate":**
- Vérifier certificat Distribution est dans Keychain
- Ou: Passer en Automatic signing

**"CocoaPods error":**
```bash
cd ios/
pod deintegrate
pod install
cd ..
```

### Étape 12 : Archive

**Raccourci:** ⌘⇧B (Shift+Cmd+B)

Ou: Menu > Product > Archive

**Durée:** 5-8 minutes

**Progression:**
- Barre de progression en haut de Xcode
- Log détaillé dans Report Navigator (⌘9)

**Succès:**
- Fenêtre "Organizer" s'ouvre automatiquement
- Archive apparaît dans la liste avec date/heure/version

**Si Organizer ne s'ouvre pas:**
- Menu > Window > Organizer (⌘⇧O)
- Onglet "Archives"

### Étape 13 : Vérifier l'Entitlement dans l'Archive

**Avant upload, vérifier que l'entitlement IAP est présent:**

```bash
# Dans Organizer, clic droit sur l'archive > Show in Finder
# Puis terminal:

cd ~/Library/Developer/Xcode/Archives/<date>/ResetPulse.xcarchive/Products/Applications/
codesign -d --entitlements - ResetPulse.app
```

**Vérifier output:**
```xml
<key>com.apple.developer.in-app-purchases</key>
<array></array>
```

**Si absent:** Retour Étape 7, capability pas correctement ajoutée.

---

## Partie 4 : Upload vers TestFlight

### Étape 14 : Distribute App

Dans Organizer (fenêtre ouverte après Archive):

1. Sélectionner l'archive (la plus récente en haut)
2. Bouton bleu "Distribute App" à droite
3. Sélectionner "App Store Connect"
4. Next

### Étape 15 : Distribution Options

**Options recommandées:**

- **Upload:** Coché
- **Bitcode:** Non disponible (deprecated iOS 14+)
- **Symbols:** Coché (pour crash reports symbolisés)
- **Manage Version and Build Number:** Décoché (géré dans app.json)

Next

### Étape 16 : Signing

**Automatically manage signing:** Recommandé

Xcode gère le re-signing avec le bon provisioning profile pour distribution.

Next

### Étape 17 : Review & Upload

**Dernière vérification:**
- Bundle ID: com.irimwebforge.resetpulse
- Version: 1.1.0 (ou version actuelle)
- Build: (vérifier cohérence app.json)

**Upload:**
- Bouton "Upload"
- Barre de progression

**Durée:** 2-5 minutes (selon taille IPA)

**Succès:**
- Message "Upload Successful"
- "View in App Store Connect" link

### Étape 18 : Processing Apple

**Après upload réussi:**
1. Aller sur App Store Connect: https://appstoreconnect.apple.com/apps/6752913010/testflight/ios
2. Section "Builds" > "iOS"
3. Status "Processing" pendant 5-15 minutes

**Email Apple:**
- "Your build is processing" immédiatement
- "Your build is ready for testing" après processing

**Si processing échoue:**
- Email détaillant le problème (missing compliance, invalid entitlements, etc.)
- Corriger et rebuild

### Étape 19 : Distribuer aux Testeurs

Une fois processing terminé:
1. App Store Connect > TestFlight > Build
2. "Groups" > Sélectionner groupe de testeurs
3. Ajouter le build au groupe
4. Testeurs reçoivent notification TestFlight

---

## Partie 5 : Workflow Récurrent

### Build Suivants

**À chaque nouveau build:**

1. **Incrementer buildNumber dans app.json:**
```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "15"  // Incrementer: 14 → 15
    }
  }
}
```

2. **Regenerer workspace (si modifications natives):**
```bash
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..
```

**Quand regenerer:**
- Après ajout plugin expo dans app.json
- Après modification config native (Info.plist, entitlements)
- Après update SDK Expo majeur

**Quand ne PAS regenerer:**
- Modifications code JS uniquement (src/)
- Modifications assets (images, fonts)
- Modifications styles

3. **Build & Archive:**
- Xcode > Product > Archive
- Distribute App > Upload

**Optimisation workflow:**
- Keyboard shortcuts: ⌘B (build), ⌘⇧B (archive)
- Xcode window layout sauvegardé entre sessions

### Automation Future (Optionnel)

**Script increment-build.js:**
```javascript
// scripts/increment-build.js
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentBuild = parseInt(appJson.expo.ios.buildNumber);
const newBuild = currentBuild + 1;

appJson.expo.ios.buildNumber = String(newBuild);

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Build incremented: ${currentBuild} → ${newBuild}`);
```

**Usage:**
```bash
node scripts/increment-build.js
npx expo prebuild --platform ios
# Puis build Xcode
```

**Fastlane (avancé, post-v1.1.0):**
```ruby
# fastlane/Fastfile
lane :beta do
  increment_build_number_in_app_json
  expo_prebuild
  build_app(workspace: "ios/ResetPulse.xcworkspace")
  upload_to_testflight
end
```

---

## Troubleshooting

### Problème: "No such module 'ExpoModulesCore'"

**Cause:** Pods pas installés ou workspace corrompu

**Solution:**
```bash
cd ios/
rm -rf Pods/ Podfile.lock
pod install
cd ..
```

Rouvrir le workspace.

### Problème: "Command PhaseScriptExecution failed"

**Cause:** Node modules ou React Native packager issue

**Solution:**
```bash
# Clean tout
rm -rf node_modules/ ios/
npm install
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..
```

### Problème: "Provisioning profile doesn't match entitlements"

**Cause:** Provisioning profile créé avant ajout capability IAP

**Solution:**
1. Xcode Preferences > Accounts > Download Manual Profiles
2. Ou: Developer Portal > Regenerate profile avec capabilities à jour
3. Ou: Passer en Automatic signing (Xcode gère)

### Problème: Archive réussit mais Upload échoue (iTunes Connect errors)

**Erreur commune:** "Invalid Bundle - Missing In-App Purchase entitlement"

**WTF:** Exactement le problème qu'on a eu avec EAS! Mais ici c'est visible dans Xcode.

**Solution:**
- Vérifier Étape 7 (capability ajoutée)
- Vérifier Étape 13 (entitlement présent dans binaire)
- Si absent: Clean build folder (⌘⇧K), rebuild, re-archive

### Problème: Build réussit en simulateur mais Archive échoue

**Cause:** Simulateur = architecture x86_64, Archive = arm64 (device)

**Vérifier:**
- Build Settings > Architectures > Standard (arm64)
- Pas de conditionals excluant arm64

**Dépendances natives incompatibles:**
- Vérifier podspec compatible arm64
- Update pods: `pod update` dans ios/

### Problème: TestFlight build processing échoue

**Email Apple "Missing Export Compliance":**
- App Store Connect > App Information > Export Compliance
- Ou: Info.plist contient `ITSAppUsesNonExemptEncryption = NO`

**Email Apple "Invalid Entitlements":**
- Vérifier Étape 13 (codesign output)
- Possible conflit entitlements + capabilities
- Tenter: Supprimer et re-ajouter capability dans Xcode

### Problème: RevenueCat still failing avec "Purchases disabled"

**Si entitlement est présent mais RevenueCat échoue:**

1. **Vérifier App Store Connect:**
   - Agreements, Tax, Banking complets
   - In-App Purchases actifs pour bundle ID

2. **Vérifier RevenueCat Dashboard:**
   - Bundle ID correct
   - Shared secret configuré
   - Products créés

3. **Vérifier Sandbox Account:**
   - Settings > App Store > Sandbox Account logged in
   - Différent du compte dev principal

4. **Clean install app:**
   - Delete app simulateur/device
   - Rebuild & reinstall
   - RevenueCat SDK peut cacher status

---

## Checklist Complète

**Avant Premier Build:**
- [ ] Xcode installé (v16+)
- [ ] Certificat Distribution dans Keychain
- [ ] Provisioning profile actif (ou automatic signing)
- [ ] Bundle ID match app.json (com.irimwebforge.resetpulse)

**Setup Xcode:**
- [ ] `npx expo prebuild --platform ios`
- [ ] `cd ios/ && pod install && cd ..`
- [ ] Ouvrir .xcworkspace (pas .xcodeproj)
- [ ] Signing & Capabilities > Team selected
- [ ] Capability In-App Purchase ajoutée
- [ ] Background Modes > Audio coché
- [ ] Info.plist contient ITSAppUsesNonExemptEncryption = NO

**Build & Upload:**
- [ ] Destination: Any iOS Device (arm64)
- [ ] Product > Build (⌘B) réussit
- [ ] Product > Archive (⌘⇧B) réussit
- [ ] Organizer shows archive
- [ ] codesign verification (entitlement IAP présent)
- [ ] Distribute App > App Store Connect
- [ ] Upload successful
- [ ] App Store Connect shows "Processing"
- [ ] Email Apple "Ready for testing" reçu
- [ ] TestFlight distribué aux testeurs

**Post-Upload:**
- [ ] Testeurs reçoivent notification
- [ ] App installe sur device testeur
- [ ] RevenueCat IAP fonctionne (pas d'erreur "disabled")
- [ ] Log succès achat sandbox visible

---

## Ressources

**Documentation officielle:**
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [Apple: Distributing Your App](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [RevenueCat: iOS SDK](https://www.revenuecat.com/docs/getting-started/installation/ios)

**Tools:**
- Xcode Organizer: `⌘⇧O`
- App Store Connect: https://appstoreconnect.apple.com
- Developer Portal: https://developer.apple.com/account

**Expo Dashboard:**
- Builds: https://expo.dev/accounts/irim/projects/resetPulse/builds
- Submissions: https://expo.dev/accounts/irim/projects/resetPulse/submissions

---

## Prochaines Étapes

**Une fois premier build natif validé:**
1. Supprimer `eas.json` (plus nécessaire)
2. Update `docs/development/builds/IOS_BUILD_CONFIG.md`
3. Update `README.md` section Build iOS
4. Documenter learnings dans ce devlog

**Post-v1.1.0:**
- Évaluer Fastlane pour automation
- Script increment-build.js dans package.json
- CI/CD GitHub Actions (si besoin builds fréquents)

---

**Dernière mise à jour:** 13 Octobre 2025
**Status:** Documentation complète, prêt pour premier build natif v1.1.0
