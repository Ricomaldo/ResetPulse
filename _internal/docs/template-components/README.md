---
created: '2025-12-19'
updated: '2025-12-19'
type: documentation
status: active
---

# Component Templates

Templates réutilisables de composants avec patterns avancés.

## 📚 Templates disponibles

### BottomSheetMultiSnapFade.template.jsx

**Pattern**: BottomSheet multi-snap avec transitions fade entre layers

**Stack**:
- `@gorhom/bottom-sheet` ^5.0.5
- `react-native-reanimated` ^4.1.6
- `react-native-gesture-handler` ^2.21.2

**Use cases**:
- Drawer avec changement de contenu fluide
- Navigation multi-niveau dans un sheet
- Toolbox progressive (favorite → tools → all options)

**Architecture**:
- 4 snap points (closed / small / medium / large)
- 3 layers superposés avec fade transitions
- Container height animé (effet "grandir depuis le bas")
- Scroll conditionnel (disabled aux petits snaps)

**Key features**:
- ✅ Transitions fade smooth entre layers
- ✅ Effet "recouvrir depuis le haut" (pas de stack vertical)
- ✅ Pas de JSX conditionnel (approche doc Gorhom)
- ✅ Gestures protection (NativeViewGestureHandler)
- ✅ Auto-collapse sur trigger externe
- ✅ **100% responsive** (iPhone SE → iPad, calculé en % screen height)

**Origine**: Créé pour ResetPulse AsideZone (ADR-005 v2, ADR-006)

**Date**: 2025-12-19

**Authors**: Eric Zuber & Claude Sonnet 4.5

---

## 🎯 Comment utiliser un template

1. **Copier le fichier template** dans votre projet
2. **Renommer** le fichier (retirer `.template`)
3. **Adapter**:
   - Couleurs (remplacer dev colors)
   - Hauteurs des layers (selon votre design)
   - Snap points (selon vos besoins)
   - Contenu des layers (remplacer wrappers dev par vos composants)
4. **Tester** les transitions
5. **Polir** les timings d'animation si besoin

---

## 🔗 Références

| Document | Description |
|----------|-------------|
| ADR-005 | Architecture DialZone/AsideZone (3-snap pattern) |
| ADR-006 | Stack Gestes & Animations (Gorhom migration) |
| Gorhom Doc Research | `_internal/cockpit/knowledge/findings/2025-12-19_gorhom-bottomsheet-doc-research.md` |

---

## 💡 Patterns réutilisables

### Pattern 1: Layers superposés avec fade

```javascript
<Animated.View style={containerHeightStyle}>
  <Animated.View style={[absolute, layer1Style, opacityStyle1]} />
  <Animated.View style={[absolute, layer2Style, opacityStyle2]} />
  <Animated.View style={[absolute, layer3Style, opacityStyle3]} />
</Animated.View>
```

**Avantages**:
- Effet "recouvrir" au lieu de "remplacer"
- Transitions fluides sans saut visuel
- Pas de re-render du contenu (toujours présent)

### Pattern 2: Container height animé

```javascript
const containerHeightStyle = useAnimatedStyle(() => ({
  height: interpolate(
    animatedIndex.value,
    [0, 1, 2, 3],
    [0, 60, 200, 600]
  )
}));
```

**Avantages**:
- Effet "grandir depuis le bas"
- Contrôle précis de la taille visible
- Combine bien avec fade transitions

### Pattern 3: useBottomSheet() pour animations

```javascript
function SheetContent() {
  const { animatedIndex } = useBottomSheet(); // Access sheet position

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [...], [...])
  }));
}
```

**Avantages**:
- Accès direct à la position du sheet en temps réel
- Pas besoin de state management manuel
- Interpolation smooth automatique

---

## 📱 Responsive Strategy

Tous les templates utilisent **Dimensions.get('window').height** pour calculer les hauteurs dynamiquement.

### Pourquoi pas de pixels hardcodés?

❌ **Mauvais** (hardcodé):
```javascript
const LAYER_HEIGHT = 60; // Trop petit sur iPad, trop grand sur iPhone SE
```

✅ **Bon** (responsive):
```javascript
const SCREEN_HEIGHT = Dimensions.get('window').height;
const LAYER_HEIGHT = SCREEN_HEIGHT * 0.08; // 8% de l'écran
```

### Résultats sur différents devices:

| Device | Screen Height | Layer 8% | Container 10% | Container 32% | Container 80% |
|--------|---------------|----------|---------------|---------------|---------------|
| iPhone SE | 667px | 53px | 67px | 213px | 534px |
| iPhone 14 | 844px | 68px | 84px | 270px | 675px |
| iPhone 14 Pro Max | 932px | 75px | 93px | 298px | 746px |
| iPad | 1366px | 109px | 137px | 437px | 1093px |

**Avantages**:
- ✅ S'adapte automatiquement à tous les devices
- ✅ Maintient les proportions visuelles
- ✅ Fonctionne en portrait et landscape
- ✅ Pas de magic numbers

---

## 🚀 Prochains templates potentiels

- [ ] BottomSheetWithCarousels (horizontal scroll + vertical sheet)
- [ ] BottomSheetModal (detached pattern pour modals)
- [ ] BottomSheetWithBackdrop (custom backdrop avec blur)
- [ ] BottomSheetDynamicSnap (snap points basés sur contenu)

---

## 📝 Notes

- Tous les templates sont documentés avec commentaires inline
- Architecture decisions expliquées dans chaque fichier
- Troubleshooting section incluse
- Usage examples fournis

**Vive Gorhom! Vive nous! 🎉**
