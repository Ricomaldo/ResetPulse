---
created: '2025-12-07'
updated: '2026-07-24'
status: active
type: project-framework
---

# CLAUDE.md - ResetPulse

## 🏗️ Framework (Stable Reference)

This document defines the **project architecture, tech stack, and conventions**. It changes rarely.

> ⚠️ **RECENTRAGE EN COURS (07/2026)** — l'app est en reconstruction par cycles
> (ADR-014). Sources de vérité, dans l'ordre :
> 1. `CONTEXT.md` (racine) — vocabulaire du domaine, obligatoire
> 2. `_docs/decisions/adr-014-recentrage-signature.md` + `adr-015-modele-rituel-activite.md`
> 3. `_docs/specs/recentrage.md` — spec des écrans cibles (SCR-x)
> 4. `_cockpit/missions/active/recentrage.md` — méthode, suivi cycles, règles
>
> Toute section ci-dessous marquée 🕰️ décrit l'app d'avant — encore
> partiellement en place, en cours de remplacement cycle par cycle.

For **current missions, workflows, or next steps**, see:
- **Orientation session** → `_cockpit/README.md` ← lire en premier
- **Mission active** → `_cockpit/missions/active/recentrage.md`
- **Vision & cap** → `_cockpit/vision/index.md`
- **Règles de pilotage** → `_cockpit/flow-rules.md`

---

## 📱 Vue d'ensemble

ResetPulse est une application Time Timer visuel pour utilisateurs neuroatypiques (TDAH, TSA). App React Native/Expo en production sur Apple App Store et Google Play. Modèle freemium avec RevenueCat pour les IAP.

## Stack technique

- **Framework**: React Native 0.83.6 + Expo SDK 55 (New Architecture activée)
- **React**: 19.1.0
- **État**: Context API (TimerConfigContext consolidé ADR-009, PurchaseContext)
- **i18n**: i18n-js (15 langues — refonte en FR/EN, batch final en fin de Lot 3)
- **Analytics**: sortie Mixpanel faite (adaptateur no-op) → PostHog au Lot 2
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
│   ├── dial/             # TimeTimer, TimerDial, DialCenter… (noyau visuel, récolté)
│   ├── layout/           # AsideZone (sheet léger SCR-10), Icons
│   └── modals/           # 🕰️ legacy — meurent en C6 (Rituels/Ambiances)
├── config/
│   ├── activities.js     # Activités (atomes d'identité, ADR-015)
│   ├── timer-palettes.js # Palettes de couleurs
│   ├── revenuecat.js     # Config RevenueCat
│   └── test-mode.js      # DEV_MODE toggle
├── contexts/             # TimerConfigContext (consolidé ADR-009), PurchaseContext
├── dev/                  # DevPremiumContext + composants dev
├── hooks/                # useTimer (noyau sacré), useNotificationTimer, useTranslation
├── i18n/                 # Traductions (15 langues)
├── screens/              # TimerScreen.jsx (écran neuf, reconstruction C1+)
├── services/             # analytics.js (no-op, en attente PostHog)
└── theme/                # ThemeProvider, tokens, colors
```

## Modèle Freemium — 🕰️ en refonte (ADR-014)

Le modèle cible : **cœur gratuit entier** (disque, emoji, couleur en direct,
activités et 3 rituels de base) + pack **Ambiances** en achat unique ≈ 4,99 €
(mouvements, plein écran, exports, palettes complètes, rituels illimités).
Détail : `_docs/specs/recentrage.md`. La répartition gratuit/payant des palettes
est parquée — à trancher devant les écrans (C6+). L'ancien comportement
(carrousels + modale Discovery) meurt en C6.

## Mode développement

Le fichier `src/config/test-mode.js` contient `DEV_MODE`:
- `true`: Affiche DevFab (coin haut-gauche) pour toggle App/Onboarding et Free/Premium
- `false`: Production normale

Contexte dev: `src/dev/DevPremiumContext.js` simule le statut premium pour tests.

## État actuel du projet

### En production
- v2.1.6 sur Apple App Store et Google Play
- Analytics Mixpanel actifs

### En cours
- **Mission Recentrage** (ADR-014) : reconstruction par cycles, cible v3.0.0
- Suivi : `_cockpit/missions/active/recentrage.md` · Spec : `_docs/specs/recentrage.md`

### Tests
- Les tests suivent le code (règle recentrage) : supprimés avec leurs composants,
  sacrés pour le noyau (`useTimer`, state machine ADR-007). Compte courant dans
  le dernier rapport de cycle.

## Fichiers clés à connaître

- `CONTEXT.md` - Glossaire du domaine (Rituel, Activité, Mode…) — lire en premier
- `App.js` - Point d'entrée
- `src/screens/TimerScreen.jsx` - Écran principal (neuf, reconstruction C1+)
- `src/components/layout/AsideZone.jsx` - Sheet léger (SCR-10)
- `src/components/dial/` - Noyau visuel du disque (récolté)
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
