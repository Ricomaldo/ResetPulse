---
created: "2025-12-08"
updated: "2025-12-08"
status: active
type: mission
milestone: M8
priority: medium
---

# Mission : Popover Presets Durée

## Objectif

Ajouter dans l'app principale la même UX que l'onboarding : tap sur l'affichage digital → popover avec presets de durée.

## Contexte

L'onboarding V2 (Filter2) propose des boutons presets durée (5, 15, 25, 45, 60 min). Cette UX doit être disponible dans TimerScreen pour les utilisateurs existants.

---

## Comportement Attendu

1. **Trigger** : Tap sur le pill/affichage digital du temps (ex: "25:00")
2. **Action** : Ouvre un popover/bottom sheet avec presets durée
3. **Presets** : 5, 15, 25, 45, 60 min (identiques à onboarding)
4. **Sélection** : Tap sur preset → ferme popover + set duration

---

## Plan d'Exécution

### Phase 1 : Composant Popover

- [ ] Créer `src/components/DurationPopover.jsx`
- [ ] Réutiliser `DURATION_OPTIONS` de `onboardingConstants.js`
- [ ] Style cohérent avec theme (useTheme)

### Phase 2 : Intégration TimerScreen

- [ ] Wrapper l'affichage digital dans TouchableOpacity
- [ ] State `popoverVisible`
- [ ] Connecter sélection à `setPresetDuration`

### Phase 3 : Polish

- [ ] Animation ouverture/fermeture
- [ ] Haptic feedback sur sélection
- [ ] Accessibilité (labels)

---

## Fichiers à Modifier

| Fichier | Action |
|---------|--------|
| `src/components/DurationPopover.jsx` | Nouveau |
| `src/screens/TimerScreen.jsx` | Ajouter tap handler + popover |
| `src/components/TimeTimer.jsx` | Peut-être wrapper digital display |

---

## Notes

- Garder cohérence avec les presets onboarding
- Le popover ne doit pas interférer avec le dial gesture

