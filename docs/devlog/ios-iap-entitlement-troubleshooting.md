# Devlog - Troubleshooting IAP Entitlement iOS (BLOCAGE APPLE)

**Date:** 10-13 Octobre 2025
**Context:** Blocage builds iOS - Provisioning profiles sans entitlement IAP
**Status:** 🔴 BLOCKED - Attente Apple Developer Support
**Related:** ADR 003 (`docs/decisions/apple-provisioning-profile-iap-failure.md`)

---

## Vue d'ensemble

**Problème:** Impossible de builder iOS (Xcode + EAS) - Provisioning profiles ne contiennent pas l'entitlement `com.apple.developer.in-app-purchases`.

**Root cause:** Apple ne génère pas l'entitlement dans les profiles malgré configuration complète (App ID capability, Paid Apps Agreement, IAP product).

**Impact:** v1.1.0 monétisation bloquée sur iOS. Android non impacté.

**Timeline:** 3+ jours de debugging, escalade Apple Support.

---

## Timeline Détaillée

### 10 Octobre - Symptôme Initial

**Context:** Tests sandbox RevenueCat pour v1.1.0 monétisation.

**Erreur rencontrée:**
```
RevenueCat Error: Purchases are disabled for this app
```

**Tests device:**
- iPhone 13 Pro iOS 17.5
- Sandbox account logged in (Settings > App Store)
- Build TestFlight v1.0.4 (buildNumber 13)

**Hypothèse initiale:** Configuration RevenueCat Dashboard incorrecte.

**Actions:**
```bash
# Vérifier RevenueCat Dashboard
- Bundle ID: com.irimwebforge.resetpulse ✓
- Apple App Store Shared Secret: configuré ✓
- Products: premium_lifetime créé ✓
```

**Résultat:** Configuration RevenueCat OK. Problème ailleurs.

---

### 11 Octobre - Hypothèse EAS Build

**Nouvelle hypothèse:** EAS Build ne génère pas correctement l'entitlement IAP dans les IPA.

**Recherches:**
- GitHub Issues Expo: Mentions sporadiques problèmes entitlements
- RevenueCat docs: "Ensure IAP entitlement present" (pas de détails EAS)
- Forums développeurs: Quelques reports similaires, pas de solution

**Analyse binaire build EAS v1.0.4:**
```bash
# Download IPA depuis EAS
eas build:download --platform ios --latest

# Extract IPA
unzip ResetPulse.ipa -d ResetPulse_extracted

# Vérifier entitlements dans embedded.mobileprovision
cd ResetPulse_extracted/Payload/ResetPulse.app/
security cms -D -i embedded.mobileprovision > profile.plist

# Chercher entitlement IAP
grep -A 5 "Entitlements" profile.plist
```

**Output:**
```xml
<key>Entitlements</key>
<dict>
    <key>application-identifier</key>
    <string>YNG7STJX5U.com.irimwebforge.resetpulse</string>
    <key>com.apple.developer.team-identifier</key>
    <string>YNG7STJX5U</string>
    <key>get-task-allow</key>
    <false/>
</dict>
```

**Entitlement `com.apple.developer.in-app-purchases` ABSENT.**

**Décision:** Migrer vers build natif Xcode pour contrôle total (ADR 002).

---

### 12 Octobre Matin - Setup Build Natif

**Actions:**
```bash
# Clean
rm -rf ios/

# Generate Xcode workspace
npx expo prebuild --platform ios

# Install pods
cd ios/
pod install
cd ..

# Ouvrir Xcode
open ios/ResetPulse.xcworkspace
```

**Configuration Xcode:**
1. Target ResetPulse > Signing & Capabilities
2. Team: Eric Zuber (Individual) - YNG7STJX5U
3. Bundle ID: com.irimwebforge.resetpulse
4. Signing: Automatic

**Ajout capability In-App Purchase:**
1. + Capability
2. Recherche "In-App Purchase"
3. Add

**Résultat visible:** Section "In-App Purchase" apparaît dans Signing & Capabilities tab.

