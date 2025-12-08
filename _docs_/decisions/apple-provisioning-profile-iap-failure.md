---
created: '2025-10-13'
updated: '2025-10-15'
status: resolved
milestone: M6
confidence: high
---

# ADR 003 - Blocage Apple: Provisioning Profile sans Entitlement IAP

**Status:** RESOLVED - Entitlement fantôme supprimé + Code fix
**Date initiale:** 13 Octobre 2025
**Date résolution:** 15 Octobre 2025
**Décideurs:** Eric (dev) + Apple DTS Engineer
**Context:** Impossible de builder iOS - Provisioning profiles ne contiennent pas l'entitlement IAP
**Résolution:** Entitlement n'existe pas (fantôme) + Bug code product identifier

---

## Situation Critique

### Symptôme

**Builds iOS échouent systématiquement** (Xcode Archive + EAS Build) avec erreur de signature:

```
Error: Provisioning profile "com.irimwebforge.resetpulse AppStore"
doesn't include the com.apple.developer.in-app-purchases entitlement.
```

### Root Cause Confirmée

**Apple ne génère PAS l'entitlement `com.apple.developer.in-app-purchases` dans les provisioning profiles** malgré configuration complète:

**Vérifié ✓:**
- App ID capability "In-App Purchase" cochée sur Developer Portal
- app.json contient `"ios.entitlements"` avec IAP
- Paid Applications Agreement actif et signé
- Tax/Banking info complète sur App Store Connect

**Evidence technique:**
```bash
# Analyse provisioning profile Xcode
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision

# Analyse profile EAS
security cms -D -i profile-eas.mobileprovision

# Analyse profile manuel Developer Portal
security cms -D -i profile-manual.mobileprovision
```

**Résultat identique sur TOUS les profiles:**
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

**Entitlement IAP ABSENT** dans tous les cas.

---

## Timeline Investigation

### 10-11 Octobre: Hypothèse EAS Build

**Symptôme initial:** RevenueCat tests sandbox iOS échouent "Purchases are disabled"

**Hypothèse:** EAS Build ne génère pas correctement l'entitlement IAP dans les IPA.

**Action:** Migration vers build natif Xcode (ADR 002)

**Résultat:** Même problème - l'entitlement n'est pas dans le provisioning profile, donc impossible de signer l'app (Xcode ou EAS).

### 12 Octobre: Découverte du vrai problème

**Tests multiples:**
1. Xcode Archive → Échec signature
2. EAS Build cloud → Échec signature
3. Profile manuel Developer Portal → Échec signature

**Analyse binaire profiles:** `security cms -D` confirme entitlement IAP absent sur tous les profiles générés par Apple.

**Constat:** Ce n'est PAS un problème de build tool (EAS vs Xcode). C'est Apple qui ne génère pas les profiles correctement.

### 13 Octobre: Escalade Apple

**Actions prises:**

1. **Créé nouvel In-App Purchase v2:**
   - Product ID: `com.irimwebforge.resetpulse.premium_lifetime`
   - Type: Non-Consumable
   - Price: 4,99€
   - Status: "Ready to Submit"
   - Hypothèse: Peut-être qu'un IAP doit exister pour que Apple génère l'entitlement ?

2. **Mis à jour code:**
   - `src/config/revenuecat.js` → Product ID v2
   - Commit changes

3. **Contacté Apple Developer Support:**
   - Technical Support incident créé
   - Evidence: `security cms -D` outputs fournis
   - Screenshots configuration App ID + IAP

**Attente:** 48-72h réponse Apple.

---

## Hypothèses Explorées

### 1. Provisioning Profile Type ❓ NON CONCLUANT

**Hypothèse:** Profile Development vs Distribution ne génère pas l'entitlement de la même manière.

**Tests:**
- Profile Development Xcode: IAP absent
- Profile Distribution Xcode: IAP absent
- Profile Distribution EAS: IAP absent
- Profile manuel Developer Portal (Distribution): IAP absent

**Résultat:** Type de profile n'impacte pas - tous manquent IAP.

