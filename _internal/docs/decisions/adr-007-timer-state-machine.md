# ADR-007 : Machine d'états Timer — Suppression PAUSED + Pattern Rembobinage

## Statut : ACCEPTÉ

**Date creation :** 19 decembre 2025
**Date acceptation :** 19 decembre 2025
**Auteur :** Eric Zuber + Claude

---

## Contexte

### Probleme initial

ResetPulse est un **timer VISUEL**. Le concept fondamental est que le temps s'ecoule visuellement.

L'etat `PAUSED` posait plusieurs problemes :

1. **Confusion semantique** : "Pause" est aussi le nom d'une activite (Pause cafe)
2. **Modele mental flou** : Un timer visuel qui "se fige" contredit la metaphore
3. **Complexite code** : 10+ fichiers impactent par l'etat isPaused
4. **UX inconsistante** : Tap = pause vs long press = reset (non intuitif)

### Question architecturale

> Si on supprime PAUSED, comment l'utilisateur arrete-t-il un timer en cours ?

---

## Decision

### Principe fondamental

> "Un timer visuel avance ou rembobine. Il ne se fige jamais."

### Machine d'etats simplifiee

```
AVANT : REST <-> RUNNING <-> PAUSED -> COMPLETE
APRES : REST <-> RUNNING -> COMPLETE
              ^              |
              |    (tap)     |
              +--------------+
```

**3 etats seulement :**

| Etat | Description | Transition sortante |
|------|-------------|---------------------|
| **REST** | Timer pret, duree definie | Tap → RUNNING |
| **RUNNING** | Timer en cours, temps decompte | 0s → COMPLETE, Rembobinage → REST |
| **COMPLETE** | Timer termine, message affiche | Tap → REST |

### Pattern "Rembobinage" (nouvelle interaction STOP)

L'arret d'un timer en cours utilise une **friction intentionnelle** :

| Parametre | Valeur | Justification |
|-----------|--------|---------------|
| **Geste** | Long press | Differencie du tap (action deliberee) |
| **Duree** | 2500ms (defaut) | Friction suffisante contre abandon accidentel |
| **Feedback visuel** | Cercle qui se remplit | Progres visible, annulable |
| **Direction animation** | **Inverse** du sens timer | Metaphore "rembobinage" |
| **Resultat** | REST (pas STOP intermediaire) | Simplification maximale |

### Duree confirmation personnalisable

La duree du long press est **adaptable** pour l'accessibilite :

| Parametre | Valeur |
|-----------|--------|
| **Defaut** | 2500ms |
| **Minimum** | 1000ms |
| **Maximum** | 5000ms |

**Calibration :**
- Calculee lors de l'onboarding (test long press utilisateur)
- Ajustable dans Settings > Accessibilite
- Stockee : `TimerOptionsContext.longPressConfirmDuration`

**Justification accessibilite :**
- Utilisateurs TDAH : duree plus courte (moins de friction cognitive)
- Utilisateurs avec tremblements : duree plus longue (evite declenchements accidentels)
- Personnalisation = inclusivite

### Animation Rembobinage

```
Timer sens horaire :
  - Normal : cercle se vide dans sens horaire
  - Rembobinage : cercle se RE-remplit dans sens ANTI-horaire

Timer sens anti-horaire :
  - Normal : cercle se vide dans sens anti-horaire
  - Rembobinage : cercle se RE-remplit dans sens HORAIRE
```

**Metaphore visuelle** : On "rembobine" le temps, on ne le "stoppe" pas.

---

## Flow d'interaction final

### Dial (centre)

| Etat | Tap | Long press 3s |
|------|-----|---------------|
| REST | START → RUNNING | Rien |
| RUNNING | Rien | REMBOBINAGE → REST |
| COMPLETE | RESET → REST | Rien |

### Bouton PlaybackButtons

| Etat | Icone | Tap | Long press 3s |
|------|-------|-----|---------------|
| REST | Play | START | Rien |
| RUNNING | Stop | Rien | REMBOBINAGE → REST |
| COMPLETE | Reset | RESET | Rien |

---

## Messaging System

### Principes

Le système de messaging guide l'utilisateur à travers chaque étape du timer avec des messages clairs et contextuels.

### States et Messages

| État Timer | Trigger | Message affiché | Durée | Comportement |
|-----------|---------|-----------------|-------|-------------|
| **REST** | Défaut | `t('invitation')` = "Prêt ?" | Permanent | Invite à sélectionner une activité |
| **SÉLECTION** | Tap activité carousel | `"🎯 {emoji} {label}"` flash | 2s → REST | Confirme le choix, retourne auto à "Prêt ?" |
| **RUNNING** | Tap play | `timerMessages.{activityId}.startMessage` + dots animés | Permanent | Message motivant adapté à l'activité (ex: "Focus...", "Détente...", "Respire...") |
| **COMPLETE** | Timer = 0s | `timerMessages.{activityId}.endMessage` + NO dots | 3500ms | Message de célébration (ex: "Accompli ✨", "Rechargé 🔋") |
| **TRANSITION** | Après COMPLETE | Silence / vide | 300ms | Espace de respiration visuelle |
| **RESET** | Tap reset ou auto après délai | `t('invitation')` = "Prêt ?" | Permanent | Retour au repos |

