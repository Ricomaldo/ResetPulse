---
created: '2025-12-19'
updated: '2025-12-19'
status: active
tags: [gorhom, bottomsheet, research, drawer, multi-snap, v5]
source: https://gorhom.dev/react-native-bottom-sheet/
---

# @gorhom/bottom-sheet v5 — Documentation Research

## 🎯 Objectif
Préparer migration drawer AsideZone avec multi-snap (38% → 90%)

**Contexte** : ResetPulse migre vers @gorhom/bottom-sheet v5
- ✅ **CE SOIR** : Modales avec pattern `detached={true}` (SettingsModal fonctionne)
- 🔮 **DEMAIN** : Drawer AsideZone avec multi-snap points (38% → 90%)

**Plan migration** : `_internal/cockpit/knowledge/findings/2025-12-18_drawer-bottomsheet-migration-plan.md`

---

## 📚 Documentation Fetchée

**Date de recherche** : 2025-12-19 (nuit)
**Version ciblée** : @gorhom/bottom-sheet v5.2.8 (latest)
**Compatibilité** : React Native Reanimated v3/v4, Gesture Handler v2

### Pages Explorées

| Priorité | Sujet | Status | Notes |
|----------|-------|--------|-------|
| 🔥 CRITICAL | Snap Points | ✅ Partiel | Doc officielle limitée, complété par GitHub |
| 🔥 CRITICAL | Gesture Handling | ✅ Partiel | Props trouvés, examples sur GitHub |
| 🔥 CRITICAL | Scrollables | ✅ Complet | BottomSheetScrollView + FlatList docs |
| 🎯 HIGH | Dynamic Sizing | ✅ Complet | Activé par défaut v5, maxDynamicContentSize |
| 🎯 HIGH | Props Reference | ✅ Complet | Liste complète des props + types |
| 🎯 HIGH | Troubleshooting | ✅ Complet | Android gesture conflicts, horizontal scroll |
| 📚 NICE | Animations | ✅ Complet | Spring/Timing configs, hooks |
| 📚 NICE | Hooks | ✅ Complet | useBottomSheet, useBottomSheetSpringConfigs |
| 📚 NICE | Methods | ✅ Complet | snapToIndex, expand, collapse, close |
| 📚 NICE | Backdrop | ✅ Complet | BottomSheetBackdrop custom implementation |

**Note** : Plusieurs pages spécifiques renvoient 404 (docs en cours de migration?), mais infos récupérées via GitHub issues/discussions + npm docs.

---

## 1. Snap Points (Multi-Snap Configuration)

