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
- [ ] Hook useTimer → extraire la logique useState/useEffect/useCallback
- [ ] Adapter requestAnimationFrame → React Native Animated ou simple setInterval
- [ ] Tests logique : play/pause/reset/presets fonctionnels

### Rendu Basique SVG
- [ ] Cercle blanc + bordure (design de base)
- [ ] Arc dynamique noir/blanc pour progression
- [ ] Graduations simples (sans les nombres pour l'instant)
- [ ] Messages "C'est parti" centrés

**Milestone:** Clean architecture ready for component integration

---

## M2 : Timer Core Fonctionnel 🎯

### Fonctionnalités Core
- [ ] Timer core fonctionnel
- [ ] Build iOS validé
- [ ] Tests unitaires de la logique timer

**Milestone:** Timer fonctionnel avec build iOS stable

---

## M3 : Interface Minimale 🎨

### Couleurs & Contrôles
- [ ] 4 pastilles fixes (palette "classique" pour commencer)
- [ ] Boutons play/pause/reset avec icônes simples
- [ ] Presets 4min/20min
- [ ] Responsive carré selon orientation device

### Polish Initial
- [ ] Proportions nombre d'or appliquées
- [ ] Animations fluides des transitions
- [ ] TestFlight build qui fonctionne

**Milestone:** Interface utilisateur complète et polie

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

