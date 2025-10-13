# ADR 002 - Abandon EAS Build pour iOS au profit du Build Natif

**Status:** ACCEPTED
**Date:** Octobre 2025 (13/10/2025)
**Décideurs:** Eric (dev) + Chrysalis (architecte conseil)
**Context:** Blocage IAP intégration RevenueCat, entitlement manquant dans EAS builds

---

## Décision

**Abandonner EAS Build pour iOS et passer au build natif via Xcode.**

**Raison principale:** L'entitlement `com.apple.developer.in-app-purchases` n'est pas correctement injecté dans les builds EAS, bloquant l'intégration RevenueCat pour la v1.1.0.

**Impact:** Contrôle total sur capabilities iOS, cohérence avec le process Android (déjà natif via Gradle), debugging local possible.

---

## Contexte

### Situation Initiale

**Stack iOS actuelle (jusqu'à v1.0.4):**
- Builds cloud via `eas build --platform ios`
- Credentials gérés par EAS (certificats, provisioning profiles)
- Auto-increment buildNumber
- Submit automatique vers TestFlight avec `eas submit`
- Configuration documentée dans `docs/development/builds/IOS_BUILD_CONFIG.md`

**Fonctionnement:** Process fluide pour apps simples, 10-15min de build cloud, pas de config Xcode locale.

### Problème Détecté

**Contexte v1.1.0:** Intégration RevenueCat pour monétisation freemium (ADR 001).

**Blocage:** Tests sandbox iOS échouent systématiquement:
```
RevenueCat Error: Purchases are disabled for this app
```

**Investigation (3 jours):**
1. **Hypothèse 1:** Configuration RevenueCat incorrecte → éliminée (dashboard OK, Android fonctionne)
2. **Hypothèse 2:** Provisioning profile sandbox → éliminé (sandbox account configuré)
3. **Hypothèse 3:** Missing entitlement → **CONFIRMÉE**

**Analyse binaire IPA:**
```bash
codesign -d --entitlements - ResetPulse.ipa
```

**Résultat:** L'entitlement `com.apple.developer.in-app-purchases` est **absent** du build EAS, alors que l'App Store Connect capability est active.

### Gap Documentation Expo

**Recherches documentation officielle:**
- Expo docs: Aucune mention explicite de l'entitlement IAP dans EAS Build
- RevenueCat docs: "Ensure IAP entitlement is present" sans précision EAS
- GitHub Issues: Quelques mentions sporadiques, pas de solution officielle

**Constat:** Gap entre "capability active sur ASC" et "entitlement présent dans IPA". EAS Build ne semble pas injecter automatiquement certains entitlements critiques.

**Temps perdu:** 3 jours de debugging, multiples rebuilds, frustration.

---

## Alternatives Considérées

### 1. Rester sur EAS Build avec config customisée ❌ REJETÉ

**Approches tentées:**
- Plugin `expo-build-properties` avec entitlements custom
- Manipulation credentials via `eas credentials`
- Pre-build hooks pour injection entitlements

**Contre:**
- Documentation insuffisante
- Pas de garantie que ça fonctionne (plusieurs reports contradictoires)
- Risque de casser à chaque update EAS CLI
- Complexité debug : build cloud = boîte noire
- 3 jours déjà perdus sans solution claire

**Raison rejet:** Investissement temps incertain pour résultat non garanti. Pattern "lutte contre l'outil" = mauvais signe.

### 2. Forcer regeneration provisioning profile ❌ TENTÉ, ÉCHEC

**Approche:** Supprimer provisioning profile sur expo.dev, rebuild pour forcer recréation avec entitlements corrects.

**Résultat:** Build réussit, mais entitlement toujours absent de l'IPA. Le problème n'est pas au niveau du provisioning profile, mais au niveau de l'injection dans le binaire final.

**Raison échec:** EAS Build pipeline ne gère pas correctement l'entitlement IAP pour une raison inconnue.

### 3. Build natif via Xcode ✅ SÉLECTIONNÉ

**Pour:**
- Contrôle total sur capabilities/entitlements (Xcode Signing & Capabilities UI)
- Debugging local possible (pas de 15min de cloud build pour tester un fix)
- Cohérence Android : déjà build natif via `./gradlew` depuis le début
- Process iOS standard documenté partout (Stack Overflow, RevenueCat docs)
- Visibilité complète configuration build (pas de boîte noire)
- Xcode Archive = export manuel vers TestFlight (ou automatisation CI future)

**Contre:**
- Setup initial : configurer Xcode workspace (prebuild nécessaire)
- Gestion manuelle certificates/provisioning profiles (mais déjà faite via EAS)
- Pas d'auto-increment buildNumber automatique (gérer manuellement ou script)
- Perte du workflow `eas build && eas submit` one-liner

**Raison sélection:** Le contrôle total et la visibilité valent largement la perte du confort EAS. Pattern standard iOS = documentation abondante. 3 jours perdus avec EAS = sunk cost, pas raison pour continuer.

---

## Décision Finale Détaillée

### Stratégie Build iOS v1.1.0+

**Abandoner:**
- `eas build --platform ios`
- Auto-increment via EAS
- Cloud build workflows

**Adopter:**
- `npx expo prebuild` pour générer workspace Xcode
- Build via Xcode: Product > Archive
- Upload manuel TestFlight via Xcode Organizer (ou Transporter app)
- Gestion manuelle buildNumber dans app.json (ou script automation)

**Justification:**
- Capabilities iOS = first-class citizen dans Xcode (checkbox UI)
- RevenueCat docs assument build natif (toutes instructions Xcode-based)
- Debugger localement un problème IAP = invaluable
- Android déjà natif = cohérence process entre plateformes

### Process Build Cible

**Préparation:**
```bash
# Générer le workspace Xcode natif
npx expo prebuild --platform ios

# Ouvrir le projet dans Xcode
open ios/ResetPulse.xcworkspace
```

**Configuration Xcode (une fois):**
1. Signing & Capabilities tab
2. Cocher "In-App Purchase" capability
3. Vérifier provisioning profile (automatic ou manual)
4. Vérifier Team = YNG7STJX5U (Eric Zuber - Individual)

**Build & Upload:**
1. Xcode: Product > Archive
2. Organizer: Distribute App > App Store Connect
3. Upload vers TestFlight
4. Attendre processing Apple (5-10min)

**Avantages immédiats:**
- Entitlement IAP garanti présent dans IPA (visible dans Xcode)
- Debugging local si problème RevenueCat (pas de rebuild cloud)
- Timeline maîtrisée (pas de queue EAS build)

---

## Conséquences

### Positives

**Déblocage technique:**
- RevenueCat IAP fonctionne (entitlement présent)
- v1.1.0 peut avancer (monétisation non bloquée)
- Learnings transférables à MoodCycle app future

**Contrôle accru:**
- Visibilité totale configuration build
- Debugging local possible (attach Xcode debugger)
- Modification capabilities en 30 secondes (pas rebuild cloud)

**Cohérence Android:**
- iOS et Android = builds natifs (même philosophie)
- Documentation process cohérente (pas de split EAS/natif)
- Apprentissage natif iOS = préparation projets plus complexes

**Documentation robuste:**
- Process standard iOS = documentation abondante communauté
- RevenueCat examples tous Xcode-based
- Stack Overflow coverage maximale

### Négatives

**Loss of convenience:**
- Plus d'auto-increment buildNumber (gérer manuellement ou script)
- Workflow build moins one-liner (prebuild + Xcode steps)
- Upload TestFlight : 3 étapes vs `eas submit --latest`

**Setup initial:**
- Configurer Xcode workspace (npx expo prebuild)
- Vérifier certificates/provisioning localement
- Documenter nouveau process (ce ADR + devlog)

**Maintenance continue:**
- Prebuild à relancer si modifications natives (plugins, capabilities)
- ios/ folder en .gitignore (généré, pas versionné généralement)
- Synchronisation app.json ↔ Xcode settings manuelle

### Risques Identifiés

**Divergence config (MOYEN):**
- app.json version/buildNumber peut diverger de Xcode settings
- **Mitigation:** Script pre-build qui sync app.json → Info.plist

**Prebuild breaking (FAIBLE):**
- `expo prebuild` peut échouer si config plugins incohérente
- **Mitigation:** Documentation clear prerequisites, tester après chaque plugin ajout

**Team onboarding (FAIBLE):**
- Futur contributeur doit avoir Xcode installé
- **Mitigation:** Documentation claire setup local, prerequisites explicites

**Certificates expiration (FAIBLE):**
- Gestion manuelle = risque oubli renewal
- **Mitigation:** Calendar reminder 1 mois avant expiration (05/07/2026)

---

## Implémentation

### Étapes Migration (v1.1.0)

**1. Génération Workspace Xcode**
```bash
# Clean previous build artifacts
rm -rf ios/

# Generate native iOS project
npx expo prebuild --platform ios
```

**2. Configuration Xcode**
```
1. open ios/ResetPulse.xcworkspace
2. Target ResetPulse > Signing & Capabilities
3. Team: YNG7STJX5U (Eric Zuber - Individual)
4. Bundle Identifier: com.irimwebforge.resetpulse
5. Ajouter capability: In-App Purchase (+ button)
6. Vérifier provisioning profile: Automatic ou Manual (UVK2S43525)
```

**3. Vérification Entitlements**
```bash
# Après Archive, avant Upload
codesign -d --entitlements - path/to/ResetPulse.ipa | grep in-app

# Doit afficher:
# <key>com.apple.developer.in-app-purchases</key>
# <array></array>
```

**4. Build & Upload**
```
1. Xcode: Product > Archive (⌘B puis attendre build)
2. Organizer window s'ouvre automatiquement
3. Distribute App > App Store Connect
4. Next > Upload
5. Attendre confirmation upload
6. Vérifier TestFlight après processing (5-10min)
```

**5. Suppression EAS Config (après validation build réussi)**
```bash
# Une fois premier build natif validé sur TestFlight
rm eas.json

# Update package.json: supprimer eas-cli de devDependencies (optionnel)
```

### Documentation Requise

**1. ADR (ce document):**
- `docs/decisions/eas-to-native-ios-build.md`
- Décision architecturale pour historique projet

**2. Devlog technique:**
- `docs/devlog/ios-native-build-setup.md`
- Steps configuration Xcode détaillés
- Troubleshooting courants
- Screenshots Xcode si pertinent

**3. Mise à jour documentation existante:**
- `docs/development/builds/IOS_BUILD_CONFIG.md` → Remplacer section EAS par Xcode
- `README.md` → Section "Build iOS" avec nouvelles commandes
- `docs/development/builds/BUILDS_OVERVIEW.md` → Cohérence Android/iOS natif

**4. Suppression eas.json:**
- Après validation premier build natif réussi
- Commit message: "build(ios): remove eas.json after migration to native Xcode builds"

### Automation Future (Post-v1.1.0)

**BuildNumber auto-increment:**
```javascript
// scripts/increment-build.js
const fs = require('fs');
const appJson = require('../app.json');

appJson.expo.ios.buildNumber = String(parseInt(appJson.expo.ios.buildNumber) + 1);

fs.writeFileSync('./app.json', JSON.stringify(appJson, null, 2));
console.log(`Build incremented to ${appJson.expo.ios.buildNumber}`);
```

**CI/CD future (GitHub Actions ou Fastlane):**
- Fastlane lane: prebuild + archive + upload TestFlight
- GitHub Actions workflow: automated builds on tag push
- **Décision:** Reporté post-v1.1.0, besoin pas urgent pour solo dev

---

## Timeline Implémentation

**Immédiat (13/10/2025):**
- ✅ Création ADR (ce document)
- ⏳ Création devlog ios-native-build-setup.md
- ⏳ Mise à jour README.md
- ⏳ Commentaire eas.json (avant suppression)

**Prochain build iOS (v1.1.0 + RevenueCat):**
- Exécuter prebuild
- Configurer Xcode capabilities
- Build & Archive
- Upload TestFlight
- Valider IAP fonctionne

**Après validation réussie:**
- Supprimer eas.json
- Commit documentation complète
- Référencer dans BUILDS_OVERVIEW.md

---

## Références

**Conversation Chrysalis:**
- Session 13/10/2025: Analyse EAS vs Build Natif
- Artefact: "Analyse EAS vs Build Natif - Décision Stratégique"

**Documentation Technique:**
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [RevenueCat iOS SDK Setup](https://www.revenuecat.com/docs/getting-started/installation/ios)
- [Apple: Configuring In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/original_api_for_in-app_purchase)

**Related ADRs:**
- ADR 001: Stratégie Monétisation v1.1.0 (contexte RevenueCat)

---

## Conclusion

**L'abandon d'EAS Build pour iOS n'est pas un échec, c'est une maturation.**

EAS Build est excellent pour apps simples sans configuration native avancée. Mais dès qu'on touche aux capabilities iOS spécifiques (IAP, HealthKit, etc.), le contrôle natif devient nécessaire.

Cette décision:
- Débloque v1.1.0 (monétisation)
- Aligne iOS et Android (builds natifs)
- Prépare projets futurs plus complexes (MoodCycle)
- Capitalise sur documentation standard iOS

**3 jours perdus = investissement forcé dans apprentissage build natif iOS.** Leçon retenue pour projets futurs.

---

**Version:** 1.0
**Statut:** ACCEPTED - Ready for implementation
**Prochain review:** Post-premier build natif TestFlight v1.1.0
