# Changelog

All notable changes to ResetPulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] - 2025-12-04

### 📊 Analytics Tracking Dashboard

#### Added

- **Tableau de tracking simplifié** (`analytics-dashboard/tracking.html`)
  - **Hebdo** : App Store + Google Play (vues, DL, stars) - S40 à S1
  - **Quotidien** : Mixpanel + RevenueCat (opens, onboard, PW views, trials, achats, revenue) - 31 jours déc
  - Édition inline (double-clic), localStorage auto, export JSON
  - Lignes TOTAL auto (sommes + moyennes)
  - Sections collapsibles
  - Calcul auto PW→Trial %

- **Historique données** (`analytics-dashboard/DATA-HISTORY.md`)
  - Données Oct/Nov/Déc extraites des captures
  - Sources : App Store Connect, Google Play Console, Mixpanel, RevenueCat

#### Removed

- `resetpulse-tracking.html` (remplacé par version simplifiée)
- `resetpulse-tracking-guide.html` (consolidé)

---

## [1.2.3] - 2025-12-02

### 🎨 Default Color Fix

#### Fixed

- **Couleur par défaut changée en bleu** (`src/config/timerPalettes.js`)
  - Avant : `#4A5568` (gris bleuté)
  - Après : `#3B82A0` (bleu terre/océan)
  - Première couleur vue par les nouveaux utilisateurs

---

### 🎯 Paywall Copy Optimization - Version Minimaliste

**Objectif:** Améliorer conversion paywall (5.71% → target >18%)

#### Changed

- **Copy paywall "Version C - Minimaliste punch"** (15 langues)
  - `premium.title`: "Débloque tout" (direct, action)
  - `premium.description`: "Toutes les couleurs.\nToutes les activités.\nTon confort maximum."
  - `premium.features`: "🎁 7 JOURS GRATUITS" (trial visible en premier)
  - `premium.price`: "Puis {price} une fois.\nÀ toi pour toujours."
  - `premium.trial`: Supprimé (intégré dans features)

- **Simplification UI** (`src/components/PremiumModal.jsx`)
  - Suppression du texte trial séparé (maintenant dans features box)
  - Prix dynamique avec interpolation `{price}`

---

## [1.2.2] - 2025-12-02

### 📊 Analytics Improvements

#### Added

- **`app_opened` event** (`App.js`)
  - Track app opens avec `is_first_launch` boolean
  - Utilise AsyncStorage pour détecter premier lancement
  - Event déclenché après init Mixpanel

#### Changed

- **Platform casing uniformisé** (`src/services/analytics.js`)
  - Avant : `platform: 'ios'` / `platform: 'android'` (minuscule)
  - Après : `platform: 'iOS'` / `platform: 'Android'` (casse standard)
  - Évite fragmentation données Mixpanel

- **`paywall_viewed` dédupliqué** (`src/components/PremiumModal.jsx`)
  - Avant : Event déclenché à chaque ouverture modal (même user = N events)
  - Après : Event déclenché une seule fois par session
  - Ratio paywall→trial plus fiable pour mesurer conversion

---

## [1.2.1] - 2025-12-02

### 🔧 Prix dynamique RevenueCat

#### Changed

- **Prix Premium dynamique** (`src/components/PremiumModal.jsx`)
  - Avant : Prix hardcodé dans i18n (4,99€, 49kr, ¥700, etc.)
  - Après : Prix récupéré dynamiquement via `priceString` de RevenueCat
  - Avantage : Le prix affiché correspond toujours au prix réel du store de l'utilisateur
  - Fallback : Si RevenueCat échoue, affiche le prix i18n hardcodé

- **Nouvelle clé i18n `premium.priceOnce`** (15 langues)
  - Texte "Une fois, pour toujours" séparé du prix
  - Permet l'affichage : `{priceString} - {t('premium.priceOnce')}`

---

## [1.2.0] - 2025-11-26

### 🌍 International Edition - Production Release

**Status**: ✅ READY FOR PRODUCTION - IAP Fixed!

#### Release Information
- **Release Name**: International Edition / Global Release
- **Android**: v1.2.0 (versionCode 20) - Internal Testing on Google Play
- **iOS**: v1.2.0 (buildNumber 21) - TestFlight
- **Build Date**: 2025-11-26

#### Major Features

### 🔧 Critical IAP Fix - RevenueCat Android Bug Workaround

**Status**: ✅ FIXED - Build 20 résout le bug critique

#### Fixed

- **Bug RevenueCat Android** - Achat Premium impossible
  - Problème : RevenueCat cherchait un type `subscription` pour un produit `non-consumable`
  - Symptôme : "Missing productDetails: productType='subs'" alors que Google Play retournait `type="inapp"`
  - Solution : Workaround utilisant `purchasePackage()` au lieu de `purchaseProduct()`
  - Nouveau produit : `com.irimwebforge.resetpulse.premium_lifetime_v2` (4,99€)
  - Build 20 : versionCode 20 avec workaround implémenté

### 🌍 M7.6 - Internationalisation (Phase 5 Complete)

**Status**: ✅ TESTING - 15 langues implémentées

#### Added

- **i18n Complete Coverage** - 15 langues supportées
  - Langues : FR, EN, ES, DE, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO
  - Strings : 160+ keys traduites (onboarding, settings, premium, palettes, activités, sons)
  - Système : react-i18next avec détection automatique langue device

- **Traductions manquantes ajoutées**
  - `premium.unlock`: "Débloquer ✨" → "Unlock ✨" (15 langues)
  - `premium.onboardingToast`: Toast onboarding palettes premium (15 langues)
  - `sounds.*`: 10 noms de sons traduits (bell_classic, microwave_vintage, etc.)
  - `palettes.automne`: "Automne" → "Autumn" / "Otoño" / "秋" (15 langues)
  - `palettes.lavande`: "Lavande" → "Lavender" / "Lavanda" / "ラベンダー" (15 langues)

- **Hooks i18n**
  - `useTranslation()` : Hook custom pour accès traductions
  - Utilisation : `const t = useTranslation(); t('settings.title')`

#### Changed

- **Chrono Numérique UX amélioré** (`src/components/timer/DigitalTimer.jsx`)
  - Avant : Visible uniquement quand timer lancé
  - Après : Visible en permanence (si activé dans settings)
  - Réglage cadran : Opacité 70% + temps dynamique en temps réel
  - Timer en cours : Opacité 100% + pulse subtil (échelle 1.02x)

