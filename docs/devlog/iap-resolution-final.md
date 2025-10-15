# IAP "Product Not Found" - Résolution Finale

**Date:** 15 Octobre 2025
**Status:** ✅ RÉSOLU - IAP sandbox opérationnel
**Durée debugging:** 1 semaine intensive (10-15 Octobre)
**Related:**
- Devlog troubleshooting: `ios-iap-entitlement-troubleshooting.md`
- ADR 003: `apple-provisioning-profile-iap-failure.md`

---

## Résumé Exécutif

**Symptôme initial:** RevenueCat erreur "Couldn't find product" en sandbox iOS

**Root cause découverte:** DEUX bugs indépendants masquaient le problème

**Résolution:** 15 Octobre 2025 - IAP fonctionnel avec Product ID `com.irimwebforge.resetpulse.premium_lifetime`

**Impact:** v1.1.0 monétisation maintenant déployable sur iOS

---

## Les Deux Bugs Identifiés

### Bug #1: Entitlement Fantôme (BLOQUANT)

**Problème:**
- `com.apple.developer.in-app-purchases` présent dans `app.json` ios.entitlements
- Cet entitlement **N'EXISTE PAS** selon DTS Engineer Apple
- Provoquait erreurs provisioning profile generation

**Erreur observée:**
```
Error: Provisioning profile doesn't include the
com.apple.developer.in-app-purchases entitlement
```

**Source confusion:**
- Documentation obsolète/tiers-party mentionnant cet entitlement
- RevenueCat docs anciennes suggérant son ajout
- Confusion avec capability "In-App Purchase" (≠ entitlement)

**Réponse Apple Developer Support (DTS):**
> "The com.apple.developer.in-app-purchases entitlement does not exist.
> In-App Purchases use StoreKit framework without requiring entitlements.
> Only the capability on App ID is needed, not an entitlement in code."

**Fix:**
```json
// app.json - AVANT (INCORRECT)
"ios": {
  "entitlements": {
    "com.apple.developer.in-app-purchases": []
  }
}

// app.json - APRÈS (CORRECT)
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false,
    "UIBackgroundModes": ["audio"]
  }
  // PAS d'entitlements IAP
}
```

**Impact:** Après suppression → Builds iOS fonctionnels (Xcode + EAS)

**Commits:**
- `b4fde13` - "retiré entitlemeent" (typo commit message historique)
- `7f96016` - "docs(ios): document IAP entitlement blocker (Apple backend issue)"

---

### Bug #2: Incorrect Product Identifier Path (CODE)

**Problème:**
- `PremiumModal.jsx` ligne 38 (version initiale)
- Utilisait `premiumPackage.identifier` au lieu de `premiumPackage.product.identifier`

**Erreur observée:**
```javascript
// RevenueCat SDK
const offerings = await getOfferings();
const premiumPackage = offerings.availablePackages[0];

// ❌ INCORRECT (masqué par bug #1)
await purchaseProduct(premiumPackage.identifier);
// → undefined, RevenueCat ne trouve pas le product

// ✅ CORRECT
await purchaseProduct(premiumPackage.product.identifier);
// → "com.irimwebforge.resetpulse.premium_lifetime"
```

**Documentation RevenueCat:**
```typescript
// Package structure
Package {
  identifier: string;          // "premium" (package ID)
  product: {
    identifier: string;         // "com.app.premium_lifetime" (App Store Product ID)
    priceString: string;        // "4,99 €"
    // ...
  }
}
```

**Root cause masking:**
Bug #1 empêchait d'atteindre cette ligne de code (build échouait avant).
Une fois Bug #1 résolu → Bug #2 révélé lors des tests sandbox.

**Fix:**
```javascript
// src/components/PremiumModal.jsx:72
const result = await purchaseProduct(premiumPackage.product.identifier);
```

**Commit:**
- Pending (voir section Commit Plan ci-dessous)

---

## Timeline Résolution

### 10-13 Octobre: Bug #1 Hunting

**Phase 1 - Hypothèse EAS:**
- Pensait que EAS Build ne générait pas entitlements correctement
- Migration vers build natif Xcode (ADR 002)
- Résultat: Même erreur

**Phase 2 - Analyse Provisioning Profiles:**
```bash
security cms -D -i *.mobileprovision | grep "in-app"
# Résultat: Aucun entitlement IAP dans AUCUN profile
```

**Phase 3 - Escalade Apple Support:**
- Ticket DTS créé avec evidence technique
- Réponse: "Cet entitlement n'existe pas"
- WTF moment: 1 semaine perdue sur un entitlement fantôme

### 14 Octobre: Bug #1 Résolu

**Action:** Suppression entitlement de `app.json`

