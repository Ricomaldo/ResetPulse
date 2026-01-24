---
created: '2026-01-23'
updated: '2026-01-23'
status: active
tags: [adr, ux, bottom-sheet, gestures, aside-zone, gorhom]
---

# ADR-013: Bottom Sheet 3-Snaps Architecture

## Status
**Active** — Implemented in v2.1.0

## Context

ResetPulse utilise un **AsideZone drawer** pour afficher les commandes utilisateur en 3 niveaux de complexité :
1. **Favorite Tool** (18%) — Outil favori rapide (1 commande visible)
2. **ToolBox** (32%) — 3 outils principaux (ActivityCarousel, PaletteCarousel, PresetPills)
3. **Settings Panel** (90%) — Paramètres complets de l'app

### Problème identifié

**Migration nécessaire** : PanResponder custom → @gorhom/bottom-sheet
- PanResponder custom difficile à maintenir (gesture conflicts, animations, snap logic)
- @gorhom/bottom-sheet v5 offre API robuste + gesture handling optimisé
- Besoin de **3 snap points distincts** avec fade transitions entre layers

### Contraintes techniques

1. **Horizontal scroll** : ActivityCarousel et PaletteCarousel doivent scroller horizontalement sans conflit avec le drag vertical du sheet
2. **Scroll vertical au snap 3** : SettingsPanel scrollable verticalement sans conflit avec le drag du sheet
3. **Animations fluides** : Fade in/out des layers basé sur snap position
4. **Responsive** : Snap points en % pour s'adapter à toutes tailles d'écran

---

## Decision

### Architecture 3-Snaps

**Snap Points** : `['18%', '32%', '90%']`

| Snap | Height | Layer Visible | Use Case |
|------|--------|---------------|----------|
| **0** | 18% | FavoriteToolBox (turquoise) | Timer running → collapsed state, favorite tool accessible |
| **1** | 32% | ToolBox (pourpre) | User explores activities, palettes, presets |
| **2** | 90% | SettingsPanel (mandarine) | User configures app settings |

### Snap Behavior: Natural Flow (No Blocking)

**Decision**: **Abandon du snap blocking** pour comportement natif fluide

**Rationale** :
- Initial plan: Forcer pause au snap 1 (32%) pour éviter skip accidentel
- Après tests: Comportement natif plus fluide, blocking créait friction UX
- Users peuvent swipe rapidement entre snaps sans contrainte artificielle

**Implementation** :
```javascript
// NO onAnimate blocking, NO snap locking
// Natural gorhom/bottom-sheet behavior (smooth drag between snaps)
onChange={(index) => setCurrentSnapIndex(index)}
```

### Gesture Configuration

**Horizontal Scroll** (ActivityCarousel, PaletteCarousel) :
```javascript
activeOffsetY={[-10, 10]}      // Require 10px vertical before capturing sheet gesture
failOffsetX={[-10, 10]}        // Allow horizontal scroll (fail sheet gesture if horizontal)
simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}
```

**Vertical Scroll at Snap 2** (SettingsPanel) :

**Problem identified** : Gesture conflict entre scroll vertical du SettingsPanel et drag du sheet pour fermer

**Solution** : Option C (Combined approach)
1. **Increase vertical threshold** : `activeOffsetY={[-20, 20]}` → Sheet ne réagit que si drag > 20px
2. **Conditional content panning** : Désactiver pan depuis contenu au snap 2
   ```javascript
   enableContentPanningGesture={currentSnapIndex !== 2}
   ```
   → Au snap 2 (90%), scroll libre du SettingsPanel, drag du **handle** pour fermer

### Animation Configuration

**Spring config** (smooth, natural feel) :
```javascript
const animationConfigs = useBottomSheetSpringConfigs({
  damping: 80,               // Less bouncy (vs default 50)
  stiffness: 450,            // Moderate speed (vs default 500)
  overshootClamping: true,   // No overshoot
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
});
```

### Layer Transitions (Fade Animations)

**Opacity interpolations** basées sur `animatedIndex` :

| Layer | Snap 0 (18%) | Snap 1 (32%) | Snap 2 (90%) |
|-------|--------------|--------------|--------------|
| **FavoriteToolBox** | opacity: 1 | opacity: 0 | opacity: 0 |
| **ToolBox** | opacity: 0 | opacity: 1 | opacity: 0 |
| **SettingsPanel** | opacity: 0 | opacity: 0 | opacity: 1* |

*Note: SettingsPanel fade démarre à `animatedIndex: 1.8` (80% du trajet vers snap 2) pour éviter preview prématuré

### Auto-Collapse Behavior

**Quand timer démarre** : Auto-collapse à snap 0 (18%)
```javascript
useEffect(() => {
  if (isTimerRunning && bottomSheetRef.current) {
    bottomSheetRef.current.snapToIndex(0); // Collapse to favorite tool
  }
}, [isTimerRunning]);
```

**Rationale** : Focus utilisateur sur le timer, favorite tool reste accessible pour contrôle rapide

---

## Consequences

### ✅ Positives