**Vérification entitlements file:**
```bash
cat ios/ResetPulse/ResetPulse.entitlements
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.in-app-purchases</key>
    <array></array>
</dict>
</plist>
```

**Entitlement présent dans .entitlements file ✓**

---

### 12 Octobre Après-midi - Premier Build Natif

**Tentative Archive:**
```
Xcode > Product > Archive (⌘⇧B)
```

**Erreur signature:**
```
Error: Provisioning profile "com.irimwebforge.resetpulse AppStore"
doesn't include the com.apple.developer.in-app-purchases entitlement.

Your build settings specify an entitlement which is not included in your provisioning profile.
```

**WTF moment:** Xcode dit que le provisioning profile n'a pas l'entitlement, alors que capability est ajoutée.

**Vérification provisioning profile:**
```bash
# Trouver le profile utilisé par Xcode
cd ~/Library/MobileDevice/Provisioning\ Profiles/
ls -lt | head -5

# Analyser le plus récent
security cms -D -i <UUID>.mobileprovision > profile-xcode.plist

# Vérifier entitlements
cat profile-xcode.plist | grep -A 10 "Entitlements"
```

**Output:**
```xml
<key>Entitlements</key>
<dict>
    <key>application-identifier</key>
    <string>YNG7STJX5U.com.irimwebforge.resetpulse</string>
    <key>com.apple.developer.team-identifier</key>
    <string>YNG7STJX5U</string>
    <key>get-task-allow</key>
    <false/>
    <key>keychain-access-groups</key>
    <array>
        <string>YNG7STJX5U.*</string>
    </array>
</dict>
```

**Entitlement IAP ABSENT du provisioning profile.**

---

### 12 Octobre Soir - Vérifications Configuration Apple

**Hypothèse:** Problème config App ID sur Developer Portal.

**Vérifications Developer Portal:**

1. **App ID Configuration:**
   ```
   developer.apple.com > Certificates, IDs & Profiles > Identifiers
   > com.irimwebforge.resetpulse
   ```

   **Capabilities cochées:**
   - ✓ In-App Purchase
   - ✓ Push Notifications (pour expo-notifications)

   **Status:** Enabled

2. **Edit App ID:**
   - Click capability "In-App Purchase"
   - No additional config required (pas de services à activer)
   - Save

   **Message:** "Update Complete"

3. **Regenerate Provisioning Profile:**
   ```
   Developer Portal > Profiles > com.irimwebforge.resetpulse AppStore
   > Edit > Save (force regeneration)
   ```

   **Download nouveau profile:**
   ```bash
   # Depuis Developer Portal
   # OU
   xcodebuild -downloadAllPlatforms
   ```

4. **Re-analyze nouveau profile:**
   ```bash
   security cms -D -i <nouveau-UUID>.mobileprovision > profile-regenerated.plist
   cat profile-regenerated.plist | grep -A 10 "Entitlements"
   ```

   **Résultat:** TOUJOURS PAS d'entitlement IAP.

**WTF x2:** Capability cochée sur App ID, mais entitlement pas dans profile généré par Apple.

---

### 12 Octobre - Test EAS Build Post-Config

**Hypothèse:** Peut-être qu'EAS Build fonctionne maintenant que capability est cochée ?

**Test:**
```bash
# Clean EAS credentials (forcer refresh)
eas credentials --platform ios

# Delete provisioning profile
# Rebuild génère nouveau profile

# Build
eas build --platform ios --profile production
```

**Résultat build:** ❌ Failed

**Log EAS:**
```
error: exportArchive: Provisioning profile "com.irimwebforge.resetpulse AppStore"
doesn't include the com.apple.developer.in-app-purchases entitlement.
```

**Constat:** Même erreur. EAS génère profile depuis Apple API, mais Apple ne met pas l'entitlement.

---

### 12 Octobre - Analyse Profile Manuel

**Hypothèse:** Différence entre profile auto-généré (Xcode/EAS) et profile manuel ?