**Sources** :
- [Props Documentation](https://gorhom.dev/react-native-bottom-sheet/props)
- [GitHub Discussion #1744](https://github.com/gorhom/react-native-bottom-sheet/discussions/1744)
- [Comprehensive Guide](https://andreadams.com.br/gorhom-bottom-sheet-a-comprehensive-guide-to-bottom-sheet-implementation/)

### Key Concepts

**Définition des snap points** :
- Points où le bottom sheet peut "s'accrocher" (snap)
- Doivent être triés du **bas vers le haut** (smallest → largest)
- Acceptent : nombres (pixels), strings (%), ou mix
- Requis **sauf** si `enableDynamicSizing={false}`

**Formats supportés** :
```javascript
snapPoints={[200, 500]}                    // Pixels absolus
snapPoints={[200, '50%']}                  // Mix
snapPoints={['38%', '90%']}                // Pourcentages (RECOMMANDÉ pour responsive)
```

**Index de snap** :
- `index={0}` → Premier snap point (le plus bas)
- `index={1}` → Deuxième snap point
- `index={-1}` → Sheet fermé

### Code Examples

**Example 1: Basic Multi-Snap (Drawer Pattern)**
```jsx
import React, { useMemo, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

const DrawerComponent = () => {
  const bottomSheetRef = useRef(null);

  // CRITICAL: useMemo pour éviter re-créations inutiles
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}  // Démarrer au premier snap (38%)
      enablePanDownToClose={false}  // Pas de fermeture totale
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

**Example 2: Index Control (Imperative)**
```jsx
import React, { useMemo, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Button } from 'react-native';

const DrawerWithControls = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const expandToFull = () => {
    bottomSheetRef.current?.snapToIndex(1);  // Snap to 90%
  };

  const collapseToMinimum = () => {
    bottomSheetRef.current?.snapToIndex(0);  // Snap to 38%
  };

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={0}>
        <Button title="Expand" onPress={expandToFull} />
      </BottomSheet>

      <Button title="Collapse from outside" onPress={collapseToMinimum} />
    </>
  );
};
```

**Example 3: Animation Configs (Custom Spring)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

const DrawerWithCustomAnimation = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,           // Plus élevé = moins de rebond
    stiffness: 500,        // Plus élevé = plus rapide
    overshootClamping: true,  // Empêche dépassement
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
  });

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      animationConfigs={animationConfigs}
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

### Notes pour Drawer AsideZone

✅ **Pattern recommandé pour AsideZone** :
- `snapPoints={['38%', '90%']}` (pourcentages pour responsive)
- `index={0}` (démarrer à 38%, collapsed state)
- `enablePanDownToClose={false}` (drawer permanent, pas de fermeture)
- `animationConfigs` custom pour feeling ResetPulse (smooth, moins bouncy)

⚠️ **Gotcha identifié** :
- Avec 2 snap points, impossible de "bypass" le premier pour fermer (par design)
- Si besoin de fermeture : ajouter `index={-1}` comme 3ème option OU `enablePanDownToClose={true}`

---

## 2. Gesture Handling (simultaneousHandlers)

**Sources** :
- [Props Documentation](https://gorhom.dev/react-native-bottom-sheet/props)
- [Troubleshooting](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)
- [GitHub Issue #770](https://github.com/gorhom/react-native-bottom-sheet/issues/770)
- [GitHub Issue #1433](https://github.com/gorhom/react-native-bottom-sheet/issues/1433)

### Key Concepts

**Problème** : Le BottomSheet utilise `PanGestureHandler` pour gérer le glissement vertical. Cela peut **conflictuer** avec :
- Horizontal ScrollView/FlatList (carousels)
- Touchables (buttons, pressables)
- Sliders, custom gestures

**Props disponibles** :
- `simultaneousHandlers` : Refs des gestures à permettre simultanément
- `activeOffsetY` : Offset vertical avant activation du gesture sheet
- `activeOffsetX` : Offset horizontal avant activation du gesture sheet
- `failOffsetY` / `failOffsetX` : Offsets causant échec du gesture
- `enableContentPanningGesture` : Activer/désactiver pan sur le contenu (default: true)
- `enablePanDownToClose` : Permettre fermeture en glissant vers le bas (default: false)

### Code Examples

**Example 1: Horizontal Carousel avec simultaneousHandlers**
```jsx
import React, { useMemo, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';  // IMPORTANT: gesture-handler!

const DrawerWithCarousel = () => {
  const bottomSheetRef = useRef(null);
  const carouselRef = useRef(null);
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      // Permettre gestures simultanés
      simultaneousHandlers={[carouselRef]}
      // Augmenter threshold X pour favoriser scroll horizontal
      activeOffsetX={[-10, 10]}
    >
      <FlatList
        ref={carouselRef}
        horizontal
        data={items}
        renderItem={renderItem}
        // Props gesture-handler
        showsHorizontalScrollIndicator={false}
      />
    </BottomSheet>
  );
};
```

**Example 2: NativeViewGestureHandler pour Android**
```jsx
import React, { useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { View } from 'react-native';

const DrawerWithNativeGesture = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      {/* Wrapper pour résoudre conflits Android */}
      <NativeViewGestureHandler disallowInterruption={true}>
        <View>
          {/* Custom components avec leurs propres gestures */}
          <HorizontalCarousel />
          <InteractiveSlider />
        </View>
      </NativeViewGestureHandler>
    </BottomSheet>
  );
};
```

**Example 3: activeOffsetY pour priorité au scroll vertical**
```jsx
import React, { useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

const DrawerWithVerticalPriority = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      // Sheet gesture ne démarre qu'après 20px de déplacement vertical
      activeOffsetY={[-20, 20]}
      // Scroll horizontal libre dès 5px
      activeOffsetX={[-5, 5]}
      // Gesture échoue si mouvement horizontal > 50px
      failOffsetX={[-50, 50]}
    >
      {/* Content with both horizontal and vertical scrolling */}
    </BottomSheet>
  );
};
```

### Notes pour Drawer AsideZone

✅ **Pattern recommandé** :
- `simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}` (passer refs des 2 carousels)
- `activeOffsetX={[-10, 10]}` (favoriser scroll horizontal)
- Utiliser `FlatList` de `react-native-gesture-handler` (PAS react-native)

⚠️ **Gotcha Android** :
- Horizontal scroll ne fonctionne PAS out-of-the-box sur Android
- **Solution obligatoire** : Wrapper avec `NativeViewGestureHandler` + imports `react-native-gesture-handler`

🎯 **Différence enableContentPanningGesture vs enablePanDownToClose** :
- `enableContentPanningGesture` : Permet drag du sheet depuis le **contenu** (body)
- `enablePanDownToClose` : Permet **fermeture** totale en glissant vers le bas
- Pour drawer permanent : `enablePanDownToClose={false}`, `enableContentPanningGesture={true}`

---

## 3. Scrollables (BottomSheetScrollView)

**Sources** :
- [Scrollables Documentation](https://gorhom.dev/react-native-bottom-sheet/scrollables)
- [BottomSheetFlatList](https://gorhom.dev/react-native-bottom-sheet/components/bottomsheetflatlist)
- [GitHub Issue #377](https://github.com/gorhom/react-native-bottom-sheet/issues/377)
- [GitHub Issue #2153](https://github.com/gorhom/react-native-bottom-sheet/discussions/2153)

### Key Concepts

La librairie fournit **5 composants scrollables pré-intégrés** :
1. **BottomSheetScrollView** - ScrollView vertical optimisé
2. **BottomSheetFlatList** - FlatList vertical (performance listes longues)
3. **BottomSheetSectionList** - SectionList vertical
4. **BottomSheetVirtualizedList** - VirtualizedList custom
5. **BottomSheetView** - View non-scrollable (static content)

**Pourquoi PAS les composants React Native standards ?** :
- Les composants BottomSheet* sont **gesture-aware** : ils gèrent automatiquement la coordination entre :
  - Scroll interne du contenu
  - Pan gesture du sheet
  - Snap points transitions
- Utilisent `react-native-gesture-handler` sous le capot

### Code Examples

**Example 1: BottomSheetScrollView (Vertical Content)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const DrawerWithVerticalScroll = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Long vertical content */}
        {items.map((item) => (
          <Card key={item.id} data={item} />
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
```

**Example 2: BottomSheetFlatList Horizontal (Carousel Pattern)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

