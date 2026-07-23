---
created: '2026-07-23'
updated: '2026-07-23'
status: accepted
type: architecture-decision-record
---

# ADR-015 — Modèle Rituel/Activité à deux étages

Le recentrage (ADR-014) unifie presets, cuisson d'œuf, timer custom et Pomodoro.
Question : un seul concept (Rituel absorbe Activité) ou deux étages ? **Décision :
deux étages.**

- **Activité** = l'atome d'identité, non lançable : emoji + messages i18n de
  début/fin (`timerMessages.*`, 15 langues) + rythme propre (`pulseDuration`).
  Vit dans `src/config/activities.js`.
- **Rituel** = l'objet lançable en un tap : *référence une Activité* + durée +
  couleur + son. Champ `étapes?[]` réservé au build n+1 (séquences/Pomodoro) —
  présent dans le schéma, non implémenté au recentrage.
- **Emoji custom** (clavier, pack Ambiances) : crée une Activité *anonyme* — emoji
  sans messages i18n dédiés → messages génériques de fallback. L'user l'habille en
  Rituel via le même formulaire.
- **Mouvement** : suit l'Activité automatiquement (dérivé de `pulseDuration`,
  déjà câblé — 600 ms travail, 1200 ms méditation).

## Option rejetée

Rituel absorbe Activité (concept unique) : plus simple sur le papier, mais casse
la liaison messages i18n ×15 langues (actif existant), force une migration de
`activities.js` sans gain visible, et perd le rythme par activité qui pilote le
Mouvement automatique.

## Conséquences

- Les « rituels de base » gratuits sont des instances préconfigurées pointant vers
  les activités gratuites existantes — pas de migration de données.
- « Créer un rituel = le même formulaire, vide » reste vrai : zéro nouveau concept
  à apprendre pour l'user.
- Vocabulaire normatif : `CONTEXT.md` (Activité, Rituel, Mouvement, Première fois).
