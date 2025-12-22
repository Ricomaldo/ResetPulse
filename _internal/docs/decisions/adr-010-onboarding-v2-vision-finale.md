---
created: '2025-12-22'
status: accepted
type: architecture-decision-record
context: 'ResetPulse Onboarding v2.1 - Vision finale avant implémentation'
stakeholders: 'Eric (product), Chrysalis (architecture), Claude Code (implementation)'
supersedes: 'OB v2 proto (non déployé)'
---

# ADR-010 — Onboarding v2.1 Vision Finale

## Statut

**ACCEPTED** — Prêt pour implémentation

---

## Contexte

### Situation Actuelle

- **App v1 (prod)** : Tooltips basiques, pas de vrai onboarding
- **OB v2 (proto)** : Jamais déployé, architecture incompatible avec App v2
- **App v2 (dev)** : Refonte UI/UX (DialZone, BottomSheet, ADR-005/007/008)

### Problème

L'OB v2 proto a été conçu pour l'ancienne architecture. Il contient :

- Branches discover/personalize (escape hatch vers sortie sans paywall)
- Filter-020-needs (abstrait, pas actionnable)
- Pas de détection comportementale (ADR-008)
- Pas d'intégration killer feature (création custom)

### Données Terrain (Pré-OB)

| Métrique        | Valeur                                     | Analyse                                                |
| --------------- | ------------------------------------------ | ------------------------------------------------------ |
| Paywall → Trial | 5.71%                                      | ❌ Trop bas — investissement insuffisant avant paywall |
| Trial → Paid    | 100%                                       | ✅ Ceux qui essaient achètent                          |
| Sources paywall | 33% palettes / 33% activités / 33% contenu | ✅ Chemins équilibrés                                  |

**Diagnostic** : Le produit convainc. Le problème est l'investissement émotionnel AVANT le paywall.

---

## Décision

### Flow Onboarding v2.1 — 9 Écrans Linéaires

| #   | Filtre        | Fonction                               | Output                   | Durée    |
| --- | ------------- | -------------------------------------- | ------------------------ | -------- |
| 010 | Opening       | Respiration, ancrage                   | —                        | 15-20s   |
| 020 | Tool          | Choix outil favori (4 modes)           | `favoriteToolMode`       | 5-10s    |
| 030 | Creation      | Créer 1 activité custom                | `customActivity`         | 30-60s   |
| 040 | TestStart     | Détection tap (mesure timing)          | `startBehavior`          | 5-10s    |
| 050 | TestStop      | Détection relâche + Révélation persona | `interactionProfile`     | 10-15s   |
| 060 | Sound         | Choix son notification                 | `selectedSoundId`        | 5-10s    |
| 070 | Notifications | Permission système                     | `notificationPermission` | 5-10s    |
| 080 | Paywall       | Upgrade naturel post-investissement    | `purchaseResult`         | variable |
| 090 | FirstTimer    | Résumé + Timer guidé 60s               | `firstTimerCompleted`    | 60-90s   |

**Durée totale estimée** : 2-4 minutes (selon comportement user)

### Suppressions Définitives

| Filtre Supprimé      | Raison                                |
| -------------------- | ------------------------------------- |
| Filter-020-needs     | Abstrait, remplacé par Tool (concret) |
| Filter-060-branch    | Escape hatch, crée fuite conversion   |
| Filter-070-vision    | Marketing vide, pas de valeur         |
| Filter-100-interface | Settings post-OB, pas critique        |

### Principe Fondamental

**Flow linéaire unique. Pas de branches. Tout le monde passe par le paywall APRÈS avoir investi.**

---

## Architecture Détaillée

### Filter-010-opening

**Fonction** : Ancrage, respiration, premier contact calme

**UX** :

- Animation respiration (5 cycles)
- Pas de texte lourd
- Auto-advance ou tap pour continuer

**Composant** : ✅ Existant (inchangé)

---

### Filter-020-tool

**Fonction** : Choix outil favori (ADR-008)

**UX** :

```
"Qu'est-ce qui te correspond le mieux ?"

[🎨 Créatif]      [☯ Minimaliste]
   Couleurs         Épuré

[🔄 Multi-tâches]  [⏱ Rationnel]
   Activités        Contrôles
```

**Output** : `favoriteToolMode` → `TimerConfigContext.layout`

**Composant** : 🆕 Nouveau (4 SelectionCard)

---

### Filter-030-creation

**Fonction** : Créer SA première activité custom (IKEA effect)

**UX** :

- Emoji picker (grille)
- Nom activité (0-20 caractères)
- Durée (presets ± ajustement)
- Preview TimerDial en temps réel

**Output** : `customActivity` → sauvegardée comme 1ère custom (slot gratuit)

