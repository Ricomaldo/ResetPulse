---
created: '2025-12-17'
updated: '2025-12-17'
status: active
type: audit-findings
scope: gesture-handling
---

# Rapport d'Audit : Gestion des Gestes Tactiles dans dialZone

**Date:** 2025-12-17
**Version app:** v1.2.3
**Scope:** Zone haute de l'écran (62%) contenant DigitalTimer + TimerDial
**Agent:** Explore (sonnet)

---

## 1. Architecture Gestuelle (Vue d'ensemble)

```
TimerScreen (SafeAreaView)
├── PanResponder (swipe up → drawer)
│   └── isTouchInDial() → exclusion zone dial
│
└── DialZone (62% screen height)
    ├── DigitalTimerZone (height: 64px fixed)
    │   └── TouchableOpacity (tap toggle collapse/expand)
    │       └── DigitalTimer (display MM:SS)
    │
    └── DialCenteredZone (flex: 1)
        └── TimeTimer
            └── TimerDial (PanResponder)
                ├── Graduation marks (tap pour set)
                ├── Nombres débordants (tap pour set)
                ├── Arc progress (drag pour ajuster)
                └── Centre (tap play/pause, long press reset)
                    └── DialCenter
                        ├── ActivityEmoji (pointerEvents: none)
                        ├── Pulse animation (pointerEvents: none)
                        └── PlayPauseButton (TouchableOpacity)
```

---

## 2. Gestion par Type de Geste

### 2.1 TAP

#### Zone A: DigitalTimer (haut de dialZone)
**Handler:** `TouchableOpacity` (TimerScreen.jsx:239-251)
**Détection:** Tap direct sur pill
**hitSlop:** `{ top: 20, bottom: 20, left: 20, right: 20 }`
**activeOpacity:** `0.8`
**Action:** Toggle `showDigitalTimer` (expand ↔ collapse)
**Callback:** `handleToggleDigitalTimer()` → `setShowDigitalTimer(!showDigitalTimer)`

```jsx
// TimerScreen.jsx:239-251
<TouchableOpacity
  onPress={handleToggleDigitalTimer}
  activeOpacity={0.8}
  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
>
  <DigitalTimer
    remaining={timerRemaining}
    isRunning={isRunning}
    color={currentColor}
    isCollapsed={!showDigitalTimer}
  />
</TouchableOpacity>
```

**Notes:**
- hitSlop étendu (+20px toutes directions) facilite tap sur petit élément
- Accessible depuis swipe up (pas bloqué par PanResponder)

---

#### Zone B: Centre Dial (zone < 35% radius du dial)
**Handler:** `PanResponder` (TimerDial.jsx:114-274)
**Détection:** Tap rapide (<200ms) + mouvement minimal (<10px) + distance du centre < 35% radius
**Action:** Play/Pause timer via `onDialTap()`
**Callback:** `handleDialTap()` → `timerRef.current.toggleRunning()`

```jsx
// TimerDial.jsx:224-261
onPanResponderRelease: (evt) => {
  const isTap = timeDelta < 200 && movementDistance < 10;
  const distanceFromCenter = Math.sqrt(
    Math.pow(tapX - centerX, 2) + Math.pow(tapY - centerY, 2)
  );
  const centerZoneRadius = radiusBackground * 0.35; // 35% = centre
  const isTapOnCenter = distanceFromCenter < centerZoneRadius;

  if (isTap && isTapOnCenter && onDialTap) {
    onDialTap();
  }
}
```

**Sous-composant (si showActivityEmoji = false):**
`PlayPauseButton` (TouchableOpacity dans DialCenter.jsx:59-78)
- hitSlop: `{ top: 12, bottom: 12, left: 12, right: 12 }`
- activeOpacity: non défini (défaut 0.2)
- Icône contextuelle: play / pause / refresh (selon état)

**Notes:**
- Zone centre exclusive (entre 0-35% radius)
- Si emoji visible → tap passe à travers (pointerEvents: none sur emoji)
- Si emoji caché → PlayPauseButton affiché avec sa propre hitSlop

---