### Comportement détaillé

**1. Au démarrage (REST)**
- Affiche: `t('invitation')` ("Prêt ?", "Ready?", "Bereit?", etc. selon langue)
- User peut sélectionner une activité dans ActivityCarousel

**2. Sélection d'activité (SÉLECTION)**
- User tap une activité → déclenche le **flash state**
- Affiche: `"{emoji} {label}"` (ex: "☕ Pause")
- Durée: 2s
- Auto-retour: "Prêt ?"
- Charge la durée sauvegardée pour cette activité

**3. Pendant le countdown (RUNNING)**
- User tap play → timer lance et affiche le startMessage
- Affiche: `timerMessages.{activityId}.startMessage` + points animés (".", "..", "...")
- Points tournent selon `activity.pulseDuration` (400-800ms par défaut)
- Le message change JAMAIS pendant la session, pour focus max

**4. Timer terminé (COMPLETE)**
- Affiche: `timerMessages.{activityId}.endMessage` (ex: "Accomplished ✨")
- Points disparaissent (importé isCompleted supprime les dots)
- Visible pendant 3500ms
- User peut taper dial pour retourner REST

**5. Transition (RESET)**
- Après les 3500ms de COMPLETE, délai de 300ms de silence
- Aucun message affiché = espace de respiration
- Puis retour auto à "Prêt ?"

### Traductions (i18n)

**Clés i18n requises:**

```json
{
  "invitation": "Prêt ?",  // NEW - invitation au repos
  "timerMessages": {
    "none": {
      "startMessage": "Ready",
      "endMessage": "Well done 🎉"
    },
    "work": {
      "startMessage": "Focus",
      "endMessage": "Accomplished ✨"
    },
    "break": {
      "startMessage": "Rest",
      "endMessage": "Recharged 🔋"
    },
    // ... 12 autres activités
  }
}
```

**Couverts: 15 langues**
- EN, FR, ES, DE, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO

### States et Props

**Dans TimerOptionsContext:**
```javascript
// NEW - Flash state pour sélection activité
const [flashActivity, setFlashActivity] = useState(null);
const [flashTimeout, setFlashTimeout] = useState(null);

// Déclencher le flash
const handleActivitySelect = (activity) => {
  setFlashActivity(activity);
  if (flashTimeout) clearTimeout(flashTimeout);
  setFlashTimeout(
    setTimeout(() => {
      setFlashActivity(null);
    }, 2000)  // 2 secondes
  );
};
```

**Dans ActivityLabel:**
```javascript
const getMessage = (timerState, currentActivity, flashActivity) => {
  // 1. Flash state prioritaire (sélection activité)
  if (flashActivity) {
    return `${flashActivity.emoji} ${flashActivity.label}`;
  }

  // 2. États du timer
  if (timerState === 'REST') return t('invitation');      // "Prêt ?"
  if (timerState === 'RUNNING') return displayMessage;    // startMessage + dots
  if (timerState === 'COMPLETE') return displayMessage;   // endMessage, no dots

  return '';  // Défaut
};
```

### Fichiers à modifier

| # | Fichier | Changement |
|---|---------|-----------|
| 1 | `locales/*.json` | ADD clé `invitation` (pour "Prêt ?" i18n) |
| 2 | `TimerOptionsContext.jsx` | ADD `flashActivity` + `setFlashActivity` + `handleActivitySelect()` |
| 3 | `ActivityCarousel.jsx` | Utiliser `handleActivitySelect()` au lieu de `setCurrentActivity()` directement |
| 4 | `ActivityLabel.jsx` | Utiliser `getMessage()` avec flashActivity en priorité |
| 5 | `useTimer.js` | Renommer `displayTime()` → `getDisplayMessage()` (clarté) |

### Timings de confirmation

| Élément | Délai | Raison |
|--------|-------|--------|
| COMPLETE message visible | 3500ms | Laisser l'utilisateur savourer l'accomplissement |
| Délai de transition | 300ms | Espace de respiration visuelle |
| Flash sélection activité | 2000ms | Assez long pour confirmer, pas trop pour bloquer |

---

## Implementation technique

### Composant nouveau : LongPressStopButton

