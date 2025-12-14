---
created: '2025-10-09'
updated: '2025-10-09'
status: outdated
milestone: M4
confidence: medium
superseded_by: cockpit/active/m8-onboarding-v2.md
---

# Système d'Onboarding V1 - Documentation Technique

**Version** : 2.1
**Date** : 2025-10-09
**Status** : Superseded by Onboarding V2

---

## 🎯 Vue d'ensemble

Système d'onboarding interactif avec tooltips séquentiels et spotlight highlighting pour guider les nouveaux utilisateurs à travers les fonctionnalités de l'app.

**Flow** : Welcome Screen → Activities → Dial → Palette → Controls → Completion

---

## 🏗️ Architecture

### Composants

```
OnboardingController (Context Provider)
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
    id: 'palette',
    text: 'Changez les couleurs à votre guise',
    arrowDirection: 'down',
  },
  {
    id: 'controls',
    text: 'Démarrez, mettez en pause, ou réinitialisez',
    subtext: 'Le timer continue en arrière-plan',
    arrowDirection: 'down',
  },
  {
    id: 'completion',
    text: 'Profitez bien de ResetPulse !',
    subtext: null,
    arrowDirection: null, // Centered message, no target
  },
];
```

### État persistant

```javascript
// usePersistedState via AsyncStorage - retourne [value, setValue, isLoading]
const [onboardingCompleted, setOnboardingCompleted, isLoadingOnboarding] = usePersistedState(
  '@ResetPulse:onboardingCompleted',
  false
);
```

**Important** : Le flag `isLoadingOnboarding` est essentiel pour éviter d'afficher le WelcomeScreen pendant le chargement initial.

### Actions

- `startTooltips()` - Démarre le guide (attend 1200ms pour les animations)
- `nextTooltip()` - Passe au tooltip suivant
- `showZenModeCompletion()` - Affiche le message de completion en mode zen (quand l'utilisateur démarre le timer pendant l'onboarding)
- `skipAll()` - Saute tous les tooltips
- `completeOnboarding()` - Marque l'onboarding comme terminé
- `resetOnboarding()` - Relance le guide (via Settings)

---

## 📱 Intégration

### 1. App.js

```jsx
<OnboardingProvider>
  {/* ... */}

  {/* WelcomeScreen avec gestion du loading */}
  {showWelcome && (
    <WelcomeScreen
      visible={showWelcome}
      onDiscover={handleDiscover}
      onSkip={handleSkipWelcome}
    />
  )}
</OnboardingProvider>
```

**Important** : Le `showWelcome` doit attendre que `isLoadingOnboarding` soit `false` :

```jsx
const { onboardingCompleted, isLoadingOnboarding, startTooltips, completeOnboarding } = useOnboarding();
const [showWelcome, setShowWelcome] = useState(false);

useEffect(() => {
  // Wait for onboarding state to load from AsyncStorage
  if (!isLoadingOnboarding) {
    // Only show welcome if onboarding was never completed
    setShowWelcome(!onboardingCompleted);
  }
}, [onboardingCompleted, isLoadingOnboarding]);
```

### 2. TimerScreen.jsx

```jsx
// Mesure des bounds
const activitiesRef = useRef(null);

<Animated.View ref={activitiesRef} onLayout={() => {
  // First launch (no animations): short delay
  // Returning users (with animations): longer delay to wait for animations
  const delay = onboardingCompleted ? 100 : 900;
  setTimeout(() => {
    activitiesRef.current?.measure((x, y, w, h, pageX, pageY) => {
      const bounds = { top: pageY, left: pageX, width: w, height: h };
      const position = calculateTooltipPosition(bounds);
      registerTooltipTarget(TOOLTIP_IDS.ACTIVITIES, position, bounds);
    });
  }, delay);
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

### WelcomeScreen s'affiche à chaque lancement

**Cause** : `showWelcome` initialisé avant que `onboardingCompleted` soit chargé depuis AsyncStorage
**Solution** : Utiliser `isLoadingOnboarding` pour attendre que l'état soit chargé

### Tooltips ne se positionnent pas correctement

**Cause** : Délais inversés - courte attente pour premier lancement (avec animations d'entrance), longue attente pour relance (sans animations)
**Solution** : Inverser la logique des délais :
- Premier lancement (`onboardingCompleted = false`) : délais longs (900-1300ms) pour attendre les animations
- Relance depuis settings (`onboardingCompleted = true`) : délais courts (100-400ms) car pas d'animations

### Tooltip hors écran

**Cause** : Position calculée avant layout complet
**Solution** : Augmenter timeout dans `setTimeout()`

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

## 🐛 Bugs Corrigés (v2.1)

### 1. WelcomeScreen s'affichait à chaque lancement
- **Problème** : Le `showWelcome` était initialisé avec `!onboardingCompleted` avant le chargement depuis AsyncStorage
- **Solution** : Ajout de `isLoadingOnboarding` pour attendre que l'état persiste soit chargé

### 2. Tooltips mal positionnés lors de la relance
- **Problème** : Délais inversés entre premier lancement et relance depuis settings
- **Solution** : Correction de la logique conditionnelle (premier lancement = longs délais, relance = courts délais)

---

**Maintenu par** : Équipe ResetPulse
**Dernière mise à jour** : 2025-10-09