### 2. IAP Product Existence ⏳ EN COURS

**Hypothèse:** Apple ne génère l'entitlement que si un IAP existe sur App Store Connect.

**Action:** Créé IAP v2 "premium_lifetime" (status Ready to Submit).

**Test:** Regenerer profile APRÈS création IAP.

**Résultat:** En attente - profile pas encore mis à jour côté Apple (délai propagation ?).

### 3. Paid Apps Agreement Timing ❓ POSSIBLE

**Hypothèse:** Délai entre signature Paid Apps Agreement et génération entitlement dans profiles.

**Context:** Paid Apps Agreement signé récemment (juin 2025).

**Possible:** Apple met X jours/semaines à propager cette info aux systèmes de génération de profiles ?

**Evidence manquante:** Pas de doc Apple sur délai de propagation.

### 4. Bundle ID Configuration ❌ ÉLIMINÉ

**Hypothèse:** Problème config App ID capability IAP.

**Vérifié:**
- Developer Portal > Identifiers > com.irimwebforge.resetpulse
- Capability "In-App Purchase" cochée ✓
- Edit capability → Save → Regenerate profile

**Résultat:** Capability présente mais entitlement toujours absent du profile.

---

## Impact Projet

### Blocage Complet iOS Builds

**Impossible de:**
- Builder archive Xcode locale
- Builder IPA via EAS cloud
- Signer l'app manuellement (codesign échoue)

**Conséquence:** v1.1.0 (monétisation RevenueCat) bloquée sur iOS.

### Android Non Impacté

Android builds fonctionnent normalement (Gradle local). Pas de dépendance aux provisioning profiles Apple.

**Option:** Avancer features Android-side en attendant résolution Apple.

### Timeline v1.1.0 Suspendue

**Planning original:** v1.1.0 TestFlight dans 2-3 semaines.

**Planning révisé:** Dépend résolution Apple (ETA inconnu).

**Risque:** Si Apple ne résout pas, évaluer alternatives:
- Lancer v1.1.0 Android only (iOS reste v1.0.4 sans IAP)
- Reporter monétisation v1.2.0
- Changer de bundle ID (last resort, perd App Store history)

---

## Actions en Cours

### 1. Support Apple (Priorité 1)

**Ticket créé:** Technical Support incident

**Evidence fournie:**
- `security cms -D` outputs (3 profiles différents)
- Screenshots configuration App ID
- Screenshots IAP "Ready to Submit"
- Timeline troubleshooting

**Attente:** 48-72h première réponse.

**Escalation possible:** Si réponse non concluante, demander escalade ingénieur Apple.

### 2. Monitoring Profile Updates

**Check quotidien:**
```bash
# Download latest profiles
xcodebuild -downloadAllPlatforms

# Vérifier entitlement
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision | grep "in-app"
```

**Hypothèse:** Si Apple fixe backend, profiles régénérés automatiquement contiendront l'entitlement.

### 3. IAP Product Submission

**Status actuel:** IAP v2 "Ready to Submit"

**Action possible:** Submit IAP pour review Apple (même sans build).

**Risque:** Rejection si pas de build associé.

**Décision:** Attendre réponse Support avant submit.

### 4. Documentation Continue

**Ce document (ADR 003):** Suivi évolution situation.

**Devlog troubleshooting:** Timeline détaillée + commands executées (référence future).

**README blocker:** Informer collaborateurs potentiels du blocage iOS.

---

## Décisions Prises

### 1. Suspendre Builds iOS Temporairement

**Jusqu'à:** Résolution Apple ou workaround trouvé.

**Justification:** Inutile de continuer à tester builds - le problème est confirmé côté Apple, pas notre config.

### 2. Maintenir Documentation Migration Build Natif (ADR 002)

**Bien que:** Le problème n'était finalement pas résolu par migration Xcode.

**Justification:**
- Build natif reste meilleur long-terme (contrôle, debugging)
- Documentation utile pour projets futurs
- Processus découverte problème root cause = learnings valables

