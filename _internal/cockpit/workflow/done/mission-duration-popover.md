---
created: '2025-12-08'
updated: '2025-12-12'
status: done
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

- [x] Créer `src/components/DurationPopover.jsx`
- [x] Réutiliser `DURATION_OPTIONS` de `onboardingConstants.js`
- [x] Style cohérent avec theme (useTheme)

### Phase 2 : Intégration TimerScreen

- [x] Wrapper l'affichage digital dans TouchableOpacity
- [x] State `popoverVisible`
- [x] Connecter sélection à `setPresetDuration`

### Phase 3 : Polish

- [x] Animation ouverture/fermeture
- [x] Haptic feedback sur sélection
- [x] i18n support (FR/EN)

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

---

## Résultat

**Mission terminée le 2025-12-12**

- DurationPopover component créé avec 8 presets (5, 10, 15, 20, 25, 30, 45, 60 min)
- DigitalTimer rendu tappable (TouchableOpacity wrapper)
- Popover s'ouvre au tap sur DigitalTimer (uniquement quand timer arrêté)
- Haptic feedback sur sélection + fermeture
- i18n FR/EN intégré
- Style cohérent avec theme system

**Fichiers créés/modifiés :**

- `src/components/DurationPopover.jsx` (nouveau)
- `src/components/TimeTimer.jsx` (integration)
- `src/components/timer/DigitalTimer.jsx` (pointerEvents removed)
- `locales/fr.json` (timer.durationPopover keys)
- `locales/en.json` (timer.durationPopover keys)