#### Zone C: Graduations + Nombres (zone > 65% radius du dial)
**Handler:** `PanResponder` (TimerDial.jsx:114-274)
**Détection:** Tap rapide (<200ms) + mouvement minimal (<10px) + distance du centre > 65% radius
**Action:** Set duration à la minute tapée + snap
**Callback:** `onGraduationTap(tappedMinutes, true)` → TimeTimer:120 → useTimer.setDuration()

```jsx
// TimerDial.jsx:224-261
const outerZoneMinRadius = radiusBackground * 0.65; // 65%+ = graduations
const isTapOnGraduation = distanceFromCenter > outerZoneMinRadius;

if (isTap && isTapOnGraduation && onGraduationTap) {
  const tappedMinutes = dial.coordinatesToMinutes(tapX, tapY, centerX, centerY);
  onGraduationTap(tappedMinutes, true); // true = apply snap
}
```

**Algorithme de détection:**
1. `dial.coordinatesToMinutes(x, y, centerX, centerY)` (useDialOrientation.js:91-100)
2. Calcul angle: `Math.atan2(dy, dx) * (180 / Math.PI) + 90`
3. Conversion angle → minutes via `angleToMinutes()`
4. Snap appliqué: `snapToInterval(seconds, scaleMode)` (snap-settings.js:39-42)

**Snap intervals (par scale mode):**
- 1min: 1s
- 5min: 5s
- 10min: 5s
- 25min: 60s (Pomodoro)
- 45min: 60s
- 60min: 60s

---

#### Zone D: Nombres Débordants (SVG overflow: visible)
**Tactile:** OUI (inclus dans zone C)
**Mécanisme:** Les nombres sont positionnés à `radiusBackground + 18px` (TIMER_PROPORTIONS.NUMBER_RADIUS)
**Implication:** Débordent visuellement du cercle blanc, MAIS restent dans le container SVG avec panResponder actif

```jsx
// DialBase.jsx (nombres positionnés dans SVG parent)
const numberRadius = radiusBackground + TIMER_PROPORTIONS.NUMBER_RADIUS; // +18px
const positions = dial.getNumberPositions(numberRadius, centerX, centerY);
```

**Test empirique nécessaire:** Vérifier si tap sur "60" (en haut, débordant) fonctionne bien.

---

#### Zone E: Zone Morte (entre 35% et 65% radius)
**Action:** Aucune
**Pourquoi:** Zone intermédiaire entre centre et graduations, probablement pour éviter taps accidentels sur arc progress.

```jsx
// Pas de handler si distance entre centerZoneRadius et outerZoneMinRadius
// TimerDial.jsx:261
// Middle zone (between center and graduations) - do nothing
```

---

### 2.2 SWIPE

#### Swipe UP (direction verticale négative)
**Handler:** `PanResponder` (TimerScreen.jsx:106-127)
**Détection:** `gestureState.dy < -SWIPE_THRESHOLD` (50px)
**Conditions:**
- `!isTimerRunning` (bloqué pendant timer actif)
- `!optionsDrawerVisible` (déjà ouvert)
- `!isTouchInDial(evt)` (exclusion zone dial)
**Action:** Ouvre drawer options
**Callback:** `setOptionsDrawerVisible(true)`

```jsx
// TimerScreen.jsx:106-127
const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      if (isTouchInDial(evt)) {
        return false; // Let dial handle its own gestures
      }
      return !isTimerRunning && !optionsDrawerVisible;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (isTouchInDial(evt)) {
        return false; // Let dial handle its own gestures
      }
      return !isTimerRunning && !optionsDrawerVisible && gestureState.dy < -10; // UP
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -SWIPE_THRESHOLD) {
        setOptionsDrawerVisible(true);
      }
    },
  })
).current;
```

**Exclusion dial (isTouchInDial):**
```jsx
// TimerScreen.jsx:94-103
const isTouchInDial = (evt) => {
  if (!dialLayoutRef.current) {
    return false;
  }

  const { pageX, pageY } = evt.nativeEvent;
  const { x, y, width: dialWidth, height: dialHeight } = dialLayoutRef.current;

  return pageX >= x && pageX <= x + dialWidth && pageY >= y && pageY <= y + dialHeight;
};
```