**Test:**
```bash
# Rebuild Xcode
npx expo prebuild --clean --platform ios
cd ios && pod install && cd ..
open ios/ResetPulse.xcworkspace

# Archive
# Résultat: ✅ Build réussi (première fois en 5 jours)
```

**Validation:** Provisioning profile généré SANS entitlement IAP (normal)

### 15 Octobre: Bug #2 Découvert et Résolu

**Test sandbox sur iPhone physique:**
```
RevenueCat: Could not find product "undefined"
```

**Debug PremiumModal.jsx:**
```javascript
console.log('Package:', premiumPackage);
// { identifier: "premium", product: { identifier: "com...", ... } }

console.log('Passing to purchaseProduct:', premiumPackage.identifier);
// "premium" ← INCORRECT (package ID, pas product ID)
```

**Fix:** Utiliser `premiumPackage.product.identifier`

**Test sandbox après fix:**
```
✅ Product found: com.irimwebforge.resetpulse.premium_lifetime
✅ StoreKit sheet appeared with trial 7 jours
✅ Test purchase successful
✅ Entitlement "premium_access" actif
✅ Premium content débloqué
```

---

## Configuration Finale Opérationnelle

### App Store Connect

**IAP Product:**
- **Product ID:** `com.irimwebforge.resetpulse.premium_lifetime`
- **Type:** Non-Consumable
- **Price:** 4,99€
- **Trial:** 7 jours (introductory offer)
- **Status:** Ready to Submit

### RevenueCat Dashboard

**Entitlement:**
- **Name:** `premium_access`
- **Products:** `com.irimwebforge.resetpulse.premium_lifetime`

**Offering:**
- **Identifier:** `default`
- **Package:** `premium` (type: lifetime)

### Code Configuration

**revenuecat.js:**
```javascript
export const PRODUCT_IDS = {
  premium_lifetime: "com.irimwebforge.resetpulse.premium_lifetime",
};

export const ENTITLEMENTS = {
  premium: "premium_access",
};
```

**PremiumModal.jsx (ligne 72):**
```javascript
const offerings = await getOfferings();
const premiumPackage = offerings.availablePackages[0];
const result = await purchaseProduct(premiumPackage.product.identifier);
```

**App ID Capability:**
- ✅ In-App Purchase enabled (Developer Portal)
- ❌ NO entitlement in code (correct)

---

## Learnings Critiques

### 1. Documentation Obsolète = Perte de Temps

**Problème:** Docs tiers/anciennes mentionnant entitlement IAP
**Leçon:** Toujours vérifier avec Apple DTS en cas de doute
**Temps perdu:** 4 jours sur un entitlement qui n'existe pas

### 2. Capability ≠ Entitlement

**Confusion:**
- **App ID Capability:** Coché sur Developer Portal (✅ requis)
- **Code Entitlement:** Clé dans .plist (❌ PAS requis pour IAP)

**Clarification Apple:**
> StoreKit works automatically without entitlements.
> The App ID capability is sufficient.

### 3. RevenueCat API Package Structure

**Structure non-intuitive:**
```javascript
premiumPackage.identifier         // "premium" (package name)
premiumPackage.product.identifier // Product ID App Store
```

**Piège:** `identifier` seul ≠ Product ID
**Best practice:** Toujours accéder via `.product.identifier`

### 4. Bug Masking

**Symptôme:** Bug #1 empêchait de découvrir Bug #2
**Leçon:** Résoudre bugs un par un, re-tester complètement après chaque fix

### 5. Sandbox Testing Crucial

**Process:**
1. Fix Bug #1 → Build réussi
2. Ne pas assumer que ça fonctionne
3. Tester sandbox immédiatement
4. Découvrir Bug #2

**Leçon:** Build réussi ≠ IAP fonctionnel (tester sandbox obligatoire)

---

## Documentation Générée

### Suite à cette résolution:

1. **Ce document:** `docs/devlog/iap-resolution-final.md`
   - Timeline complète des deux bugs
   - Configuration finale opérationnelle
   - Learnings pour futurs projets

2. **Update devlog:** `ios-iap-entitlement-troubleshooting.md`
   - Section résolution ajoutée
   - Référence bugs #1 et #2

3. **Update ADR 003:** `apple-provisioning-profile-iap-failure.md`
   - Status changé: BLOCKED → RESOLVED
   - Root cause documentée

4. **Troubleshooting Guide:** Section "Debugging IAP 'Product not found'"
   - Checklist pour futurs développeurs
   - Références aux deux bugs résolus

---

## Troubleshooting Guide: IAP "Product Not Found"

Si vous rencontrez cette erreur, vérifier dans cet ordre:

### 1. Product ID Correct dans Code

```javascript
// ❌ INCORRECT
await purchaseProduct(package.identifier);

// ✅ CORRECT
await purchaseProduct(package.product.identifier);
```

