# TODO - Tests Build Dev v1.1.0 (RevenueCat)

**Build EAS development en cours** - Tests à effectuer après installation

---

## 🎯 1. Freemium Configuration

### Palettes
- [ ] **2 palettes débloquées** au démarrage
  - [ ] `softLaser` (cool tones) accessible
  - [ ] `terre` (warm tones) accessible
- [ ] **13 palettes verrouillées** visibles avec 🔒
  - [ ] `classique` locked
  - [ ] `tropical`, `zen`, `forêt`, `océan`, etc. locked
- [ ] **Scroll palette premium** → scroll-back automatique + haptic warning

### Activités
- [ ] **4 activités débloquées** au démarrage
  - [ ] `none` (Basique) accessible
  - [ ] `work` (Travail 💻) accessible
  - [ ] `break` (Pause ☕) accessible
  - [ ] `breathing` (Respiration 🌬️) accessible
- [ ] **12 activités verrouillées** visibles avec 🔒
  - [ ] `reading`, `study`, `meditation`, `yoga`, etc. locked
- [ ] **Tap activité premium** → haptic warning + modal s'ouvre

---

## 💰 2. PremiumModal Flow

### Affichage Modal
- [ ] **Modal s'ouvre** sur tap activité premium
- [ ] **Modal s'ouvre** sur scroll palette premium
- [ ] **Design cohérent** avec SettingsModal (theme, spacing)

### Contenu Modal
- [ ] **Titre**: "Débloquer Premium"
- [ ] **Corps texte** exact:
  ```
  ResetPulse est gratuit et fonctionnel.
  Pour plus d'activités et de palettes, débloquez premium.
  ```
- [ ] **Features box** affiché:
  ```
  15 palettes + 16 activités
  4,99€ - Une fois, pour toujours
  Trial gratuit 7 jours
  ```
- [ ] **Bouton principal**: "Commencer l'essai gratuit" (vert brand)
- [ ] **Bouton secondaire**: "Peut-être plus tard"
- [ ] **Lien restore**: "Restaurer mes achats" (underline)

### Interactions
- [ ] **Boutons disabled** pendant loading (opacité 0.6)
- [ ] **ActivityIndicator** visible pendant purchase
- [ ] **Modal non fermable** pendant operation (tap outside inactif)
- [ ] **Fermeture** via "Peut-être plus tard" fonctionne

---

## 🔌 3. RevenueCat SDK Initialization

### Démarrage App
- [ ] **App démarre sans crash** avec RevenueCat SDK
- [ ] **Console logs visibles**:
  - [ ] `[RevenueCat] Premium status: false` au démarrage
  - [ ] `[RevenueCat] Active entitlements: []` (vide si pas premium)
- [ ] **isLoading → false** après init (2-3 secondes max)

### Dashboard RevenueCat
- [ ] **Connexion dashboard**: https://app.revenuecat.com/
- [ ] **Projet "ResetPulse"** visible
- [ ] **Customer** créé après premier lancement app (anonymous ID)

---

## 🛒 4. Purchase Flow (Sandbox iOS)

### Sandbox Tester Setup
- [ ] **Compte sandbox** créé dans App Store Connect
  - Settings → Users and Access → Sandbox Testers
- [ ] **Device déconnecté** compte App Store réel
  - Settings → App Store → Sign Out
- [ ] **Sandbox tester** connecté au premier achat

### Flow Achat
- [ ] **Clic "Commencer l'essai gratuit"**
  - [ ] Sheet Apple apparaît (pas web browser)
  - [ ] Prix affiché: "4,99€" ou équivalent devise
  - [ ] Mention trial: "Free for 7 days, then..."
- [ ] **Connexion sandbox tester** fonctionne
- [ ] **Confirmation achat** → purchase success
  - [ ] Haptic success ressenti
  - [ ] Alert "Bienvenue Premium ! 🎉"
  - [ ] Message: "Toutes les palettes et activités sont maintenant débloquées"
  - [ ] Modal se ferme automatiquement

### Post-Purchase
- [ ] **Palettes premium débloquées** immédiatement
  - [ ] `classique`, `tropical`, `zen`, etc. accessibles
  - [ ] Plus de 🔒 visible
- [ ] **Activités premium débloquées** immédiatement
  - [ ] `reading`, `meditation`, `yoga`, etc. accessibles
- [ ] **Console log**: `[RevenueCat] Premium status: true`
- [ ] **Dashboard RevenueCat** montre purchase event

---

## 🔄 5. Restore Purchases

### Test Restore (avec achat sandbox précédent)
- [ ] **Désinstaller app** + **réinstaller**
- [ ] **Lancer app** → freemium strict (2 palettes locked)
- [ ] **Ouvrir PremiumModal** (tap activité premium)
- [ ] **Clic "Restaurer mes achats"**
  - [ ] Loading spinner visible
  - [ ] **Alert success**: "Restauration réussie"
  - [ ] Message: "Vos achats ont été restaurés. Toutes les fonctionnalités premium sont débloquées."
  - [ ] Modal se ferme automatiquement