```javascript
// Specifications
const DEFAULT_DURATION = 2500; // 2.5 secondes
const MIN_DURATION = 1000;     // 1 seconde
const MAX_DURATION = 5000;     // 5 secondes

// Props
interface LongPressStopButtonProps {
  onComplete: () => void;      // Appele apres duration
  clockwise: boolean;          // Sens timer (pour inverser)
  duration?: number;           // Duree confirmation (defaut: context)
  disabled?: boolean;          // Inactif si !RUNNING
  size?: number;               // Taille bouton
}

// Animation
// - SVG Circle avec strokeDasharray/strokeDashoffset
// - Reanimated 2 pour 60fps
// - Direction = inverse de clockwise
// - onPressIn = start animation
// - onPressOut avant 3s = cancel + reverse animation
// - 3s atteint = onComplete + haptic warning
```

### Fichiers impactes (ordre d'implementation)

| # | Fichier | Changements |
|---|---------|-------------|
| 1 | `useTimer.js` | Supprimer isPaused, ajouter stopTimer() |
| 2 | `TimerOptionsContext.js` | Ajouter longPressConfirmDuration (2500ms defaut) |
| 3 | `LongPressStopButton.jsx` | **NOUVEAU** - Bouton avec animation rembobinage |
| 4 | `TimerDial.jsx` | Long press centre → animation rembobinage |
| 5 | `TimeTimer.jsx` | Exposer stopTimer, connecter long press |
| 6 | `DialZone.jsx` | Passer onRewind callback |
| 7 | `TimerScreen.jsx` | Handler handleRewind |
| 8 | `PlaybackButtons.jsx` | Utiliser LongPressStopButton |
| 9 | `DialCenter.jsx` | Supprimer prop isPaused |
| 10 | `PlayPauseButton.jsx` | Supprimer isPaused, simplifier etats |
| 11 | `timer-events.js` | Supprimer reason 'paused', garder 'reset' |
| 12 | `SettingsModal.jsx` | Ajouter slider Accessibilite > Duree confirmation |

### Haptic feedback

| Action | Type haptic | Justification |
|--------|-------------|---------------|
| START | Light (success) | Confirmation positive |
| REMBOBINAGE complete | Heavy (warning) | Abandon = action significative |
| COMPLETE naturel | Medium (notification) | Accomplissement |
| Rembobinage annule | Aucun | Pas d'action effectuee |

---

## Consequences

### Positives

| Benefice | Impact |
|----------|--------|
| **Clarte conceptuelle** | Timer = avance ou rembobine, jamais fige |
| **Pas de confusion** | "Pause" = activite, pas etat timer |
| **Friction intentionnelle** | Abandon = decision deliberee (3s) |
| **Code simplifie** | -1 etat, -10 conditions isPaused |
| **Animation coherente** | Rembobinage = metaphore visuelle forte |

### Negatives

| Contrainte | Mitigation |
|------------|------------|
| Pas de pause rapide | Feature intentionnellement retiree |
| Animation a implementer | Reanimated 2 deja installe |
| Breaking change UX | Communication utilisateur si necessaire |
| Long press moins discoverable | Icone Stop + tooltip onboarding |

### Neutres

| Aspect | Note |
|--------|------|
| Analytics | 'paused' → 'reset' (meme semantique abandon) |
| Notifications | Simplification (plus de reprogrammation post-pause) |
| Background | Inchange (timer continue en background) |

---

## Alternatives considerees

### A. Garder PAUSED avec nouveau nom

**Rejete** : Ne resout pas le probleme conceptuel (timer fige = non-visuel)

### B. Double tap pour STOP

**Rejete** : Moins intuitif que long press, pas de feedback progressif

### C. Swipe pour STOP

**Rejete** : Conflit potentiel avec gestes drawer/carrousels

### D. Bouton STOP separe (sans friction)

**Rejete** : Trop facile d'abandonner accidentellement

---

## Tests validation

### Comportement de base
- [ ] Tap dial REST → START (timer demarre)
- [ ] Tap dial RUNNING → rien (pas d'action)
- [ ] Long press dial < duration RUNNING → animation puis annulation
- [ ] Long press dial = duration RUNNING → STOP + haptic + retour REST
- [ ] Animation rembobinage = sens inverse du timer
- [ ] Meme comportement sur bouton PlaybackButtons
- [ ] Timer atteint 0 → COMPLETE → tap → REST
- [ ] Analytics: event timer_abandoned reason='reset' (pas 'paused')

### Duree personnalisable
- [ ] Defaut 2500ms fonctionne
- [ ] Duree depuis context respectee
- [ ] Min 1000ms applique
- [ ] Max 5000ms applique
- [ ] Settings > Accessibilite modifie la valeur
- [ ] Valeur persistee entre sessions

---

## References

- **State machine** : `src/hooks/useTimer.js`
- **Gestes dial** : `src/components/dial/TimerDial.jsx`
- **ADR-006** : Stack gestes (contexte technique)
- **Audit prealable** : Conversation Claude 2025-12-19

---

## Changelog

- **2025-12-19** : Creation ADR (statut PROPOSITION)
