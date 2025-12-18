---
created: '2025-12-17'
updated: '2025-12-19'
type: roadmap
milestone: M9+
phase: gesture-stack-migration
status: in-progress
---

# Go Version 2 — Migration Stack Gestes (ADR-006)

> **Objectif** : Migrer de PanResponder custom vers `react-native-gesture-handler` + `reanimated` + `@gorhom/bottom-sheet`
>
> **Principe** : Progression bottom-up avec validation visuelle à chaque milestone
>
> **⚠️ Pivot M1.5** : ADR-005 updated → BottomSheet 3-snap (15%/38%/90%) + Message Zone permanente

---

## 📍 État Actuel

- ✅ **M0 : Setup Stack** (2025-12-17)
- ✅ **M1 : Drawer Custom** (2025-12-18) — AsideZone avec Gesture.Pan() [LEGACY]
- ⏳ **M1.5 : BottomSheet 3-Snap** — AsideZone migration (ADR-005 updated)

**Prochaine étape :** Migrer AsideZone → @gorhom/bottom-sheet (15%/38%/90%)

---

## 🎯 Séquence Progressive

### ✅ M0 : Setup Stack ⚙️ — **COMPLÉTÉ**

**Action :** Install dependencies + config Babel
**Validation :** `npm start` sans crash

**Tasks :**
- [x] `npm install react-native-gesture-handler react-native-reanimated @gorhom/bottom-sheet`
- [x] Config Babel : ajouter `react-native-reanimated/plugin` en dernier plugin
- [x] Rebuild iOS : `npx expo run:ios` (30min initial build)
- [x] Test : `npm start` → app démarre sans erreur
- [x] Fix: Downgrade reanimated 4.2.0 → 4.1.6 (Expo 54 compatibility)

**Durée réelle :** 45min (30min build + 15min troubleshooting Worklets version)
**Completed :** 2025-12-17

---

### ✅ M1 : Drawer Custom (AsideZone Intégré) 📐 — **LEGACY**

**Action :** Drawer custom avec Gesture.Pan() (ADR-005 v1)

**Note :** Remplacé par M1.5 (BottomSheet 3-snap, ADR-005 v2)

**Fichiers modifiés :**
- [x] `src/components/layout/Drawer.jsx` → `Drawer.legacy.jsx` (backup)
- [x] `src/components/layout/AsideZone.jsx` — Refacto complet avec nouvelle stack
  - Migration `PanResponder` → `Gesture.Pan()` (gesture-handler)
  - Migration `Animated.Value` → `useSharedValue` (reanimated)
  - Migration `Animated.spring()` → `withSpring()` (reanimated)
- [x] `App.js` — Ajout `GestureHandlerRootView` wrapper (requis)
- [x] `src/dev/components/DevFab.jsx` — Refacto + ajout bouton reset tooltip

**Validation visuelle :**
- [x] Swipe up ouvre drawer (suit le doigt en temps réel)
- [x] Swipe down ferme drawer (suit le doigt en temps réel)
- [x] Snap intelligent (< 50% = ouvrir, > 50% = fermer)
- [x] Hauteur 38% (AsideZone, Fibonacci golden ratio)
- [x] Styles production : `theme.colors.surface`, border radius 20px, shadow XL
- [x] Handle visuel (50x5px, opacity 0.8) au top de l'AsideZone
- [x] Tooltip "↑ Balayer vers le haut" (premier lancement uniquement)
  - Fade in 500ms après 500ms délai
  - Auto-hide après 3s OU au premier swipe
  - Sauvegarde AsyncStorage (`@ResetPulse:hasSeenDrawerHint`)
- [x] Animation fluide 60fps (damping: 40, stiffness: 100)