**Création profile manuel:**
```
Developer Portal > Profiles > + (Create new)
Type: App Store
App ID: com.irimwebforge.resetpulse (vérifie capability IAP cochée)
Certificate: Distribution certificate (6698EA...)
Generate
```

**Download profile manuel:**
```bash
# Depuis Developer Portal
# ResetPulse_AppStore_Manual.mobileprovision
```

**Analyze:**
```bash
security cms -D -i ResetPulse_AppStore_Manual.mobileprovision > profile-manual.plist
cat profile-manual.plist | grep -A 10 "Entitlements"
```

**Output:**
```xml
<key>Entitlements</key>
<dict>
    <key>application-identifier</key>
    <string>YNG7STJX5U.com.irimwebforge.resetpulse</string>
    <key>com.apple.developer.team-identifier</key>
    <string>YNG7STJX5U</string>
</dict>
```

**Résultat:** Profile manuel AUSSI sans entitlement IAP.

**Conclusion:** Ce n'est PAS un problème Xcode, EAS, ou type de profile. C'est **Apple qui ne génère pas l'entitlement**.

---

### 13 Octobre Matin - Vérifications Paid Apps Agreement

**Hypothèse:** Problème lié au Paid Apps Agreement.

**Vérifications App Store Connect:**
```
App Store Connect > Agreements, Tax, and Banking
```

**Status:**
- ✓ Paid Applications Agreement: Active (signé juin 2025)
- ✓ Tax Info: Complète (France)
- ✓ Banking Info: Complète (IBAN vérifié)

**Pas d'alerte, pas d'action requise.**

**Test:** Attendre 24h propagation ? Non - Agreement signé il y a 4 mois.

---

### 13 Octobre - Création IAP Product

**Hypothèse:** Apple génère l'entitlement seulement si un IAP existe ?

**Action:** Créer IAP sur App Store Connect.

**Steps:**
```
App Store Connect > My Apps > ResetPulse
> In-App Purchases > + (Create)

Type: Non-Consumable
Reference Name: Premium Lifetime
Product ID: com.irimwebforge.resetpulse.premium_lifetime
Price: 4,99€ (Tier 5)

Localization:
- Display Name: Premium Access
- Description: Unlock all palettes and activities

Review Information:
- Screenshot: (placeholder timer screenshot)
- Notes: One-time purchase, no subscription

Submit
```

**Status:** "Ready to Submit" (pas submitted pour review)

**Update code:**
```bash
# src/config/revenuecat.js
export const PRODUCT_IDS = {
  premium_lifetime: "com.irimwebforge.resetpulse.premium_lifetime",
};
```

**Test regenerate profile:**
```bash
# Developer Portal > Profile > Edit > Save
# Download nouveau profile
# Analyze
security cms -D -i <nouveau>.mobileprovision | grep -A 10 "Entitlements"
```

**Résultat:** TOUJOURS pas d'entitlement IAP.

**Hypothèse invalidée (partielle):** Peut-être que IAP doit être "In Review" ou "Approved", pas juste "Ready to Submit" ?

---

### 13 Octobre Après-midi - Escalade Apple Support

**Décision:** Impossible de débugger plus loin. C'est un problème backend Apple.

**Action:** Créer Technical Support incident.

**Apple Developer Support - Incident Details:**

**Title:** Provisioning profiles missing com.apple.developer.in-app-purchases entitlement

**Description:**
```
App: ResetPulse
Bundle ID: com.irimwebforge.resetpulse
Team ID: YNG7STJX5U

Issue: Unable to build iOS app - all provisioning profiles are missing
the com.apple.developer.in-app-purchases entitlement despite complete configuration.

Configuration verified:
✓ App ID capability "In-App Purchase" enabled (developer.apple.com)
✓ Paid Applications Agreement active and signed
✓ Tax and Banking info complete
✓ IAP product created (com.irimwebforge.resetpulse.premium_lifetime, status "Ready to Submit")
✓ app.json contains ios.entitlements with IAP

Tested profiles (ALL missing IAP entitlement):
1. Xcode automatic signing
2. EAS Build cloud-generated profile
3. Manual profile created on Developer Portal

Evidence:
security cms -D analysis of all 3 profiles shows Entitlements dict
without com.apple.developer.in-app-purchases key.

Error when building:
"Provisioning profile doesn't include the com.apple.developer.in-app-purchases entitlement"

Request: Please verify why provisioning profiles are not including
the IAP entitlement despite App ID capability being enabled.
```

