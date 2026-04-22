---
created: '2026-01-13'
updated: '2026-01-13'
status: active
---

# Checklist Pré-Déploiement ResetPulse v2.1.0

## 🚨 CRITIQUE - À faire AVANT build

### 1. Configuration Dev Mode
**Fichier:** `src/config/test-mode.js`

| Variable | Actuel | Production |
|----------|--------|------------|
| `DEV_MODE` | ❌ `true` | `false` |
| `SHOW_DEV_FAB` | ✅ `false` | `false` |
| `DEFAULT_PREMIUM` | ❌ `true` | `false` |

### 2. Versions
**Fichiers:** `app.json` + `package.json`

- [ ] Version synchronisée : `2.1.0` ✅
- [ ] Build number iOS incrémenté (Xcode)
- [ ] Version code Android incrémenté (si applicable)

---

## 🔧 BUILD & COMPILATION

### iOS
- [ ] `npx expo prebuild --clean`
- [ ] Ouvrir `ios/ResetPulse.xcworkspace` dans Xcode
- [ ] Sélectionner "Any iOS Device (arm64)"
- [ ] Product → Archive
- [ ] Aucune erreur de compilation
- [ ] Aucun warning critique

### Android (si applicable)
- [ ] `cd android && ./gradlew bundleRelease`
- [ ] Aucune erreur de compilation

---

## ✅ TESTS FONCTIONNELS

### Timer Core
- [ ] Démarrer un timer (tap dial center)
- [ ] Arrêter un timer en cours
- [ ] Reset après completion
- [ ] Drag pour ajuster durée (même en running - nouveau!)
- [ ] Tap sur graduation pour set durée
- [ ] Completion avec son + vibration
- [ ] Mode landscape (zen mode)

### Onboarding
- [ ] Flow complet du début à la fin
- [ ] Création activité custom fonctionne
- [ ] Sélection son fonctionne
- [ ] Notifications permission request
- [ ] Écran launch (Filter-080) s'affiche

### Freemium / Premium
- [ ] Activités gratuites: work, break, meditation, creativity
- [ ] Palettes gratuites: terre, softLaser
- [ ] Bouton "+" ouvre Discovery modal
- [ ] **Achat test en sandbox** (TestFlight)
- [ ] Restore purchases fonctionne
- [ ] Two Timers Modal à 2-3 timers
- [ ] Review Request à 5 timers

### Paramètres
- [ ] Panel settings s'ouvre (swipe up)
- [ ] Changement d'activité
- [ ] Changement de palette
- [ ] Changement de couleur
- [ ] Son de completion
- [ ] Interaction profile (si implémenté)

---

## 📊 ANALYTICS (Mixpanel)

- [ ] `app_opened` au lancement
- [ ] `onboarding_started` / `onboarding_completed`
- [ ] `timer_started` / `timer_completed`
- [ ] `two_timers_milestone`
- [ ] `app_review_requested`
- [ ] `purchase_started` / `purchase_completed` / `purchase_failed`
- [ ] Vérifier dans Mixpanel dashboard qu'events arrivent

---

## 🔐 SÉCURITÉ & SECRETS

- [ ] Pas de clés API en dur visibles dans le code
- [ ] `.env` non commité (vérifié dans `.gitignore`)
- [ ] RevenueCat keys dans `app.json` extra (OK - c'est public)
- [ ] Pas de `console.log` sensibles (credentials, tokens)

---

## 📱 APP STORE REQUIREMENTS

### Métadonnées
- [ ] Screenshots à jour (iPhone, iPad si applicable)
- [ ] Description mise à jour avec nouvelles features
- [ ] Keywords optimisés
- [ ] Privacy policy URL valide
- [ ] Support URL valide

### Compliance
- [ ] `ITSAppUsesNonExemptEncryption: false` ✅ (déjà dans app.json)
- [ ] Pas de private APIs utilisées
- [ ] Permissions justifiées (notifications, exact alarm Android)

---

## 🧹 NETTOYAGE

- [ ] Supprimer code commenté obsolète
- [ ] Supprimer fichiers de prototype non utilisés
- [ ] Vérifier qu'aucun fichier `.test.js` n'est bundlé en prod
- [ ] Supprimer console.log de debug (ou les wrapper avec `__DEV__`)

---

## 🚀 DEPLOY WORKFLOW

1. **Passer test-mode.js en production**
   ```javascript
   export const DEV_MODE = false;
   export const SHOW_DEV_FAB = false;
   export const DEFAULT_PREMIUM = false;
   ```

2. **Commit final**
   ```bash
   git add -A
   git commit -m "chore: prepare v2.1.0 for production release"
   ```

3. **Build iOS**
   ```bash
   npx expo prebuild --clean
   # Ouvrir Xcode → Archive → Upload to App Store Connect
   ```

4. **TestFlight**
   - Soumettre pour review interne
   - Tester IAP en sandbox
   - Vérifier tous les flows

5. **Soumettre pour Review**
   - App Store Connect → Submit for Review

---

## 📋 POST-DEPLOY

- [ ] Vérifier dans Mixpanel les premiers events utilisateurs
- [ ] Monitorer RevenueCat dashboard
- [ ] Surveiller crashlytics / erreurs
- [ ] Préparer hotfix si nécessaire

---

## Notes

- Version actuelle: 2.1.0
- Nouvelles features v2.1:
  - In-app review à 5 timers (`expo-store-review`)
  - Drag pour ajuster durée même pendant running
  - Apple Search Ads attribution via RevenueCat
  - Onboarding avec launch screen (Filter-080)
  - Two Timers modal robuste (2-3 + fallback 5)
- TestFlight ne permet pas de tester StoreReview (retourne false)