**Mesure layout dial:**
```jsx
// TimerScreen.jsx:165-173
const handleDialRef = (ref) => {
  dialWrapperRef.current = ref;
  if (ref) {
    ref.measureInWindow((x, y, width, height) => {
      dialLayoutRef.current = { x, y, width, height };
    });
  }
};
```

**Notes:**
- Layout mesuré via `measureInWindow()` (coordonnées absolues screen)
- Swipe up UNIQUEMENT en dehors du dial (DigitalTimer zone OK, espace autour dial OK)
- Bloqué si timer running (UX: éviter ouverture drawer accidentelle pendant focus)

---

#### Autres directions de swipe
**Action:** Aucune
**Notes:** Seul swipe UP implémenté (drawer reveal). Swipe horizontal ignoré.

---

### 2.3 DRAG/PAN

#### Zone: Arc Progress (drag sur cercle dial)
**Handler:** `PanResponder` (TimerDial.jsx:114-274)
**Détection:** Mouvement > seuil (onMoveShouldSetPanResponder: true si onGraduationTap existe)
**Action:** Ajustement fluide de duration avec résistance dynamique
**Callback:** `onGraduationTap(minutes, false)` pendant drag, `onGraduationTap(minutes, true)` au release

**Phases du drag:**

**1. Grant (début du touch):**
```jsx
// TimerDial.jsx:119-146
onPanResponderGrant: (evt) => {
  gestureStartTimeRef.current = Date.now();
  gestureStartPosRef.current = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };

  setIsDragging(true);

  // Calcul position touchée → minutes
  const touchMinutes = dial.coordinatesToMinutes(
    evt.nativeEvent.locationX,
    evt.nativeEvent.locationY,
    centerX,
    centerY
  );

  // Offset entre touch et valeur actuelle (pour maintenir relation pendant drag)
  const currentMinutes = duration / 60;
  dragOffsetRef.current = currentMinutes - touchMinutes;

  // Références pour wrap-around detection
  lastMinutesRef.current = currentMinutes;
  lastTouchMinutesRef.current = touchMinutes;
  lastMoveTimeRef.current = Date.now();
}
```

**2. Move (pendant drag):**
```jsx
// TimerDial.jsx:148-209
onPanResponderMove: (evt) => {
  const touchMinutes = dial.coordinatesToMinutes(
    evt.nativeEvent.locationX,
    evt.nativeEvent.locationY,
    centerX,
    centerY
  );

  const maxMinutes = dial.maxMinutes;

  // Détection wrap-around (passage 60→0 ou 0→60)
  let touchDelta = touchMinutes - lastTouchMinutesRef.current;
  if (Math.abs(touchDelta) > maxMinutes / 2) {
    // Ajustement delta si wrap détecté
    if (touchDelta > 0) {
      touchDelta = touchDelta - maxMinutes; // Wrap counter-clockwise
    } else {
      touchDelta = touchDelta + maxMinutes; // Wrap clockwise
    }
  }

  // Calcul vélocité pour résistance dynamique
  const now = Date.now();
  const deltaTime = Math.max(1, now - (lastMoveTimeRef.current || now));
  const velocity = Math.abs(touchDelta) / (deltaTime / 1000); // minutes/sec

  // Résistance adaptative (plus rapide = plus de résistance)
  const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
  const dynamicResistance = DRAG.BASE_RESISTANCE - (velocityFactor * DRAG.VELOCITY_REDUCTION);

  // Ease-out curve pour décélération naturelle
  const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
  const resistedDelta = touchDelta * easedResistance;

  // Nouveau temps = ancien + delta résisté
  let newMinutes = lastMinutesRef.current + resistedDelta;

  // Clamp critique [0, maxMinutes]
  newMinutes = Math.max(0, Math.min(maxMinutes, newMinutes));

  // Update timer (smooth, pas de snap)
  onGraduationTap(newMinutes, false); // false = dragging

  // Update refs
  lastMinutesRef.current = newMinutes;
  lastTouchMinutesRef.current = touchMinutes;
  dragOffsetRef.current = newMinutes - touchMinutes;
  lastMoveTimeRef.current = now;
}
```

