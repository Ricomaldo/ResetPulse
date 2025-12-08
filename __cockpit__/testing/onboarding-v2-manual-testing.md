---
created: '2025-12-08'
updated: '2025-12-08'
status: active
type: checklist
mission: mission-onboarding-v2.md
---

# Test Manuel — Onboarding V2

> **Note** : Les tests Jest couvrent déjà les aspects suivants (54 tests) :
> - Navigation entre filtres 0→5
> - Tracking analytics (started, step_viewed, step_completed, abandoned)
> - Data flow (needs → creation → test)
> - Completion (trial_started / skipped)
> - Constants (STEP_NAMES, NEEDS_OPTIONS, FREE_ACTIVITIES, smart defaults)
>
> Voir `__tests__/unit/screens/onboarding/`

## Prérequis

```bash
# Réinitialiser l'état onboarding pour tester
npx expo start
# Dans l'app, ouvrir React Native Debugger ou:
# AsyncStorage.removeItem('onboarding_v2_completed')
```

---

## 1. Flow Complet (Premier Lancement)

### Filter 0 — Opening
- [ ] Animation respiration visible (cercle qui pulse)
- [ ] Texte "Respire. Ton temps t'appartient."
- [ ] Tap anywhere → passe au filtre suivant
- [ ] Auto-advance après 5 cycles

### Filter 1 — Needs
- [ ] 5 options de besoins affichées (meditation, work, creativity, time, neurodivergent)
- [ ] Sélection multiple possible
- [ ] Animation de sélection (scale)
- [ ] Bouton "Continuer" actif après sélection
- [ ] Désélection fonctionne

### Filter 2 — Creation
- [ ] TimerDial preview visible
- [ ] Durée ajustable (slider ou tap graduations)
- [ ] Palette de couleurs sélectionnable
- [ ] Smart defaults selon needs sélectionnés
- [ ] Bouton "Créer mon moment"

### Filter 3 — Test (60sec)
- [ ] Countdown 60 secondes démarre automatiquement
- [ ] TimerDial animé (progression fluide)
- [ ] Couleur correspond à la sélection Filter 2
- [ ] Possibilité de skip
- [ ] Transition auto à la fin

### Filter 4 — Vision
- [ ] 4 scénarios journée type affichés
- [ ] Personnalisé selon needs (vérifier les sublabels)
- [ ] Bouton "Continuer"

### Filter 5 — Paywall
- [ ] Offre premium affichée
- [ ] Bouton "Essai gratuit"
- [ ] Bouton "Continuer sans" (skip)
- [ ] Les deux options terminent l'onboarding

---

## 2. Analytics (Console Logs)

En mode DEV, vérifier les logs Mixpanel :

- [x] `onboarding_started` — au mount Filter 0 *(couvert par Jest)*
- [x] `onboarding_step_viewed` — à chaque changement de filtre *(couvert par Jest)*
- [x] `onboarding_step_completed` — à chaque transition *(couvert par Jest)*
  - [x] Step 1 inclut `needs_selected`, `needs_count` *(couvert par Jest)*
  - [x] Step 2 inclut `activity`, `palette`, `duration` *(couvert par Jest)*
- [x] `timer_config_saved` — fin Filter 2 *(couvert par Jest)*
- [x] `onboarding_completed` — fin Filter 5 *(couvert par Jest)*
  - [x] Inclut `result` ('trial_started' ou 'skipped') *(couvert par Jest)*
  - [x] Inclut `needs_selected` *(couvert par Jest)*

### Test Abandon
- [ ] Mettre l'app en background pendant l'onboarding
- [ ] Vérifier log `onboarding_abandoned` avec step actuel

---

## 3. Persistance

- [ ] Terminer l'onboarding
- [ ] Fermer complètement l'app
- [ ] Rouvrir → TimerScreen direct (pas d'onboarding)
- [ ] Vérifier AsyncStorage `onboarding_v2_completed` = 'true'

---

## 4. DevFab (Mode DEV)

- [ ] FAB wrench visible (coin haut gauche)
- [ ] Toggle Free/Premium fonctionne
- [ ] Plus de toggle App/Onboarding (retiré)

---

## 5. Animations & UX

- [ ] Transitions fluides entre filtres
- [ ] Pas de flash blanc
- [ ] Thème cohérent (dark/light selon config)
- [ ] Responsive sur différentes tailles d'écran

---

## 6. Edge Cases

- [ ] Retour arrière (Android back button) — comportement attendu ?
- [ ] Rotation écran (si supporté)
- [ ] Interruption (appel téléphonique) puis retour
- [ ] Mémoire faible / app killed → reprend au début

---

## Résultat

| Test | iOS | Android |
|------|-----|---------|
| Flow complet | ⬜ | ⬜ |
| Analytics | ⬜ | ⬜ |
| Persistance | ⬜ | ⬜ |
| DevFab | ⬜ | ⬜ |
| Animations | ⬜ | ⬜ |
| Edge cases | ⬜ | ⬜ |

**Testeur** : _______________
**Date** : _______________
**Build** : _______________

---

## Notes

_Ajouter ici les bugs ou observations_