**Status ADR 002:** Accepted mais bloqué par ADR 003.

### 3. Avancer Features Non-Bloquées

**Possible:**
- Développement UI/UX (code JS)
- Features Android-specific
- Tests unitaires
- Documentation

**Bloqué:**
- Intégration RevenueCat iOS (impossible tester sans IAP functional)
- TestFlight iOS builds
- Release v1.1.0 iOS

### 4. Pas de Changement Bundle ID (pour l'instant)

**Last resort option:** Créer nouveau Bundle ID `com.irimwebforge.resetpulse.v2`

**Contre:**
- Perd historique App Store (reviews, downloads v1.0.4)
- Perd TestFlight testeurs existants
- Pas de garantie que nouveau bundle ID n'aura pas même problème

**Décision:** Épuiser toutes options avec bundle ID actuel avant envisager.

---

## Learnings

### 1. EAS Build n'était pas le problème

**Leçon:** Avant de migrer stack (EAS → Xcode), analyser provisioning profiles directement (`security cms -D`).

**Temps perdu:** 2 jours migration + documentation pour problème non résolu.

**Positif:** Documentation build natif = utile long-terme, pas wasted.

### 2. Provisioning Profiles = Boîte Noire Apple

**Constat:** Développeur a zero contrôle sur génération entitlements dans profiles.

**Frustration:** Configuration App ID capability ≠ garantie entitlement dans profile.

**Gap doc Apple:** Aucune mention de ce problème dans docs officielles ou forums.

### 3. IAP = Écosystème Complexe

**Dépendances multiples:**
- App ID capability
- Provisioning profile entitlement
- Paid Apps Agreement
- IAP product existence
- Tax/Banking configuration

**Failure silencieux:** Chaque dépendance peut échouer sans error message clair.

### 4. Support Apple = Point de Blocage Critique

**Solo dev reality:** Impossible de débugger problème Apple backend.

**Dépendance totale:** Attente 48-72h pour chaque réponse Support.

**Impact planning:** Impossible estimer timeline si blocage externe.

---

## Hypothèses Restantes (Attente Réponse Apple)

### A. Bug Backend Apple

**Possibilité:** Système génération profiles a un bug affectant notre App ID.

**Plausibilité:** Moyenne - d'autres devs auraient reporté.

**Test:** Apple Support peut vérifier logs backend génération profiles.

### B. Délai Propagation Paid Apps Agreement

**Possibilité:** X jours/semaines entre signature Agreement et activation IAP entitlement.

**Plausibilité:** Haute - Apple a souvent délais propagation config.

**Test:** Attendre 1-2 semaines, regenerer profile.

### C. Requirement IAP Submitted

**Possibilité:** Entitlement IAP généré seulement après IAP submitted (pas juste "Ready to Submit").

**Plausibilité:** Moyenne - logique Apple "backend vérifie existence IAP".

**Test:** Submit IAP v2, attendre approval, regenerer profile.

### D. Configuration Manquante Obscure

**Possibilité:** Une config Apple subtile manquante (checkbox caché, setting compte).

**Plausibilité:** Faible - configuration déjà vérifiée exhaustivement.

**Test:** Apple Support peut auditer notre compte.

---

## Next Steps

### Immédiat (13/10)

- [x] Créer ADR 003 (ce document)
- [x] Créer devlog troubleshooting complet
- [x] Update README blocker iOS
- [x] Commit documentation

### Court Terme (48-72h)

- [ ] Réponse Apple Support
- [ ] Tester workarounds suggérés par Apple
- [ ] Update ADR 003 avec résolution

### Moyen Terme (1-2 semaines)

**Si résolu:**
- [ ] Regenerer provisioning profiles
- [ ] Vérifier entitlement IAP présent
- [ ] Resume builds iOS
- [ ] Continue v1.1.0 timeline

**Si pas résolu:**
- [ ] Escalade ingénieur Apple
- [ ] Évaluer options alternatives (Android only, delay v1.1.0, change bundle ID)
- [ ] Communiquer timeline révisée testeurs

---

## Références

