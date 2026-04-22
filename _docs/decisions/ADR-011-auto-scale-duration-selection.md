---
created: '2026-01-15'
updated: '2026-01-15'
status: active
tags: [adr, ux, scale, duration, presets, activities]
---

# ADR-011: Auto-Scale on Duration Selection

## Status
**Active** — Implemented in v2.1.0

## Context

ResetPulse utilise un système de **5 scales de cadran** [5min, 15min, 30min, 45min, 60min] pour afficher les durées de timer. L'utilisateur peut :
1. Sélectionner une **activité** (avec durée par défaut) via ActivityCarousel
2. Sélectionner une **durée preset** via PresetPills
3. Créer une **activité custom** avec durée personnalisée

**Problème identifié** : Si une durée sélectionnée **dépasse le scale actuel du cadran** (ex: sélectionner activité 60min sur scale 15min), l'arc du timer déborde visuellement, créant confusion.

### Exemple problématique

```
Scale actuel: 15min
Activité sélectionnée: Sport (60min default)
Résultat: Arc déborde à 400% du cadran (60/15 = 4 tours)
```

**UX attendue** : Le cadran doit s'adapter automatiquement au scale optimal pour afficher la durée complète.

---

## Decision

### Règle d'auto-scale

**Quand une durée est sélectionnée** (preset, activité, ou activité custom créée) :

1. **Comparer** durée sélectionnée vs scale actuel
2. **Si durée > scale actuel** → Auto-adapter au scale optimal
3. **Si durée ≤ scale actuel** → Conserver scale actuel (pas de zoom out inutile)

### Implémentation

**Helper centralisé** : `src/utils/scaleHelpers.js`

```javascript
export const getOptimalScale = (durationMinutes) => {
  if (durationMinutes <= 5) return 5;
  if (durationMinutes <= 15) return 15;
  if (durationMinutes <= 30) return 30;
  if (durationMinutes <= 45) return 45;
  return 60;
};
```

**Composants impactés** :

| Composant | Fonction | Comportement |
|-----------|----------|--------------|
| **PresetPills** | `handlePresetSelect` | Auto-scale si preset > scale actuel |
| **PresetPills** | `handlePresetLongPress` | TOUJOURS scale to optimal (long press = force adapt) |
| **ActivityCarousel** | `handleActivityPress` | Auto-scale si activité.duration > scale actuel |
| **ActivityCarousel** | `handleActivityCreated` | Auto-scale si activité custom.duration > scale actuel |

### Code Pattern

```javascript
const handleDurationSelect = (durationSeconds) => {
  const durationMinutes = durationSeconds / 60;
  const currentScaleMinutes = modeToScale(scaleMode);
  const optimalScale = getOptimalScale(durationMinutes);

  // Auto-adapt if duration exceeds current scale
  if (durationMinutes > currentScaleMinutes) {
    setScaleMode(scaleToMode(optimalScale));
    setCurrentDuration(durationSeconds);
    haptics.selection(); // Feedback visuel + tactile
  } else {
    // Keep current scale (no unnecessary zoom out)
    setCurrentDuration(durationSeconds);
  }
};
```

---

## Consequences

### ✅ Positives

1. **UX cohérente** : Même comportement dans PresetPills, ActivityCarousel, et création activités custom
2. **Pas de débordement visuel** : Arc du timer toujours visible complètement
3. **Intelligent** : Auto-scale seulement si nécessaire (pas de zoom out inutile)
4. **Feedback haptique** : L'utilisateur sent que le scale s'adapte
5. **Simplicité** : L'utilisateur n'a pas besoin de gérer manuellement le scale

### ⚠️ Trade-offs

1. **Changement implicite** : Le scale change sans action explicite de l'utilisateur
   - **Mitigation** : Feedback haptique + animation visuelle du scale
   - **Long press preset** : Option explicite pour forcer adaptation (avec haptic fort)

