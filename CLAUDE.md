---
created: '2025-12-07'
updated: '2025-12-14'
status: active
---

# CLAUDE.md - ResetPulse

## Vue d'ensemble

ResetPulse est une application Time Timer visuel pour utilisateurs neuroatypiques (TDAH, TSA). App React Native/Expo en production sur Apple App Store et Google Play. Modèle freemium avec RevenueCat pour les IAP.

## Stack technique

- **Framework**: React Native 0.81.4 + Expo SDK 54 (New Architecture activée)
- **React**: 19.1.0
- **État**: Context API (TimerPaletteContext, TimerOptionsContext, PurchaseContext)
- **i18n**: i18n-js (15 langues supportées)
- **Analytics**: Mixpanel
- **IAP**: RevenueCat (react-native-purchases)
- **Package manager**: npm

## Commandes essentielles

```bash
# Développement
npx expo start          # Démarrer le serveur dev
npm run ios             # Lancer sur iOS
npm run android         # Lancer sur Android

# Tests
npm run test            # Tous les tests
npm run test:hooks      # Tests des hooks uniquement
npm run test:timer      # Tests useTimer

# Versioning
npm run version:patch   # Bump patch (1.2.3 → 1.2.4)
npm run version:minor   # Bump minor (1.2.3 → 1.3.0)
npm run version:set 1.2.5  # Set version spécifique

# Build production
# iOS: ouvrir ios/ResetPulse.xcworkspace dans Xcode → Archive
# Android: cd android && ./gradlew bundleRelease
```

## Architecture des dossiers

```
src/
├── components/
│   ├── modals/           # PremiumModal, DiscoveryModal, MoreActivitiesModal, MoreColorsModal
│   ├── onboarding/       # OnboardingController, WelcomeScreen, HighlightOverlay, Tooltip
│   └── timer/            # TimerDial, DialBase, DialProgress, DialCenter
├── config/
│   ├── activities.js     # Définition des activités (FREE: 4, PREMIUM: 14)
│   ├── timerPalettes.js  # Palettes de couleurs (FREE: 2, PREMIUM: 13)
│   ├── revenuecat.js     # Config RevenueCat
│   └── testMode.js       # DEV_MODE toggle
├── contexts/             # TimerPaletteContext, TimerOptionsContext, PurchaseContext
├── dev/                  # DevPremiumContext, DevFab (toggle dev)
├── hooks/                # useTimer, useTranslation, usePremiumStatus, useAnalytics
├── i18n/                 # Traductions (15 langues)
├── prototypes/           # OnboardingV2Prototype.jsx (en cours)
├── screens/              # TimerScreen.jsx (écran principal)
├── services/             # analytics.js (Mixpanel)
└── theme/                # ThemeProvider, tokens, colors
```

## Modèle Freemium

### Activités gratuites (4)
- `work` (💻 Travail) - 25min Pomodoro
- `break` (☕ Pause) - 15min
- `meditation` (🧘 Méditation) - 20min
- `creativity` (🎨 Créativité) - 45min

### Palettes gratuites (2)
- `terre` - Bleu terre, vert, rouge brique, or
- `softLaser` - Verts, cyans, magentas doux

### Comportement UX Freemium
- Carrousels affichent uniquement les items gratuits + bouton "+" en fin
- Le bouton "+" ouvre une modale Discovery (aperçu des items premium)
- Pendant l'onboarding: toast léger au lieu de modale payante

## Mode développement

Le fichier `src/config/testMode.js` contient `DEV_MODE`:
- `true`: Affiche DevFab (coin haut-gauche) pour toggle App/Onboarding et Free/Premium
- `false`: Production normale

Contexte dev: `src/dev/DevPremiumContext.js` simule le statut premium pour tests.

## État actuel du projet

### En production
- v1.2.3 sur Apple App Store et Google Play
- Analytics Mixpanel actifs

### En cours (proto)
- `OnboardingV2Prototype.jsx` - Nouveau funnel d'onboarding
- À valider puis séquencer en screens séparés
- Mise à jour des implémentations Mixpanel et RevenueCat à prévoir

### Timeline
- Position actuelle: environ M8

## Fichiers clés à connaître

- `App.js` - Point d'entrée, gère DEV_MODE et routing App/Onboarding
- `src/screens/TimerScreen.jsx` - Écran principal de l'app
- `src/components/ActivityCarousel.jsx` - Carrousel activités freemium
- `src/components/PaletteCarousel.jsx` - Carrousel palettes freemium
- `src/prototypes/OnboardingV2Prototype.jsx` - Prototype onboarding V2 (en dev)
- `CHANGELOG.md` - Historique des versions

## Conventions

- i18n: Tous les textes visibles doivent utiliser `t('key')` via `useTranslation()`
- Modales: Regroupées dans `src/components/modals/` avec export centralisé via `index.js`
- Premium check: Utiliser `usePremiumStatus()` hook
- Haptics: Via `src/utils/haptics.js`
- Analytics: Via `useAnalytics()` hook

## Notes importantes

- iOS build nécessite Xcode (pas EAS Build) pour support IAP
- Le hook `useTimer` est critique - bien testé dans `__tests__/`
- Les palettes utilisent un système séparé du thème global (voir `timerPalettes.js`)

---

## Documentation

La documentation du projet est organisée dans `_internal/docs/` :

| Catégorie | Emplacement | Description |
|-----------|-------------|-------------|
| Guides | `_internal/docs/guides/` | Guides pratiques (builds, deployment, testing) |
| Decisions | `_internal/docs/decisions/` | Décisions techniques et ADRs |
| Reports | `_internal/docs/reports/` | Audits, analyses, architecture, legal |
| Legacy | `_internal/docs/legacy/` | Documentation précédente (référence) |

→ Voir [`_internal/docs/README.md`](_internal/docs/README.md) pour la structure complète.

---

## Cockpit

Le cockpit (gestion de projet) est dans `_internal/cockpit/` :

→ Voir [`_internal/cockpit/CLAUDE.md`](_internal/cockpit/CLAUDE.md) pour l'état des missions.

---

## Références Système

Ce projet suit l'Architecture V2. Sources de vérité :

| Document | Emplacement |
|----------|-------------|
| Index Références | `~/dev/_ref/LINKS.md` |
| ADR-01 Architecture | `~/dev/_ref/standards/ADR-01-architecture-v2.md` |
| ADR-02 Conventions | `~/dev/_ref/standards/ADR-02-conventions-nommage.md` |
| ADR-03 Linking | `~/dev/_ref/standards/ADR-03-strategie-linking.md` |
| Framework Cockpit | `~/dev/_ref/frameworks/cockpit.md` |
| Framework Documentation | `~/dev/_ref/frameworks/documentation.md` |

### Conventions Appliquées (ADR-02)

| Contexte | Convention | Exemple |
|----------|------------|---------|
| Fichiers/dossiers | kebab-case | `user-profile.tsx` |
| Composants | PascalCase | `UserProfile` |
| Variables/fonctions | camelCase | `getUserData` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRIES` |

### Frontmatter Obligatoire

Tous les fichiers `.md` :

```yaml
---
created: 'YYYY-MM-DD'
updated: 'YYYY-MM-DD'
status: draft | active | archived
---
```