const DrawerWithHorizontalCarousel = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const renderItem = ({ item }) => (
    <CarouselItem data={item} />
  );

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetFlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        // Important pour performance
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </BottomSheet>
  );
};
```

**Example 3: Multiple Horizontal Carousels (AsideZone Pattern)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet, { BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';

const AsideZoneDrawer = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const renderActivityItem = ({ item }) => <ActivityItem activity={item} />;
  const renderPaletteItem = ({ item }) => <PaletteItem palette={item} />;

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      {/* Parent scrollable vertical */}
      <BottomSheetScrollView>

        {/* Section Activités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activités</Text>
          <BottomSheetFlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          />
        </View>

        {/* Section Palettes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palettes</Text>
          <BottomSheetFlatList
            data={palettes}
            renderItem={renderPaletteItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          />
        </View>

        {/* Section Presets */}
        <View style={styles.section}>
          <PresetPills />
        </View>

      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  carousel: {
    // CRITICAL: Set explicit height pour horizontal FlatList
    height: 100,
  },
});
```

### Notes pour Drawer AsideZone

✅ **Pattern recommandé** :
- Parent : `<BottomSheetScrollView>` (scroll vertical global)
- Carousels : `<BottomSheetFlatList horizontal>` (NOT regular FlatList)
- **CRITICAL** : Définir `height` explicite sur les carousels horizontaux

⚠️ **Gotcha Horizontal Scroll** :
- Le mainteneur a dit : "BottomSheetFlatList meant to be for vertical sheet content"
- Horizontal scroll fonctionne **mais** avec limitations :
  - Android : Crashes/stuck scrolling signalés (fix : NativeViewGestureHandler)
  - iOS : Généralement OK
- **Solution** : Wrapper horizontal FlatList dans `View` avec width/height fixes

🎯 **Performance Tips** :
- `initialNumToRender={2-3}` pour carousels
- `windowSize={5}` (default: 21, trop élevé pour carousels)
- `removeClippedSubviews={true}` sur Android

---

## 4. Dynamic Sizing