**Composant** : ♻️ Wrapper autour `CreateActivityModalContent`

**Prop ajoutée** : `context="onboarding"` (masque bouton Annuler)

---

### Filter-040-test-start

**Fonction** : Détection comportement démarrage (ADR-008)

**UX** :

```
"Quand tu es prêt, appuie"

     [PulseButton au centre]

(Aucune indication de timing — mesure naturelle)
```

**Mesure** :

- `pressTime < 800ms` → `startBehavior: 'rapid'`
- `pressTime >= 800ms` → `startBehavior: 'deliberate'`

**Output** : `startBehavior` (passé à Filter-050)

**Composant** : 🆕 Nouveau (réutilise PulseButton)

---

### Filter-050-test-stop

**Fonction** : Détection comportement arrêt + Révélation persona

**UX Phase 1** (Test) :

```
"Maintenant, lâche quand tu veux"

     [Cercle qui se remplit 5s]
```

**Mesure** :

- `releaseTime < 2500ms` → `stopBehavior: 'early'`
- `releaseTime >= 2500ms` → `stopBehavior: 'patient'`

**Calcul Persona** (Matrice 2x2 ADR-008) :

| startBehavior | stopBehavior | Persona         |
| ------------- | ------------ | --------------- |
| rapid         | early        | ⚡ Véloce       |
| rapid         | patient      | 🏃 Abandonniste |
| deliberate    | early        | 🚀 Impulsif     |
| deliberate    | patient      | 🎯 Ritualiste   |

**UX Phase 2** (Révélation immédiate) :

```
"Tu es 🎯 Ritualiste"

Les actions délibérées te correspondent.
Ton timer s'adaptera à ton rythme.

[Continuer]
```

**Output** : `interactionProfile` → `TimerConfigContext.interaction`

**Composant** : 🆕 Nouveau (cercle animé Reanimated + écran révélation)

**Pourquoi révélation immédiate** : Feedback instantané = validation dopaminergique. Délai = décrochage ADHD.

---

### Filter-060-sound

**Fonction** : Choix son notification fin timer

**UX** :

```
"Quel son pour te signaler la fin ?"

[🔔 Cloche]  [✨ Carillon]  [🔇 Silence]

(Tap = preview audio)
```

**Output** : `selectedSoundId` → `TimerConfigContext.timer`

**Composant** : ♻️ Existant (ex-Filter080, universalisé)

**Note** : Son = accessibilité ADHD (ADR-003). Gratuit pour tous.

---

### Filter-070-notifications

**Fonction** : Permission notifications système

**UX** :

```
"Autoriser les notifications ?"

Pour te prévenir même écran verrouillé.

[Autoriser]  [Plus tard]
```

**Output** : `notificationPermission`, `shouldRequestLater`

**Composant** : ✅ Existant (ex-Filter050, décalé)

---

### Filter-080-paywall

**Fonction** : Conversion naturelle post-investissement

**Timing** : Après création custom + détection persona + configuration son

**UX** :

```
"Tu as créé ton premier moment"

🎸 Guitare — 20 min
Profil : 🎯 Ritualiste

Envie d'en créer d'autres ?

━━━━━━━━━━━━━━━━━━━━━━━━━

15 palettes · 16 activités · Créations illimitées

4,99€ — Une fois, pour toujours

[Essai gratuit 7 jours]

[Peut-être plus tard]
```

**Output** : `purchaseResult: 'trial' | 'purchased' | 'skipped'`

**Composant** : ♻️ Refonte (intègre résumé personnalisé)

**Analytics** :

- `paywall_viewed` (source: 'onboarding')
- `trial_started` / `purchase_completed` / `paywall_skipped`

---

### Filter-090-first-timer

**Fonction** : Premier timer guidé (récompense + démonstration)

**UX Phase 1** (Résumé) :

```
"Ton timer est prêt"

━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Profil : 🎯 Ritualiste
🛠 Outil : 🎨 Créatif
⏱ Moment : 🎸 Guitare

━━━━━━━━━━━━━━━━━━━━━━━━━

[Lancer mon premier timer]
```

**UX Phase 2** (Timer 60s guidé) :

- TimerDial avec activité créée
- MessageZone active (guidage contextuel)
- Interactions selon persona détecté
- Completion = fin OB, entrée app

**Output** : `firstTimerCompleted` → marque fin onboarding

**Composant** : 🆕 Nouveau (réutilise TimerDial + MessageZone)

---

## Stratégie Conversion

### Principe IKEA Effect

L'user crée SON activité en Filter-030. Cet investissement personnel augmente la valeur perçue.

Au moment du paywall (Filter-080), l'user a :

1. Choisi son outil favori (ownership)
2. Créé son activité (investissement temps)
3. Découvert son persona (connexion émotionnelle)
4. Configuré son son (personnalisation)

