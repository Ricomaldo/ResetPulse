---
created: '2026-01-16'
version: 2.1.4
---

# Release Notes - Version 2.1.4

## Français

### Améliorations visuelles et animations

- Ajout d'un indicateur rotatif (trotteuse) sur le bouton central pendant le timer
- Animation de respiration améliorée sur les messages (pulsation plus visible)
- Animation séquentielle des points redessinée pour une progression plus claire
- Cercle de progression du long press en couleur accent (or) pour plus de cohérence

### Améliorations de l'expérience utilisateur

- Protection contre le changement d'activité pendant le timer (retour haptique si tentative)
- Amélioration de la reconnaissance des gestes de glissement vertical vs horizontal dans le tiroir
- Meilleure hiérarchie visuelle du timer digital (fond transparent, espacement optimisé)

### Corrections de bugs

- Correction d'une condition de course critique causant des notifications orphelines
- Correction du bouton "Relancer le guide" dans les paramètres
- Correction de la largeur des boutons de durée dans l'onboarding (5 boutons au lieu de 4)
- Correction de la propagation des props isRunning dans la chaîne de composants

### Traductions et localisation

- Audit complet de l'internationalisation (15 langues)
- Suppression de 220 clés obsolètes
- Complétion de 13 langues de 43-55% à 100%
- Restauration de clés critiques supprimées par erreur (onboarding, accessibilité)
- Toutes les langues maintenant synchronisées à 300 clés

---

## English

### Visual and animation improvements

- Added rotating indicator (second hand) on center button during timer
- Improved breathing animation on messages (more visible pulsation)
- Redesigned sequential dots animation for clearer progression
- Long press progress circle in accent color (gold) for consistency

### User experience improvements

- Protection against activity change while timer running (haptic feedback on attempt)
- Improved vertical vs horizontal swipe gesture recognition in drawer
- Better visual hierarchy for digital timer (transparent background, optimized spacing)

### Bug fixes

- Fixed critical race condition causing orphaned notifications
- Fixed "Restart the guide" button in settings
- Fixed duration button width in onboarding (5 buttons instead of 4)
- Fixed isRunning prop propagation through component chain

### Translations and localization

- Complete internationalization audit (15 languages)
- Removed 220 obsolete keys
- Completed 13 languages from 43-55% to 100%
- Restored critical keys deleted by error (onboarding, accessibility)
- All languages now synchronized at 300 keys