**Sources** :
- [Props Documentation](https://gorhom.dev/react-native-bottom-sheet/props)
- [V5 Release Notes](https://gorhom.dev/react-native-bottom-sheet/blog/bottom-sheet-v5)
- [GitHub Issue #1573](https://github.com/gorhom/react-native-bottom-sheet/issues/1573)

### Key Concepts

**Nouveauté v5** : `enableDynamicSizing` est **activé par défaut** (breaking change depuis v4).

**Comportement** :
- Quand `true` : Le sheet calcule automatiquement sa hauteur basée sur le **contenu**
- Insère un nouveau snap point dans l'array `snapPoints`
- Utile pour contenu à hauteur variable (formulaires, listes dynamiques)

**Props liés** :
- `enableDynamicSizing` : Boolean (default: true)
- `maxDynamicContentSize` : Number (hauteur max en pixels)
- `snapPoints` : Devient optionnel si enableDynamicSizing=true

### Code Examples

**Example 1: Disable Dynamic Sizing (Migration v4→v5)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

const StaticDrawer = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      // MIGRATION v5: Désactiver pour comportement v4
      enableDynamicSizing={false}
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

**Example 2: Dynamic Sizing avec Max Height**
```jsx
import React from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

const DynamicDrawer = () => {
  return (
    <BottomSheet
      enableDynamicSizing={true}
      // Limite la hauteur max (évite overflow sur petits écrans)
      maxDynamicContentSize={600}
      index={0}
    >
      {/* Content with variable height */}
      <DynamicForm />
    </BottomSheet>
  );
};
```

### Notes pour Drawer AsideZone

🚫 **PAS recommandé pour AsideZone** :
- AsideZone a **hauteurs fixes et prévisibles** (38% et 90%)
- Dynamic sizing ajouterait complexité inutile
- **Action** : `enableDynamicSizing={false}` explicitement

✅ **Pattern AsideZone** :
```jsx
<BottomSheet
  snapPoints={['38%', '90%']}
  index={0}
  enableDynamicSizing={false}  // Explicit pour clarté
>
```

---

## 5. Props Reference (Complet)

**Source** : [Props Documentation](https://gorhom.dev/react-native-bottom-sheet/props)

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `snapPoints` | `Array<number\|string>` | Required* | Points de snap (triés bas→haut). *Optionnel si enableDynamicSizing=true |
| `index` | `number` | `0` | Index initial. -1 = fermé |
| `enablePanDownToClose` | `boolean` | `false` | Permet fermeture en glissant vers le bas |
| `enableDynamicSizing` | `boolean` | `true` | Calcul auto hauteur basé sur contenu |
| `maxDynamicContentSize` | `number` | `undefined` | Hauteur max si enableDynamicSizing=true |

### Gesture Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableContentPanningGesture` | `boolean` | `true` | Permet drag depuis le contenu |
| `enableHandlePanningGesture` | `boolean` | `true` | Permet drag depuis le handle |
| `simultaneousHandlers` | `Ref\|Ref[]` | `[]` | Refs gestures simultanés autorisés |
| `activeOffsetX` | `number\|number[]` | `undefined` | Offset X avant activation gesture |
| `activeOffsetY` | `number\|number[]` | `undefined` | Offset Y avant activation gesture |
| `failOffsetX` | `number\|number[]` | `undefined` | Offset X causant échec gesture |
| `failOffsetY` | `number\|number[]` | `undefined` | Offset Y causant échec gesture |

### Animation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationConfigs` | `Function` | `undefined` | Callback retournant spring/timing config |
| `animateOnMount` | `boolean` | `true` | Anime depuis fermé vers index initial |
| `overrideReduceMotion` | `'System'\|'Always'\|'Never'` | `'System'` | Override accessibility reduce motion |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onChange` | `(index: number) => void` | Appelé quand le sheet atteint un snap point |
| `onAnimate` | `(fromIndex: number, toIndex: number) => void` | Appelé au début animation |

### Style Props

| Prop | Type | Description |
|------|------|-------------|
| `style` | `ViewStyle` | Style du container sheet |
| `backgroundStyle` | `ViewStyle` | Style du background interne |
| `handleStyle` | `ViewStyle` | Style du handle container |
| `handleIndicatorStyle` | `ViewStyle` | Style de l'indicateur handle |

### Custom Components Props

| Prop | Type | Description |
|------|------|-------------|
| `handleComponent` | `Component` | Custom handle component |
| `backdropComponent` | `Component` | Custom backdrop component |
| `backgroundComponent` | `Component` | Custom background component |

### Notes

✅ **Props critiques pour AsideZone** :
```jsx
<BottomSheet
  // Core
  snapPoints={['38%', '90%']}
  index={0}
  enableDynamicSizing={false}
  enablePanDownToClose={false}

  // Gestures
  enableContentPanningGesture={true}
  simultaneousHandlers={[carouselRef1, carouselRef2]}
  activeOffsetX={[-10, 10]}

  // Animation
  animationConfigs={customSpringConfig}
  animateOnMount={true}

  // Callbacks
  onChange={handleSnapChange}

  // Style
  backgroundStyle={{ backgroundColor: theme.colors.background }}
  handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
/>
```

---

## 6. Troubleshooting (Android Gestures)

**Source** : [Troubleshooting Documentation](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)

### Issue 1: Pressables/Touchables Not Working (Android)

**Problème** : Buttons, TouchableOpacity ne répondent pas dans le BottomSheet sur Android.

**Cause** : Wrapping avec `TapGestureHandler` & `PanGestureHandler` interfère.

**Solution** : Utiliser les touchables de la librairie :
```jsx
import {
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from '@gorhom/bottom-sheet';

// Au lieu de :
// import { TouchableOpacity } from 'react-native';
```

### Issue 2: Horizontal Lists Not Working (Android)

**Problème** : Horizontal FlatList/ScrollView ne scrollent pas sur Android.

**Cause** : Même conflit gesture handler.

**Solution** : Utiliser les composants de `react-native-gesture-handler` :
```jsx
import { ScrollView, FlatList } from 'react-native-gesture-handler';

// Au lieu de :
// import { ScrollView, FlatList } from 'react-native';
```

### Issue 3: Custom Components Gesture Conflicts

**Problème** : Composants custom (sliders, carousels) ne fonctionnent pas.

**Solution** : Wrapper avec `NativeViewGestureHandler` :
```jsx
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

<NativeViewGestureHandler disallowInterruption={true}>
  <CustomCarousel />
</NativeViewGestureHandler>
```

### Notes pour AsideZone

⚠️ **Checklist Android** :
- [ ] ActivityCarousel : FlatList de `react-native-gesture-handler`
- [ ] PaletteCarousel : FlatList de `react-native-gesture-handler`
- [ ] CommandButtons : TouchableOpacity de `@gorhom/bottom-sheet`
- [ ] PresetPills : TouchableOpacity de `@gorhom/bottom-sheet`
- [ ] Wrapper global : `<NativeViewGestureHandler disallowInterruption={true}>`

---

## 7. Animations & Configs

**Sources** :
- [Hooks Documentation](https://gorhom.dev/react-native-bottom-sheet/hooks)
- [Methods Documentation](https://gorhom.dev/react-native-bottom-sheet/methods)

### Hooks Disponibles

**useBottomSheetSpringConfigs** : Spring-based animations (rebond naturel)
```jsx
import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

const animationConfigs = useBottomSheetSpringConfigs({
  damping: 80,                    // Damping (higher = less bounce)
  stiffness: 500,                 // Stiffness (higher = faster)
  overshootClamping: true,        // Prevent overshoot
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
});
```

**useBottomSheetTimingConfigs** : Timing-based animations (linéaire, contrôlé)
```jsx
import { useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';

const animationConfigs = useBottomSheetTimingConfigs({
  duration: 250,
  easing: Easing.exp,
});
```

### Code Examples

**Example 1: Custom Spring (Smooth, Less Bouncy)**
```jsx
import React, { useMemo } from 'react';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

const SmoothDrawer = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 100,              // Plus élevé que default (80) = moins bouncy
    stiffness: 400,            // Légèrement plus lent que default (500)
    overshootClamping: true,   // Pas de dépassement
    restDisplacementThreshold: 0.01,  // Settle plus précis
    restSpeedThreshold: 0.01,
  });

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      animationConfigs={animationConfigs}
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

**Example 2: Per-Method Animation Override**
```jsx
import React, { useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { withTiming, Easing } from 'react-native-reanimated';

const DrawerWithMethodOverride = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const expandWithCustomTiming = () => {
    bottomSheetRef.current?.snapToIndex(1, {
      // Override animation pour cette action spécifique
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  return (
    <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={0}>
      <Button title="Expand Smooth" onPress={expandWithCustomTiming} />
    </BottomSheet>
  );
};
```

### Notes pour AsideZone

🎯 **Recommandation** : Spring config custom pour feeling ResetPulse
```jsx
const drawerAnimationConfigs = useBottomSheetSpringConfigs({
  damping: 90,
  stiffness: 450,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
});
```

**Rationale** :
- `damping: 90` : Légèrement plus bouncy que trop rigide (feeling naturel)
- `stiffness: 450` : Un peu plus lent que default (feeling délibéré, pas rushed)
- `overshootClamping: true` : Pas de dépassement snap points (propre)

---

## 8. Hooks (useBottomSheet)

**Source** : [Hooks Documentation](https://gorhom.dev/react-native-bottom-sheet/hooks)

### Hooks Disponibles

| Hook | Usage | Retour |
|------|-------|--------|
| `useBottomSheet` | Accès methods + animatedIndex/Position depuis enfants | `{ snapToIndex, expand, collapse, close, animatedIndex, animatedPosition }` |
| `useBottomSheetModal` | Même chose pour BottomSheetModal | Idem |
| `useBottomSheetSpringConfigs` | Créer spring animation config | `Animated.WithSpringConfig` |
| `useBottomSheetTimingConfigs` | Créer timing animation config | `Animated.WithTimingConfig` |

### Code Examples

**Example 1: useBottomSheet (Control from Inside)**
```jsx
import React from 'react';
import { View, Button } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';

// Ce composant est INSIDE le BottomSheet
const SheetContent = () => {
  const { snapToIndex, expand, collapse } = useBottomSheet();

  return (
    <View>
      <Button title="Expand to Full" onPress={() => snapToIndex(1)} />
      <Button title="Collapse" onPress={collapse} />
      <Button title="Expand (helper)" onPress={expand} />
    </View>
  );
};

// Parent
const DrawerWithInternalControls = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <SheetContent />
    </BottomSheet>
  );
};
```

**Example 2: Tracking Position avec animatedIndex**
```jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const AnimatedContent = () => {
  const { animatedIndex } = useBottomSheet();

  // Fade opacity based on snap position
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],  // De snap 0 (38%) à snap 1 (90%)
      [0.5, 1] // Opacity 0.5 → 1
    ),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text>Content fades in when expanded</Text>
    </Animated.View>
  );
};
```

### Notes pour AsideZone

✅ **Use case AsideZone** :
- CommandButtons peuvent utiliser `useBottomSheet()` pour expand/collapse
- PAS besoin de passer bottomSheetRef en props (useBottomSheet accessible depuis enfants)

🎯 **Pattern** :
```jsx
// Dans CommandButton.jsx
import { useBottomSheet } from '@gorhom/bottom-sheet';

const CommandButton = ({ command }) => {
  const { expand } = useBottomSheet();

  const handlePress = () => {
    // Expand drawer pour voir plus de contenu
    expand();
    // Puis exécuter command
    executeCommand(command);
  };

  return <Button onPress={handlePress} />;
};
```

---

## 9. Methods (Imperative Control)

**Source** : [Methods Documentation](https://gorhom.dev/react-native-bottom-sheet/methods)

### Methods Disponibles

| Method | Signature | Description |
|--------|-----------|-------------|
| `snapToIndex` | `(index: number, animationConfigs?) => void` | Snap vers index spécifique |
| `snapToPosition` | `(position: number\|string, animationConfigs?) => void` | Snap vers position pixel/% |
| `expand` | `(animationConfigs?) => void` | Snap vers snap point max |
| `collapse` | `(animationConfigs?) => void` | Snap vers snap point min |
| `close` | `(animationConfigs?) => void` | Fermer sheet (interruptible) |
| `forceClose` | `(animationConfigs?) => void` | Fermer sheet (non-interruptible) |

### Code Examples

**Example 1: Ref-Based Control (External)**
```jsx
import React, { useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Button } from 'react-native';

const DrawerWithExternalControls = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const handleExpand = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCollapse = () => {
    bottomSheetRef.current?.collapse();
  };

  const handleSnapToMid = () => {
    bottomSheetRef.current?.snapToPosition('60%');
  };

  return (
    <>
      {/* Controls OUTSIDE sheet */}
      <Button title="Expand" onPress={handleExpand} />
      <Button title="Collapse" onPress={handleCollapse} />
      <Button title="Snap to 60%" onPress={handleSnapToMid} />

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={0}>
        {/* Content */}
      </BottomSheet>
    </>
  );
};
```

**Example 2: snapToIndex avec Animation Custom**
```jsx
import React, { useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { withSpring } from 'react-native-reanimated';

const DrawerWithCustomSnap = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const handleSnapWithBounce = () => {
    bottomSheetRef.current?.snapToIndex(1, {
      damping: 50,      // Très bouncy
      stiffness: 300,
      overshootClamping: false,  // Autoriser dépassement
    });
  };

  return (
    <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={0}>
      <Button title="Bounce to Top" onPress={handleSnapWithBounce} />
    </BottomSheet>
  );
};
```

### Notes pour AsideZone

✅ **Access methods** : 2 patterns disponibles
1. **Via ref** (depuis parent/external) : `bottomSheetRef.current?.expand()`
2. **Via hook** (depuis children) : `const { expand } = useBottomSheet()`

🎯 **Use case AsideZone** :
- TimerScreen : Utiliser ref pour contrôler drawer (ouvrir/fermer sur events)
- CommandButtons : Utiliser hook pour expand depuis inside

---

## 10. Backdrop (Custom Implementation)

**Sources** :
- [BottomSheetBackdrop Documentation](https://gorhom.dev/react-native-bottom-sheet/components/bottomsheetbackdrop)
- [Custom Backdrop Guide](https://gorhom.dev/react-native-bottom-sheet/custom-backdrop)

### Key Concepts

**Backdrop** : Overlay sombre derrière le sheet (dimming effect).

**Props** :
- `backdropComponent` : Composant custom (default: null, pas de backdrop)
- BottomSheetBackdrop fourni par librairie (à instancier manuellement)

**BottomSheetBackdrop Props** :
- `appearsOnIndex` : Index où backdrop apparaît (fade in)
- `disappearsOnIndex` : Index où backdrop disparaît (fade out)
- `opacity` : Opacity max (default: 0.5)
- `pressBehavior` : Comportement au tap ('close' | 'collapse' | 'none' | number)

### Code Examples

**Example 1: Default BottomSheetBackdrop**
```jsx
import React, { useMemo, useCallback } from 'react';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const DrawerWithBackdrop = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}      // Apparaît quand snap à index 1 (90%)
        disappearsOnIndex={0}   // Disparaît quand snap à index 0 (38%)
        opacity={0.3}           // 30% opacity
        pressBehavior="collapse" // Tap backdrop → collapse to 38%
      />
    ),
    []
  );

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      backdropComponent={renderBackdrop}
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

**Example 2: Custom Backdrop (Custom Color)**
```jsx
import React, { useMemo, useCallback } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const CustomBackdrop = ({ animatedIndex, style }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 0.5]  // Fade from 0 to 50%
    ),
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: '#000000',  // Custom color
        },
        animatedStyle,
      ]}
    />
  );
};

const DrawerWithCustomBackdrop = () => {
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  const renderBackdrop = useCallback(
    (props) => <CustomBackdrop {...props} />,
    []
  );

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      backdropComponent={renderBackdrop}
    >
      {/* Content */}
    </BottomSheet>
  );
};
```

### Notes pour AsideZone

🤔 **Décision à prendre** : AsideZone a-t-il besoin d'un backdrop ?

**Arguments POUR** :
- Drawer à 90% couvre presque tout l'écran → backdrop améliore focus
- Tap backdrop → collapse à 38% (UX intuitive)

**Arguments CONTRE** :
- Drawer est UI permanente (pas une modale)
- Backdrop peut sembler trop "modal-like" pour un drawer

✅ **Recommandation** : Tester avec backdrop subtil
```jsx
const renderBackdrop = useCallback(
  (props) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={1}
      disappearsOnIndex={0}
      opacity={0.2}  // Très subtil
      pressBehavior="collapse"
    />
  ),
  []
);
```

---

## 🚀 Quick Start Guide (Synthèse)

### Pattern Drawer Multi-Snap (38% → 90%)

**Installation** :
```bash
npm install @gorhom/bottom-sheet@^5
npm install react-native-reanimated react-native-gesture-handler
```

**Setup Reanimated** (si pas déjà fait) :
```js
// babel.config.js
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

