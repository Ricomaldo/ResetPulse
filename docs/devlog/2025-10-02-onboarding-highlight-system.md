# DevLog - Système d'Onboarding & Highlight

**Date:** 2025-10-02
**Status:** ⚠️ En cours - Pause technique
**Version:** v1.0.4 (Foundation)

---

## 🎯 Objectif Initial

Implémenter un système d'onboarding fluide avec tooltips séquentiels et highlight spotlight pour guider l'utilisateur lors du premier lancement de l'app.

### Flow souhaité (de haut en bas)
1. **Activities** → "Sélectionnez votre activité"
2. **Dial** → "Ajustez la durée du timer"
3. **Controls** → "Démarrez, mettez en pause, ou réinitialisez" + subtext
4. **Palette** → "Vous pouvez aussi changer les couleurs"

---

## ✅ Ce qui a été fait

### 1. Architecture de base
- ✅ `WelcomeScreen.jsx` : Modal de premier lancement avec logo
- ✅ `Tooltip.jsx` : Composant réutilisable avec flèches SVG, support subtext
- ✅ `OnboardingController.jsx` : Context API pour gérer état et séquence
- ✅ `HighlightOverlay.jsx` : Système de highlight avec découpe (topOverlay + bottomOverlay)
- ✅ Intégration dans `App.js` avec détection first launch
- ✅ Bouton "Relancer le guide" dans SettingsModal (accessible utilisateur)

### 2. Système de highlight "spotlight"
**Concept correctement implémenté:**
```
┌─────────────────────────────────┐
│   Overlay noir rgba(0,0,0,0.6)  │ ← Zone dimmed
├─────────────────────────────────┤
│   ZONE CIBLE (pleine lumière)   │ ← Pas d'overlay ici
├─────────────────────────────────┤
│   Overlay noir rgba(0,0,0,0.6)  │ ← Zone dimmed
└─────────────────────────────────┘
```

**Implémentation:**
- 2 rectangles : `topOverlay` (0 → targetTop) + `bottomOverlay` (targetBottom → screenHeight)
- Zone cible reste visible en pleine lumière (pas couverte)
- Tooltip en zIndex 100 (au-dessus de tout)

### 3. Séquence logique inversée
- ✅ Tooltips 3 ↔ 4 inversés (Controls avant Palette)
- ✅ Texte palette changé : "Vous pouvez aussi changer les couleurs"
- ✅ Flow descendant cohérent avec découverte progressive

### 4. Enregistrement des bounds
- ✅ `registerTooltipTarget(id, position, bounds)` étendu
- ✅ Bounds = `{ top, left, width, height }` en coordonnées absolues
- ✅ Utilisation de `measure()` pour Activities, Dial, Palette
- ✅ Utilisation de `ref.measure()` pour Controls (avec setTimeout 200ms)

### 5. Nettoyage du code
- ✅ Suppression des `opacity/zIndex` conditionnels manuels
- ✅ Le dimming est géré par l'overlay, pas par les composants
- ✅ Composants gardent leur opacity normale

---

## ⚠️ Problèmes actuels (non résolus)

### Bug #1: Tooltips 3 & 4 invisibles
**Symptôme:** Après tooltip #2 (Dial), les tooltips #3 (Controls) et #4 (Palette) ne s'affichent pas.

**Hypothèses:**
1. `bounds` non enregistrés correctement pour Controls/Palette
2. `measure()` appelé trop tôt (composant pas encore monté)
3. Conditions de guard (`registeredTooltips.current`) bloquent l'enregistrement
4. Position calculée hors écran ou masquée

**Debug nécessaire:**
- Ajouter `console.log` dans `registerTooltipTarget` pour vérifier enregistrement
- Vérifier `tooltipBounds` dans OnboardingController
- Tester sans timeout pour Controls
- Vérifier si `currentBounds` est `null` pour tooltips 3/4

### Bug #2: Positioning complexe et instable
**Contexte:** Après 1h+ de galère sur positionnement relatif vs absolu.

**Problème fondamental:**
- Layout actuel utilise Flexbox imbriqué avec `Animated.View`
- Difficile de mesurer positions absolues de manière fiable
- `measure()` asynchrone, timing incertain
- Animations entrance interfèrent avec mesures

**Solution envisagée mais non implémentée:**
Utiliser un **layout Grid** au lieu de Flexbox pour:
- Positions fixes et prévisibles des zones
- Faciliter calcul des bounds
- Simplifier le système de highlight
- Réduire dépendance aux `measure()` asynchrones

---

## 🔄 Ce qu'il reste à faire

### Priorité 1: Débug tooltips 3 & 4
1. Ajouter logs détaillés dans enregistrement bounds
2. Vérifier timing des `measure()` calls
3. Tester avec positions fixes hardcodées pour isoler le problème
4. Vérifier séquence `nextTooltip()` dans OnboardingController

