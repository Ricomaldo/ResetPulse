---
created: '2025-12-18'
updated: '2025-12-18'
status: draft
tags: [M1.5, drawer, bottomsheet, simultaneousHandlers, multi-snap]
---

# 2025-12-18 — Drawer Migration avec @gorhom/bottom-sheet (Plan M1.5)

## 🎯 Pivot Architectural

**Découverte ce soir** : Pattern `detached` @gorhom/bottom-sheet fixe les modales
**Intuition demain** : La même lib peut gérer le drawer AsideZone (pivot M1)

### Timeline Migration Stack Gestes

```
M1 (17 déc) : Custom drawer
              - Gesture.Pan() + reanimated
              - Raison: @gorhom incompatible (pensait-on)
              ↓
M1.5 (19 déc) : @gorhom drawer (HYPOTHESIS)
                - BottomSheet multi-snap
                - BottomSheetScrollView
                - simultaneousHandlers pour carousels
                ↓
M2+ : Modales avec pattern detached (déjà validé ce soir)
```

## 🔑 Pattern Drawer Multi-Snap

### Configuration de Base

```jsx
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

const AsideZoneDrawer = ({ visible, onClose }) => {
  // 3 snap points : fermé, 38%, 90%
  const snapPoints = useMemo(() => ['1%', '38%', '90%'], []);

  // Index contrôlé par visible prop
  // 0 = fermé (1%), 1 = défaut (38%), 2 = étendu (90%)
  const [index, setIndex] = useState(visible ? 1 : 0);

  return (
    <BottomSheet
      index={index}
      snapPoints={snapPoints}
      onChange={(idx) => {
        if (idx === 0) onClose(); // Snap à 1% = fermeture
      }}
      enablePanDownToClose={true}

      // Pas detached pour drawer (fullscreen anchored)
      detached={false}

      // Gestion des gestes simultanés (scroll + horizontal swipe)
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
    >
      <BottomSheetScrollView>
        {/* Contenu scrollable vertical */}

        {/* Carousels horizontaux (FlatList ou custom) */}
        <BottomSheetFlatList
          horizontal
          data={items}
          // La lib gère les conflits gestes automatiquement
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
```

## 🎨 Gestes Simultanés (simultaneousHandlers)

### Le Problème
Drawer avec :
- Scroll vertical (contenu long)
- Swipe horizontal (carousels)
- Swipe vertical (drag drawer entre snap points)

**Risque** : Conflits de gestes (quel handler gagne ?)

### La Solution @gorhom

**Built-in** : La lib gère automatiquement les conflits avec ces composants :
- `BottomSheetScrollView` → Scroll vertical prioritaire quand contenu scrollable
- `BottomSheetFlatList` → Horizontal swipe si `horizontal={true}`
- `BottomSheetSectionList` → Sections scrollables

**Custom handlers** : Si besoin de PanGestureHandler custom (ex: notre ActivityCarousel) :

```jsx
import { Gesture } from 'react-native-gesture-handler';

const bottomSheetRef = useRef();

// Custom gesture (ex: carousel)
const carouselGesture = Gesture.Pan()
  .onUpdate((e) => {
    // Logic carousel
  })
  .simultaneousWithExternalGesture(bottomSheetRef); // ← Clé !

return (
  <BottomSheet ref={bottomSheetRef}>
    <GestureDetector gesture={carouselGesture}>
      {/* Carousel custom */}
    </GestureDetector>
  </BottomSheet>
);
```

**Doc** : https://gorhom.dev/react-native-bottom-sheet/gesture-handling

## 📋 Migration Steps (Draft)

### Phase 1 : Test BottomSheet Multi-Snap (30min)
- [ ] Créer `AsideZone.bottomsheet.jsx` (test à côté de AsideZone.jsx actuel)
- [ ] Config 2 snap points : `['38%', '90%']`
- [ ] Tester drag entre snap points
- [ ] Valider animation fluide

### Phase 2 : Intégrer Contenu (1h)
- [ ] BottomSheetScrollView pour container
- [ ] Migrer CommandBar dedans (buttons statiques)
- [ ] Tester scroll si contenu dépasse 38%

### Phase 3 : Carousels Horizontaux (1h30)
**Option A** : BottomSheetFlatList (recommandé)
```jsx
<BottomSheetFlatList
  horizontal
  data={activities}
  renderItem={ActivityItem}
/>
```

