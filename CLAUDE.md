---
created: '2025-12-07'
updated: '2026-04-30'
status: active
type: project-framework
---

# CLAUDE.md - ResetPulse

## 🏗️ Framework (Stable Reference)

This document defines the **project architecture, tech stack, and conventions**. It changes rarely.

For **current missions, workflows, or next steps**, see:
- **Orientation session** → `_cockpit/README.md` ← lire en premier
- **Mission active** → `_cockpit/missions/active/`
- **Vision & cap** → `_cockpit/vision/index.md`
- **Règles de pilotage** → `_cockpit/flow-rules.md`

---

## 📱 Vue d'ensemble

ResetPulse est une application Time Timer visuel pour utilisateurs neuroatypiques (TDAH, TSA). App React Native/Expo en production sur Apple App Store et Google Play. Modèle freemium avec RevenueCat pour les IAP.

## Stack technique

- **Framework**: React Native 0.83.6 + Expo SDK 55 (New Architecture activée)
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
- v2.1.6 sur Apple App Store et Google Play
- Analytics Mixpanel actifs

### En cours
- Mission P1 : simplifier app pour prestataire Fiverr (PulseButton, onboarding, console)
- Séquence complète : `_cockpit/vision/fiverr-engagement.md`

### Tests
- 161/161 passent

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

## 🎨 Color System Architecture

ResetPulse utilise un système de couleurs à 3 niveaux pour garantir cohérence visuelle et maintenabilité.

### Architecture (src/theme/colors.js)

| Niveau | Nom | Usage | Mutabilité |
|--------|-----|-------|-----------|
| **1** | `baseColors` | Constantes brand (coral, fixed colors) | Jamais changé |
| **2** | `lightTheme`/`darkTheme` | Tokens sémantiques contextuels | Adaptatif au thème |
| **3** | `devColors` | Dev-only (DevFab uniquement) | Dev/testing seulement |

### Visual Hierarchy (Light Mode)

| Couleur | Token | Usage | Exemples Composants |
|---------|-------|-------|---------------------|
| **Cream** (#ebe8e3) | `theme.colors.background` | Containers/screen backgrounds | TimerScreen, Drawer, Onboarding, Carousel navigation |
| **White** (#FFFFFF) | `theme.colors.surface` | Interactive surfaces | Activity items, command buttons, preset pills |
| **Coral** | `theme.colors.brand.primary` | Active/highlighted states | Selected pill, active button, highlights |

### Usage Guidelines

**Utiliser `theme.colors.background` pour:**
- Backgrounds d'écrans (TimerScreen, Onboarding)
- Containers non-interactifs (Drawer, Modals)
- Boutons de navigation de carrousel
- Labels de feedback

**Utiliser `theme.colors.surface` pour:**
- Items interactifs (ActivityItem, CommandButton)
- Pills et cards (PresetPills, PaletteItems)
- Surfaces qui "flottent" au-dessus du background

**Utiliser `theme.colors.brand.primary` pour:**
- États actifs/sélectionnés
- Highlights utilisateur
- Accents de marque

### Platform-Specific Patterns

**Borders subtiles (iOS uniquement):**
```javascript
...Platform.select({
  ios: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border + '30', // 30% opacity
  },
  android: {}, // Rely on shadow/elevation
})
```

**Utilisé dans:** Drawer, Modals (SettingsModal, PremiumModal)

### Accessibility

Tous les ratios de contraste respectent **WCAG AA** :
- `brand.primary` sur cream: **5.1:1**
- `textSecondary` sur cream: **5.2:1**
- `textLight` sur cream: **4.8:1**

### Source de vérité

→ `src/theme/colors.js` (documentation complète inline)

---

## 📚 Documentation Framework

La documentation du projet est organisée dans `_docs/` :

| Catégorie | Emplacement | Contenu |
|-----------|-------------|---------|
| **Guides** | `_docs/guides/` | How-to (builds, deployment, testing) |
| **Decisions** | `_docs/decisions/` | ADRs projet |
| **Testing** | `_docs/testing/` | Checklists, procédures QA |
| **Templates** | `_docs/templates/` | Modèles réutilisables |
| **Reports/Audits** | `_library/resetpulse/` (Hyperion) | Archives audits (bougées lors du revival avril 2026) |

→ See [`_docs/INDEX.md`](_docs/INDEX.md) for complete structure.

---

## 🚀 Cockpit & Missions

Project execution (missions, vision, findings) is orchestrated in `_cockpit/` :

- **Orientation session** → [`_cockpit/README.md`](_cockpit/README.md) ← lire en premier
- **Mission active** → `_cockpit/missions/active/`
- **Vision & séquence** → `_cockpit/vision/index.md`
- **Règles de pilotage** → `_cockpit/flow-rules.md`

---

## 🔧 System References

Ce projet suit le système aegis. Sources de vérité :

| Document | Emplacement |
|----------|-------------|
| Nommage & frontmatter | `~/_aegis/decisions/records/adr-001-naming-and-format.md` |
| Versioning | `~/_aegis/decisions/records/adr-014-versioning.md` |
| Git strategy | `~/_aegis/decisions/records/adr-041-git-strategy.md` |
| Cockpit structure | `~/_aegis/decisions/records/adr-081-cockpit.md` |
| Règles projet | `_cockpit/flow-rules.md` |

### Conventions Appliquées (ADR-001)

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

---

## 🗺️ Navigation session

**You're here**: Working on ResetPulse (React Native timer app).

### Nouvelle session — lire dans cet ordre
1. `_cockpit/README.md` — état actuel, mission active, ce qui est stale
2. `_cockpit/missions/active/` — périmètre en cours
3. `_cockpit/changelog.md` — ce qui s'est passé avant

### Travail actif
- **Mission active** → `_cockpit/missions/active/`
- **Vision séquence** → `_cockpit/vision/fiverr-engagement.md`
- **Findings & devlogs** → `_cockpit/findings/` / `_cockpit/devlogs/`

### Standards projet
- **ADRs projet** → `_docs/decisions/`
- **Guides techniques** → `_docs/guides/`
- **Règles cockpit** → `_cockpit/flow-rules.md`

### Standards système (aegis)
- **Nommage** → `~/_aegis/decisions/records/adr-001-naming-and-format.md`
- **Versioning** → `~/_aegis/decisions/records/adr-014-versioning.md`
- **Cockpit** → `~/_aegis/decisions/records/adr-081-cockpit.md`
