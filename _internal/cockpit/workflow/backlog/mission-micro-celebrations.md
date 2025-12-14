---
created: '2025-12-08'
updated: '2025-12-08'
status: backlog
type: mission
milestone: M8
priority: low
---

# Mission : Micro-Célébrations

## Objectif

Ajouter des feedbacks sensoriels subtils aux transitions clés de l'app pour renforcer l'engagement.

---

## Scope

### Transitions Onboarding

- [ ] Haptic success à chaque passage de filtre
- [ ] Toast/animation fin onboarding ("Bienvenue!")

### Transitions App

- [ ] Haptic au démarrage timer
- [ ] Célébration fin timer (haptic + animation subtile)
- [ ] Feedback sélection activité/palette

---

## Implémentation

- Utiliser `src/utils/haptics.js` existant
- Haptics légers (selection, not heavy)
- Animations via Animated ou Reanimated si déjà présent

---

## Contraintes

- Ne pas surcharger l'UX (subtil > flashy)
- Respecter les préférences système (réduire animations)
- Performance : pas de lag

