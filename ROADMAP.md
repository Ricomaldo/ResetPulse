# ResetPulse - Roadmap de Développement

> La roadmap sera donnée au fur et à mesure pour que tu n'anticipes pas de trop et que je garde le contrôle.

## M1 : Foundation & Architecture ⚙️

### Setup & Structure
- [x] Init Expo project + structure folders
- [x] Install dependencies (react-native-svg, styled-components)
- [x] Setup ThemeProvider with color tokens
- [x] Create layout system with golden ratio proportions
- [x] Define responsive breakpoints for iPhone formats

### Core Timer Logic
- [x] Hook useTimer → extraire la logique useState/useEffect/useCallback
- [x] Adapter requestAnimationFrame → React Native Animated ou simple setInterval
- [x] Tests logique : play/pause/reset/presets fonctionnels

### Rendu Basique SVG
- [x] Cercle blanc + bordure (design de base)
- [x] Arc dynamique noir/blanc pour progression
- [x] Graduations simples (sans les nombres pour l'instant)
- [x] Messages "C'est parti" centrés

**Milestone:** Clean architecture ready for component integration ✅

---

## M2 : Timer Core Fonctionnel 🎯

### Fonctionnalités Core
- [x] Timer core fonctionnel
- [x] Build iOS validé
- [x] Tests unitaires de la logique timer

**Milestone:** Timer fonctionnel avec build iOS stable ✅

---

## M3 : Interface Minimale 🎨

### Couleurs & Contrôles
- [x] 4 pastilles fixes (palette "classique" pour commencer)
- [x] Boutons play/pause/reset avec icônes simples
- [x] Presets 4min/20min
- [x] Responsive carré selon orientation device

### Polish Initial
- [x] Proportions nombre d'or appliquées
- [x] Animations fluides des transitions
- [x] TestFlight build qui fonctionne

**Milestone:** Interface utilisateur complète et polie ✅

---

## Structure Technique

```
src/
├── components/     # Composants réutilisables
├── hooks/         # Hooks personnalisés (useTimer, etc.)
├── screens/       # Écrans de l'application
├── styles/        # Thème et tokens de design
│   ├── theme.js   # Tokens couleurs + proportions dorées
│   └── layout.js  # Système de layout
└── utils/         # Utilitaires et helpers
```

## Dépendances Principales
- `expo` - Framework React Native
- `react-native-svg` - Rendu des cercles et arcs
- `styled-components` - Styling (optionnel)