**Code Ready-to-Use** :
```jsx
import React, { useMemo, useCallback, useRef } from 'react';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AsideZoneDrawer = () => {
  const bottomSheetRef = useRef(null);

  // Snap points
  const snapPoints = useMemo(() => ['38%', '90%'], []);

  // Custom animation
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 90,
    stiffness: 450,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  });

  // Backdrop
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        opacity={0.2}
        pressBehavior="collapse"
      />
    ),
    []
  );

  // Change handler
  const handleSheetChanges = useCallback((index) => {
    console.log('Sheet snap index:', index);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        enableContentPanningGesture={true}
        animationConfigs={animationConfigs}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{ backgroundColor: '#ebe8e3' }}
        handleIndicatorStyle={{ backgroundColor: '#c0bdb8' }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>

          {/* Section Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activités</Text>
            <BottomSheetFlatList
              data={activities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              initialNumToRender={3}
            />
          </View>

          {/* Section Palettes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Palettes</Text>
            <BottomSheetFlatList
              data={palettes}
              renderItem={renderPaletteItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              initialNumToRender={3}
            />
          </View>

          {/* Section Presets */}
          <View style={styles.section}>
            <PresetPills />
          </View>

        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  carousel: {
    height: 100,  // CRITICAL: Explicit height pour horizontal FlatList
  },
});

export default AsideZoneDrawer;
```