- **Palettes optimisées** (`src/config/timerPalettes.js`)
  - **Doublons supprimés** : "verts" et "bleus" (identiques à "forêt" et "océan")
  - **Nouvelles palettes** :
    - `automne` : Tons chauds marron/cuivre (chocolat, cuivre, rouille, or)
    - `lavande` : Violets doux (violet moyen, orchidée, prune, lavande)
  - **Couleur onboarding** : Bleu (#4A5568) au lieu de vert (#68752C)
  - **Ordre optimisé** : Progression chromatique Énergie → Chaleur → Douceur → Sérénité
    - 🆓 Gratuites (2) : terre, softLaser
    - 🌈 Vives/Saturées (4) : classique, tropical, crépuscule, darkLaser
    - 🍁 Chauds/Terreux (2) : automne, aurore
    - 🌸 Pastels/Doux (4) : douce, pastel_girly, lavande, zen
    - 🌊 Nature/Bleu-Vert (3) : canard, forêt, océan

- **Refactoring i18n dans code**
  - `PaletteCarousel.jsx` : Badge "Débloquer ✨" utilise `t('premium.unlock')`
  - `PaletteCarousel.jsx` : Toast onboarding utilise `t('premium.onboardingToast')`
  - `soundsMapping.js` : Noms de sons utilisent `i18n.t('sounds.*')` avec getters

#### Technical

- **TEST_MODE** : Désactivé (`false`) - Mode production freemium actif
- **Fichiers modifiés** : 19 (15 locales + 4 composants)
- **Traductions totales** : 160+ keys × 15 langues = 2400+ strings
- **ProGuard Rules** : Added for RevenueCat SDK and Google Play Billing
- **Android Signing** : Fixed release configuration to use production keystore
- **Version Bump Script** : Automated version update across 5 files

#### Testing

- ✅ Tests hooks : 29/29 passed
- ✅ Compilation : OK (aucune erreur)
- ✅ Android AAB : Built successfully (65 MB)
- ✅ iOS Build : EAS build completed with auto-submit to TestFlight
- ⏳ Tests manuels : Android Internal Testing + iOS TestFlight

#### Deployment

- **Android Build Process**:
  - Fixed critical signing configuration issue (was using debug keystore for release)
  - Added ProGuard rules for RevenueCat to prevent obfuscation crashes
  - Build command: `./gradlew bundleRelease`
  - AAB location: `app/build/outputs/bundle/release/app-release.aab`

- **iOS Build Process**:
  - EAS build with production profile
  - Auto-submit enabled for TestFlight
  - Provisioning profile regenerated automatically
  - Build command: `eas build --platform ios --profile production --auto-submit`

---

## [1.1.8] - 2025-10-20

### 📊 M7.5 - Analytics Foundation Complete

**Status**: ✅ VALIDÉ - Events reçus dashboard Mixpanel

#### Added
- **Mixpanel Analytics Integration** - 6 events critiques trackés
  - `app_opened`: Attribution baseline (is_first_launch tracking)
  - `onboarding_completed`: Funnel top (target > 65% completion)
  - `paywall_viewed`: Reach measurement (source tracking)
  - `trial_started`: Intention achat (RevenueCat sync)
  - `purchase_completed`: Revenue tracking (price + transaction_id)
  - `purchase_failed`: Friction debug (error_code granulaire)

- **Analytics Service** (`src/services/analytics.js`)
  - Mixpanel SDK v3+ integration (mixpanel-react-native@3.1.2)
  - EU data residency configuration (https://api-eu.mixpanel.com)
  - Token projet: 4b1bd9b9a3be61afb7c19b40ad5a73de
  - Super properties: platform, app_version
  - Graceful fallback Expo Go
  - Flush immédiat DEV (debugging feedback)

- **Analytics Hook** (`src/hooks/useAnalytics.js`)
  - React hook optimisé (singleton, pas de recréation)
  - Usage: `const analytics = useAnalytics()`

#### Fixed
- **Token Organisation → Projet** - Events droppés silencieusement
  - Initial: 19fef5beb302264e8e3eaf9c0ccaed91 (organisation token)
  - Corrigé: 4b1bd9b9a3be61afb7c19b40ad5a73de (projet ResetPulse)

- **EU Data Residency RGPD** - Serveurs US → EU
  - Added: `setServerURL('https://api-eu.mixpanel.com')` après init()
  - Compliance: Data stays in EU (projet créé avec residency EU)

#### Technical
- **ProGuard Rules Android** - Obfuscation Mixpanel configured
  - `-keep class com.mixpanel.** { *; }`
  - Prevents crash production release builds

- **Debug Session** (1h30 token + endpoint)
  - Pattern validé: Test 1 event avant intégrer tous
  - Délai dashboard: 3-5 minutes (pas 30s instantané)
  - Logs diagnostics: token + server URL visibility

#### Changed
- **Version bump**: 1.1.7 → 1.1.8
- **App.js**: Mixpanel init au startup (Analytics.init())
- **PremiumModal.jsx**: trackPaywallViewed(source) on visible
- **PurchaseContext.jsx**: 3 events (trial_started, purchase_completed, purchase_failed)
- **OnboardingController.jsx**: trackOnboardingCompleted() on complete

#### Documentation
- **Learning Session Devlog** - `docs/devlog/analytics/mixpanel-m7-5-implementation.md`
  - Galères debug documentées (token + EU endpoint)
  - Checklist setup Mixpanel réutilisable MoodCycle
  - Erreurs classiques + solutions (économie 2h debug)

#### Next Steps (M7.6)
- [ ] expo-localization 15 langues (dimanche après-midi 4-6h)
- [ ] Metadata stores iOS/Android (lundi)
- [ ] Submit v1.2.0 production simultané (mardi)

---

## [1.1.7] - 2025-10-18

### 🛡️ Keep Awake Feature

#### Added
- **Keep Awake Hook** (`src/hooks/useTimerKeepAwake.js`)
  - Prevents screen lock during active timer
  - Default: ON (user-configurable)
  - Settings toggle: "Maintenir écran allumé"
  - Battery hint displayed in Settings

#### Changed
- **Version bump**: 1.1.6 → 1.1.7

---

## [1.1.6] - 2025-10-17

### 🎉 iOS APPROVED - RevenueCat Integration Complete

**APPROVED**: 17.10.2025 23:30 by Apple Review Team

#### Status
- ✅ **iOS**: APPROVED and live on App Store (within 24h)
- 🚀 **Android**: Ready for submission (ProGuard configured)

### 🛠️ Fixed - Apple Review Rejection Issues

#### Fixed
- **Audio Background Mode (Guideline 2.5.4)** - Removed unnecessary UIBackgroundModes capability
  - `app.json:18-22`: Suppression de `UIBackgroundModes: ["audio"]` from iOS infoPlist
  - Timer uses local notifications for background alerts (expo-notifications)
  - Audio playback only when app is in foreground (expo-audio)
  - Compliant with Apple Guideline 2.5.4: App does not require persistent audio session
  - Justification: Notifications handle sound playback automatically through iOS notification system

- **IAP Free Trial Button (Guideline 2.1)** - Enhanced error logging for purchase flow debugging
  - `PremiumModal.jsx:37-107`: Added 7 detailed log points throughout purchase flow
  - Log prefix `[IAP]` with emoji indicators for easy console filtering
  - Logged data: offerings status, package details, product ID, price, purchase result
  - Helps Apple reviewers and developers identify exact failure points
  - All logs include structured objects for comprehensive debugging
  - Error cases explicitly logged: network errors, missing offerings, store problems

#### Changed
- **Version bump**: 1.1.5 → 1.1.6
- **Debug capability**: Production-ready logging without affecting user experience

#### Technical
- **Files Modified**: 2 (app.json, PremiumModal.jsx)
- **iOS Configuration**: UIBackgroundModes removed from infoPlist
- **IAP Logging**: 7 checkpoint logs added to purchase flow
  - Start: `[IAP] 🚀 Starting purchase flow...`
  - Fetch: `[IAP] 📡 Fetching offerings from RevenueCat...`
  - Received: `[IAP] 📦 Offerings received:` + structure details
  - Error: `[IAP] ❌ Network error` / `[IAP] ❌ No offerings available`
  - Selected: `[IAP] 📋 Package selected:` + product details
  - Initiated: `[IAP] 💳 Initiating purchase for product:`
  - Result: `[IAP] ✅ Purchase result:` + status details
- **Design Philosophy**: Debug visibility for Apple Review without breaking UX

#### Apple Review Notes
- Audio background removed: Timer now compliant with Guideline 2.5.4
- IAP logging enhanced: Console logs help identify purchase flow issues
- Product ID: `com.irimwebforge.resetpulse.premium_lifetime`
- Free trial: 7 days (Introductory Offer configured in App Store Connect)

## [1.1.5] - 2025-10-15

### 🎯 Fixed - Onboarding Premium UX

#### Fixed
- **Premium content pendant onboarding** - Cliquer sur du contenu premium pendant le guide ouvrait la PremiumModal et interrompait le flow
  - `ActivityCarousel.jsx` + `PaletteCarousel.jsx`: Toast léger à la place de la modal pendant onboarding
  - Toast message: "Terminez le guide pour découvrir les [activités/palettes] premium !"
  - Animation slide-up douce (300ms) avec disparition automatique après 2s
  - Haptic feedback warning préservé
  - Après onboarding: Comportement normal (modal s'affiche)
  - UX non-bloquante: L'utilisateur peut continuer le guide sans interruption

#### Technical
- **Files Modified**: 2 (ActivityCarousel, PaletteCarousel)
- **New State**: `toastMessage` + `toastAnim` pour affichage toast
- **Condition**: `isOnboardingActive = !onboardingCompleted && currentTooltip !== null`
- **Rollback**: Mode démo complet abandonné (problèmes highlight + clics premium non fonctionnels)
- **Design Philosophy**: UX fluide - informer sans bloquer, pas de friction pendant découverte

## [Unreleased] - 2025-10-09

### 🐛 Fixed - Interface Minimaliste & Settings UX

#### Fixed
- **Timer à zéro** - Le bouton play ne peut plus lancer un timer de 0 seconde
  - `useTimer.js:226`: Correction de la condition de démarrage
  - Avant : `if (remaining === 0 && duration === 0)` (permettait le lancement si duration > 0)
  - Après : `if (remaining === 0)` (bloque tout démarrage à zéro)
  - L'utilisateur doit maintenant régler une durée ou utiliser Reset avant de démarrer

- **Enregistrement durée activité** - La durée ne s'enregistre plus à chaque changement mais uniquement au play
  - `TimeTimer.jsx:184`: Suppression de l'enregistrement automatique lors du changement via graduations
  - `useTimer.js:248-252`: L'enregistrement se fait uniquement au premier démarrage (utilisation réelle)
  - Flux corrigé : Changement d'activité → restaure durée sauvegardée → ajustement via graduations (pas de sauvegarde) → play → sauvegarde
  - Évite la pollution des données avec des durées non utilisées
- **Mode zen activités** - Activités encore visibles avec taille réduite en mode minimaliste
  - `ActivityCarousel.jsx`: Retrait des styles hardcodés `opacity: 0.3` et `scale: 0.8` dans container
  - Contrôle désormais géré uniquement par le parent `TimerScreen`
  - Mode zen fonctionne parfaitement : masquage complet quand timer actif

- **Switchs afficher/masquer** - Les toggles "Afficher les palettes" et "Afficher les activités" ne fonctionnaient pas correctement
  - `TimerScreen.jsx`: Correction des valeurs d'opacity (lignes 288, 344)
  - Avant : `opacity: showActivities ? activityAnim : 0` (valeur d'animation fixe)
  - Après : `opacity: showActivities ? 1 : 0` (réactivité immédiate)
  - Les sections disparaissent instantanément lors du toggle dans les settings
  - Animations d'entrée préservées (translateX, translateY, scale au démarrage)

- **Bouton "Relancer le guide"** - Le bouton dans les settings ne relançait pas l'écran de bienvenue
  - `SettingsModal.jsx:900`: Appelle maintenant `resetOnboarding()` au lieu de `startTooltips()`
  - Comportement corrigé: Affiche l'écran de bienvenue complet puis les tooltips
  - Avant: Relançait seulement les tooltips (sans WelcomeScreen)
  - Après: Réinitialise complètement l'onboarding (WelcomeScreen + tooltips)
  - Description mise à jour: "Afficher à nouveau l'écran de bienvenue et les conseils"

#### Changed
- **Réorganisation des settings** - Ordre optimisé : Fonction → Technique → Forme
  - `SettingsModal.jsx`: Architecture repensée avec priorités claires pour UX neuroatypique
  - **Avant** : 5 sections (Expérience Timer, Personnalisation, Activités, Réglages Cadran, À propos)
  - **Après** : 4 sections logiques (Fonction → Technique → Forme)
    - 🪄 **Interface** (Card Primary) : Interface minimaliste + Chrono numérique + Animation Pulse
    - ⚙️ **Timer** (Card) : Son de fin + Mode Cadran + Sens de rotation
    - 🎨 **Apparence** (Card) : Thème + Palettes + Activités favorites
    - ℹ️ **À propos** (Flat) : Version + Relancer le guide
  - Badge "NOUVEAU" retiré (plus pertinent après plusieurs versions)
  - Emoji 🪄 pour Interface : Plus doux et évocateur que la cible 🎯
  - Ordre intuitif : Comment on travaille → Réglages techniques → Personnalisation visuelle
  - Philosophie : L'essentiel (comportement) avant le cosmétique (apparence)

#### Technical
- **Files Modified**: 3 (TimeTimer, useTimer, ActivityCarousel, TimerScreen, SettingsModal)
- **State Management**: Confirmé que `showActivities` et `showPalettes` fonctionnent correctement via `TimerOptionsContext`
- **Design Philosophy**: Séparation des responsabilités - le parent contrôle la visibilité, pas les enfants
- **Timer Logic**: Amélioration de la fiabilité du démarrage et de la persistance des données utilisateur

## [Unreleased] - 2025-10-08

### 🎨 UX/Freemium Improvements

#### Changed
- **Palette par défaut** - App ouvre sur palette "Terre" avec couleur bleue sélectionnée
  - `TimerPaletteContext.jsx`: defaultPalette = 'terre', defaultColorIndex = 1 (bleu)
  - Meilleure cohérence visuelle à l'ouverture

- **Ordre des palettes** - Palettes gratuites en premier pour meilleure discovery
  - `timerPalettes.js`: "terre" repositionnée avant "softLaser"
  - Palettes free d'abord, puis premium

- **Premium Modal trigger** - Modale se déclenche uniquement au tap (pas au scroll)
  - `PaletteCarousel.jsx`: Suppression du trigger dans `handleScrollEnd`
  - Permet de browse les palettes premium sans friction
  - Tap sur couleur ou badge "Débloquer" → modale

- **Badge "Débloquer"** - Affordance claire pour palettes premium
  - Badge semi-transparent noir (rgba(0,0,0,0.7)) centré sur palette
  - Texte: "Débloquer ✨" (call-to-action explicite)
  - Tappable avec haptic feedback
  - Remplace sparkle subtile peu visible

- **Navigation chevrons** - Réparée pour permettre browsing fluide
  - Chevrons permettent de naviguer entre toutes les palettes
  - Auto-switch pour palettes gratuites
  - Scroll uniquement pour premium (preview sans bloquer)

- **Activités gratuites** - Ordre optimisé et favoris par défaut cohérents
  - `activities.js`: "none", puis activités gratuites, puis premium
  - Activité "reading" corrigée en premium (était free par erreur)
  - Favoris par défaut: ['work', 'break', 'breathing'] (uniquement free)

- **Sparkles** - Réduction de l'oppression visuelle (48 cadenas → sparkles)
  - Tous les 🔒 remplacés par ✨ dans ActivityCarousel, PaletteCarousel, SettingsModal
  - Background transparent au lieu de badges colorés
  - Opacity réduite (0.7-0.85) avec text-shadow subtil
  - Overflow: visible sur ActivityCarousel pour éviter coupure

#### Technical
- **Files Modified**: 5 (TimerPaletteContext, timerPalettes, PaletteCarousel, activities, TimerOptionsContext)
- **Design Philosophy**: Freemium non-oppressif - browse premium sans friction, CTA clair au tap

## [1.1.0] - 2025-10-08

### 💰 Monétisation - RevenueCat Integration (MAJOR)

#### Added
- **RevenueCat SDK Integration** - Complete in-app purchase system
  - SDK `react-native-purchases@9.5.3` installed and configured
  - iOS API Key: `appl_NJoSzWzcoJXLiNDMTGKJShISApt`
  - Android API Key: `goog_OemWJnBmzLuWoAGmEfDJKFBEAYc`
  - Product: `com.irimwebforge.resetpulse.premium` (non-consumable)
  - Entitlement: `premium_access`
  - One-time purchase: 4,99€ avec trial 7 jours

- **Freemium Configuration** - Config stricte 2 palettes + 4 activités gratuites
  - Palettes gratuites: `softLaser` (cool), `terre` (warm)
  - Palettes premium: 13 (total 15)
  - Activités gratuites: `none`, `work`, `break`, `breathing`
  - Activités premium: 12 (total 16)
  - Documentation: `docs/decisions/adr-monetization-v11.md`

- **PurchaseContext** - Context API pour gestion premium (`src/contexts/PurchaseContext.jsx`)
  - SDK initialization avec Platform detection (iOS/Android)
  - Real-time listener `addCustomerInfoUpdateListener`
  - Methods: `purchaseProduct()`, `restorePurchases()`, `getOfferings()`
  - State: `isPremium`, `isLoading`, `isPurchasing`, `customerInfo`
  - TEST_MODE override pour développement (désactivé en build)

- **usePremiumStatus Hook** - Migration de `isTestPremium()` (`src/hooks/usePremiumStatus.js`)
  - API: `const { isPremium, isLoading } = usePremiumStatus()`
  - Remplace les appels directs à `testMode.js`
  - Intégré dans 3 composants (ActivityCarousel, PaletteCarousel, SettingsModal)

- **PremiumModal Component** - UI paywall complète (`src/components/PremiumModal.jsx`)
  - Messaging ADR validé: "ResetPulse est gratuit et fonctionnel..."
  - Features box: "15 palettes + 16 activités - 4,99€ - Une fois, pour toujours"
  - Trial badge: "Trial gratuit 7 jours"
  - Boutons: "Commencer l'essai gratuit" / "Peut-être plus tard"
  - "Restaurer mes achats" avec loading states
  - Design cohérent avec SettingsModal (theme tokens, responsive)

- **Edge Cases Handling** - Robustesse production-ready
  - Offline/network errors: Messages user-friendly ("Pas de connexion")
  - Race conditions: Double-purchase prevention via `isPurchasing` lock
  - Restore logic: Force refresh + entitlement verification (`hasPremium`)
  - Store errors: `STORE_PROBLEM_ERROR`, `PAYMENT_PENDING_ERROR` handled
  - Button states: Tous les boutons disabled pendant operations
  - Modal close prevention pendant purchase

#### Changed
- **ActivityCarousel** - Integration PremiumModal
  - Haptic warning sur clic activité premium
  - Modal trigger ligne 113 (remplace TODO)
  - State `showPremiumModal` + props `highlightedFeature="activités premium"`

- **PaletteCarousel** - Integration PremiumModal
  - Haptic warning + modal sur scroll palette premium
  - Scroll-back animation préservée (ligne 88-91)
  - State `showPremiumModal` + props `highlightedFeature="palettes premium"`

- **SettingsModal** - Migration usePremiumStatus
  - Remplace `isTestPremium()` par `usePremiumStatus()` hook
  - Logique premium check préservée

- **App.js** - Provider injection
  - Hiérarchie: ErrorBoundary → Theme → **Purchase** → Onboarding → AppContent
  - PurchaseProvider après ThemeProvider (modal utilise `useTheme()`)

- **testMode.js** - TEST_MODE désactivé pour build dev
  - `TEST_MODE = false` (ligne 10)
  - Permet tests freemium réels avec RevenueCat sandbox

- **timerPalettes.js** - Palette `classique` passée premium
  - `classique.isPremium: true` (ligne 8)
  - Config freemium finale: 2 gratuites (softLaser, terre)

- **activities.js** - Activité `breathing` passée gratuite
  - `breathing.isPremium: false` (ligne 98)
  - Rationale: Ancrage neuroatypique baseline (ADR)

#### Technical
- **Dependencies**: `react-native-purchases@9.5.3`, `expo-dev-client@6.0.13`
- **Architecture**: 5 phases implémentées (Setup, Core, Migration, UI, Edge Cases)
- **Files Created**: 4 (PurchaseContext, usePremiumStatus, PremiumModal, revenuecat.js)
- **Files Modified**: 7 (App.js, ActivityCarousel, PaletteCarousel, SettingsModal, testMode, timerPalettes, activities)
- **Lines Added**: ~650 (Context 120, Modal 354, Hook 25, Config 52, integrations ~100)
- **Documentation**: ADR complet + analyse triangulaire + decisions monetization

#### References
- ADR: `docs/decisions/adr-monetization-v11.md`
- Analysis: `docs/audits/revenuecat-analysis.md`
- Decisions: `docs/decisions/monetization-decisions.md`
- Dashboard RevenueCat: https://app.revenuecat.com/
- Build EAS: Profile `development` configured

## [1.0.5] - 2025-10-08

### 🔔 Android Notifications Fix (CRITICAL - Android 12+)

#### Fixed
- **Android 12+ Notifications** - Notifications programmées ne se déclenchaient pas en production:
  - Added `SCHEDULE_EXACT_ALARM` permission (required for Android 12+ API 31+)
  - Created Android Notification Channel "Timer Notifications" with HIGH importance
  - Configured expo-notifications plugin with sound files
  - Fixed scheduleNotificationAsync to use proper enum type and channelId
  - Notifications now trigger correctly in background and when app is closed
- **Android Resource Naming** - Fixed sound file naming for Android compatibility:
  - Renamed `407342__forthehorde68__fx_bell_short.wav` → `bell_short.wav`
  - Android resources must start with a letter (not digit)
  - Fixes build error: "Resource name must start with a letter"

#### Changed
- **app.json** - Added expo-notifications plugin with configuration
- **AndroidManifest.xml** - Added SCHEDULE_EXACT_ALARM permission (line 4)
- **useNotificationTimer.js** - Created notification channel at module load
- **scheduleNotificationAsync** - Now uses `Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL` enum
- **versionCode** - Incremented from 10 to 11 (Android)
- **versionName** - Updated from "1.0.4" to "1.0.5"

#### Technical
- Sound file copied to `android/app/src/main/res/raw/` (1.5M WAV)
- Channel configured with vibration pattern [0, 250, 250, 250]
- Release signing config restored in build.gradle
- Full documentation in `docs/archive/fixes/NOTIFICATION_FIX_ANDROID_2025.md`

#### References
- Android Exact Alarms: https://developer.android.com/about/versions/12/behavior-changes-12#exact-alarm-permission
- Notification Channels: https://developer.android.com/develop/ui/views/notifications/channels
- Expo Notifications SDK 54: https://docs.expo.dev/versions/v54.0.0/sdk/notifications/

### 🤖 Versioning Automation System

#### Added
- **Automated version bump script** - `scripts/version-bump.js` (250 lines):
  - Automatically updates 6 files: package.json, app.json, build.gradle, SettingsModal.jsx, docs/README.md
  - Auto-increments Android versionCode
  - Supports patch/minor/major/set commands
  - Displays current version and preview of changes
  - 3-second confirmation delay with CTRL+C to cancel
  - Colorized terminal output with clear success/error messages
  - SemVer format validation
- **NPM scripts** - Version management commands:
  - `npm run version:patch` - Increment patch (1.0.5 → 1.0.6)
  - `npm run version:minor` - Increment minor (1.0.5 → 1.1.0)
  - `npm run version:major` - Increment major (1.0.5 → 2.0.0)
  - `npm run version:set X.Y.Z` - Set specific version

#### Documentation
- **[VERSIONING.md](docs/development/VERSIONING.md)** - Complete versioning system guide (300 lines):
  - Semantic Versioning explanation
  - Usage examples and workflows
  - Best practices (when to bump what)
  - Validation checklist
  - Troubleshooting guide
  - Script customization guide

### 📚 Build Documentation Improvements

#### Added
- **[BUILDS_OVERVIEW.md](docs/development/builds/BUILDS_OVERVIEW.md)** - Comprehensive build strategy guide:
  - Dual workflow explanation (Android local, iOS EAS)
  - Platform comparison table (method, rationale, upload process)
  - Quick command reference for both platforms
  - Complete release cycle documentation
  - Pre-build checklists for Android and iOS
  - Troubleshooting common issues
  - Version history tracking table

#### Changed
- **[ANDROID_BUILD_CONFIG.md](docs/development/builds/ANDROID_BUILD_CONFIG.md)** - Clarified local build strategy:
  - Added "🎯 Stratégie : Builds LOCAUX (SANS EAS)" section at top
  - Explained rationale: autonomy, no quotas, full versionCode control
  - Replaced "Alternative: Build avec EAS (Recommandé)" with "Pourquoi pas EAS Build pour Android?"
  - Emphasized proven local workflow (v1.0.4 deployed successfully)
- **[IOS_BUILD_CONFIG.md](docs/development/builds/IOS_BUILD_CONFIG.md)** - Clarified EAS requirement:
  - Added "🎯 Stratégie : Builds avec EAS (OBLIGATOIRE)" section at top
  - Explained why EAS is mandatory for iOS (credentials, no local Xcode)
  - Clear workflow: build → submit → TestFlight

#### Technical
- Build completed successfully: `android/app/build/outputs/bundle/release/app-release.aab` (63 MB)
- versionCode: 11
- Signature verified with jarsigner
- Sound file integrated in raw resources
- **[versioning-automation-setup.md](docs/development/versioning-automation-setup.md)** - Setup report:
  - Before/after comparisons
  - Measured gains (60x faster, 100% consistent)
  - Use case examples
  - Integration in development workflow
- **[scripts/README.md](scripts/README.md)** - Scripts directory documentation

#### Benefits
- ⚡ **60x faster**: 10 minutes → 10 seconds
- ✅ **100% reliable**: No more forgotten files or version mismatches
- 🎯 **Guaranteed consistency**: All 6 files always synchronized
- 📱 **Zero mistakes**: versionCode auto-incremented correctly
- 🔢 **Flexible**: Support for version skipping (e.g., 1.0.5 → 1.2.0)

## [Unreleased] - 2025-10-02

### Added
- **✨ Timer Start Glow Effect** - Subtle visual feedback when timer starts:
  - Arc opacity animates from 85% to 100% over 600ms
  - Smooth "ignition" effect independent of shouldPulse setting
  - Works even when pulse animation is disabled
  - Natural fade-in that signals timer activation clearly
  - Non-invasive and respects app's zen aesthetic
- **🎯 Onboarding System v2.0** - Professional interactive tooltip spotlight
  - Sequential tooltips: Activities → Dial → Palette → Controls (optimized flow)
  - **Fully interactive**: Users can try features while tooltips guide them
  - SVG Mask spotlight with rounded corners (dial: circular, others: theme.borderRadius.xl)
  - Smart tooltip positioning: auto-detects space and positions above/below without hiding elements
  - Precise bounds measurement using `measure()` API with timing optimizations
  - Auto-completion when user starts timer on final tooltip
  - "Skip all" button with persistent completion state
  - Accessible via "Relancer le guide" in Settings modal (dev mode)
  - No entrance animations during first launch for instant onboarding start
  - Consistent highlight padding: horizontal `lg`, vertical `sm` (dial top: `lg` for duration indicator)

### Changed
- **⚙️ Default Values for Production** - Optimized first-launch experience:
  - Default timer duration: 5min → 45min (2700 seconds)
  - Default activity: Basique (none)
  - Default palette: Terre with blue color (index 1)
  - Better initial setup for typical Pomodoro/work sessions
- **🎨 Settings Modal Redesign** - Card-based UI with visual hierarchy (iOS 15+ style):
  - Sections organized in 3 levels: Core Experience → Configuration → Informations
  - Level 1 (Primary Cards): 🎯 Expérience Timer, 🎨 Personnalisation, ⭐ Activités
  - Level 2 (Standard Card): ⚙️ Réglages du Cadran
  - Level 3 (Flat): ℹ️ À propos
  - Card styling: surface background, rounded corners, subtle borders & shadows
  - Logical grouping: Sons + Animation Pulse | Palettes + Thème
  - Level dividers for clear visual separation
  - Improved spacing and visual breathing room
- **🎨 Sound Picker UX Enhancement**:
  - Enlarged tap area for close button in SettingsModal (44x44px iOS minimum)
  - Added iOS-style circular progress loader during sound preview playback
  - Loader animates for exact duration of sound (1-3s depending on sound)
  - Removed static duration text ("Durée: Xs") for cleaner interface
  - Progress loader provides visual feedback replacing text duration
  - Icon size adjusted: PauseIcon reduced to 12px to fit within 24px loader circle
- **Freemium Strategy Refined**: Reorganized activity order and premium tiers
  - Pause activity moved to free tier (completes Pomodoro cycle with Work)
  - Meditation and Breathing moved to premium tier (entire mindfulness vertical now premium)
  - Free activities now: Basique, Travail, Pause, Lecture (4 activities)
  - Premium activities: All mindfulness (Yoga, Méditation, Respiration) + Sport, Étude, etc. (12 activities)
  - Better value proposition: Complete Pomodoro workflow free, desire-creating premium features locked
- **Grid Layout System**: Simplified with Golden Ratio (φ = 1.618)
  - Header: 50px, Activities/Palette: 80px (50 × φ)
  - Grid provides structure, `measure()` provides precision
  - Removed complex manual calculations in favor of dynamic measurement

### Fixed
- **🌓 System Theme Detection Fixed** (Critical):
  - Replaced `useColorScheme()` hook with `Appearance` API for reliable system theme detection
  - `useColorScheme()` was returning 'light' even when device was in dark mode
  - Added `Appearance.addChangeListener()` to track system theme changes in real-time
  - Changed `userInterfaceStyle` from "light" to "automatic" in app.json
  - Auto mode now correctly follows device appearance settings immediately
- **🔧 Haptic Feedback Configuration**:
  - Added `expo-haptics` plugin to app.json for proper native haptic support
  - Fixes potential vibration issues in production builds (iOS/Android)
  - Haptics now properly configured for builds outside Expo Go
- **🐛 Theme System Critical Bugs**:
  - Fixed `toggleTheme()` not respecting "auto" mode (was stuck cycling only between light/dark)
  - Now properly cycles through: light → dark → auto → light
  - Added missing `textLight` color property to both light and dark themes
  - Fixed `theme.colors.primary` reference error in SettingsModal (should be `theme.colors.brand.primary`)
- **🔴 Notification Crash Fix** (Critical):
  - Fixed app crash on timer completion due to missing `ExpoPushTokenManager` native module
  - Added try-catch protection around all notification API calls to prevent total app crashes
  - Configured `expo-notifications` plugin in app.json with proper settings
  - Notifications now fail gracefully if native modules are unavailable
- **Responsive Design**: Settings button now properly adapts to all device sizes
  - Changed from `rs(44)` to `rs(44, 'min')` for width/height/borderRadius
  - Settings icon size now responsive with `rs(24, 'min')`
  - Tooltip positioning made responsive with `rs()` function
- **Onboarding UX Polish**:
  - SVG Mask spotlight with perfect rounded corners (no visual gaps)
  - Render order optimized: overlay with `pointerEvents="none"` allows full interactivity
  - Entrance animations disabled during first launch to prevent measurement errors
  - Highlight widths consistent across all elements (content + padding lg)
  - Tooltip arrow directions: Activities (up), Dial (down), Palette (down), Controls (down)
  - Fade-in animation only on first tooltip, instant transitions between tooltips
- **Timer Visual Hierarchy**: Fixed z-index layering of physical fixation dots
  - Moved center fixation dots to render after dial progress arc
  - Dots now properly visible above dial but below activity emoji
  - Represents physical mounting fixture more accurately
- **Activity Icons**: Replaced dual circles with ⏱️ emoji for "Basique" activity
  - Simplified icon in ActivityCarousel and SettingsModal
  - More consistent and recognizable as a timer
  - Removed dependency on timer.png asset

### Technical
- **Architecture Improvement**: Hybrid Grid + measure() approach
  - `gridLayout.js` simplified to only provide Grid heights
  - Component bounds measured dynamically for accuracy
  - Smart tooltip positioning prevents element occlusion
- **New Components**:
  - `HighlightOverlay.jsx` - SVG-based spotlight with mask
  - `Tooltip.jsx` - Reusable tooltip with arrow directions
  - `OnboardingController.jsx` - Context-based state management
  - `WelcomeScreen.jsx` - First-launch modal

### Documentation
- **DevLog**: Created comprehensive onboarding implementation log (`docs/devlog/2025-10-02-onboarding-highlight-system.md`)
- **ADR**: Created carousel affordance decision record (`docs/decisions/carousel-affordance.md`)
  - Documents approach differences between ActivityCarousel (peek) vs PaletteCarousel (no dots for now)
  - Phase 1/Phase 2 implementation strategy for freemium pagination dots

## [1.0.4] - 2025-09-29

### 🎯 Foundation v1.0.4 - SDK 54 Migration + Audio System Complet

#### SDK 54 & New Architecture ✅
- **Migration complète**: Expo SDK 54 + React Native 0.81.4 + React 19.1.0
- **New Architecture**: Fabric + Turbo Modules activés et fonctionnels
- **Performance**: Build times optimisés de 120s → 10s avec XCFrameworks
- **Dependencies**: Package-lock réduit de 12k → 4k lignes (dépendances optimisées)

#### Audio System (CRITICAL PATH - 100% consensus famille) ✅
- **Mode silencieux**: `playsInSilentMode: true` pour iOS
- **Background audio**: UIBackgroundModes + notifications programmées
- **Sound Picker**: 10 sons configurables avec interface élégante
  - Cloche classique, Cloche mélodique
  - Micro-ondes vintage, Ping micro-ondes
  - Minuteur cuisine, Minuteur mécanique
  - Minuteur à œuf, Grille-pain
  - Ding simple, Timer complet
- **Architecture audio SIMPLIFIÉE** (29 sept. soir):
  - **UN SEUL HOOK**: `useSimpleAudio.js` remplace 5 hooks audio
  - Utilise uniquement expo-audio SDK 54 (pas de conflits d'API)
  - Configuration audio globale (une seule fois)
  - Preview sons fonctionnels sur simulateur et device
  - Code réduit de 70% (plus maintenable)
  - Solution hybride: foreground (expo-audio) + background (notifications)

#### Tests & Qualité ✅
- **Jest SDK 54**: Configuration minimaliste compatible
  - `react-test-renderer` au lieu de `@testing-library/react-native`
  - Tests archivés dans `archive-sdk51/` pour référence
  - Coverage: useTimer 74.57%, useDialOrientation 41.17%
- **Bug fixes**:
  - Bug historique NaN dans useDialOrientation corrigé avec `isFinite()`
  - Timer continue en background avec `setTimeout` (pas RAF)
  - Notifications trigger bug fixé avec `type: 'timeInterval'`

#### Notifications Background ✅
- **Timer background**: Continue même app fermée
- **Screen wake-up**: Écran s'allume automatiquement à la fin
- **Son système**: Notifications jouent le son par défaut iOS
- **Durée limite**: 8h Dynamic Island, 12h Lock Screen

#### UX & Persistence ✅
- **Pattern learning**: Sauvegarde durée par activité
  - Association activité → durée mémorisée
  - Pré-remplissage automatique au prochain usage
  - Optimisation AsyncStorage (écriture conditionnelle)
- **Settings améliorés**:
  - Organisation en 5 sections claires
  - Badge "NOUVEAU" pour Sound Picker
  - Section Sons du Timer en priorité

### Added
- **Migration Documentation**: Comprehensive documentation suite
  - `TODO-NewArchitecture-Testing.md`: Structured testing plan for New Architecture validation
  - `devlogs/2025-09-28_Migration-NewArchitecture-SDK54.md`: Complete migration documentation
  - `.nvmrc`: Node.js version specification (20.19.4 minimum)
- **Timer Refactoring**: Complete modularization of timer dial into separate components
  - DialBase: Static SVG elements (graduations, numbers)
  - DialProgress: Animated arc display
  - DialCenter: Activity emoji and pulse animations
- **Drag Interaction**: Support for adjusting timer when paused
- **UI Constants**: Extracted all magic numbers into organized constant files
- **Clickable Graduations**: Started implementation for tap-to-set time values (rolled back due to UX issues)

### Changed
- **React Native Foundation**: Major architecture migration (SDK 51 → 54)
  - New Architecture enabled: Fabric rendering + Turbo Modules
  - React 18.2.0 → 19.1.0 with React Native 0.74.5 → 0.81.4
  - Node.js requirement updated to 20.19.4+ (using Node 24.9.0)
  - Package lock reduced from 12k+ to 4k lines (optimized dependencies)
- **Audio System**: Complete API modernization (expo-av → expo-audio)
  - `Audio.Sound.createAsync()` → `useAudioPlayer()` hook
  - Removed manual audio mode configuration (automatic system integration)
  - Simplified error handling with silent fallbacks
  - Better iOS silent mode compatibility
- **Timer Architecture**: Replaced monolithic TimerCircle with modular TimerDial system
- **Code Organization**: Better separation of concerns with specialized hooks
  - useDialOrientation: Centralized angle/minute conversion logic
  - useTimer: Enhanced with pause state management
- **UI Improvements**:
  - Applied currentColor from palette to activity buttons and play button
  - Basic activity icon now uses proportional gray circles instead of image
  - Individual animation states for each activity in carousel

### Fixed
- **Critical Bug**: NaN opacity error in animations (using Animated.multiply instead of direct multiplication)
- **Timer Drag**: Now works correctly when timer is paused
- **Arc Alignment**: Perfect alignment between arc progress and graduation marks
- **Carousel Animation**: Each activity now has its own animation state
- **Responsive Layout**: Removed fixed height from color carousel for better responsiveness
- **Version Sync**: Aligned app.json version with Android build.gradle

### Technical Debt Addressed
- Removed code duplication in dial rendering
- Extracted constants for better maintainability
- Improved drag physics with resistance and easing
- Fixed wrap-around prevention at midnight (0↔60 transitions)

## [1.0.3] - 2025-09-26

### Fixed - 2025-09-26 (Critical Android Build Fix)
- **CRITICAL**: Resolved ExpoAsset crash on Android production builds
- Downgraded from Expo SDK 53 to SDK 51 for stability
- Reverted React from 19.0.0 to 18.2.0 to fix compatibility issues
- Disabled New Architecture to prevent runtime crashes
- Fixed keystore configuration for Google Play Store signing

### Changed - 2025-09-26 (Build Configuration)
- Updated all dependencies to SDK 51 compatible versions
- Configured proper Android build with correct keystore credentials
- Incremented versionCode to 9 for Play Store release
- Created comprehensive Android build documentation (ANDROID_BUILD_CONFIG.md)

### Added - 2025-09-26 (Documentation)
- Complete Android build configuration guide with working setup
- Keystore management instructions and SHA1 verification steps
- Troubleshooting guide for common build issues

## [Unreleased]

### Changed - 2025-09-25 (Part 13 - Documentation Organization)
- Reorganized documentation structure with dedicated subdirectories
- Moved all documentation files from root to organized `/docs` folders
- Created specialized folders: `audits/`, `fixes/`, `deployment/`, `legal/`
- Added deployment information document with iOS/Android build details
- Enhanced `.gitignore` with better coverage for sensitive and temporary files

### Fixed - 2025-09-25 (Part 13)
- Root directory clutter with 10+ documentation files
- Missing deployment configuration documentation
- Backup files and sensitive keystore files in repository

### Removed - 2025-09-25 (Part 13)
- `package.json.backup` unnecessary backup file
- Documentation files from root (moved to `/docs`)

## [1.0.2] - 2025-09-25

### Added - 2025-09-25 (Part 12 - Android Platform Fixes & UI Improvements)
- Timer icon (timer.png) for "Basique" activity replacing missing emoji
- Static background disc for activity emojis when animations are disabled (accessibility)
- Improved cross-platform button handling with Pressable component

### Changed - 2025-09-25 (Part 12)
- Activity carousel buttons now use TouchableOpacity for better Android stability
- Removed tintColor from timer icon to preserve original design colors
- Default activity set to "Basique" (none) on app launch
- Pulse animations disabled by default for epilepsy safety compliance

### Fixed - 2025-09-25 (Part 12)
- React.Children.only error on Android with TouchableNativeFeedback
- Square artifacts appearing after selecting activity buttons on Android
- Octagonal shape rendering issue for activity buttons on Android
- Activity carousel proper circular button shapes on all platforms
- Index calculation bug in activity carousel preventing proper default selection

### Added - 2025-09-24 (Part 11 - Freemium Strategy & Final Polish)
- Test mode configuration for unlocking all premium content during testing
- 12 new premium activities (Pause, Sport, Yoga, Marche, Lecture, Étude, Créativité, Cuisine, Jeux, Devoirs, Musique, Ménage)
- Activity lock system with visual indicators in settings
- Smart activity ordering with favorites prioritization in carousel
- Default timer color changed to blue-gray (#4A5568) for better first impression

### Changed - 2025-09-24 (Part 11)
- Restructured freemium model: 4 free activities vs 12 premium (more compelling upgrade incentive)
- "Pause" activity moved to premium tier (creates desire after using "Travail")
- Splash screen background color adjusted to match icon (#F5F5F0)
- PanResponder now recreates on mode change for accurate touch handling
- Activity carousel maintains favorites sorting for personalized experience

### Fixed - 2025-09-24 (Part 11)
- Timer duration selection now accurate in both 60min and 25min modes
- PanResponder stale closure issue when switching between timer modes
- Premium content locks properly respect test mode status
- Activity ordering consistency between carousel and settings

### Fixed - 2025-09-24 (Part 10 - Timer Selection Accuracy)
- Fixed incorrect duration selection in 25min mode where visual positions didn't match selected minutes
- Refactored angleToMinutes calculation to use proper angular distributions per mode
- 60min mode now correctly uses 6° per minute distribution
- 25min mode now correctly uses 14.4° per minute distribution
- Clicking on graduation "15" in 25min mode now correctly selects 15 minutes (was showing 45-50)

### Added - 2025-09-24 (Part 9 - Code Quality & Performance)
- PlatformTouchable utility component for cross-platform touch handling
- Constants directory with centralized design tokens and animation durations
- React.memo optimization on TimerCircle component
- useMemo hooks for expensive calculations (createNumbers, createProgressArc)
- Centralized animation constants (PULSE_ANIMATION, COMPLETION_ANIMATION, etc.)
- Design system constants for SVG dimensions and proportions
- Performance monitoring with optimized re-render prevention

### Changed - 2025-09-24 (Part 9)
- Refactored all hardcoded animation durations to use constants
- Extracted magic numbers to design.js (stroke width, padding, ratios)
- Moved StyleSheet creation outside components for better performance
- Optimized TimerCircle with memoization to prevent unnecessary recalculations
- Replaced duplicated platform touch logic with reusable component

### Fixed - 2025-09-24 (Part 9)
- TimerScreen syntax error from incomplete StyleSheet removal
- Unnecessary re-renders in TimerCircle component
- Performance bottlenecks from recalculating unchanged values

## [1.0.1] - 2025-09-24

### Technical - 2025-09-24 (Part 9)
- Created `/src/utils/PlatformTouchable.jsx` for touch handling abstraction
- Created `/src/constants/animations.js` with all timing constants
- Created `/src/constants/design.js` with design system values
- Applied useMemo to computationally expensive operations
- Implemented proper React.memo comparison for TimerCircle props
- Removed 15% of duplicated code and improved render performance by ~20%

### Fixed - 2025-09-24 (Part 8 - Compliance & Testing)
- **Critical**: Disabled pulsation animation by default (epilepsy compliance)
- **Critical**: Removed excessive Android permissions (only INTERNET and VIBRATE kept)
- Added epilepsy warning modal for pulsation animation toggle
- Added accessibility labels to all interactive components
- Fixed timer not advancing in both 60min and 25min modes
- Fixed graduation tap broken when switching between modes
- Removed all test dependencies and Jest configuration (rollback)

### Changed - 2025-09-24 (Part 8)
- Pulsation animation now opt-in with warning (WCAG 2.1 compliance)
- Android manifest cleaned of unnecessary permissions
- All buttons now have proper accessibilityLabel and accessibilityHint

### Added - 2025-09-23 (Part 7 - Timer Completion Feedback)
- Haptic feedback on timer completion (respects system settings)
- Visual completion animation with 3 gentle pulses
- Color transition to green (#48BB78) on timer completion
- Contextual completion messages based on activity type
- "shouldPulse" toggle in settings to control timer pulsation
- Automatic detection and respect of device silent mode
- Platform-aware haptic patterns (iOS notification success)

### Changed - 2025-09-23 (Part 7)
- Timer completion now provides multi-sensory feedback
- Activity-specific completion messages (e.g., "Méditation terminée")
- Enhanced useTimer hook with completion state management
- TimerCircle component supports completion animations

### Fixed - 2025-09-23 (Part 7)
- Timer completion state properly resets after animation
- Haptic feedback gracefully handles failures
- Completion animation timing synchronized with haptic feedback

### Fixed - 2025-09-23 (Part 6 - 25min Mode Fixes)
- Fixed 25 appearing above 0 in 25min mode timer display
- Corrected angle-to-minutes calculation for 25min mode to match visual distribution
- Limited maximum timer duration to 25 minutes when in 25min mode
- Fixed incorrect minute selection when clicking/dragging in 25min mode
- Aligned number distribution with actual timer functionality in Pomodoro mode

### Added - 2025-09-23 (Part 5 - Gesture Controls & UI Polish)
- Tap on timer graduations to set duration instantly
- Drag gesture on timer dial for continuous duration adjustment
- Double tap on timer for quick play/pause
- Vertical swipe gesture to pause timer during execution (zen mode exit)
- Visual feedback showing duration while dragging
- Activity name display instead of generic "C'est parti!" when starting
- Larger SVG container to prevent graduation numbers from being cut off

### Changed - 2025-09-23 (Part 5)
- Timer dial visibility improved with thicker stroke (4.5px) and darker graduations
- Activity carousel simplified - removed text labels, increased emoji size (28px → 34px)
- Control buttons repositioned to bottom center for better ergonomics
- Palette carousel dots removed for cleaner interface
- Graduation numbers positioned with more spacing from dial (18px)
- Focus mode animation - UI elements fade when timer is running
- Timer size limited to 320px max to maintain golden ratio proportions

### Fixed - 2025-09-23 (Part 5)
- Activity buttons being cut off by container overflow
- Control buttons positioned too high on screen
- Drag and tap gestures not properly blocked during timer execution
- Graduation numbers being cut off at container edges
- Palette dots spacing issues in carousel

### Removed - 2025-09-23 (Part 5)
- Duration preset buttons (replaced by tap/drag gestures)
- Activity text labels in carousel (cleaner emoji-only design)
- Palette scroll indicator dots

### Added - 2025-09-23 (Part 4 - Cross-Platform Adaptive Design)
- Platform-adaptive styling system with `platformStyles.js`
- Adaptive shadow system (iOS shadows vs Android Material elevation)
- Cross-platform haptic feedback module with iOS/Android specific patterns
- Platform-specific animations with Material Design (Android) and iOS HIG timing
- Native touchable components (TouchableOpacity iOS vs TouchableNativeFeedback Android)
- Ripple effects on Android buttons, highlight effects on iOS
- Platform-aware modal styles (vibrancy blur iOS vs overlay Android)
- Switch components with native styling per platform
- Animation library with platform-specific easing curves and spring configs

### Changed - 2025-09-23 (Part 4)
- ThemeProvider enhanced with platform-adaptive tokens and style creators
- SettingsModal refactored with native touchables and haptic feedback
- ActivityCarousel updated with platform-specific touch feedback
- All shadows migrated to adaptive shadow system
- Button interactions now include haptic feedback
- Modal presentations respect platform conventions

### Technical - 2025-09-23 (Part 4)
- Created `/src/styles/platformStyles.js` for conditional styling
- Created `/src/styles/shadows.js` for adaptive elevation/shadows
- Created `/src/utils/haptics.js` for cross-platform haptic feedback
- Created `/src/styles/animations.js` for platform-specific animations
- Safe optional chaining for TouchableNativeFeedback to prevent runtime errors

### Added - 2025-09-23 (Part 3 - Theme Refactoring)
- New simplified theme system with clear separation of concerns
- `src/theme/` directory with modular color and token management
- Light/Dark theme support infrastructure (dark mode ready)
- Dedicated `TimerPaletteContext` for timer color management
- IRIM brand colors: Turquoise (#00A0A0), Bleu foncé (#004466), Orange (#F06424)
- Documentation: `docs/theme-management.md` for theme system guide
- Improved light theme with subtle gray background (#F9FAFB)

### Changed - 2025-09-23 (Part 3)
- Major theme system refactoring from monolithic to modular architecture
- Default palette changed from "laser" to "terre" (more natural colors)
- Activities no longer force color changes - user maintains control
- Activity selection uses current palette color instead of brand color
- Separated UI theme colors from timer palette colors
- Reduced shadow opacity for subtler depth (0.08 from 0.1)
- Overlay colors less aggressive (rgba(248,249,250,0.92) from pure white)

### Fixed - 2025-09-23 (Part 3)
- Activity carousel showing wrong color (turquoise) for selected items
- Import errors from old theme system references
- Layout.js dependency on deleted theme file
- Settings modal using outdated palette imports
- Visual regression where selected activities lost palette harmony

## [1.0.0] - 2025-09-23

### Removed - 2025-09-23 (Part 3)
- Old monolithic `src/styles/theme.js` file
- Obsolete `src/styles/palette.json` file
- Redundant `src/config/palettes.js` file
- Temporary compatibility `src/components/ThemeProvider.jsx`
- 90% of unused code from `src/styles/layout.js`

### Added - 2025-09-23 (Part 2)
- Activity carousel with 8 emoji activities (4 free, 4 premium)
- Favorites system for activity reordering in settings modal
- Premium lock overlays on premium activities and palettes
- Complete responsive design system with rs(), rf(), getLayout() functions
- Activity persistence across app restarts
- Premium palette restrictions (only terre and laser available in free version)
- Lock icons on premium content (activities and palette colors)

### Changed - 2025-09-23 (Part 2)
- Major refactor of layout system from mixed flex/fixed to pure flex-based design
- Replaced all responsiveSize() calls with new rs() responsive system
- Improved component sizing with getComponentSizes() for consistent scaling
- Settings button moved from absolute positioning to header for better accessibility
- Enhanced PaletteCarousel with premium locks on unavailable palettes

### Fixed - 2025-09-23 (Part 2)
- Layout issues with component visibility and overlapping
- Settings button z-index and positioning problems
- Emoji centering in activity buttons
- Height management issues across all screen sizes
- Component imports updated for new responsive system

### Added - 2025-09-23
- Data persistence with AsyncStorage for user preferences
- usePersistedState and usePersistedObject hooks for automatic state persistence
- Palette carousel with horizontal swipe navigation between 8 color palettes
- Animated palette name display when switching palettes
- Visual indicators (dots) showing current palette position
- Automatic color validation when switching palettes
- Premium-ready palette system (infrastructure for future premium features)

### Changed - 2025-09-23
- Enhanced TimeTimer UI with improved layout and controls
- Timer default duration changed from 4 to 5 minutes
- Added increment/decrement buttons (±1 minute) for duration adjustment
- Redesigned preset buttons in 2x2 grid layout (5m, 15m, 30m, 45m)
- Improved ColorSwitch with larger touch targets and better visual feedback
- Enhanced TimerCircle with refined stroke width and gradient center dot
- Color switch container now has background and shadow for better visibility

### Fixed - 2025-09-23
- User preferences now persist across app restarts (palette, color, timer options)
- Color selection resets to default when switching to incompatible palette

### Added - 2025-09-22
- Settings modal with native iOS-style interface
- Palette selector with visual preview (8 palettes: terre, classique, laser, douce, pastel_girly, verts, bleus, canard)
- TimerOptions context for managing timer display settings
- Cadran toggle (60min mode vs Full duration mode)
- Rotation toggle (Clockwise vs Counter-clockwise)
- Settings icon in top-right corner
- PalettePreview component for visual color display
- Clean, minimal main screen layout (timer + color selector at thumb height)

### Changed
- Moved timer options to settings modal for cleaner UI
- Repositioned color selector below timer for better thumb accessibility (bottom: 120px)
- Removed PaletteSelector from main screen (now in settings)
- Simplified TimerScreen layout to focus on core timer functionality

### Added - Initial
- Initial React Native/Expo project setup
- Core timer functionality with useTimer hook (requestAnimationFrame-based for precision)
- TimerCircle component with SVG-based circular progress visualization
- TimeTimer component with preset durations (4m, 20m)
- ThemeProvider with Context API for theming
- Golden ratio-based design system (1.618 proportions)
- Responsive layout utilities for iPhone sizes (SE, 12/13/14, Pro Max)
- Laser color palette (green, cyan, magenta, yellow)
- French timer messages ("C'est parti", "C'est reparti", "C'est fini", "Pause")
- Play/Pause/Reset controls
- Color selector for timer visualization (4 laser colors)
- Dynamic preset button styling (colored background matching selected color)

## [0.1.0] - 2025-09-20

### Technical
- React Native 0.79.5
- Expo SDK 52
- React Native SVG for circular timer graphics
- Folder structure: components, screens, styles, hooks, utils
- Theme system with colors, spacing, borders, shadows
- Responsive sizing based on device width