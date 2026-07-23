---
status: partially-superseded
superseded_by: 'adr-014-recentrage-signature.md (gorhom sort, RNGH reste)'
updated: '2026-07-23'
---

# ADR-006 : Stack Gestes & Animations

## Statut : ACCEPTÉ (implémentation partielle justifiée)

**Date création :** 18 décembre 2025
**Date acceptation :** 19 décembre 2025
**Dernière mise à jour :** 18 décembre 2025 (validation architecture)

---

## Décision

Adopter une approche hybride pour gestes et animations :

```
✅ @gorhom/bottom-sheet (AsideZone) — Délégué à bibliothèque
✅ react-native-reanimated (AsideZone) — Animations 60fps
✅ NativeViewGestureHandler (DialZone) — Protection gestures dial
⏸️ PanResponder custom (DialZone) — Maintenu (justifié ci-dessous)
```

**Justification PanResponder custom pour DialZone** :
- ✅ Interaction circulaire 360° unique (pas de pattern standard)
- ✅ Résistance dynamique basée sur vélocité (algorithmique avancé)
- ✅ Wrap-around prevention (passage 60min→0min)
- ✅ Zones concentriques custom (centre 35%, graduations 65%+)
- ✅ Snap subtil uniquement au release (pas pendant drag)
- ✅ Code stable (160 lignes, bien testé, performant)

**Décision** : **Ne PAS migrer DialZone vers GestureDetector** (complexité non justifiée).

---

## État Implémentation

### ✅ Complété

| Composant | Stack | Statut | Date |
|-----------|-------|--------|------|
| **AsideZone** | @gorhom/bottom-sheet + Reanimated 2 | ✅ Migré | 2025-12-19 |
| **DialZone** | PanResponder + NativeViewGestureHandler | ✅ Validé (maintenu) | 2025-12-18 |

### ⏸️ Annulé (non nécessaire)

| Composant | Migration Proposée | Décision | Raison |
|-----------|-------------------|----------|--------|
| **DialZone** | PanResponder → GestureDetector | ❌ Annulé | Complexité non justifiée, code stable |
| **Carrousels** | FlatList → GestureDetector | 🔮 Futur | Si mode roulette implémenté (M9+) |

---

## Gestes Implémentés

### DialZone (PanResponder custom)

| Élément | Geste | Action | Implémentation |
|---------|-------|--------|----------------|
| Dial | Drag 360° | Ajuste durée | TimerDial.jsx:148-209 (résistance dynamique) |
| Dial | Tap centre | Play/Pause | TimerDial.jsx:257-259 (zone < 35% radius) |
| Dial | Tap graduation | Set time | TimerDial.jsx:253-256 (zone > 65% radius) |
| Dial | Long press | Reset | TimerDial.jsx:250-251 (≥500ms) |
| DigitalTimer | Tap | Toggle mini/full | DialZone.jsx:46-58 (TouchableOpacity) |

### AsideZone (@gorhom/bottom-sheet)

| Élément | Geste | Action | Implémentation |
|---------|-------|--------|----------------|
| Handle | Swipe vertical | Snap entre 4 points | Natif bibliothèque |
| Sheet | Swipe up/down | Navigation snaps (5%, 15%, 38%, 90%) | AsideZone.jsx:140 |
| Content | Scroll vertical | Scroll interne (snap 2+) | AsideZone.jsx:83 (scrollEnabled) |
| Layers | Fade | Transitions opacity entre layers | AsideZone.jsx:32-78 (Reanimated) |

---

## ~~Migration~~ Validation Finale

### ✅ P0 : AsideZone (Drawer) — COMPLÉTÉ
**De :** PanResponder custom
**Vers :** @gorhom/bottom-sheet
**Date :** 2025-12-19
**Résultat :** ✅ Succès (4 snap points, fade transitions, auto-collapse)

### ❌ P1 : DialZone — ANNULÉ (maintenu)
**De :** PanResponder custom
**Vers :** ~~GestureDetector~~ → **Maintenu PanResponder**
**Date décision :** 2025-12-18
**Raison :** Code stable, performant, complexité non justifiée
**Protection ajoutée :** NativeViewGestureHandler (`disallowInterruption: true`)

### 🔮 P2 : Carrousels — FUTUR (si nécessaire)
**De :** FlatList
**Vers :** Potentiel GestureDetector + Animated (mode roulette)
**Timeline :** M9+ (si feature "roulette" demandée)
**Statut actuel :** FlatList suffit (navigation simple)

---

## Prérequis

- [x] Install `react-native-gesture-handler` — v2.21.2
- [x] Install `react-native-reanimated` — v3.16.7
- [x] Config Babel (`react-native-reanimated/plugin`) — ✅
- [x] Rebuild natif (iOS + Android) — ✅
- [x] Install `@gorhom/bottom-sheet` — v5.0.7

---

## Architecture Validée (2025-12-18)

```
TimerScreen (orchestrateur)
├── DialZone (self-contained)
│   ├── DigitalTimer — TouchableOpacity
│   └── NativeViewGestureHandler (protection)
│       └── TimeTimer → TimerDial (PanResponder custom)
│
├── MessageZone (container simple)
│   └── ActivityLabel
│
└── AsideZone (self-contained)
    └── @gorhom/bottom-sheet (gestures natifs)
        ├── 4 snap points (5%, 15%, 38%, 90%)
        ├── Fade transitions (Reanimated 2)
        └── Auto-collapse (timer start)
```

**Pattern cohérent** : DialZone et AsideZone sont tous deux self-contained, chacun avec l'approche gestures appropriée à son interaction.

---

## Références

- **Architecture** : `src/components/layout/DialZone.jsx` (100 lignes)
- **Architecture** : `src/components/layout/AsideZone.jsx` (200 lignes)
- **Gestures Dial** : `src/components/dial/TimerDial.jsx` (500 lignes, PanResponder 114-274)
- **Audit** : `_internal/cockpit/knowledge/findings/2025-12-17_audit-gestion-gestes-dialzone.md`
- **Docs externes** :
  - https://docs.swmansion.com/react-native-gesture-handler/
  - https://docs.swmansion.com/react-native-reanimated/
  - https://gorhom.github.io/react-native-bottom-sheet/

---

## Changelog

- **2025-12-19** : Migration AsideZone → @gorhom/bottom-sheet (COMPLÉTÉ)
- **2025-12-18** : Validation architecture, décision maintien PanResponder pour DialZone
- **2025-12-18** : Refactoring DialZone → self-contained (pattern cohérent)
- **2025-12-18** : ADR créé (statut PROPOSITION)
