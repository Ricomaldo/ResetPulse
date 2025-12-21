---
created: '2025-12-19'
updated: '2025-12-19'
status: active
type: workflow
tags: [design-system, color-audit, process]
---

# Debug Color Audit Process

## Objectif

Valider que chaque couleur = un rôle unique. Détecter les conflits sans réfléchir.

**Mantra** : Si tu dois expliquer une couleur, elle est mal utilisée.

---

## Palette de référence

| Rôle | Couleur | Hex | Règle |
|------|---------|-----|-------|
| Primary | 🟦 Bleu | `#0066FF` | 1 seul par écran |
| Secondary | 🟪 Violet | `#7B2CFF` | Ne rivalise jamais avec Primary |
| Accent | 🟧 Orange | `#FF8A00` | État, jamais action |
| Background | ⬛ Noir | `#121212` | Monde passif |
| Surface | 🟩 Vert | `#1AFF6A` | Conteneur, non-cliquable |
| SurfaceElevated | 🟨 Jaune | `#FFF200` | Bloque le flux |
| UserColor | 🎨 Palette | (variable) | Contenu user, inchangé |

---

## Phase 0 — Préparation

### Checklist

- [ ] **Question clé** : Quelle est l'action principale de cet écran ?
  - Si pas de réponse claire → problème détecté

- [ ] **Couleurs brutes appliquées** :
  - [ ] Pas de dégradé
  - [ ] Pas d'opacité
  - [ ] Pas de blur
  - [ ] Pas d'ombre (sauf surfaceElevated)

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 1 — Scan macro (1 mètre)

Recule ou plisse les yeux.

### Checklist

- [ ] Quelle couleur attire en premier ? → ___________
- [ ] Y a-t-il UNE couleur dominante d'action ? → Oui / Non
- [ ] Combien de couleurs chaudes visibles simultanément ? → ___

### Red flags

- [ ] ❌ Bleu + violet + orange au même niveau
- [ ] ❌ Tout attire = rien n'attire

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 2 — Scan par rôle (passes mentales)

### Passe 1 : Primary (🟦 bleu)

Masque mentalement tout sauf le bleu.

- [ ] Y a-t-il plus d'un Primary visible ? → Oui / Non
- [ ] Est-il dans la zone de pouce ? → Oui / Non
- [ ] Est-il visible sans lire le texte ? → Oui / Non

**Résultat attendu** : Je sais quoi faire, sans réfléchir.

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

### Passe 2 : Secondary (🟪 violet)

- [ ] Ces actions sont-elles vraiment optionnelles ? → Oui / Non
- [ ] Y en a-t-il trop ? → Oui / Non
- [ ] Rivalisent-elles avec le Primary ? → Oui / Non

**Red flag** : Si Secondary attire plus que Primary → erreur

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

### Passe 3 : Accent (🟧 orange)

- [ ] Sert-il à indiquer un état ? → Oui / Non
- [ ] Est-il ponctuel ? → Oui / Non
- [ ] Est-il temporaire ? → Oui / Non

**Red flag** : Accent permanent = bruit visuel

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 3 — Analyse structurelle (surfaces)

### Passe 4 : Surface (🟩 vert)

Tout ce qui est vert = conteneur.

- [ ] Y a-t-il trop de surfaces ? → Oui / Non
- [ ] Surfaces à fusionner ? → ___________
- [ ] Surface dans surface sans justification ? → Oui / Non

**Red flag** : Surface imbriquée inutile = dette

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

### Passe 5 : SurfaceElevated (🟨 jaune)

Tout ce qui est jaune bloque ou surplombe.

- [ ] L'utilisateur peut-il interagir avec le fond ?
  - Non → jaune OK
  - Oui → erreur de rôle

**Règle** : SurfaceElevated = interruption du flux

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 4 — Hiérarchie spatiale

### Test blur (80%)

Floute le screenshot à 80%.

- [ ] Le Primary ressort-il encore ? → Oui / Non
- [ ] Le focus est-il cohérent ? → Oui / Non

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 5 — Test d'absurdité

Vérifie ces phrases :

- [ ] "Je peux cliquer sur tout ce qui est bleu" → Vrai / Faux
- [ ] "L'orange ne m'invite pas à agir" → Vrai / Faux
- [ ] "Le vert ne fait rien" → Vrai / Faux
- [ ] "Le jaune m'empêche de voir le reste" → Vrai / Faux

**Si une phrase est fausse → bug DS**

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Phase 6 — Cohérence multi-écrans

Aligner 3 screenshots côte à côte.

- [ ] Le Primary est-il toujours bleu ? → Oui / Non
- [ ] L'Accent sert-il toujours au même rôle ? → Oui / Non
- [ ] Le jaune est-il rare ? → Oui / Non

**Règle** : Cohérence > esthétique

**Insight** : _[noter ici]_

**Action** : _[noter ici]_

---

## Résumé exécution

| # | Phase | Status |
|---|-------|--------|
| 0 | Préparation | ✅ |
| 1 | Scan macro | ✅ |
| 2a | Primary | ✅ |
| 2b | Secondary | ✅ |
| 2c | Accent | ✅ |
| 3a | Surface | ✅ |
| 3b | SurfaceElevated | ✅ |
| 4 | Blur test | ⬜ (skipped) |
| 5 | Test absurdité | ✅ 4/4 |
| 6 | Multi-écrans | ⬜ (backlog: modals/onboarding) |

---

## Audit 2025-12-20 — Findings

### Corrigés en live
| # | Élément | Avant | Après |
|---|---------|-------|-------|
| 1 | AsideZone collapsed | 🟨 surfaceElevated | 🟩 surface |
| 2 | Carrousels fond | 🟨 surfaceElevated | ⬛ background |
| 4 | Fond dial | 🟩 surface | ⬛ background |

### À traiter
| # | Élément | Actuel | Attendu |
|---|---------|--------|---------|
| 3 | Bouton "+" et "Encore plus de couleurs" | 🟦 primary | 🟪 secondary |
| 5 | Overlay BottomSheet expanded | ⬛ background | `overlay` (rgba ~50%) |
| 6 | Boutons dans sheet expanded | 🟩 surface | 🟪/🟦 selon action |

### Backlog
- [ ] Modales (Settings, Premium, Discovery)
- [ ] Onboarding screens

→ Voir `backlog/mission-modals-onboarding-style-conformity.md`

---

## Décisions UX validées

1. **Action principale timer arrêté** = Régler et lancer le timer → 🟦 Play
2. **Action principale timer actif** = Se concentrer (lâcher l'app) → 🟪 Stop (sortie de secours)
3. **Dial** = partie du monde (background), pas objet flottant (surface)
