---
created: '2025-12-18'
updated: '2025-12-18'
status: active
tags: [ADR-006, gesture-stack, bottomsheet, modals, M1-drawer, pattern]
---

# 2025-12-18 — @gorhom/bottom-sheet Pattern Discovery

## 🎯 Le Problème

Migration stack gestes (ADR-006) : Créer SettingsModal avec `@gorhom/bottom-sheet` pour remplacer le modal React Native standard. **Objectif** : Swipe to dismiss + template pour tous les modaux (paywall, discovery, etc.).

**Comportement voulu** : Tap icon ⚙️ → Ouverture instantanée à 90%

**Comportement obtenu (7 itérations)** : Modal s'ouvre à ~15% (peek state), nécessite swipe up pour atteindre 90%.

## 🔍 Les Fausses Pistes (2h de debugging)

### Tentative 1-3 : BottomSheetModal avec `visible` state
```jsx
<BottomSheetModal snapPoints={['90%']} index={0}>
```
**Résultat** : Peek à 15% persistant
**Essayé** :
- `animateOnMount={false}` → Aucun effet
- `animationConfigs={{ duration: 1 }}` → Change vitesse du swipe (mauvais fix)
- `snapPoints={['1%', '90%']} + index={1}` → Même comportement

### Tentative 4-5 : Contrôle backdrop
```jsx
<BottomSheetBackdrop appearsOnIndex={1} disappearsOnIndex={-1} />
```
**Hypothèse** : Animation backdrop force le sheet à animer
**Résultat** : Aucun changement

### Tentative 6 : Pattern impératif avec ref
```jsx
const modalRef = useRef();
modalRef.current?.present();
```
**Inspiration** : Exemple YouTube officiel
**Résultat** : Toujours peek à 15%

## ✅ La Solution : `BottomSheet` + `detached={true}`

