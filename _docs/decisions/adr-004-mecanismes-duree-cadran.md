# ADR-004 : Gestion Durée et Cadran

## Statut : VALIDÉ (v2)
**Date :** 18 décembre 2025 (v1) → 19 décembre 2025 (v2)
**Décideurs :** Eric + Claude

---

## Contexte

ResetPulse est un timer visuel pour neurodivergents. Le dial affiche le temps restant proportionnellement à une échelle (cadran).

**Deux concepts distincts :**
- **Durée** : combien de temps je veux (ex: 25 min)
- **Échelle cadran** : graduation max du dial (ex: 30 min ou 60 min)

**Problème v1 :**
La v1 proposait deux contrôles séparés visibles (incrémenteur + 4 boutons échelle), créant une complexité cognitive inutile.

**Solution v2 :**
Simplifier en exposant uniquement les presets de durée, avec adaptation du cadran via bouton FIT.

---

## Décision (v2)

### ControlBar - Layout unifié

```
┌────────────────────────────────────────────────────────────┐
│  [5][15][30][60]   [−] ══25:00══ [+]   [▶]   [⊡]   [↻]    │
│     PRESETS           DURÉE           RUN   FIT   ROTATE   │
└────────────────────────────────────────────────────────────┘
```

### Composants

| Composant | Rôle | Fichier |
|-----------|------|---------|
| `DurationPresets` | 4 boutons durée (5, 15, 30, 60 min) | `controls/DurationPresets.jsx` |
| `DigitalTimer` | Affichage + contrôles +/- | `controls/DigitalTimer.jsx` |
| `PulseButton` | Run/Stop/Reset unifié (ADR-007) | `buttons/PulseButton.jsx` |
| `FitButton` | Adapter cadran à durée | `controls/FitButton.jsx` |
| `CircularToggle` | Sens horaire/anti-horaire | `toolbox/controls/CircularToggle.jsx` |
| `ControlBar` | Container horizontal | `controls/ControlBar.jsx` |

### Comportements

| Action | Résultat |
|--------|----------|
| Tap preset [15] | Durée = 15 min |
| Tap `+` | Durée +1 min (ou +5 si > 10 min) |
| Tap `-` | Durée -1 min (ou -5 si > 10 min) |
| Long press `+/-` | Accélération |
| Tap FIT [⊡] | Cadran s'adapte à la durée (optimal) |
| Tap RUN [▶] | Start timer (ADR-007) |
| Long press RUN | Stop timer (ADR-007) |
| Tap ROTATE [↻] | Toggle sens horaire |

### Logique FIT (adaptation cadran)

```javascript
// Trouve l'échelle optimale pour la durée
if (duration <= 5min)  → scale = 5min
if (duration <= 15min) → scale = 15min
if (duration <= 30min) → scale = 30min
else                   → scale = 60min
```

### Contraintes

- Durée min : 1 min
- Durée max : échelle cadran actuelle
- Échelles disponibles : 5, 15, 30, 60 minutes
- Presets = durées fixes (pas d'auto-adaptation cadran)

---

## Justification

### Pourquoi simplifier vs v1 ?

La v1 exposait deux contrôles (durée + échelle) créant une charge cognitive. La plupart des users veulent juste "25 min" sans penser au cadran.

**v2 :** Presets = durée. Le cadran s'adapte manuellement via FIT si besoin.

### Pourquoi 4 presets (5/15/30/60) ?

- **5 min** : micro-pauses, respirations
- **15 min** : Pomodoro court, focus rapide
- **30 min** : Pomodoro standard
- **60 min** : sessions longues, deep work

### Pourquoi un bouton FIT explicite ?

- Action intentionnelle (pas d'auto-magic confusant)
- Icône Focus (Lucide) = ajuster/cibler
- L'user power comprend, le casual n'en a pas besoin

---

## Emplacement UI

Le `ControlBar` apparaît dans :
1. **AsideZone Layer 1** (snap 15%) — mode compact
2. **AsideZone Layer 2** (snap 38%) — mode compact

---

## Migration v1 → v2

### Fichiers supprimés (archivés)
- `CommandsPanel.jsx` → remplacé par `ControlBar.jsx`
- `ScaleButtons.jsx` → remplacé par `DurationPresets.jsx`
- `DurationIncrementer.jsx` → fusionné dans `DigitalTimer.jsx`
- `PlaybackButtons.jsx` → remplacé par `ControlBar.jsx`

### Nouveau dossier
```
src/components/controls/
├── index.js
├── ControlBar.jsx
├── DigitalTimer.jsx
├── DurationPresets.jsx
└── FitButton.jsx
```

### Archive
```
_internal/docs/legacy/code-archive/components-legacy-2025-12-19/
```

---

## Implémentation

### Fichiers impactés
- `src/components/controls/*` : nouveaux composants
- `src/components/layout/aside-content/Layer1.jsx` : utilise ControlBar
- `src/components/layout/aside-content/Layer2.jsx` : utilise ControlBar
- `src/components/layout/AsideZone.jsx` : props isCompleted, onPlay
- `src/screens/TimerScreen.jsx` : passe isTimerCompleted

### Tests
- [x] Presets sélectionnent durée
- [x] Incrémenteur +/- fonctionne
- [x] FIT adapte cadran
- [x] PulseButton états REST/RUNNING/COMPLETE
- [x] DigitalTimer mode remaining (dial zone)
- [x] DigitalTimer mode duration (ControlBar)

---

## Références

- Session Eric-Claude 19 décembre 2025
- ADR-007 : PulseButton et suppression PAUSED
- ADR-003 : Stratégie Conversion