- [ ] **Premium actif** immédiatement après restore

### Test Restore (sans achat)
- [ ] **Device sandbox tester** sans achat précédent
- [ ] **Clic "Restaurer mes achats"**
  - [ ] **Alert**: "Aucun achat trouvé"
  - [ ] Message: "Aucun achat précédent n'a été trouvé pour ce compte."
  - [ ] Modal **reste ouverte** (pas de fermeture auto)

---

## 🌐 6. Edge Cases Network

### Mode Avion
- [ ] **Activer mode avion** sur device
- [ ] **Ouvrir PremiumModal**
- [ ] **Clic "Commencer l'essai gratuit"**
  - [ ] **Alert**: "Pas de connexion"
  - [ ] Message: "Impossible de charger les offres. Vérifiez votre connexion internet."
  - [ ] Modal reste ouverte
- [ ] **Désactiver mode avion** + retry → fonctionne

### Network Slow
- [ ] **Connexion lente** (throttle network)
- [ ] **Loading states** visibles pendant fetch offerings
- [ ] **Timeout gracieux** (pas de crash)

---

## 🚫 7. Race Conditions

### Double-Purchase Prevention
- [ ] **Tap rapide** "Commencer l'essai gratuit" (double-tap)
  - [ ] **Une seule** sheet Apple s'ouvre (pas deux)
  - [ ] Console log: `[RevenueCat] Purchase already in progress, ignoring`
- [ ] **Boutons tous disabled** pendant purchase
  - [ ] "Commencer l'essai gratuit" grisé
  - [ ] "Peut-être plus tard" grisé
  - [ ] "Restaurer mes achats" grisé

### Cancel Purchase
- [ ] **Sheet Apple ouverte** → **Cancel**
  - [ ] **Aucune alert** affichée (silent cancel)
  - [ ] Modal reste ouverte
  - [ ] Boutons redeviennent actifs

---

## 📊 8. Dashboard RevenueCat Verification

### Events à vérifier
- [ ] **Initial app open** → Customer créé (anonymous ID)
- [ ] **Trial started** → Event visible dans dashboard
- [ ] **Purchase completed** → Transaction loggée
- [ ] **Entitlement granted** → `premium_access` actif
- [ ] **Revenue** comptabilisé (sandbox = $0.00 mais event visible)

### Customer Info
- [ ] **App User ID** match device (anonymous par défaut)
- [ ] **Active Entitlements**: `premium_access`
- [ ] **Original Purchase Date** correct
- [ ] **Expiration Date** (trial): 7 jours après purchase

---

## 🐛 9. Erreurs à Logger

### Console Errors (ne devraient PAS apparaître)
- [ ] ❌ `Invariant Violation` RevenueCat
- [ ] ❌ `undefined is not an object` (customerInfo)
- [ ] ❌ Crash app pendant purchase
- [ ] ❌ Memory warning excessive

### Expected Logs (devraient apparaître)
- [ ] ✅ `[RevenueCat] Purchases SDK initialized`
- [ ] ✅ `[RevenueCat] Premium status: false/true`
- [ ] ✅ `[RevenueCat] Active entitlements: [...]`
- [ ] ✅ `[RevenueCat] Purchase error:` (si erreur volontaire testée)

---

## 📱 10. UX Polish

### Animations
- [ ] **Haptic warning** sur tap premium (vibration courte)
- [ ] **Haptic success** après purchase (vibration positive)
- [ ] **Modal fade-in** smooth (pas de flash)
- [ ] **Scroll-back palette** animé (pas instantané)

### Accessibilité
- [ ] **Labels accessibilité** corrects sur boutons
  - [ ] "Commencer l'essai gratuit"
  - [ ] "Peut-être plus tard"
  - [ ] "Restaurer mes achats"
- [ ] **VoiceOver** fonctionne (si activé)

---

## ✅ Validation Globale

### Critères Success
- [ ] **Freemium strict**: 2 palettes + 4 activités gratuites confirmées
- [ ] **Purchase flow**: Sandbox purchase → premium débloqué
- [ ] **Restore flow**: Restore → premium restauré
- [ ] **Edge cases**: Network errors gérés gracieusement
- [ ] **Zero crash**: Aucun crash pendant tous les tests

### Critères Bloquants (à corriger avant TestFlight)
- [ ] ❌ Crash au démarrage avec RevenueCat
- [ ] ❌ Purchase ne débloque pas premium
- [ ] ❌ Restore ne fonctionne pas
- [ ] ❌ Modal non fermable (bug)
- [ ] ❌ Double-purchase possible

---

## 📝 Notes Post-Test

**Bugs trouvés:**
```
[À remplir pendant tests]
```

**Améliorations UX:**
```
[À remplir pendant tests]
```

**Questions RevenueCat:**
```
[À remplir si comportements inattendus]
```

---

**Date tests**: 2025-10-08
**Build**: EAS development (iOS)
**Testeur**: Eric
**Device**: iPhone (UDID: 00008110-000225A63E2B801E)
