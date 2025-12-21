*Ajuste les seuils, nettoie le texte*

---

# ADR-008 : Personnalisation & Profils Utilisateur

## Statut : VALIDÉ v1.1

**Date :** 20 décembre 2025 (révisé 21 décembre 2025)  
**Décideurs :** Eric + Chrysalis

---

## Contexte

ResetPulse s'adresse à des cerveaux neurodivergents. Chaque cerveau fonctionne différemment. L'app doit s'adapter à l'utilisateur, pas l'inverse.

Deux axes de personnalisation identifiés :

1. **Comment l'user interagit** (gestes start/stop)
2. **Ce que l'user veut voir** (outil favori)

---

## Décision

### Axe 1 : Profils d'interaction (PulseButton)

4 personas basés sur des patterns neuroatypiques réels :

| Persona      | Emoji | Start | Stop | Description                               |
| ------------ | ----- | ----- | ---- | ----------------------------------------- |
| Impulsif     | 🚀    | Long  | Tap  | "Je démarre vite, j'ai besoin de freiner" |
| Abandonniste | 🏃    | Tap   | Long | "J'ai du mal à tenir jusqu'au bout"       |
| Ritualiste   | 🎯    | Long  | Long | "J'aime les actions délibérées"           |
| Véloce       | ⚡    | Tap   | Tap  | "Je sais ce que je veux"                  |

**Config appliquée :**

- `startRequiresLongPress`: boolean
- `stopRequiresLongPress`: boolean
- `longPressDuration`: number (ms, personnalisable)

**Stockage :** TimerOptionsContext

---

### Axe 2 : Outil favori (Favorite Tool)

4 modes pour le snap 15% du bottomsheet :

| Mode         | Emoji | Label        | Affichage           |
| ------------ | ----- | ------------ | ------------------- |
| Créatif      | 🎨    | Créatif      | Carrousel couleurs  |
| Minimaliste  | ☯     | Minimaliste  | Rien (handle seul)  |
| Multi-tâches | 🔄    | Multi-tâches | Carrousel activités |
| Rationnel    | ⏱     | Rationnel    | ControlBar          |

**Stockage :** UserPreferencesContext (`favoriteToolMode`)

---

## Détection comportementale (Onboarding)

Pas de questions déclaratives. On observe l'user pendant 2 écrans ludiques.

### Écran 1 — Test Start

"Quand tu es prêt, appuie"

Mesure :

- Tap rapide (< 800ms) → tendance Véloce/Abandonniste
- Maintien long (≥ 800ms) → tendance Ritualiste/Impulsif

### Écran 2 — Test Stop

"Maintenant, lâche quand tu veux"

Un cercle se remplit (5 secondes). Mesure :

- Lâche tôt (< 2.5s) → tendance Impulsif/Véloce
- Attend milieu/fin (≥ 2.5s) → tendance Ritualiste/Abandonniste

### Matrice de détection

| Écran 1 (Start) | Écran 2 (Stop) | Profil détecté  |
| --------------- | -------------- | --------------- |
| < 800ms         | < 2.5s         | ⚡ Véloce       |
| < 800ms         | ≥ 2.5s         | 🏃 Abandonniste |
| ≥ 800ms         | < 2.5s         | 🚀 Impulsif     |
| ≥ 800ms         | ≥ 2.5s         | 🎯 Ritualiste   |

**Note :** Seuils choisis pour tolérance neuroatypique (fatigue motrice, variabilité attentionnelle).

---

## Choix Outil Favori (Onboarding)

Question directe, visuelle, placée **avant** les tests comportementaux :

> "Qu'est-ce qui te correspond le mieux ?"
>
> [🎨 Créatif] [☯ Minimaliste] [🔄 Multi-tâches] [⏱ Rationnel]

**Raison de l'ordre :** Question légère d'abord, effort cognitif (tests) ensuite. L'utilisateur sait ce qu'il préfère visuellement sans analyse comportementale.

---

## Settings Panel

Les deux axes modifiables dans Settings, en haut du panel :

```
── TOI ──
🎭 Comment tu fonctionnes (4 personas)
⚙️ Ton raccourci préféré (4 modes)

── TES FAVORIS ──
⭐ Activités favorites
🎨 Palettes favorites

── TIMER ──
🕰️ Échelle du cadran
⏱️ Options du timer
🔄 Sens de rotation

── AMBIANCE ──
🔊 Son de notification
💡 Keep Awake
🎨 Thème

── INFO ──
ℹ️ À propos
```

Headers légers (texte uppercase, couleur muted) entre les groupes.

---

## Composants

### SelectionCard.jsx (réutilisable)

```jsx
Props:
- emoji: string
- label: string
- description: string
- selected: boolean
- onSelect: () => void
- compact?: boolean
```

### SectionHeader.jsx

```jsx
Props:
- title: string

Style:
- uppercase
- fontSize: 12-13px
- color: muted
- marginTop: 24px
- marginBottom: 8px
```

---

## Justification

### Pourquoi 4 personas ?

Couvre les patterns principaux sans complexifier. Basé sur retours terrain (famille neuroatypique) et littérature TDAH/TSA.

### Pourquoi comportemental vs déclaratif ?

L'user ne se connaît pas toujours. Observer > demander. Plus ludique, moins "test psy".

### Pourquoi modifiable dans Settings ?

L'user peut se tromper ou évoluer. Pas de prison. L'app reste flexible.

### Pourquoi Tool avant Tests dans l'onboarding ?

Minimise charge cognitive initiale. Question visuelle simple → effort comportemental après. Pas de storytelling "Tu es X donc Y" style Buzzfeed.

---

## Conséquences

### Positives

- Personnalisation profonde sans friction
- Chaque cerveau trouve sa config
- Différenciateur marketing fort
- Onboarding ludique et rapide

### Négatives

- Complexité implémentation détection
- 4×4 = 16 combinaisons à tester

---

## Hors Scope

- **Pomodoro Flow** : Mode spécial avec activités pré-configurées (feature future)
- **Settings Discovery Modal** : Invitation post-onboarding à explorer réglages (rétention, pas acquisition)

---

## Références

- ADR-007 : Gestes & Confirmation Long Press
- ADR-005 : Architecture DialZone / AsideZone
- Session Chrysalis-Eric 18-20 décembre 2025

---

**Changelog v1.1 :**
- Seuils révisés : 500ms→800ms (start), 2s→2.5s (stop)
- Justification ordre Tool avant Tests ajoutée
- Hors scope explicité