**Constantes de résistance (timerConstants.js:163-168):**
```js
export const DRAG = {
  BASE_RESISTANCE: 0.9, // Higher = more responsive (was 0.85)
  VELOCITY_THRESHOLD: 40, // Lower = slower movements feel more responsive (was 50)
  VELOCITY_REDUCTION: 0.25, // Lower = less reduction at high velocity (was 0.3)
  WRAP_THRESHOLD: 0.4,
};
```

**Ease-out function (TimerDial.jsx:28):**
```js
const easeOut = (t) => t * (2 - t);
```

**3. Release (fin du drag):**
```jsx
// TimerDial.jsx:211-271
onPanResponderRelease: (evt) => {
  const timeDelta = now - gestureStartTimeRef.current;
  const movementDistance = Math.sqrt(dx * dx + dy * dy);

  // Détection tap vs drag
  const isTap = timeDelta < 200 && movementDistance < 10;
  const isLongPress = timeDelta >= 500 && movementDistance < 10;

  // Snap UNIQUEMENT si drag (pas tap ni long press)
  if (!isTap && !isLongPress && onGraduationTap && lastMinutesRef.current !== null) {
    onGraduationTap(lastMinutesRef.current, true); // true = release, apply snap
  }

  // Gestion tap/long press par zone (voir sections 2.1 et 2.4)

  setIsDragging(false);
  // Reset refs...
}
```

**Flow snap (TimeTimer.jsx:120-144):**
```jsx
const handleGraduationTap = useCallback((minutes, isRelease = false) => {
  if (timer.running) {return;} // Pas d'ajustement pendant running

  const dialMode = getDialMode(scaleMode);
  const clampedMinutes = Math.max(0, Math.min(dialMode.maxMinutes, minutes));
  let newDuration = clampedMinutes * 60;

  // Snap UNIQUEMENT au release
  if (isRelease) {
    const { snapToInterval } = require('../../config/snap-settings');
    newDuration = snapToInterval(newDuration, scaleMode);
  } else {
    // Pendant drag: arrondir à la seconde
    newDuration = Math.round(newDuration);
  }

  timer.setDuration(newDuration);
}, [timer, scaleMode]);
```

**Notes:**
- Résistance dynamique rend drag fluide même à haute vélocité
- Wrap-around prévenu par tracking du lastTouchMinutesRef
- Snap appliqué UNIQUEMENT au release (pas pendant drag)
- Drag handle visuel (petit cercle à l'extrémité de l'arc) avec opacity adaptative

---

### 2.4 LONG PRESS

#### Zone: Centre Dial
**Handler:** `PanResponder` (TimerDial.jsx:228) OU `PlayPauseButton` (PlayPauseButton.jsx:61)
**Détection:** Maintien >= 500ms + mouvement minimal (<10px)
**Action:** Reset timer
**Callback:** `onDialLongPress()` → `timer.resetTimer()`

**Via PanResponder (si emoji visible):**
```jsx
// TimerDial.jsx:228-252
const isLongPress = timeDelta >= 500 && movementDistance < 10;

if (isLongPress && onDialLongPress) {
  onDialLongPress();
}
```

**Via TouchableOpacity (si PlayPauseButton visible):**
```jsx
// PlayPauseButton.jsx:59-78
<TouchableOpacity
  onPress={onPress}
  onLongPress={handleLongPress}
  delayLongPress={500}
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
>
  {/* Icon */}
</TouchableOpacity>
```

**Notes:**
- Deux handlers possibles selon UI state (emoji vs button)
- Délai identique: 500ms
- Haptic feedback au long press (PlayPauseButton.jsx:52-55)

---

## 3. Points d'Attention Identifiés

### 3.1 Conflits Potentiels

#### A. Swipe UP vs Drag Dial
**Risque:** Swipe up pour drawer pourrait interférer avec drag vertical sur dial.
**Mitigation actuelle:**
- `isTouchInDial(evt)` exclusion stricte dans PanResponder screen-level
- PanResponder dial capture tous les touches dans sa zone
- `onStartShouldSetPanResponder: () => true` (dial a priorité absolue)

**Verdict:** Bien géré. Pas de conflit observé dans code.

---