**DevFab refactorisé :**
- [x] Section unique "Dev Tools" au lieu de 3 sections fragmentées
- [x] Grid 2x2 : 🔄 Onboarding | ⏱️ Timer / 💬 Tooltip | → App
- [x] Bouton reset tooltip pour tests (bleu #1E90FF)

**Durée réelle :** 3h (vs 30min estimé)
- 1h : Tentative @gorhom/bottom-sheet + pivot architectural
- 1h30 : Implémentation drawer custom avec nouvelle stack
- 30min : Affordance (handle + tooltip) + polish UX

**Completed :** 2025-12-18

---

### ⏳ M1.5 : BottomSheet 3-Snap (AsideZone V2) 📐

**Action :** Migrer AsideZone → @gorhom/bottom-sheet (ADR-005 v2)

**Fichiers :**
- `AsideZone.jsx` → `AsideZone.legacy.jsx`
- `Drawer.jsx` → `Drawer2.legacy.jsx`
- Créer `AsideZone.bottomsheet.jsx` (BottomSheet 3-snap)
- Créer `FavoriteToolSection.jsx` (snap 15%)
- Créer `AllOptionsSection.jsx` (snap 90%, Settings inline)

**Architecture (ADR-005 v2) :**
- **3 zones écran** : DialZone (62%) / Message Zone / BottomSheet
- **3 snap points** : 15% (Favorite Tool) / 38% (Toolbox) / 90% (All Options)
- **Message Zone** : Hors sheet, fixe, toujours visible
- **Settings** : Plus de modal, inline dans snap 90%

**Validation visuelle :**
- [ ] Snap 15% (défaut) → Handle + Favorite Tool (configurable)
- [ ] Snap 38% → Toolbox (incrémenteur + cadran + carousels)
- [ ] Snap 90% → Scrollable (Toolbox + Settings + About)
- [ ] Message Zone visible aux 3 snaps
- [ ] Timer running → auto-collapse à 15%
- [ ] Carousels horizontaux (BottomSheetFlatList)
- [ ] simultaneousHandlers (vertical sheet + horizontal carousels)

**Durée estimée :** 3h30 (ADR-005 migration plan)

---

### ⏳ M2 : Carousels V2 (GestureDetector) 🎠

**Note :** Intégré dans M1.5 (BottomSheetFlatList dans snap 38%)

**Action :** Migrer carousels de FlatList vers GestureDetector + Animated

**Fichiers :**
- `src/components/bars/ActivityCarousel.jsx` → `ActivityCarousel.legacy.jsx`
- `src/components/bars/PaletteCarousel.jsx` → `PaletteCarousel.legacy.jsx`
- Créer versions V2 avec `react-native-gesture-handler`

**Validation visuelle :**
- ✅ Swipe horizontal lent → navigation item par item
- ✅ Swipe rapide → inertie + snap (effet roulette)
- ✅ Bouton "+" en fin de carousel

**Dev check :** Console log de la vélocité du swipe (lent vs rapide)

**Durée estimée :** 45min

---

### ⏳ M3 : CommandBar + CarouselBar dans BottomSheet 📦

**Note :** Intégré dans M1.5 (snap 38% Toolbox)

**Durée estimée :** -

---

### ⏳ M4 : Gestures simultaneousHandlers 🔄

**Note :** Intégré dans M1.5 (BottomSheet + BottomSheetFlatList)

**Durée estimée :** -

---

### ⏳ M5 : Gestures DialZone (Drag + Tap améliorés) 🎯

**Action :** Remplacer PanResponder dial par GestureDetector

**Fichiers :**
- `src/components/dial/TimeTimer.jsx` → migration vers `GestureDetector`
- Conserver zones concentriques (0-35% center, 35-65% dead, 65%+ graduations)

**Validation visuelle :**
- ✅ Tap centre → Play/Pause
- ✅ Long press centre → Reset
- ✅ Drag graduations → Ajuste durée
- ✅ Tap graduations → Snap to nearest minute

**Dev check :** Console log zone touchée (center / dead / graduations)

**Durée estimée :** 45min

---

### ⏳ M6 : Polish & Remove Legacy 🧹

**Action :** Cleanup fichiers `*.legacy.jsx` si tout fonctionne

**Validation :**
- ✅ Tous les gestes fluides
- ✅ Aucun crash
- ✅ Dev borders désactivés

**Durée estimée :** 15min

---

## 📊 Timeline

| Milestone | Estimé | Réel | Type | Statut |
|-----------|--------|------|------|--------|
| M0 Setup | 15min | 45min | Config | ✅ 2025-12-17 |
| M1 Drawer Custom | 30min | 3h | Gestures [LEGACY] | ✅ 2025-12-18 |
| M1.5 BottomSheet 3-Snap | 3h30 | - | Architecture (ADR-005 v2) | ⏳ |
| M2 Carousels | - | - | → M1.5 | ✅ |
| M3 Bars in Sheet | - | - | → M1.5 | ✅ |
| M4 simultaneousHandlers | - | - | → M1.5 | ✅ |
| M5 DialZone Gestures | 45min | - | Refacto | ⏳ |
| M6 Polish | 15min | - | Cleanup | ⏳ |

**Total estimé :** ~5h45min
**Total réel (partiel) :** 3h45min (M0+M1)
**Reste estimé :** ~4h30min (M1.5+M5+M6)

---

## 🔗 Références

### ADRs
| ADR | Titre | Lien |
|-----|-------|------|
| ADR-004 | Mécanisme Durée/Cadran | `../../docs/decisions/adr-004-mecanisme-duree-cadran.md` |
| ADR-005 | Architecture DialZone/AsideZone (v2: 3-snap) | `../../docs/decisions/adr-005-architecture-dialzone-asidezone.md` |
| ADR-006 | Stack Gestes & Animations | `../../docs/decisions/adr-006-gestures-stack.md` |

### Research & Docs
| Document | Lien |
|----------|------|
| @gorhom/bottom-sheet (doc officielle) | https://gorhom.dev/react-native-bottom-sheet/ |
| Research complet (1529 lignes) | `../../cockpit/knowledge/findings/2025-12-19_gorhom-bottomsheet-doc-research.md` |
| Migration plan M1.5 | `../../cockpit/knowledge/findings/2025-12-18_drawer-bottomsheet-migration-plan.md` |
| Devlog BottomSheet pattern (modals) | `../../cockpit/knowledge/devlog/2025-12-18_bottomsheet-modal-pattern.md` |
| Template BottomSheet | `../../../src/components/modals/BottomSheet.template.jsx` |

---

## 🎯 Principe : Bottom-Up

La séquence est **bottom-up** :
1. Primitives d'abord (drawer, carousels)
2. Intégration ensuite (bars dans drawer)
3. Conflits de gestes enfin (zones)

Chaque milestone = **un composant visuel qui marche**, pas de refacto invisible.

Le pattern `*.legacy.jsx` permet de **rollback immédiatement** si une étape plante.

---

## 📝 Notes

- Dev mode actif (`DEV_MODE = true` dans `src/config/test-mode.js`)
- Dev borders (vert/rouge) pour visualiser zones
- Validation visuelle **obligatoire** à chaque milestone avant de passer au suivant