2. **Zoom out interdit** : Si durée < scale optimal, pas de zoom out auto
   - **Exemple** : Durée 5min sur scale 60min reste à 60min (pas de zoom in auto)
   - **Rationale** : Éviter changements de scale intempestifs
   - **Alternative** : L'utilisateur peut long-press preset pour forcer optimal scale

### 🔄 Alternatives considérées

**Alternative 1** : Toujours adapter au scale optimal (même si durée < scale)
- ❌ **Rejeté** : Trop de changements de scale (zoom in/out constant)

**Alternative 2** : Bloquer sélection si durée > scale
- ❌ **Rejeté** : Friction UX élevée, utilisateur bloqué

**Alternative 3** : Afficher warning/hint sans auto-scale
- ❌ **Rejeté** : Utilisateur doit action manuelle, friction

**Alternative 4** : Permettre débordement (arc > 360°)
- ❌ **Rejeté** : Confusion visuelle, arc illisible

---

## Related

- **ADR-009** : Dial Modes Simplification (5 scales)
- **Component** : `src/components/controls/PresetPills.jsx`
- **Component** : `src/components/carousels/ActivityCarousel.jsx`
- **Helper** : `src/utils/scaleHelpers.js`
- **Context** : `src/contexts/TimerConfigContext.jsx` (scaleMode, setScaleMode)

---

## Implementation Notes

### Files Modified (v2.1.0)

1. **src/utils/scaleHelpers.js** (NEW)
   - `getOptimalScale(durationMinutes)` : Retourne scale optimal [5, 15, 30, 45, 60]
   - `scaleToMode(scale)` : Convertit `30` → `'30min'`
   - `modeToScale(scaleMode)` : Convertit `'30min'` → `30`

2. **src/components/controls/PresetPills.jsx**
   - Ligne 71-91 : `handlePresetSelect` avec auto-scale edge case
   - Ligne 101-118 : `handlePresetLongPress` avec scale optimal forcé

3. **src/components/carousels/ActivityCarousel.jsx**
   - Ligne 123-160 : `handleActivityPress` avec auto-scale
   - Ligne 230-243 : `handleActivityCreated` avec auto-scale

### Haptic Feedback

| Action | Haptic | Intensité | Rationale |
|--------|--------|-----------|-----------|
| Preset tap (auto-scale) | `selection()` | Light | Changement implicite, feedback subtil |
| Preset long press | `impact('medium')` | Medium | Action explicite, feedback fort |
| Activity select (auto-scale) | `selection()` | Light | Cohérence avec preset tap |

### Testing

**Manual test checklist** :
- [ ] Preset 60min sur scale 5min → Auto-scale to 60min
- [ ] Preset 5min sur scale 60min → Reste à 60min (pas de zoom in)
- [ ] Activité Sport (60min) sur scale 15min → Auto-scale to 60min
- [ ] Activité custom 90min (inexistant) → Scale to 60min (max scale)
- [ ] Long press preset 30min sur scale 60min → Force scale to 30min

---

## Future Considerations

### Possible Enhancements

1. **Visual hint** : Toast subtil "Dial adapted to [scale]min" lors de l'auto-scale
   - **Pro** : Feedback explicite du changement
   - **Con** : Potentiellement intrusif

2. **Preference user** : Toggle "Auto-adapt dial scale" dans Settings
   - **Pro** : Contrôle utilisateur avancé
   - **Con** : Complexité settings, cas d'usage limité

3. **Animation scale** : Smooth transition visuelle du scale change
   - **Pro** : Feedback visuel élégant
   - **Con** : Complexité implémentation (Reanimated)

**Decision** : Garder implémentation actuelle (simple, efficace). Évaluer feedback utilisateurs v2.1.0 avant enhancements.

---

**Auteur** : Claude Sonnet 4.5
**Date** : 2026-01-15
**Version** : ResetPulse v2.1.0