### Checklist Migration AsideZone

**Phase 1: Setup** :
- [ ] Installer @gorhom/bottom-sheet v5.2.8
- [ ] Vérifier react-native-reanimated v3/v4 configuré
- [ ] Vérifier react-native-gesture-handler configuré
- [ ] Wrapper App avec `<GestureHandlerRootView>` (si pas déjà)

**Phase 2: Créer AsideZone.bottomsheet.jsx** :
- [ ] Copier template ci-dessus
- [ ] Définir `snapPoints={['38%', '90%']}`
- [ ] Config `enableDynamicSizing={false}`
- [ ] Config `enablePanDownToClose={false}`
- [ ] Setup custom `animationConfigs`
- [ ] Setup `backdropComponent` (optionnel, à tester)

**Phase 3: Migrer Carousels** :
- [ ] Importer `BottomSheetFlatList` de `@gorhom/bottom-sheet`
- [ ] Remplacer FlatList activités par BottomSheetFlatList
- [ ] Remplacer FlatList palettes par BottomSheetFlatList
- [ ] Ajouter `horizontal={true}` + `style={{ height: 100 }}`
- [ ] Config `initialNumToRender={3}`, `windowSize={5}`

**Phase 4: Migrer Touchables (Android Fix)** :
- [ ] Importer TouchableOpacity de `@gorhom/bottom-sheet`
- [ ] Remplacer dans CommandButton
- [ ] Remplacer dans PresetPills
- [ ] Remplacer dans ActivityItem
- [ ] Remplacer dans PaletteItem

**Phase 5: Gestures Simultanés** :
- [ ] Créer refs pour carousels : `activityCarouselRef`, `paletteCarouselRef`
- [ ] Passer refs à `simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}`
- [ ] Config `activeOffsetX={[-10, 10]}`
- [ ] Tester scroll horizontal Android

**Phase 6: Wrapper NativeViewGestureHandler (si Android issues)** :
- [ ] Importer `NativeViewGestureHandler` de `react-native-gesture-handler`
- [ ] Wrapper content dans `<NativeViewGestureHandler disallowInterruption={true}>`
- [ ] Tester à nouveau sur Android

