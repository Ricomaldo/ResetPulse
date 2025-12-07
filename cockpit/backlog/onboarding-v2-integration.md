# Mission : Onboarding V2 — Intégration & Polish

**Date** : 2025-12-07
**Statut** : En cours
**Agent** : Chrysalis
**Owner** : Merlin

---

## Objectif

Finaliser le prototype OnboardingV2, l'intégrer au flow principal de l'app et assurer la cohérence globale.

---

## Contexte

Le prototype OnboardingV2 (6 filtres) est fonctionnel en standalone mais :
- Déconnecté du flow principal (accessible uniquement via DevFab)
- 1 seul fichier de 1000+ lignes
- Providers partiellement connectés
- Quelques incohérences avec l'app principale

---

## Chantiers

### A. Découpage du fichier
**Responsable** : Chrysalis
**Statut** : ⬜ À faire
**Effort** : M

**Quoi** : Scinder OnboardingV2Prototype.jsx en fichiers par filtre

**Comment** :
- Créer `src/screens/onboarding/` ou `src/onboarding/`
- 1 fichier par Filter (Filter0Opening.jsx, Filter1Needs.jsx, etc.)
- 1 fichier orchestrateur (OnboardingFlow.jsx)
- Extraire constantes (THEME, PALETTES, etc.) dans config

---

### B. Intégration au flow principal
**Responsable** : Chrysalis
**Statut** : ⬜ À faire
**Effort** : M

**Quoi** : Connecter l'onboarding au démarrage réel de l'app

**Comment** :
- Remplacer OnboardingV1 par V2 dans App.js
- Persister `onboardingCompleted` dans AsyncStorage
- Transférer timerConfig vers TimerOptionsContext à la fin
- Supprimer l'ancien système (OnboardingController, tooltips)

---

### C. Cohérence app
**Responsable** : Chrysalis
**Statut** : ⬜ À faire
**Effort** : S

**Quoi** : Petites modifs dans l'app pour cohérence avec l'onboarding

**Comment** :
- Activer les nouveaux modes dial (1min, 5min, 10min) dans Settings
- Vérifier que les activités/palettes choisies dans l'onboarding s'appliquent
- Harmoniser les couleurs (THEME du proto vs ThemeProvider)

---

### D. Polish & UX
**Responsable** : Chrysalis
**Statut** : 🟡 En cours
**Effort** : S

**Quoi** : Finitions UX du prototype

**Comment** :
- [x] TimerDial dans Filter 2 (preview)
- [x] Carrousel choix activité (4 options emoji+label)
- [x] Presets durée boutons
- [x] TimerDial animé dans Filter 3 (test 60sec)
- [x] Emoji choisi au centre du dial
- [x] "Respire..." guidance en bas
- [x] Animation fluide dial (50ms)
- [x] Scénarios Filter 4 personnalisés selon needs
- [ ] Thème système (useColorScheme) — light/dark auto
- [ ] Micro-célébrations transitions (haptics améliorés + toast)
- [ ] Retirer debug header (garder uniquement en __DEV__)
- [ ] Remplacer SafeAreaView deprecated
- [ ] i18n (passe finale)

---

## Tâches

### Fait cette session ✅
- [x] Intégrer TimerDial dans Filter 2 (preview)
- [x] Intégrer TimerDial animé dans Filter 3 (countdown 60sec)
- [x] Ajouter modes dial 1min, 5min, 10min (dialModes.js)
- [x] Refactorer useDialOrientation avec getDialMode()
- [x] Lisser animation dial (interval 50ms)
- [x] Personnaliser Filter 4 selon needs
- [x] Supprimer DigitalTimer du Filter 3
- [x] Wrapper proto dans providers (ThemeProvider, TimerPaletteProvider)
- [x] Créer CLAUDE.md projet

### À faire
- [ ] Découper OnboardingV2Prototype.jsx en fichiers
- [ ] Intégrer au flow principal (remplacer V1)
- [ ] Activer nouveaux modes dial dans Settings
- [ ] Implémenter useColorScheme (thème auto)
- [ ] Micro-célébrations transitions (haptics améliorés + toast)
- [ ] Retirer debug header prod (garder DevBar si __DEV__ seulement)
- [ ] Remplacer SafeAreaView → SafeAreaView de react-native-safe-area-context
- [ ] Passe i18n sur tous les textes hardcodés
- [ ] Supprimer OnboardingV1 + tooltips (après validation)

---

## Notes session

**2025-12-07** :
- Session productive : dial intégré, modes courts ajoutés, animation fluide
- Le proto est proche d'être production-ready côté UX
- Prochaine priorité : découpage fichier puis intégration flow

---

## Résultat

[À remplir quand terminée]

**Fichiers créés/modifiés :**
- App.js (providers pour proto)
- src/prototypes/OnboardingV2Prototype.jsx (TimerDial, animation, Filter4)
- src/constants/dialModes.js (modes 1min, 5min, 10min)
- src/hooks/useDialOrientation.js (refacto getDialMode)
- src/components/timer/TimerDial.jsx (refacto)
- src/components/TimeTimer.jsx (refacto)
- CLAUDE.md (créé)

**Commits :**
- (à faire en fin de session)

---

## Drag & Drop

Quand terminée, déplacer ce fichier dans `done/`
