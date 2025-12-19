---
created: '2025-12-19'
updated: '2025-12-19'
status: active
type: devlog
tags: [design-system, color-audit, learnings]
---

# Color System - Learnings

## Insight #1 : Couleur ≠ Élévation

```
Surface = couleur
Surface Elevated = comportement (shadow, motion, z-index)
```

En PROD, les deux peuvent être `#FFFFFF`. La différence = shadow + motion.

---

## Insight #2 : Pourquoi déclarer surfaceElevated si même couleur ?

**Réponse** : On déclare le RÔLE, pas la couleur.

```jsx
// Ça raconte une histoire :
backgroundColor: colors.surfaceElevated

// Ça ne dit rien :
backgroundColor: '#FFF'
```

**Bénéfices** :
- Évolution sans refactor (demain `#FAFAFA` ? → 0 changement composants)
- Support thèmes (dark mode = couleurs différentes)
- Garde-fou cognitif (devs/designers suivent la règle)

**Règle senior** :
> Même rendu + rôle différent = deux tokens différents

---

## Insight #3 : Texte neutre en debug dark

**Règle** : Le texte doit rester NEUTRE et NON SIGNIFIANT.
Il ne doit JAMAIS entrer en compétition avec les couleurs de rôle.

**Palette texte debug (sur background #121212) :**

| Token | Hex | Usage |
|-------|-----|-------|
| `text` | `#E0E0E0` | Valeur principale (temps, titres) |
| `textSecondary` | `#9E9E9E` | Labels, statuts, feedback passif |
| `textDisabled` | `#6B6B6B` | Hint, clairement passif |

**À éviter :**
- ❌ `#FFFFFF` partout (trop agressif)
- ❌ Texte coloré (bleu, orange = réservé aux rôles)
- ❌ Opacité sur blanc (brouille la lecture)

**Hiérarchie timer screen :**
```
Temps central    → #E0E0E0 (text)
ActivityLabel    → #9E9E9E (textSecondary)
Presets texte    → #9E9E9E (textSecondary)
Disabled         → #6B6B6B (textDisabled)
```

---

## Insight #4 : Neutral = infrastructure visuelle

**Problème** : `textSecondary` est pour du TEXTE, pas pour des bordures.

**Solution** : Token `neutral` dédié à l'infrastructure.

| Token | Usage correct |
|-------|---------------|
| `text` | Texte principal |
| `textSecondary` | Texte secondaire (réglages) |
| `neutral` | Infrastructure (bordures, graduations, dividers) |

**Application dial :**
```
Cadre dial       → neutral (infrastructure)
Graduations      → neutral (infrastructure)
Fond dial        → background (passif)
Arc progression  → user color (contenu)
```

**Règle** : Ne jamais détourner un token texte pour des éléments non-textuels.

---

## Palette Debug

| Rôle | Hex | Usage |
|------|-----|-------|
| **Primary** 🟦 | `#0066FF` | Action principale (Play) |
| **Secondary** 🟪 | `#7B2CFF` | Action secondaire (Stop) |
| **Accent** 🟧 | `#FF8A00` | État sélectionné |
| **Background** ⬛ | `#121212` | Monde passif |
| **Surface** 🟩 | `#1AFF6A` | Conteneurs |
| **SurfaceElevated** 🟨 | `#FFF200` | Au-dessus (modals, sheets) |

**Note** : Dial color = USER content (inchangée en debug).

---

## Corrections appliquées

1. ✅ AsideZone layers → `transparent`
2. ✅ ActivityItem actif → `brand.accent`
3. ✅ ScaleButtons actif → `brand.accent`
4. ✅ PlaybackButtons Stop → `brand.secondary`
5. ✅ Chevrons carousels → `surface`

---

## Next

- [ ] Simplifier PROD : `surfaceElevated = #FFFFFF` (= surface)
- [ ] `DEBUG_MODE = false`
- [ ] Valider visuellement
