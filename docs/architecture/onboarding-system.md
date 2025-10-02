# Système d'Onboarding - Documentation Technique

**Version** : 2.0
**Date** : 2025-10-02
**Status** : Production Ready

---

## 🎯 Vue d'ensemble

Système d'onboarding interactif avec tooltips séquentiels et spotlight highlighting pour guider les nouveaux utilisateurs à travers les fonctionnalités de l'app.

**Flow** : Welcome Screen → Activities → Dial → Controls → Palette → Completion

---

## 🏗️ Architecture

### Composants

```
OnboardingProvider (Context)
├── WelcomeScreen (Modal premier lancement)
├── HighlightOverlay (SVG Mask spotlight)
└── Tooltip (Bulle + flèche + boutons)
```

### Flux de données

```
TimerScreen
  ├─ measure() → bounds précis
  └─ registerTooltipTarget(id, position, bounds)
       ↓
OnboardingController (Context)
  ├─ State: currentTooltip, tooltipPositions, tooltipBounds
  └─ Render: HighlightOverlay + Tooltip
```

---

## 📐 Système de Positionnement

### 1. Grid Layout (Structure)

```javascript
// gridLayout.js - Hauteurs des sections
{
  header: 50px,
  activities: 80px,  // 50 × φ (Golden Ratio)
  palette: 80px
}
```

**Rôle** : Fournir les hauteurs fixes pour le layout responsive.

### 2. Measure() (Précision)

```javascript
// TimerScreen.jsx - Bounds réels
<View ref={ref} onLayout={() => {
  setTimeout(() => {
    ref.current?.measure((x, y, w, h, pageX, pageY) => {
      const bounds = { top: pageY, left: pageX, width: w, height: h };
      const position = calculateTooltipPosition(bounds);
      registerTooltipTarget(id, position, bounds);
    });
  }, 100);
}}>
```

**Rôle** : Mesurer les coordonnées absolues des éléments visuels.

### 3. Smart Positioning (Intelligence)

```javascript
const calculateTooltipPosition = (bounds, tooltipHeight = 120) => {
  const spaceAbove = bounds.top;
  const spaceBelow = SCREEN_HEIGHT - (bounds.top + bounds.height);

  // Priorité: au-dessus > en dessous > centré
  if (spaceAbove >= tooltipHeight + 20) {
    return { top: bounds.top - tooltipHeight - 20 };
  } else if (spaceBelow >= tooltipHeight + 20) {
    return { top: bounds.top + bounds.height + 20 };
  } else {
    return { top: SCREEN_HEIGHT / 2 - tooltipHeight / 2 };
  }
};
```

**Rôle** : Garantir que le tooltip ne cache jamais l'élément cible.

---

## 🎨 Highlight avec SVG Mask

### Technique

```jsx
<Svg>
  <Defs>
    <Mask id="spotlight-mask">
      {/* Blanc = overlay visible (sombre) */}
      <Rect fill="white" width="100%" height="100%" />

      {/* Noir = découpe (spotlight transparent) */}
      <Rect fill="black" x={left} y={top} width={width} height={height} rx={12} />
    </Mask>
  </Defs>

  {/* Overlay avec mask appliqué */}
  <Rect mask="url(#spotlight-mask)" fill="rgba(0,0,0,0.75)" />
</Svg>
```

### Avantages

✅ **Aucun gap visuel** (vs 4 rectangles)
✅ **Performance optimale** (1 seul SVG)
✅ **Coins arrondis** (rx/ry)
✅ **Maintenable** (technique standard)

---

## 🔄 Séquence d'Onboarding

### Configuration

```javascript
const TOOLTIPS_CONFIG = [
  {
    id: 'activities',
    text: 'Sélectionnez votre activité',
    arrowDirection: 'up',
  },
  {
    id: 'dial',
    text: 'Ajustez la durée du timer',
    arrowDirection: 'down',
  },
  {
    id: 'controls',
    text: 'Démarrez, mettez en pause, ou réinitialisez',
    subtext: 'Le timer continue en arrière-plan',
    arrowDirection: 'up',
  },
  {
    id: 'palette',
    text: 'Vous pouvez aussi changer les couleurs',
    arrowDirection: 'down',
  },
];
```

### État persistant

```javascript
// usePersistedState via AsyncStorage
const [onboardingCompleted, setOnboardingCompleted] = usePersistedState(
  '@ResetPulse:onboardingCompleted',
  false
);
```

### Actions

- `startTooltips()` - Démarre le guide
- `nextTooltip()` - Passe au tooltip suivant
- `skipAll()` - Saute tous les tooltips
- `resetOnboarding()` - Relance le guide (via Settings)

---

## 📱 Intégration

### 1. App.js

```jsx
<OnboardingProvider>
  <NavigationContainer>
    {/* ... */}
  </NavigationContainer>
  <WelcomeScreen />
</OnboardingProvider>
```

### 2. TimerScreen.jsx

```jsx
// Mesure des bounds
const activitiesRef = useRef(null);

<View ref={activitiesRef} onLayout={() => {
  setTimeout(() => {
    activitiesRef.current?.measure((x, y, w, h, pageX, pageY) => {
      const bounds = { top: pageY, left: pageX, width: w, height: h };
      const position = calculateTooltipPosition(bounds);
      registerTooltipTarget(TOOLTIP_IDS.ACTIVITIES, position, bounds);
    });
  }, 100);
}}>
```

### 3. TimeTimer.jsx

```jsx
// Refs pour Dial & Controls
const dialWrapperRef = useRef(null);
const controlsContainerRef = useRef(null);

useEffect(() => {
  if (onDialRef && dialWrapperRef.current) {
    onDialRef(dialWrapperRef.current);
  }
}, [onDialRef]);
```

---

## 🎯 Points Clés

### ✅ Do's

1. **Toujours utiliser measure()** pour bounds précis
2. **Timeout de 100-600ms** après onLayout pour garantir layout stable
3. **Smart positioning** pour ne jamais cacher l'élément
4. **SVG Mask** pour spotlight sans gaps

### ❌ Don'ts

1. **Jamais calculer manuellement** les positions (préférer measure())
2. **Jamais hardcoder** la position des tooltips
3. **Jamais utiliser 4 rectangles** pour overlay (utiliser SVG Mask)
4. **Jamais confondre** Grid sections et éléments visuels

---

## 🔧 Dépannage

### Tooltip hors écran

**Cause** : Position calculée avant layout complet
**Solution** : Augmenter timeout dans `setTimeout()` (100 → 200ms)

### Bounds décalés

**Cause** : measure() appelé pendant animation
**Solution** : Mesurer après animations (délai 500-600ms)

### Highlight avec gaps

**Cause** : Utilisation de 4 rectangles au lieu de SVG Mask
**Solution** : Utiliser HighlightOverlay.jsx (SVG Mask)

---

## 📊 Performance

- **Renders** : Context optimisé (pas de re-render inutiles)
- **Animations** : useNativeDriver pour 60fps
- **SVG** : 1 seul élément SVG (performant)
- **Measure** : Appelé uniquement au mount (pas à chaque render)

---

## 🚀 Évolutions futures

1. **Analytics** : Tracker completion rate et skip points
2. **A/B Testing** : Tester différents textes de tooltips
3. **Animations** : Ajouter transitions entre tooltips
4. **Accessibilité** : Support VoiceOver/TalkBack
5. **Mode debug** : Overlay visuel montrant bounds calculés

---

**Maintenu par** : Équipe ResetPulse
**Dernière mise à jour** : 2025-10-02