1. **Maintenance simplifiée** : Librairie robuste vs custom PanResponder (500+ lignes code éliminées)
2. **Gesture handling optimisé** : Horizontal scroll + vertical scroll sans conflicts
3. **Animations fluides** : Transitions natives + fade customs performantes
4. **Responsive** : Snap points en % s'adaptent à toutes tailles d'écran
5. **UX naturelle** : Pas de snap blocking, flow fluide entre layers
6. **Scroll fiable au snap 2** : Solution Option C élimine confusion gesture

### ⚠️ Trade-offs

1. **Dépendance librairie** : @gorhom/bottom-sheet + react-native-reanimated
   - **Mitigation** : Librairie mature (v5+), maintenance active, large adoption

2. **Complexité gesture config** : activeOffsetY, failOffsetX, simultaneousHandlers
   - **Mitigation** : Bien documenté dans code + ADR

3. **No snap blocking** : Users peuvent skip snap 1 rapidement
   - **Acceptable** : Tests montrent comportement naturel préféré

### 🔄 Alternatives considérées

**Alternative 1** : 2 snap points (18% + 90%, skip ToolBox)
- ❌ **Rejeté** : ToolBox (32%) est layer principal (activities, palettes, presets), ne peut être skippé

**Alternative 2** : Modal pour SettingsPanel au lieu de snap 3
- ❌ **Rejeté** : Cohérence UX (drawer unifié), moins de composants à gérer

**Alternative 3** : Snap blocking forcé au snap 1
- ❌ **Rejeté** : Friction UX, comportement naturel préféré après tests

**Alternative 4** : Scroll vertical au snap 2 via option A uniquement (activeOffsetY)
- ❌ **Rejeté** : Pas assez robuste, Option C (combined) élimine tous cas edge

---

## Related

- **Component** : `src/components/layout/AsideZone.jsx`
- **Librairie** : [@gorhom/bottom-sheet v5](https://gorhom.dev/react-native-bottom-sheet/)
- **Research** : `_internal/cockpit/knowledge/findings/2025-12-19_gorhom-bottomsheet-doc-research.md`
- **ADR-006** : Timer Core & Reanimated (foundation pour animations)

---

## Implementation Notes

### Files Modified (v2.1.0)

1. **src/components/layout/AsideZone.jsx** (complete rewrite)
   - Migration PanResponder → @gorhom/bottom-sheet
   - 3 snap points: 18% / 32% / 90%
   - Gesture configs: activeOffsetY, failOffsetX, simultaneousHandlers
   - Fade animations: FavoriteToolBox, ToolBox, SettingsPanel
   - Auto-collapse on timer start

2. **_internal/docs/decisions/ADR-013-bottom-sheet-3-snaps.md** (NEW)
   - Ce document

### Gesture Conflict Solutions

**Horizontal Scroll (Carousels)** :
- `failOffsetX={[-10, 10]}` : Sheet gesture fails si horizontal movement
- `simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}` : Allow simultaneous pan

**Vertical Scroll (SettingsPanel at snap 2)** :
- `activeOffsetY={[-20, 20]}` : Increase threshold (10px → 20px)
- `enableContentPanningGesture={currentSnapIndex !== 2}` : Disable content pan at snap 2
- **Result** : Scroll libre du SettingsPanel, drag handle pour fermer

### Testing Checklist

**Manual test checklist** :
- [ ] Snap 0 (18%) : FavoriteToolBox visible, fade out vers snap 1
- [ ] Snap 1 (32%) : ToolBox visible, horizontal scroll carousels fonctionne
- [ ] Snap 2 (90%) : SettingsPanel visible, scroll vertical fonctionne
- [ ] Drag handle depuis snap 2 : Ferme le sheet (snapToIndex 0 ou 1)
- [ ] Auto-collapse : Timer démarre → snap 0 automatique
- [ ] Gestures : Pas de conflict entre horizontal scroll et vertical drag
- [ ] Responsive : Snap points adaptés sur iPhone SE, iPhone Pro Max, iPad

**Platform testing** :
- [ ] iOS : All gestures smooth
- [ ] Android : Horizontal scroll OK (simultaneousHandlers)

---

## Future Considerations

### Possible Enhancements

1. **Backdrop au snap 2** : Dimming effect quand SettingsPanel est ouvert (snap 90%)
   - **Pro** : Focus visuel sur settings
   - **Con** : Drawer permanent, pas modal (backdrop peut sembler trop "modal-like")
   - **Decision** : À tester si feedback utilisateurs demande plus de focus

2. **Haptic feedback** : Vibration subtile lors des snap transitions
   - **Pro** : Feedback tactile clair du changement de snap
   - **Con** : Peut être intrusif si trop fréquent
   - **Decision** : À tester avec `haptics.selection()` sur `onChange`

3. **Snap point dynamique** : Ajuster snap 2 height basé sur contenu SettingsPanel
   - **Pro** : Optimisation espace si settings peu nombreux
   - **Con** : Complexité, snap 2 à 90% déjà confortable
   - **Decision** : Pas prioritaire, 90% fonctionne bien

4. **Gesture tutorial** : Onboarding pour expliquer 3 snaps
   - **Pro** : Users découvrent les 3 layers rapidement
   - **Con** : Onboarding déjà chargé (6 étapes)
   - **Decision** : À considérer si analytics montrent low engagement snap 1/2

---

**Auteur** : Claude Sonnet 4.5
**Date** : 2026-01-23
**Version** : ResetPulse v2.1.6
