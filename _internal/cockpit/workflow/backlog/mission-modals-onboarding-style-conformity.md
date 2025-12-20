---
created: '2025-12-20'
updated: '2025-12-20'
status: backlog
type: mission
priority: medium
---

# Mission: Modales & Onboarding — Conformité Style

## Contexte

Audit DEBUG_MODE en cours. Les modales et l'onboarding n'ont pas encore été mis en conformité avec le design system.

## Règles à appliquer

### Modales (Settings, Premium, Discovery, etc.)

| Element | Token | Couleur DEBUG |
|---------|-------|---------------|
| Fond modale | `surfaceElevated` | 🟨 jaune |
| Overlay derrière | `overlay` | rgba noir ~50% |
| Bouton principal | `brand.primary` | 🟦 bleu |
| Bouton secondaire | `brand.secondary` | 🟪 violet |
| Toggle/switch actif | `brand.accent` | 🟧 orange |
| Toggle/switch inactif | `neutral` | gris |
| Texte | `text` / `textSecondary` | standard |

### Onboarding

| Element | Token | Couleur DEBUG |
|---------|-------|---------------|
| Fond écrans | `background` | ⬛ noir |
| Cards/conteneurs | `surface` | 🟩 vert |
| CTA principal (1 par écran) | `brand.primary` | 🟦 bleu |
| CTA secondaire (skip, later) | `brand.secondary` | 🟪 violet |
| Highlight/sélection | `brand.accent` | 🟧 orange |
| Tooltip/overlay | `surfaceElevated` | 🟨 jaune |

## Checklist

### Modales
- [ ] SettingsModal
- [ ] PremiumModal
- [ ] DiscoveryModal (MoreActivitiesModal, MoreColorsModal)
- [ ] TwoTimersModal
- [ ] Autres modales

### Onboarding
- [ ] WelcomeScreen
- [ ] Écrans tutoriel
- [ ] HighlightOverlay
- [ ] Tooltip

## Critère de validation

Activer `DEBUG_MODE = true` et vérifier visuellement:
- 1 seul 🟦 bleu par écran (CTA principal)
- 🟧 orange = états uniquement, jamais actions
- 🟨 jaune = éléments qui bloquent le flux uniquement
- 🟩 vert = conteneurs, jamais cliquables directement

## Référence

- Légende DEBUG: `src/theme/colors.js`
- Process audit: `_internal/cockpit/workflow/active/debug-color-audit-process.md`