**Phase 7: Styling** :
- [ ] Appliquer `backgroundStyle={{ backgroundColor: theme.colors.background }}`
- [ ] Appliquer `handleIndicatorStyle={{ backgroundColor: theme.colors.border }}`
- [ ] Vérifier styles carousels (paddingHorizontal, gaps)
- [ ] Tester dark mode (si applicable)

**Phase 8: Callbacks & Tracking** :
- [ ] Implémenter `onChange` callback
- [ ] Logger snap changes (debug)
- [ ] Hook analytics si besoin (Mixpanel)
- [ ] Tester imperative control (`expand()`, `collapse()`)

**Phase 9: Tests** :
- [ ] Test iOS : Gestures vertical/horizontal
- [ ] Test Android : Gestures vertical/horizontal
- [ ] Test snap à 38% (initial)
- [ ] Test snap à 90% (expanded)
- [ ] Test drag depuis contenu (enableContentPanningGesture)
- [ ] Test drag depuis handle
- [ ] Test backdrop tap → collapse
- [ ] Test animations (smooth, pas trop bouncy)

**Phase 10: Cleanup** :
- [ ] Supprimer ancien Drawer.jsx (si applicable)
- [ ] Supprimer dépendances inutilisées
- [ ] Update docs internes
- [ ] Commit avec message clair

---

## ⚠️ Warnings & Gotchas

### 🚨 CRITICAL GOTCHAS