**Evidence Technique:**
- `security cms -D` outputs: Voir devlog troubleshooting
- Screenshots configuration: Voir ticket Apple Support

**Documentation Liée:**
- ADR 002: Migration EAS → Build Natif (contexte initial)
- ADR 001: Stratégie Monétisation v1.1.0 (pourquoi IAP nécessaire)
- Devlog: `docs/devlog/ios-iap-entitlement-troubleshooting.md`

**Apple Resources:**
- [Configuring In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/original_api_for_in-app_purchase)
- [Developer Support](https://developer.apple.com/support/)

---

## ✅ RÉSOLUTION - 15 Octobre 2025

### Root Cause Confirmée: Entitlement Fantôme

**Réponse Apple Developer Technical Support:**

> "The `com.apple.developer.in-app-purchases` entitlement **does not exist**.
> In-App Purchases use StoreKit framework without requiring entitlements in code.
> Only the App ID capability is needed on Developer Portal."

**Explication:**
- Cet entitlement était dans `app.json` suite à documentation obsolète/tiers-party
- Apple ne génère JAMAIS cet entitlement car il n'existe pas dans leur système
- Confusion entre:
  - **Capability** "In-App Purchase" (Developer Portal) → ✅ Requis
  - **Entitlement** code/plist → ❌ N'existe pas pour IAP

### Solution Appliquée

**Fix #1 - Suppression Entitlement:**
```json
// app.json - AVANT (INCORRECT)
"ios": {
  "entitlements": {
    "com.apple.developer.in-app-purchases": []
  }
}

// app.json - APRÈS (CORRECT)
"ios": {
  // PAS d'entitlements IAP nécessaires
  "infoPlist": {
    "UIBackgroundModes": ["audio"]
  }
}
```

**Résultat:** Builds iOS fonctionnels (Xcode + EAS) ✅

**Fix #2 - Bug Code Révélé:**

Après Fix #1, sandbox testing révèle deuxième bug indépendant:

```javascript
// PremiumModal.jsx:72
// ❌ AVANT
await purchaseProduct(premiumPackage.identifier);  // "premium"

// ✅ APRÈS
await purchaseProduct(premiumPackage.product.identifier);  // "com.app.premium"
```

RevenueCat Package structure:
- `package.identifier` = Package name ("premium")
- `package.product.identifier` = App Store Product ID

### Validation Finale

**Tests sandbox réussis (15 Octobre):**
- ✅ Product ID: `com.irimwebforge.resetpulse.premium_lifetime`
- ✅ StoreKit sheet: 4,99€ avec trial 7 jours
- ✅ Purchase flow complet
- ✅ Entitlement activation
- ✅ Premium content unlock

### Impact Projet

**v1.1.0 Timeline:**
- Initialement bloqué: 10-13 Octobre
- Résolu: 15 Octobre
- Décalage: 5 jours (acceptable)
- Prochaine étape: TestFlight v1.1.4+

### Learnings

1. **Documentation Obsolète Dangereuse:**
   - 4 jours perdus sur un entitlement qui n'existe pas
   - Toujours vérifier avec Apple DTS en cas de doute

2. **Bug Masking:**
   - Bug #1 (entitlement) masquait Bug #2 (code)
   - Tester sandbox immédiatement après chaque fix

3. **Capability vs Entitlement:**
   - Capability = Configuration Apple backend
   - Entitlement = Permissions code explicites
   - IAP nécessite seulement capability, PAS entitlement

4. **RevenueCat API:**
   - Structure Package non-intuitive
   - Toujours utiliser `.product.identifier` pour achats

### Documentation Complète

**Résolution détaillée:** `docs/devlog/iap-resolution-final.md`
- Timeline 1 semaine debugging
- Deux bugs indépendants documentés
- Troubleshooting guide "Product not found"
- Configuration finale opérationnelle

---

**Version:** 2.0 (Resolved)
**Statut:** ✅ RÉSOLU
**Date résolution:** 15 Octobre 2025
**Prochain step:** Deploy TestFlight + Monitoring conversion
