---
created: '2025-09-24'
updated: '2025-10-20'
status: active
milestone: M2-M7
confidence: high
---

# 🏗️ Architecture - ResetPulse

> Design system, patterns et guidelines d'architecture

## 🎯 Vue d'ensemble

Cette section documente l'architecture, le design system et les guidelines de développement de ResetPulse.

## 📋 Documents d'Architecture

### Design System
- **[Style Brief](style-brief.md)** - Guidelines visuelles et identité
- **[Theme Management](theme-management.md)** - Système de thèmes et palettes
- **[Image Prompt](image-prompt.md)** - Brief logo et identité visuelle

## 🎨 Système de Design

### Principes de Base
- **Accessibilité first** - WCAG 2.1 compliance
- **Minimalisme cognitif** - Spécialement conçu pour TDAH/TSA
- **Golden ratio** - Proportions basées sur 1.618
- **Cross-platform** - Design adaptatif iOS/Android

### Palette de Couleurs
```css
/* Palette Principale */
Primaire: #7A1B3A    /* Rouge vénitien velouté */
Secondaire: #3CBBB1  /* Turquoise mat */
Accent: #A8E6CF     /* Vert jade méditatif */
Profond: #2C4A6B    /* Bleu nuit */
Neutre: #F7F3F0     /* Blanc cassé chaleureux */
```

### Système de Palettes (8 disponibles)
1. **terre** - Couleurs naturelles et apaisantes
2. **classique** - Couleurs standards et familières
3. **laser** - Couleurs vives et énergiques
4. **douce** - Couleurs pastel et douces
5. **pastel_girly** - Rose et lavande
6. **verts** - Variantes de vert
7. **bleus** - Variantes de bleu
8. **canard** - Bleu-vert sophistiqué

## 🔧 Architecture Technique

### Structure Modulaire
```
Timer Architecture:
├── TimerDial           # Orchestrateur principal
├── DialBase           # Éléments statiques (graduations)
├── DialProgress       # Arc animé
└── DialCenter         # Emoji et pulsation
```

### Contexts & State Management
- **ThemeProvider** - Gestion globale du thème
- **TimerPaletteContext** - Couleurs du timer
- **TimerOptionsContext** - Options d'affichage (60min/25min, rotation)

### Responsive Design
```javascript
// Système responsive basé sur la largeur d'écran
const rs = (size, constraint = 'default') => {
  // iPhone SE: 320px
  // iPhone 12/13/14: 390px
  // iPhone Pro Max: 428px
}
```

## 🎯 Patterns d'Architecture

### Component Patterns
- **Container/Presenter** - Séparation logique/vue
- **Compound Components** - Composants composés (Timer + Controls)
- **Render Props** - Hooks pour logique réutilisable

### Animation Patterns
- **Modular Animations** - Chaque composant gère ses animations
- **Performance First** - Animations natives avec reanimated
- **Accessibility Aware** - Respect des préférences système

### State Patterns
- **Persisted State** - AsyncStorage pour préférences
- **Optimistic Updates** - UI responsive sans attente
- **Error Boundaries** - Gestion gracieuse des erreurs

## 🎨 Guidelines Visuelles

### Typographie
- **Système iOS natif** - SF Pro Display
- **Hiérarchie claire** - 3 niveaux maximum
- **Lisibilité optimisée** - Contraste WCAG AA

### Espacements
```javascript
// Basé sur le golden ratio
const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 13,   // 0.8rem (golden ratio)
  lg: 21,   // 1.3rem (golden ratio)
  xl: 34    // 2.1rem (golden ratio)
}
```

### Animations
- **Durées standard** - 200ms (rapide), 300ms (normal), 500ms (lent)
- **Easing curves** - iOS: easeInOut, Android: Material
- **Respect accessibilité** - Désactivation si motion réduite

## 🌈 Accessibilité

### Couleurs & Contraste
- **Ratio minimum** - 4.5:1 pour texte normal
- **Ratio élevé** - 7:1 pour texte important
- **Daltonisme** - Palettes testées pour tous types

### Interactions
- **Taille minimale** - 44x44pts pour touch targets
- **Feedback haptique** - Support cross-platform
- **VoiceOver/TalkBack** - Labels et hints appropriés

### Animations
- **Épilepsie compliance** - Pas de flash > 3Hz
- **Motion sickness** - Respect reduce motion
- **Option désactivation** - Toggle dans settings

## 🔄 Evolution & Maintenance

### Versioning
- **Design tokens** - Versionnés avec l'app
- **Breaking changes** - Migration guides
- **Backward compatibility** - Support N-1 version

### Documentation
- **Storybook ready** - Composants documentés
- **Usage examples** - Code samples
- **Do's and Don'ts** - Best practices

---

*Architecture documentée et maintenue avec le code. Dernière révision : 2025-10-02*