**Attachments:**
- `profile-xcode.plist` (entitlements section)
- `profile-eas.plist` (entitlements section)
- `profile-manual.plist` (entitlements section)
- Screenshot App ID capabilities
- Screenshot IAP "Ready to Submit"

**Priority:** High (blocks production release)

**Status:** Submitted - Awaiting response (48-72h ETA)

---

## Commands Reference

### Analyze Provisioning Profile
```bash
# Trouver profiles installés
cd ~/Library/MobileDevice/Provisioning\ Profiles/
ls -lt

# Analyser un profile
security cms -D -i <UUID>.mobileprovision

# Extraire juste les entitlements
security cms -D -i <UUID>.mobileprovision | grep -A 20 "Entitlements"

# Ou sauvegarder en plist pour inspection
security cms -D -i <UUID>.mobileprovision > profile-output.plist
open profile-output.plist
```

### Download Latest Profiles
```bash
# Via Xcode
xcodebuild -downloadAllPlatforms

# Via EAS (regenerate)
eas credentials --platform ios
# Choisir: Delete provisioning profile
# Rebuild pour auto-regeneration
```

### Analyze IPA Build
```bash
# Extract IPA
unzip app.ipa -d app_extracted

# Trouver embedded profile
cd app_extracted/Payload/YourApp.app/
ls -la embedded.mobileprovision

# Analyze
security cms -D -i embedded.mobileprovision > embedded-profile.plist
```

### Verify App Binary Entitlements
```bash
# Entitlements signés dans le binaire
codesign -d --entitlements - path/to/YourApp.app

# Ou depuis IPA
codesign -d --entitlements - app_extracted/Payload/YourApp.app/YourApp
```

---

## Hypothèses Restantes

### 1. Délai Propagation Backend Apple

**Théorie:** X jours entre activation capability et génération entitlement dans profiles.

**Test:**
- Attendre 3-7 jours
- Regenerer profile
- Re-analyze entitlements

**Plausibilité:** Moyenne - Apple a souvent délais propagation.

### 2. IAP Doit Être Approved

**Théorie:** Entitlement généré seulement après IAP approved par Apple Review.

**Test:**
- Submit IAP pour review
- Attendre approval
- Regenerer profile

**Risque:** Rejection si pas de build fonctionnel.

**Plausibilité:** Faible - logiquement, dev doit pouvoir tester IAP avant submit app.

### 3. Bug Backend Apple

**Théorie:** Bug système génération profiles pour certains App IDs.

**Test:** Apple Support peut vérifier logs backend.

**Plausibilité:** Faible-Moyenne - d'autres devs auraient reporté massivement.

### 4. Requirement Configuration Obscure

**Théorie:** Une config subtile manquante (setting caché).

**Test:** Apple Support audit compte.

**Plausibilité:** Faible - config déjà exhaustivement vérifiée.

---

## Workarounds Testés (Tous Échecs)

### ❌ Manual Signing avec Profile Sans Entitlement

**Tentative:** Builder avec profile existant, ignorer warning entitlement.

**Résultat:** Xcode refuse de builder - erreur bloquante, pas warning.

### ❌ Ajouter Entitlement Manuellement au Profile

**Tentative:** Éditer .mobileprovision XML, ajouter entitlement IAP.

**Résultat:** Profile corrompu - signature invalide (signé par Apple CA, impossible modifier).

### ❌ Créer App ID v2

**Tentative:** Nouveau Bundle ID `com.irimwebforge.resetpulse.v2`, capability IAP.

**Résultat:** PAS TESTÉ - perd historique App Store. Last resort.

### ❌ Bypass Signing (Development)

**Tentative:** Build Development sans signing strict.