**Source** : Doc officielle @gorhom/bottom-sheet v5 (https://gorhom.dev/react-native-bottom-sheet/)

```jsx
<BottomSheet
  index={visible ? 0 : -1}
  snapPoints={['90%']}
  enablePanDownToClose={true}
  enableDynamicSizing={false}
  detached={true}              // 🔑 Clé du succès
  bottomInset={46}
  style={styles.sheetContainer} // marginHorizontal pour effet détaché
  backdropComponent={renderBackdrop}
>
  <BottomSheetView style={styles.container}>
    {/* Contenu */}
  </BottomSheetView>
</BottomSheet>
```

### Différences Critiques

| Pattern | Composant | Contrôle | Mount | Peek Bug |
|---------|-----------|----------|-------|----------|
| **Modal** | `BottomSheetModal` | `.present()` / `.dismiss()` | Needs provider | ✗ Oui |
| **Detached** | `BottomSheet` | `index={visible ? 0 : -1}` | Always mounted | ✓ Non |

### Props Clés

```jsx
// Container style avec margins
const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: theme.spacing.md, // Effet "détaché"
    borderRadius: rs(20),
    ...theme.shadow('xl'),
  },
});

// Backdrop custom
const renderBackdrop = useCallback(
  (props) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
      pressBehavior="none" // Pas de tap to close
    />
  ),
  []
);
```

## 🧠 Insights Techniques

### BottomSheetModal vs BottomSheet

**BottomSheetModal** :
- Conçu pour overlays fullscreen (portals)
- Animation progressive hardcodée (peek → expand)
- Nécessite `BottomSheetModalProvider`
- Contrôle impératif (`.present()`)

**BottomSheet** :
- Composant standard, toujours dans le tree
- Contrôle déclaratif (`index` prop)
- Pas de provider requis
- `detached={true}` → comportement "modal-like" sans les bugs

### Pourquoi `detached` fixe le peek ?

**Hypothèse** : Le mode fullscreen (non-detached) déclenche une animation progressive pour éviter un "pop" brutal. Le mode `detached` traite le sheet comme un composant indépendant qui peut apparaître directement à sa position finale.

### Dynamic Sizing (Bonus pour M3+)

Pour drawer multi-snap (15% → 38% → 90%) :

```jsx
<BottomSheet
  enableDynamicSizing={true}
  maxDynamicContentSize={screenHeight * 0.9}
>
  <BottomSheetView>
    {/* Lib calcule automatiquement la hauteur */}
  </BottomSheetView>
</BottomSheet>
```

**Use case** : AsideZone avec CommandBar + CarouselBar intégrés (M3). La hauteur s'adapte dynamiquement au contenu au lieu de snap points fixes.

## 📦 Livrables

### 1. SettingsModal V2 (Production)
**Fichier** : `src/components/modals/SettingsModal.jsx`
- Pattern `BottomSheet` + `detached={true}`
- Contrôle via `visible` prop
- Backdrop custom (pas de tap to close)
- Styles production (surface, border iOS, shadow XL)
- Handle custom (50x5px, opacity 0.8)

### 2. Template Réutilisable
**Fichier** : `src/components/modals/BottomSheet.template.jsx`
- Pattern documenté pour tous les modaux futurs
- Props configurables (snapPoints, backdrop, styles)
- Comments inline expliquant chaque prop

## 🔗 Liens avec Architecture

### ADR-006 : Stack Gestes
**Décision** : `react-native-gesture-handler` + `reanimated` + `@gorhom/bottom-sheet`

**Impact M1 (Drawer)** : Pivot architectural — `@gorhom/bottom-sheet` incompatible avec drawer intégré dans container (ADR-005). Solution : Drawer custom avec `Gesture.Pan()`.

**Impact M2+ (Modals)** : Pattern `detached` compatible avec modaux overlay. Pas de pivot nécessaire.

### Cohérence Pattern

| Composant | Librairie | Pattern | Pourquoi |
|-----------|-----------|---------|----------|
| **AsideZone Drawer** | `Gesture.Pan()` + `reanimated` | Custom | Bottom sheet incompatible avec container layout |
| **Settings Modal** | `@gorhom/bottom-sheet` | Detached | Overlay fullscreen, pas de contrainte layout |
| **Premium Modal** | `@gorhom/bottom-sheet` | Detached | Template cohérent |
| **Discovery Modal** | `@gorhom/bottom-sheet` | Detached | Template cohérent |

## 🎓 Learnings pour Eric

### Pattern Recognition
7 itérations pour trouver la solution → **toujours revenir à la doc officielle** avant d'essayer des hacks. L'exemple YouTube avec `detached={true}` était dans la doc v5, section "Detached Bottom Sheets".

### Debugging Methodology
1. ✓ Minimal reproducible example (retirer toutes les props custom)
2. ✓ Chercher exemples officiels (YouTube, GitHub issues, doc)
3. ✗ Ne pas essayer de "forcer" le comportement de la lib avec des hacks

### Next Time
Quand une lib ne fait pas ce qu'on veut :
1. **Doc officielle d'abord** (pas Stack Overflow)
2. Chercher "alternative patterns" dans la doc (Modal vs Sheet)
3. GitHub issues avec mots-clés exacts ("peek", "initial position", "instant open")

## 📝 TODO M3+

- [ ] Migrer PremiumModal vers pattern `detached`
- [ ] Migrer TwoTimersModal vers pattern `detached`
- [ ] Migrer MoreActivitiesModal / MoreColorsModal vers pattern `detached`
- [ ] Tester `enableDynamicSizing` pour AsideZone multi-snap (15% → 38% → 90%)
- [ ] Documenter pattern dans `_internal/docs/guides/bottomsheet-modal-guide.md`

## 🔗 Ressources

- **Doc officielle v5** : https://gorhom.dev/react-native-bottom-sheet/
- **Detached pattern** : https://gorhom.dev/react-native-bottom-sheet/detached
- **Dynamic Sizing** : https://gorhom.dev/react-native-bottom-sheet/dynamic-sizing
- **GitHub** : https://github.com/gorhom/react-native-bottom-sheet

## 🎯 Impact Produit

**Avant** : Modaux React Native standard (pas de swipe, UX rigide)

**Après** :
- Swipe down to dismiss (geste naturel iOS/Android)
- Animation fluide 60fps
- Backdrop semi-transparent
- Cohérence UX avec drawer AsideZone

**Template réutilisable** → Accélère implémentation futures modales (paywall, discovery, etc.) sans redébugger le pattern.

---

**Durée totale debugging** : 2h30
**Durée avec pattern correct dès le départ** : 15min

**ROI documentation** : 🚀 Économie 2h pour chaque nouveau modal