**Le paywall arrive au pic d'engagement, pas comme interruption.**

### Config Freemium (ADR-003 v1.1)

```
GRATUIT (4 activités total) :
├─ 3 presets système (work, break, breathing)
└─ 1 custom créée en onboarding

PREMIUM (illimité) :
├─ +12 activités presets
├─ Création custom illimitée
└─ +13 palettes
```

**Gap conversion** : User a goûté la création (1 custom) → veut en créer d'autres → paywall naturel

### Tactiques Rappel Post-Skip

Si l'user skip le paywall (Filter-080), stratégie de rappel progressive :

#### Rappel #1 : TwoTimersModal (ADR-003)

**Trigger** : 2ème timer complété

**UX** :

```
"🎉 2 timers complétés !"

Tu prends le rythme.
Envie d'explorer plus de possibilités ?

[Explorer Premium]  [Continuer]
```

**Analytics** : `two_timers_modal_shown`, `two_timers_modal_explore_clicked`

#### Rappel #2 : Tap sur Contenu Premium

**Trigger** : Tap activité/palette premium dans carrousel

**Flow** : DiscoveryModal (preview) → PremiumModal (paywall)

**Analytics** : `discovery_modal_shown`, `discovery_modal_unlock_clicked`

#### Rappel #3 : Création Custom Bloquée

**Trigger** : Tap bouton "+" pour créer 2ème activité custom

**UX** :

```
"Tu as déjà créé ton moment gratuit"

🎸 Guitare — 20 min

Envie de créer sans limites ?

[Débloquer créations illimitées]
```

**Analytics** : `custom_activity_create_attempt_free`

#### Rappel #4 : Notification J+3 (Si Permission Accordée)

**Trigger** : 3 jours après skip paywall, si notifications autorisées

**Message** : "Ta guitare t'attend 🎸 — 20 min pour toi ?"

**Deep link** : Ouvre app sur TimerScreen avec activité créée

#### Rappel #5 : Notification J+7 (Dernière Chance Trial)

**Trigger** : 7 jours après skip paywall

**Message** : "Dernière chance : essai gratuit 7 jours expire bientôt"

**Note** : Uniquement si user n'a jamais lancé trial

### KPIs Cibles

| Métrique              | Cible | Baseline (pré-OB)     |
| --------------------- | ----- | --------------------- |
| Onboarding completion | >65%  | N/A                   |
| Paywall view rate     | 100%  | 35% (optionnel avant) |
| Paywall → Trial       | >20%  | 5.71%                 |
| Trial → Paid          | >50%  | 100%                  |
| Overall conversion    | >10%  | ~3%                   |

---

## Architecture Technique

### Providers (Déjà Consolidés)

```
App()
└── TimerConfigProvider ← Unifié (9 namespaces)
    └── DevPremiumProvider
        └── GestureHandlerRootView
            └── ErrorBoundary
                └── ThemeProvider
                    └── PurchaseProvider
                        └── ModalStackProvider
                            ├── OnboardingFlow
                            └── TimerScreen
```

**Résultat** : OnboardingFlow et TimerScreen ont accès identique à tous contextes.

### Composants Réutilisés

| Composant                    | Usage OB   | Modification                |
| ---------------------------- | ---------- | --------------------------- |
| `CreateActivityModalContent` | Filter-030 | Prop `context="onboarding"` |
| `PulseButton`                | Filter-040 | Aucune                      |
| `PremiumModalContent`        | Filter-080 | Prop `showSummary={true}`   |
| `TimerDial`                  | Filter-090 | Aucune                      |
| `MessageZone`                | Filter-090 | Aucune                      |

### Nouveaux Composants

| Composant                    | Responsabilité                                    |
| ---------------------------- | ------------------------------------------------- |
| `Filter-020-tool.jsx`        | 4 SelectionCard, persist favoriteToolMode         |
| `Filter-040-test-start.jsx`  | Mesure timing press, passe startBehavior          |
| `Filter-050-test-stop.jsx`   | Mesure timing release, calcul persona, révélation |
| `Filter-090-first-timer.jsx` | Résumé + timer guidé 60s                          |

### Events Analytics Ajoutés

| Event                                | Trigger                  | Properties                         |
| ------------------------------------ | ------------------------ | ---------------------------------- | --------------- |
| `tool_selected`                      | Filter-020 complete      | `{ tool: string }`                 |
| `custom_activity_created_onboarding` | Filter-030 complete      | `{ emoji, name_length, duration }` |
| `behavior_start_measured`            | Filter-040 complete      | `{ timing_ms, behavior: 'rapid'    | 'deliberate' }` |
| `behavior_stop_measured`             | Filter-050 test complete | `{ timing_ms, behavior: 'early'    | 'patient' }`    |
| `persona_detected`                   | Filter-050 révélation    | `{ persona: string }`              |
| `paywall_skipped`                    | Filter-080 skip          | `{ time_on_screen_ms }`            |
| `first_timer_completed`              | Filter-090 complete      | `{ duration_sec }`                 |