**Vérifier:** `console.log(package.product.identifier)`
**Attendu:** `"com.yourapp.product_id"` (pas juste "premium")

### 2. Product ID Existe sur App Store Connect

- App Store Connect > My Apps > In-App Purchases
- Vérifier Product ID exact (copier/coller dans code)
- Status minimum: "Ready to Submit" (pas besoin approval pour sandbox)

### 3. RevenueCat Configuration

- Dashboard RC > Products > Verify Product ID
- Entitlement lié au product
- API Keys corrects (iOS/Android)

### 4. App ID Capability (Developer Portal)

- Certificates, IDs & Profiles > Identifiers
- App ID capability "In-App Purchase" ✅ cochée

### 5. Code Entitlements (app.json)

```json
// ❌ NE PAS AJOUTER
"ios": {
  "entitlements": {
    "com.apple.developer.in-app-purchases": []  // N'EXISTE PAS
  }
}

// ✅ CORRECT
"ios": {
  // Pas d'entitlements IAP nécessaires
}
```

**Si présent:** Le supprimer immédiatement (cause build failures)

### 6. Sandbox Testing Setup

**iOS:**
- Settings > App Store > Sandbox Account logged in
- Device physique (simulateur limité)
- Build signé (pas Expo Go)

**Android:**
- Google Play Console > License Testing
- Test account ajouté
- Signed APK/AAB

### 7. Network/Logs

```javascript
// Activer logs RevenueCat
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

// Vérifier offerings chargés
const offerings = await getOfferings();
console.log('Offerings:', offerings);
console.log('Available packages:', offerings.availablePackages);
```

**Attendre:** Array avec au moins 1 package

---

## Next Steps Post-Résolution

### Immediate (15-16 Octobre)

- [x] Bug #1 résolu (entitlement supprimé)
- [x] Bug #2 résolu (product.identifier)
- [x] Sandbox testing validé
- [ ] Commit fix PremiumModal.jsx
- [ ] Update CHANGELOG.md
- [ ] Build TestFlight v1.1.4+

### Court Terme (Semaine 3 Octobre)

- [ ] TestFlight beta famille (3 testeurs)
- [ ] Monitoring RevenueCat dashboard premiers achats tests
- [ ] Validation trial 7 jours fonctionne
- [ ] Validation restore purchases

### Moyen Terme (M+1)

- [ ] Release v1.1.0 production
- [ ] Monitoring conversion metrics
- [ ] A/B test pricing si conversion <3%

---

## Références Techniques

### Apple Documentation

- [StoreKit Overview](https://developer.apple.com/documentation/storekit)
- [In-App Purchase Configuration](https://developer.apple.com/app-store/in-app-purchase/)
- [Entitlements vs Capabilities](https://developer.apple.com/documentation/bundleresources/entitlements)

### RevenueCat Documentation

- [Package Structure](https://www.revenuecat.com/docs/packages)
- [iOS Integration Guide](https://www.revenuecat.com/docs/ios)
- [Sandbox Testing](https://www.revenuecat.com/docs/sandbox)

### Internal Documentation

- ADR 002: Migration build natif
- ADR 003: Blocage provisioning profiles
- RevenueCat Analysis: `docs/audits/revenuecat-analysis.md`

---

**Version:** 1.0
**Status:** ✅ RÉSOLU
**Date résolution:** 15 Octobre 2025
**Prochaine action:** Deploy TestFlight v1.1.4+

---

## Commit Message Template (Bug #2 Fix)

```
fix(iap): use correct RevenueCat product identifier path

**Problem:**
PremiumModal.jsx was using `premiumPackage.identifier` instead of
`premiumPackage.product.identifier`, causing RevenueCat to fail
finding the App Store product.

**Root Cause:**
RevenueCat Package API structure:
- package.identifier = "premium" (package name)
- package.product.identifier = "com.app.premium" (App Store Product ID)

StoreKit requires the full Product ID, not the package name.

**Fix:**
Changed line 72 to use `premiumPackage.product.identifier`

**Testing:**
✅ Sandbox purchase successful with Product ID:
   com.irimwebforge.resetpulse.premium_lifetime
✅ StoreKit sheet displays correct price (4,99€) and trial (7 days)
✅ Entitlement "premium_access" activated after purchase
✅ Premium content unlocked correctly

**Context:**
This bug was masked by Bug #1 (phantom entitlement blocker).
After removing the non-existent com.apple.developer.in-app-purchases
entitlement, sandbox testing revealed this code-level bug.

**Related:**
- Devlog: docs/devlog/iap-resolution-final.md
- ADR 003: docs/decisions/apple-provisioning-profile-iap-failure.md
- 1 week debugging timeline (10-15 Oct 2025)

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