1. **Horizontal FlatList sur Android** :
   - ❌ **Ne fonctionne PAS** avec FlatList de `react-native`
   - ✅ **Solution** : Utiliser FlatList de `react-native-gesture-handler` OU wrapper avec `NativeViewGestureHandler`
   - 📝 **Source** : [GitHub Issue #770](https://github.com/gorhom/react-native-bottom-sheet/issues/770), [GitHub Issue #1433](https://github.com/gorhom/react-native-bottom-sheet/issues/1433)

2. **Touchables sur Android** :
   - ❌ **Buttons ne répondent pas** avec TouchableOpacity de `react-native`
   - ✅ **Solution** : Utiliser TouchableOpacity de `@gorhom/bottom-sheet`
   - 📝 **Source** : [Troubleshooting](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)

3. **Dynamic Sizing activé par défaut (v5)** :
   - ⚠️ **Breaking change v4→v5** : `enableDynamicSizing={true}` par défaut
   - ✅ **Migration** : Explicitement `enableDynamicSizing={false}` si hauteurs fixes
   - 📝 **Source** : [V5 Release](https://gorhom.dev/react-native-bottom-sheet/blog/bottom-sheet-v5)

4. **Horizontal FlatList height** :
   - ❌ **Carousel ne s'affiche pas** si pas de height explicite
   - ✅ **Solution** : `style={{ height: 100 }}` sur BottomSheetFlatList horizontal
   - 📝 **Source** : [GitHub Discussion #2153](https://github.com/gorhom/react-native-bottom-sheet/discussions/2153)

### ⚙️ CONFIGURATION WARNINGS

5. **snapPoints sorting** :
   - ⚠️ **Doivent être triés bas→haut** : `['38%', '90%']` (PAS `['90%', '38%']`)
   - ❌ **Erreur commune** : Inverser l'ordre → comportement imprévisible

6. **GestureHandlerRootView requis** :
   - ⚠️ **Toute l'app doit être wrapped** dans `<GestureHandlerRootView>`
   - 📝 **Location** : `App.js` ou root layout

7. **simultaneousHandlers refs** :
   - ⚠️ **Doit être un array de refs** : `[ref1, ref2]` (PAS `ref1, ref2`)
   - ✅ **Format** : `simultaneousHandlers={[activityCarouselRef]}`

### 🎨 STYLING WARNINGS

8. **Backdrop opacity** :
   - ⚠️ **Default opacity=0.5** peut être trop fort pour drawer permanent
   - ✅ **Recommandation** : `opacity={0.2}` pour drawer, `0.5` pour modal

9. **Handle indicator** :
   - ⚠️ **Pas de handle par défaut** (invisible sur background clair)
   - ✅ **Solution** : `handleIndicatorStyle={{ backgroundColor: theme.colors.border }}`

### 🐛 BEHAVIORAL GOTCHAS

10. **enablePanDownToClose vs 2 snap points** :
    - ⚠️ **Avec 2 snap points, impossible de "bypass"** le premier snap pour fermer
    - ✅ **Solution drawer** : `enablePanDownToClose={false}` (drawer permanent)
    - ✅ **Solution modal** : Ajouter 3ème snap `['-1%', '38%', '90%']` + `enablePanDownToClose={true}`
    - 📝 **Source** : [GitHub Issue #1364](https://github.com/gorhom/react-native-bottom-sheet/issues/1364)

11. **onChange vs onAnimate** :
    - ⚠️ **onChange** : Appelé quand sheet **atteint** un snap point (fin animation)
    - ⚠️ **onAnimate** : Appelé au **début** de l'animation
    - ✅ **Use case** : onChange pour analytics, onAnimate pour animations custom

12. **animatedIndex inversé** :
    - ⚠️ **Comportement counter-intuitif** : `animatedPosition` est **inversé**
    - Index -1 (fermé) → animatedPosition max
    - Index 1 (full) → animatedPosition 0
    - 📝 **Source** : [GitHub Discussion #1190](https://github.com/gorhom/react-native-bottom-sheet/discussions/1190)

### 🚀 PERFORMANCE GOTCHAS

13. **BottomSheetFlatList horizontal performance** :
    - ⚠️ **Default windowSize=21** trop élevé pour carousels
    - ✅ **Optimisation** : `windowSize={5}`, `initialNumToRender={3}`, `maxToRenderPerBatch={5}`

14. **Multiple BottomSheets** :
    - ⚠️ **Performance impact** avec plusieurs sheets simultanés
    - ✅ **Solution** : Préférer 1 sheet avec contenu dynamique vs plusieurs sheets
    - 📝 **Source** : [GitHub Discussion #1629](https://github.com/gorhom/react-native-bottom-sheet/discussions/1629)

15. **useMemo pour snapPoints** :
    - ⚠️ **Re-créer snapPoints array chaque render** → animations janky
    - ✅ **Solution** : `const snapPoints = useMemo(() => ['38%', '90%'], [])`

### 📱 PLATFORM-SPECIFIC GOTCHAS

16. **Android keyboard** :
    - ⚠️ **Sheet peut se fermer** quand keyboard s'ouvre avec `enableDynamicSizing={true}`
    - ✅ **Solution** : `android_keyboardInputMode='adjustResize'` + `keyboardBehavior='interactive'`
    - 📝 **Source** : [GitHub Issue #1602](https://github.com/gorhom/react-native-bottom-sheet/issues/1602)

17. **iOS safe area** :
    - ⚠️ **React Navigation ajoute safe area** par défaut
    - ✅ **Solution** : Override `safeAreaInsets={{ top: 0 }}` si navigation nested
    - 📝 **Source** : [React Navigation Integration](https://gorhom.dev/react-native-bottom-sheet/react-navigation-integration)

---

## 🔗 Ressources Complémentaires

### Documentation Officielle
- [Main Documentation](https://gorhom.dev/react-native-bottom-sheet/)
- [Props Reference](https://gorhom.dev/react-native-bottom-sheet/props)
- [Methods Reference](https://gorhom.dev/react-native-bottom-sheet/methods)
- [Hooks Reference](https://gorhom.dev/react-native-bottom-sheet/hooks)
- [Troubleshooting Guide](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)

### GitHub Resources
- [GitHub Repository](https://github.com/gorhom/react-native-bottom-sheet)
- [Releases & Changelog](https://github.com/gorhom/react-native-bottom-sheet/releases)
- [Issues & Discussions](https://github.com/gorhom/react-native-bottom-sheet/issues)
- [V5 Release Announcement](https://gorhom.dev/react-native-bottom-sheet/blog/bottom-sheet-v5)

### Code Examples
- [CodeSandbox Examples](https://codesandbox.io/examples/package/@gorhom/bottom-sheet)
- [Bottom Sheet Modal Gist](https://gist.github.com/gorhom/a812e2d29ccd767b15ef8c8f6196b843)

### Community Resources
- [Comprehensive Guide by Andrea Adams](https://andreadams.com.br/gorhom-bottom-sheet-a-comprehensive-guide-to-bottom-sheet-implementation/)
- [GeekyAnts - Material Top Tabs Integration](https://geekyants.com/blog/navigating-heights-material-top-tabs-and-gorhom-bottom-sheet-with-react-navigation)
- [Hashnode - React Navigation Integration](https://engineering.hashnode.com/how-to-use-bottomsheet-with-react-navigation)

### Related Libraries
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

---

## 📊 Version Compatibility Matrix

| Package | Version | Notes |
|---------|---------|-------|
| @gorhom/bottom-sheet | v5.2.8 | Latest stable (2025-12-06) |
| react-native-reanimated | v3.x or v4.x | v5.1.8+ supports Reanimated v4 |
| react-native-gesture-handler | v2.x | Required v2+ for v5 |
| react-native | 0.70+ | Minimum version |
| expo | SDK 48+ | Compatible |

---

## 🎓 Key Learnings (TL;DR)

### Pour AsideZone Drawer (38% → 90%)

✅ **DO** :
- Utiliser `snapPoints={['38%', '90%']}` (pourcentages responsive)
- `enableDynamicSizing={false}` (hauteurs fixes)
- `enablePanDownToClose={false}` (drawer permanent)
- `BottomSheetScrollView` parent + `BottomSheetFlatList` horizontal carousels
- Custom spring animation (damping: 90, stiffness: 450)
- `simultaneousHandlers` pour carousels
- Imports `react-native-gesture-handler` pour FlatList/TouchableOpacity
- Explicit `height` sur carousels horizontaux
- `useMemo` pour snapPoints
- Backdrop subtil (`opacity={0.2}`)

❌ **DON'T** :
- Utiliser FlatList de `react-native` (gesture conflicts Android)
- Utiliser TouchableOpacity de `react-native` (Android)
- Oublier height sur horizontal FlatList (invisible)
- Inverser ordre snapPoints (`['90%', '38%']` = ❌)
- Omettre `GestureHandlerRootView` wrapper
- Re-créer snapPoints array chaque render (pas de useMemo)
- Activer `enableDynamicSizing` pour hauteurs fixes

### Migration Phases

1. **Setup** : Install packages, verify config
2. **Create** : AsideZone.bottomsheet.jsx with template
3. **Migrate** : Carousels to BottomSheetFlatList
4. **Fix** : Touchables to @gorhom imports
5. **Gestures** : simultaneousHandlers + activeOffsetX
6. **Android** : NativeViewGestureHandler if needed
7. **Style** : backgroundStyle, handleIndicatorStyle
8. **Callbacks** : onChange, analytics
9. **Test** : iOS + Android, all gestures
10. **Cleanup** : Remove old code, commit

---

**FIN DU DOCUMENT** 🚀

**Next Steps** : Eric lit ce fichier (10min) → code AsideZone.bottomsheet.jsx demain matin avec toutes les infos nécessaires.

Bonne nuit ! 😴