### Mapping Renommage Fichiers

| Ancien                 | Nouveau                  | Action                  |
| ---------------------- | ------------------------ | ----------------------- |
| Filter010Opening       | Filter-010-opening       | ✅ Keep (rename format) |
| Filter020Needs         | ❌                       | Supprimer               |
| Filter030Creation      | Filter-030-creation      | ♻️ Refonte              |
| Filter040Test          | Filter-090-first-timer   | 📝 Rename + refonte     |
| Filter050Notifications | Filter-070-notifications | 📝 Rename               |
| Filter060Branch        | ❌                       | Supprimer               |
| Filter070Vision        | ❌                       | Supprimer               |
| Filter080Sound         | Filter-060-sound         | 📝 Rename               |
| Filter090Paywall       | Filter-080-paywall       | 📝 Rename + refonte     |
| Filter100Interface     | ❌                       | Supprimer               |
| —                      | Filter-020-tool          | 🆕 Créer                |
| —                      | Filter-040-test-start    | 🆕 Créer                |
| —                      | Filter-050-test-stop     | 🆕 Créer                |

---

## Plan Implémentation

### Phase 0 : Préparation (1h)

1. Supprimer fichiers obsolètes (Needs, Branch, Vision, Interface)
2. Renommer fichiers existants (format kebab-case)
3. Mettre à jour `index.js` exports
4. Commit isolé : `refactor: prepare OB v2.1 file structure`

### Phase 1 : Fondations (3-4h)

1. Modifier `CreateActivityModalContent` (prop `context`)
2. Créer `Filter-020-tool.jsx` (4 SelectionCard)
3. Refondre `Filter-030-creation.jsx` (wrapper)
4. Mettre à jour freemium config (3 presets + 1 custom slot)
5. Commit : `feat(ob): add Tool filter + Creation refonte`

### Phase 2 : Détection Comportementale (3-4h)

1. Créer `Filter-040-test-start.jsx` (mesure timing)
2. Créer `Filter-050-test-stop.jsx` (mesure + révélation persona)
3. Implémenter matrice persona ADR-008
4. Persist `interactionProfile` dans TimerConfigContext
5. Commit : `feat(ob): add behavioral detection (ADR-008)`

### Phase 3 : Orchestration (2-3h)

1. Refondre `Filter-080-paywall.jsx` (résumé personnalisé)
2. Créer `Filter-090-first-timer.jsx` (résumé + timer guidé)
3. Refondre `OnboardingFlow.jsx` (9 filtres, flow linéaire)
4. Ajouter events analytics
5. Commit : `feat(ob): complete v2.1 flow orchestration`

### Phase 4 : Polish (1-2h)

1. Transitions animations entre filtres
2. Copy/ton des textes (i18n keys)
3. Tests E2E parcours complet
4. Commit : `polish(ob): animations + copy + tests`

### Phase 5 : Rappels Post-Skip (2h)

1. Implémenter notification J+3 (si permission)
2. Implémenter notification J+7 (dernière chance)
3. Vérifier TwoTimersModal fonctionnel
4. Commit : `feat(ob): post-skip reminder system`

---

## Validation Checklist

### Avant Déploiement

- [ ] 9 filtres fonctionnels (010-090)
- [ ] Flow linéaire sans branches
- [ ] Persona détecté et persisté
- [ ] Custom activity sauvegardée (1 slot gratuit)
- [ ] Paywall affiche résumé personnalisé
- [ ] FirstTimer utilise config persona
- [ ] Events analytics tous trackés
- [ ] Rappels post-skip configurés

### KPIs à Monitorer (Semaine 1 Post-Deploy)

- [ ] Onboarding completion rate
- [ ] Drop-off par filtre (funnel)
- [ ] Paywall view → trial rate
- [ ] Persona distribution (4 types)
- [ ] Tool preference distribution (4 modes)

---

## Documents Liés

- **ADR-003** : Stratégie Monétisation (freemium config)
- **ADR-005** : Architecture DialZone/AsideZone
- **ADR-007** : Timer State Machine
- **ADR-008** : Personas & Personnalisation

---

## Historique

| Version | Date       | Changement             |
| ------- | ---------- | ---------------------- |
| 1.0     | 2025-12-22 | Vision finale acceptée |

---

**Document** : ADR-010 Onboarding v2.1 Vision Finale
**Statut** : ACCEPTED
**Prêt pour** : Implémentation Phase 0