### Priorité 2: Refactoring Layout (optionnel mais recommandé)
**Si le positionnement reste chaotique:**
1. Migrer TimerScreen vers layout Grid
2. Définir zones fixes : header, activities, timer, controls, palette
3. Simplifier calcul bounds avec positions Grid connues
4. Réduire complexité et améliorer maintenabilité

### Priorité 3: Polish & Tests
1. Tester sur différents devices (iPhone SE, Pro Max)
2. Vérifier responsive avec `rs()`
3. Animations fluides entre tooltips
4. Gestion edge cases (showActivities false, etc.)

---

## 📝 Notes techniques importantes

### Structure des données
```javascript
// Position pour tooltip
position = {
  top: number,      // Position Y du tooltip
  left: number      // Position X du tooltip (ignoré si centré)
}

// Bounds pour highlight
bounds = {
  top: number,      // Y absolu de la zone
  left: number,     // X absolu de la zone
  width: number,    // Largeur de la zone
  height: number    // Hauteur de la zone
}
```

### Séquence d'enregistrement actuelle
1. **Activities** : `onLayout` → `measure()` → enregistrement
2. **Dial** : `onLayout` → réutilise position Activities → `measure()` → enregistrement
3. **Controls** : `onControlsRef` → `setTimeout(200ms)` → `ref.measure()` → enregistrement
4. **Palette** : `onLayout` → `measure()` → enregistrement

### Points d'attention
- ⚠️ `measure()` retourne coordonnées **relatives** (fx, fy) + **absolues** (pageX, pageY)
- ⚠️ Utiliser **pageX/pageY** pour bounds (pas fx/fy)
- ⚠️ Guards avec `registeredTooltips.current[id]` peuvent bloquer si mal placés
- ⚠️ `Animated.View` peut interférer avec measure si animation en cours
- ⚠️ Tooltips centrés horizontalement (left: 0, right: 0, alignItems: 'center')

---

## 🎨 Design System utilisé

### Constantes
- `TRANSITION.SHORT / MEDIUM` pour animations
- `theme.colors.brand.primary` pour bordures
- `theme.spacing.md / lg` pour paddings
- `rs(value, 'height'|'width'|'min')` pour responsive

### Z-Index hierarchy
- Overlay: default (0)
- Highlighted elements: pas de zIndex spécial (overlay les encadre)
- Tooltip: zIndex 100
- Skip button: zIndex 1000

---

## 🔧 Fichiers modifiés

### Créés
- `src/components/onboarding/WelcomeScreen.jsx`
- `src/components/onboarding/Tooltip.jsx`
- `src/components/onboarding/OnboardingController.jsx`
- `src/components/onboarding/HighlightOverlay.jsx`

### Modifiés
- `src/screens/TimerScreen.jsx` : Ajout refs, enregistrement bounds, suppression opacity conditionnels
- `src/components/TimeTimer.jsx` : Ajout `onControlsRef`, suppression highlight props
- `src/components/SettingsModal.jsx` : Bouton "Relancer le guide"
- `App.js` : Intégration WelcomeScreen + OnboardingProvider

---

## 💡 Réflexions & Leçons

### Ce qui a bien fonctionné
- Architecture Context API claire et extensible
- Système tooltip réutilisable avec SVG arrows
- Concept highlight spotlight correctement compris après clarification

### Ce qui a été difficile
- **Positionnement** : 1h+ de galère entre relatif/absolu, measure asynchrone
- **Timing** : `onLayout` vs `measure()` vs `setTimeout` très instable
- **Debug** : Difficile de visualiser bounds et positions en temps réel
- **Flexbox complexe** : Animations + nesting rendent calculs imprévisibles

### Recommandations futures
1. **Privilégier Grid layout** pour UI avec zones fixes
2. **Ajouter dev tools** pour visualiser bounds/positions (overlay debug)
3. **Simplifier animations** pendant onboarding (ou désactiver)
4. **Hardcoder positions** si measure() trop instable
5. **Tests visuels fréquents** sur device réel, pas que simulateur

---

## 📦 Prochaine session

**Objectifs:**
1. Debug tooltips 3 & 4 manquants
2. Décider si refactor layout Grid ou continuer avec Flexbox
3. Finaliser positioning stable
4. Tests complets sur devices
5. **Rédiger documentation référence** pour onboarding system

**Questions à résoudre:**
- Grid layout vaut-il le refactor ?
- Peut-on simplifier measure() avec positions fixes ?
- Faut-il un mode debug visuel pour bounds ?

---

**Status final:** Système à 70% fonctionnel. Tooltips 1-2 OK, 3-4 manquants. Highlight spotlight implémenté correctement. Besoin debug + stabilisation positioning.