#### B. Tap Centre vs Drag Arc
**Risque:** Tap rapide sur centre pourrait être interprété comme début de drag.
**Mitigation actuelle:**
- Détection tap stricte: `timeDelta < 200ms && movementDistance < 10px`
- Zones exclusives: centre (0-35%) vs graduations (65%+)
- Zone morte (35-65%) où rien ne se passe

**Verdict:** Bien isolé. Seuil 10px robuste pour éviter faux positifs.

---

#### C. DigitalTimer Tap vs Swipe UP
**Risque:** Tap sur digitalTimer pourrait déclencher swipe up.
**Mitigation actuelle:**
- hitSlop étendu sur digitalTimer (+20px) facilite tap précis
- Swipe up nécessite dy < -50px (SWIPE_THRESHOLD)
- isTouchInDial() exclusion (mais digitalTimer HORS dial bounds)

**Point d'attention:** digitalTimer est HORS dialLayoutRef (zone distincte), donc swipe up POSSIBLE depuis digitalTimer zone.
**Test empirique recommandé:** Vérifier si swipe up depuis digitalTimer pill fonctionne (probablement oui, car hors dial bounds).

---

### 3.2 Zones Aveugles

#### A. Nombres Débordants
**Statut:** Tactiles (inclus dans zone C)
**Vérification nécessaire:** Test empirique sur device pour confirmer que tap sur "60" (top, débordant) fonctionne.
**Raison:** Nombres positionnés à `radiusBackground + 18px`, donc dépassent cercle blanc, MAIS restent dans SVG container avec panResponder actif.

---