**Option B** : Custom avec simultaneousHandlers
- Garder notre ActivityCarousel actuel
- Wrapper avec simultaneousWithExternalGesture

### Phase 4 : Polish UX (30min)
- [ ] Handle custom (barre 50x5px)
- [ ] Background style (surface + border iOS)
- [ ] Backdrop si snap à 90% (optionnel)
- [ ] Haptics au snap (useBottomSheetSpringConfigs)

### Phase 5 : Replace AsideZone.jsx (15min)
- [ ] Rename AsideZone.jsx → AsideZone.legacy.jsx
- [ ] Rename AsideZone.bottomsheet.jsx → AsideZone.jsx
- [ ] Update imports TimerScreen
- [ ] Test complet

**Durée estimée totale** : 3h30 (vs M1 custom: 3h réel)

## 🎁 Avantages vs Custom Drawer

| Aspect | Custom (M1) | @gorhom (M1.5) |
|--------|-------------|----------------|
| **Code** | ~200 lignes gesture logic | ~80 lignes config |
| **Gestes** | Manual conflict resolution | Built-in simultaneousHandlers |
| **Animations** | withSpring custom | Native 60fps optimized |
| **Snap points** | Custom math | Declarative array |
| **Scroll** | Manual clamp | BottomSheetScrollView |
| **Maintenance** | Custom bugs | Community-supported lib |
| **Features** | Basic | Overscroll, haptics, dynamic sizing, etc. |

## 🔗 Ressources Clés

**Doc officielle v5** :
- Multi-snap: https://gorhom.dev/react-native-bottom-sheet/snap-points
- Gesture handling: https://gorhom.dev/react-native-bottom-sheet/gesture-handling
- Scrollables: https://gorhom.dev/react-native-bottom-sheet/scrollables
- Simultaneous gestures: https://gorhom.dev/react-native-bottom-sheet/troubleshooting

**GitHub Examples** :
- Multi-snap demo: https://github.com/gorhom/react-native-bottom-sheet/tree/master/example
- Nested scrollables: Search issues "horizontal FlatList"

**Devlog ce soir** :
- `_internal/cockpit/knowledge/devlog/2025-12-18_bottomsheet-modal-pattern.md`
- Pattern detached pour modales (déjà validé)

## 🎯 Success Criteria

**Validation M1.5** :
1. ✅ Swipe up ouvre drawer à 38%
2. ✅ Swipe up again → 90%
3. ✅ Swipe down → 38% → fermé
4. ✅ Scroll vertical fonctionne si contenu > snap height
5. ✅ Carousels horizontaux swipables sans conflit
6. ✅ Animation 60fps fluide
7. ✅ Tooltip + handle visibles
8. ✅ Code plus simple que M1 custom

**Si échec** : Rollback vers AsideZone.legacy.jsx (custom drawer M1)

## 💡 Notes pour Eric (Demain Matin)

**Mindset** : Explorer, pas réécrire tout de suite
- Créer AsideZone.bottomsheet.jsx **à côté** (pas remplacer)
- Tester snap points d'abord (phase 1)
- Si ça marche mal → garder custom drawer M1
- Si ça marche bien → migrer en phases 2-5

**Pattern découvert ce soir** :
```jsx
// Modales simples (Settings, Premium)
<BottomSheet detached={true} snapPoints={['90%']} />

// Drawer multi-snap (AsideZone demain)
<BottomSheet detached={false} snapPoints={['38%', '90%']} />
```

**Différence clé** : `detached={false}` pour drawer ancré en bas

**Bonus** : Si migration réussit, on aura :
- 1 lib pour drawer + modales (cohérence)
- Template réutilisable toutes apps futures
- Community support (bugs, features, updates)

**Estimation ROI** :
- Temps investi : ~4h (ce soir + demain)
- Temps économisé future : ~10h (bugs custom, maintenance, nouvelles apps)
- Ratio : 1:2.5 🚀

---

**Next Step** : Lire doc Gesture Handling + Scrollables (15min) puis coder phase 1

**Checkpoint** : Si phase 1 OK → continuer. Si KO → keep custom drawer (no regrets).

Bonne nuit ! 😴