**Résultat:** Development builds possibles MAIS RevenueCat IAP ne fonctionne qu'en Production/TestFlight (sandbox achats).

---

## Impact Timeline Projet

### v1.1.0 Timeline Original

**Planning initial (avant blocage):**
- Semaine 1: Installation SDK RevenueCat, PurchaseContext
- Semaine 2: PremiumModal, migration testMode
- Semaine 3: Sandbox testing iOS/Android
- Release TestFlight: 2-3 semaines

**Status:** ❌ Bloqué à Semaine 3 - impossible tester iOS.

### v1.1.0 Timeline Révisé

**Dépend résolution Apple:**

**Scénario A: Résolu sous 1 semaine**
- Continue timeline normalement
- Sandbox testing iOS
- TestFlight release décalé 1 semaine

**Scénario B: Résolu 1-2 semaines**
- Release Android v1.1.0 IAP functional
- iOS reste v1.0.4 temporairement
- iOS v1.1.0 suit 1-2 semaines après

**Scénario C: Non résolu >2 semaines**
- Évaluer options:
  - Reporter monétisation v1.2.0 (Android + iOS ensemble)
  - Lancer Android only IAP (fragmentation versions)
  - Changer Bundle ID (last resort, perd historique)

---

## Documentation Générée

**Suite à ce blocage:**

1. **ADR 003:** `docs/decisions/apple-provisioning-profile-iap-failure.md`
   - Décision architecturale
   - Hypothèses explorées
   - Impact projet

2. **Devlog (ce document):** `docs/devlog/ios-iap-entitlement-troubleshooting.md`
   - Timeline complète
   - Commands reference
   - Evidence technique

3. **README update:** Section "Known Issues - iOS Build Blocker"

4. **ADR 002 update:** Lien vers ADR 003 (build natif bloqué par problème Apple)

---

## Next Steps

### Attente Réponse Apple (Priorité 1)

- [ ] Monitorer ticket Support (email)
- [ ] Tester workarounds suggérés
- [ ] Fournir infos additionnelles si demandées
- [ ] Escalate si réponse non concluante

### Tests Périodiques (Quotidien)

```bash
# Check si profiles mis à jour
xcodebuild -downloadAllPlatforms

# Verify entitlement
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision | grep "in-app"

# Si présent → retry build
```

### Développement Continué (Non-Bloqué)

**Possible:**
- Features UI/UX (code JS)
- Android features
- Tests unitaires
- Documentation
- Préparation PremiumModal UI (sans tests IAP)

**Bloqué:**
- Tests RevenueCat iOS
- TestFlight iOS builds
- Release v1.1.0 iOS

---

## Learnings

### 1. Provisioning Profiles = Black Box

**Leçon:** Développeur ne contrôle pas génération entitlements - dépend 100% backend Apple.

**Frustration:** Configuration UI (App ID capability) ≠ garantie entitlement dans profile.

### 2. Debugging Entitlements

**Tool essentiel:** `security cms -D`

**Ne PAS se fier uniquement:**
- Xcode UI (peut afficher capability sans profile valid)
- Developer Portal UI (affiche config App ID, pas profile réel)

**Toujours vérifier:** Profile binaire contient l'entitlement.

### 3. IAP = Écosystème Fragile

**Dépendances multiples:**
- App ID capability
- Provisioning profile entitlement
- Paid Apps Agreement
- IAP product existence
- Sandbox account config

**Un seul point de failure = build impossible.**

### 4. Solo Dev = Blocage Externe Critique

**Réalité:** Impossible contourner problème Apple backend seul.

**Impact planning:** Timeline devient imprévisible (attente Support).

**Mitigation future:**
- Tester IAP très tôt dans dev cycle (pas attendre v1.1.0)
- Buffer time pour problèmes infra externes
- Plan B ready (Android-only release)

---

**Dernière mise à jour:** 13 Octobre 2025 16:00
**Status:** 🔴 BLOCKED - Attente Apple Developer Support
**Prochain update:** Après réponse Apple ou découverte workaround