#### B. Zone Morte (35-65% radius)
**Statut:** Intentionnelle (pas aveugle, juste désactivée)
**Pourquoi:** Évite taps accidentels sur arc progress pendant drag ou exploration visuelle.
**Recommandation:** Acceptable pour UX neuroatypique (clarté zones d'interaction).

---

### 3.3 Incohérences

#### A. activeOpacity Variée
**Observation:** activeOpacity varie selon composants:
- DigitalTimer: `0.8`
- PlayPauseButton: par défaut (`0.2` si non spécifié)
- Autres touchables: `0.7` (convention projet)

**Recommandation:** Standardiser à `0.7` (voir platformStyles.js:39) pour cohérence visuelle.

---

#### B. hitSlop Non Uniforme
**Observation:** hitSlop varie:
- DigitalTimer: `{20, 20, 20, 20}`
- PlayPauseButton: `{12, 12, 12, 12}`
- SettingsButton: `{10, 10, 10, 10}`

**Recommandation:** Acceptable (contextuels). DigitalTimer mérite hitSlop élargi car élément petit en haut d'écran.

---

### 3.4 Performance

#### A. PanResponder Double (Screen + Dial)
**Observation:** Deux PanResponders actifs simultanément:
1. TimerScreen (swipe up)
2. TimerDial (drag/tap)

**Mitigation actuelle:**
- `isTouchInDial()` exclusion précoce (onStartShouldSetPanResponder)
- Dial retourne `true` immédiatement → capture prioritaire

**Verdict:** Architecture propre. Pas de double-handling.

---

#### B. MeasureInWindow (Layout Calculation)
**Observation:** `dialLayoutRef` calculé via `measureInWindow()` (TimerScreen.jsx:169-172)
**Timing:** Appelé une fois au mount de TimeTimer (via `onDialRef` callback)
**Risque:** Rotation screen / resize pourrait invalider bounds

**Point d'attention:** Pas de re-mesure sur orientation change observée dans code.
**Recommandation:** Tester rotation device pour vérifier si `isTouchInDial()` reste valide.

---

## 4. Optimisations Possibles

### 4.1 Standardisation activeOpacity
**Fichier:** Tous les TouchableOpacity
**Changement:** Utiliser constante `platformStyles.activeOpacity` (0.7) partout

**Impact:** Cohérence visuelle améliorée, moins de "magic numbers".

---

### 4.2 Re-mesure Layout sur Orientation Change
**Fichier:** TimerScreen.jsx
**Ajout:** Hook `useScreenOrientation` déjà présent (ligne 26), mais pas utilisé pour re-mesurer dial bounds

**Recommandation:**
```jsx
useEffect(() => {
  if (dialWrapperRef.current && isLandscape !== undefined) {
    handleDialRef(dialWrapperRef.current); // Re-mesure on orientation change
  }
}, [isLandscape]);
```

---

### 4.3 Débug Overlay (Dev Mode)
**Fichier:** TimerDial.jsx
**Ajout:** Overlay visuel des zones tactiles (centre 35%, graduations 65%+) en DEV_MODE

**Exemple:**
```jsx
{__DEV__ && (
  <Circle
    cx={centerX}
    cy={centerY}
    r={radiusBackground * 0.35}
    stroke="red"
    strokeWidth={2}
    fill="none"
    opacity={0.3}
  />
)}
```

---

### 4.4 Haptic Feedback sur Drag
**Fichier:** TimerDial.jsx:148 (onPanResponderMove)
**Ajout:** Haptic léger lors du passage sur graduations majeures pendant drag

**Exemple:**
```jsx
// Détection passage graduation majeure
const currentGraduation = Math.floor(newMinutes);
if (currentGraduation !== lastGraduationRef.current && currentGraduation % 5 === 0) {
  haptics.impactLight();
  lastGraduationRef.current = currentGraduation;
}
```

**Impact:** Feedback tactile subtil lors de l'exploration du dial (style Apple Watch Digital Crown).

---

## 5. Synthèse Technique

### Architecture Globale
- **2 PanResponders:** Screen-level (swipe up) + Dial-level (drag/tap)
- **Exclusion propre:** `isTouchInDial()` basé sur layout measurement
- **Zones concentriques:** Centre (0-35%), Morte (35-65%), Graduations (65%+)
- **Gestures supportés:** Tap, Swipe UP, Drag, Long Press

### Points Forts
- Séparation claire des responsabilités (screen vs dial)
- Résistance drag dynamique avec ease-out (feeling naturel)
- Snap subtil uniquement au release (pas pendant drag)
- Wrap-around prevention robuste
- Accessibility bien implémentée (labels, hints, actions)

### Points d'Amélioration
- Standardiser activeOpacity (0.7 partout)
- Vérifier re-mesure layout sur rotation
- Tester tap sur nombres débordants (empirique)
- Ajouter haptic feedback sur graduations majeures (optionnel)
- Débug overlay pour zones tactiles (dev mode)

### Zones à Risque (Nécessitent Tests Empiriques)
1. Tap sur nombres débordants (60 en haut) → probablement OK mais à confirmer
2. Swipe up depuis digitalTimer zone → probablement OK (hors dial bounds)
3. Layout invalide après rotation → à tester (pas de re-mesure observée)

---

## 6. Extraits de Code Clés

### isTouchInDial (Exclusion Swipe)
```jsx
// TimerScreen.jsx:94-103
const isTouchInDial = (evt) => {
  if (!dialLayoutRef.current) return false;

  const { pageX, pageY } = evt.nativeEvent;
  const { x, y, width: dialWidth, height: dialHeight } = dialLayoutRef.current;

  return pageX >= x && pageX <= x + dialWidth && pageY >= y && pageY <= y + dialHeight;
};
```

### Détection Zones Concentriques
```jsx
// TimerDial.jsx:238-241
const centerZoneRadius = radiusBackground * 0.35; // 35% = centre
const outerZoneMinRadius = radiusBackground * 0.65; // 65%+ = graduations
const isTapOnCenter = distanceFromCenter < centerZoneRadius;
const isTapOnGraduation = distanceFromCenter > outerZoneMinRadius;
```

### Résistance Drag Dynamique
```jsx
// TimerDial.jsx:179-189
const velocity = Math.abs(touchDelta) / (deltaTime / 1000);
const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
const dynamicResistance = DRAG.BASE_RESISTANCE - (velocityFactor * DRAG.VELOCITY_REDUCTION);
const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
const resistedDelta = touchDelta * easedResistance;
```

### Snap au Release
```jsx
// TimeTimer.jsx:133-139
if (isRelease) {
  const { snapToInterval } = require('../../config/snap-settings');
  newDuration = snapToInterval(newDuration, scaleMode);
} else {
  newDuration = Math.round(newDuration); // Drag: round to second
}
```

---

**Fin du rapport.**
