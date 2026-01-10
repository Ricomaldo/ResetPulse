---
created: '2025-12-20'
updated: '2025-12-20'
status: active
---

# Text & Secondary Text Hierarchy Improvements - SettingsPanel Ecosystem

## Overview

After icon replacement, the SettingsPanel ecosystem needs refinement to text hierarchy and content strategy. Current state has inconsistent label patterns, verbose descriptions, and insufficient visual weight differentiation between primary and secondary text.

---

## Issues Identified

### 1. Visual Hierarchy (Styling)

**Current State:**
- `optionLabel`: rs(14, 'min'), theme.colors.text, medium weight
- `optionDescription`: rs(11, 'min'), theme.colors.textLight (or textSecondary), no opacity variation
- Secondary text lacks visual "recession" - should feel lighter/more subtle

**Problem:**
- optionDescription same size as some labels (rs(11) = rs(11))
- No opacity differentiation (text colors are solid, not faded)
- Descriptions don't visually support (accent) the primary action

### 2. Content Strategy (Copy)

**Current Issues:**

| Component | Issue | Example |
|-----------|-------|---------|
| **Emoji activité** | Literal/redundant | "L'emoji s'affiche au centre du cadran" / "L'emoji est masqué" |
| **Animation pulse** | Translation lookup (not localized in code) | Uses `t('settings.interface.pulseAnimationDescriptionOn/Off')` |
| **Keep Awake** | Translation lookup | Uses `t('settings.timer.keepAwake')` + descriptions |
| **Rotation** | Translation lookup | Uses `t('settings.timer.rotationDirection')` |
| **Sound** | Sub-card description | Has separate description prop in SettingsCard |
| **Theme** | Literal descriptions | "Thème clair" / "Thème sombre" / "Thème auto" |
| **Favorites** | Functional but bland | "Sélectionnez jusqu'à 4 activités favorites (X/4)" |
| **SelectionCards** | Labels are action-oriented but descriptions could be more benefit-driven | "Je démarre vite, j'ai besoin de freiner" - good but could emphasize benefit |

### 3. Label Patterns (Inconsistent)

**Current:**
- Some are nouns: "Sens de rotation", "Thème", "Son de notification"
- Some are imperative verbs: "Keep Awake"
- Some are descriptive: "Emoji activité au centre", "Animation pulse"
- Some mix noun + preposition: "Échelle du cadran"

**Problem:** No consistent mental model - user doesn't know if they're controlling a setting or reading a state.

---

## Proposed Improvements

### Phase 1: Visual Hierarchy (Styling Refinements)

**Changes to SettingsCard.jsx:**

```javascript
// description field should be lighter/smaller
description: {
  color: theme.colors.textSecondary,  // Already textLight, keep it
  fontSize: rs(10, 'min'),             // Reduce from rs(11, 'min')
  lineHeight: rs(14, 'min'),           // Add line height for readability
  marginTop: rs(8),                    // Increase spacing from rs(4)
  opacity: 0.8,                        // Add subtle opacity for recession
}
```

**Changes to SettingsPanel.jsx optionDescription:**

```javascript
optionDescription: {
  color: theme.colors.textSecondary,
  fontSize: rs(10, 'min'),             // Reduce from rs(11, 'min') - create gap from optionLabel
  lineHeight: rs(14, 'min'),           // Add line height
  marginTop: rs(6),                    // Increase from ~default
  opacity: 0.75,                       // Add opacity for visual recession
},
```

**Result:**
- optionLabel (rs(14, 'min')) feels significantly larger than description (rs(10, 'min'))
- Opacity (0.75-0.8) makes secondary text "fade into background"
- Better visual hierarchy through size + opacity + spacing combo

---

### Phase 2: Content Strategy & Copy Improvements

#### A. Label Patterns (Standardize to Imperative Verbs)

| Current | Proposed | Reason |
|---------|----------|--------|
| Emoji activité au centre | Afficher l'emoji au centre | Imperative - user is *doing* something |
| Animation pulse | Activer animation pulse | Imperative - clear action |
| Keep Awake | Garder l'écran allumé | Imperative - clearer French |
| Sens de rotation | Rotation horaire | Simpler - describes what the setting controls |
| Son de notification | Son de notification | ✓ Already clear |
| Thème | Thème d'apparence | More specific |

#### B. Description Improvements (Purpose-Driven)

**Rule:** Descriptions should explain the *benefit* or *consequence*, not restate the label.

| Component | Current | Proposed | Length |
|-----------|---------|----------|--------|
| **Emoji au centre** | L'emoji s'affiche / est masqué | Voir le nom de l'activité en un coup d'œil | Benefit |
| **Animation pulse** | (uses t() lookup) | Ajoute vie et feedback visuel au timer | Benefit |
| **Keep Awake** | (uses t() lookup) | Empêche l'écran de s'éteindre pendant la session | Consequence |
| **Rotation** | (uses t() lookup) | Sens de progression du temps sur le cadran | Clarification |
| **Sound** | (uses t() lookup) | Alerte sonore quand le timer expire | Clarification |
| **Theme** | (uses t() lookup) | Apparence de l'interface utilisateur | Clarification |
| **Favorites (Activities)** | Sélectionnez jusqu'à 4... (X/4) | Créez un carrousel personnalisé d'activités | Benefit |
| **Favorites (Palettes)** | Sélectionnez jusqu'à 4... (X/4) | Créez un carrousel personnalisé de couleurs | Benefit |

#### C. Selection Card Descriptions (Benefit-Driven)

| Component | Current | Proposed | Type |
|-----------|---------|----------|------|
| **Impulsif** | Je démarre vite, j'ai besoin de freiner | ✓ Good - describes the pattern | User Pattern |
| **Abandonniste** | J'ai du mal à tenir jusqu'au bout | ✓ Good - describes the struggle | User Pattern |
| **Ritualiste** | J'aime les actions délibérées | ✓ Good - describes preference | User Pattern |
| **Véloce** | Je sais ce que je veux | ✓ Good - describes confidence | User Pattern |
| **Créatif (Colors)** | Carrousel couleurs | Explore et changeuse les couleurs pendant la session | User Action |
| **Minimaliste** | Rien (handle seul) | Interface épurée, focus sur le timer | User Benefit |
| **Multi-tâches (Activities)** | Carrousel activités | Basculer entre activités sans redémarrer | User Action |
| **Rationnel (ControlBar)** | ControlBar (durée + run) | Durée et démarrage sans quitter l'écran | User Action |

---

### Phase 3: Implementation Priority

**HIGH PRIORITY (Quick wins):**
1. Reduce optionDescription fontSize: rs(11, 'min') → rs(10, 'min')
2. Add opacity to optionDescription: opacity: 0.75
3. Increase optionDescription marginTop: rs(6) instead of default
4. Add lineHeight to descriptions for readability
5. Reduce SettingsCard description fontSize: rs(11, 'min') → rs(10, 'min')
6. Add opacity to SettingsCard description: opacity: 0.8

**MEDIUM PRIORITY (Content updates - requires localization consideration):**
7. Standardize label patterns to imperative verbs (where not translation-dependent)
8. Update selection card descriptions to be benefit-driven (if translations are flexible)
9. Update favorites descriptions to emphasize benefit vs. instruction

**LOW PRIORITY (Future refinement):**
10. Audit all translation keys (t() calls) in SettingsPanel for consistency
11. Create content guidelines for future settings additions
12. Consider adding icons to section headers (TOI, TES FAVORIS, etc.)

---

## Specific File Changes Required

### 1. SettingsPanel.jsx

```javascript
const styles = StyleSheet.create({
  // ... existing styles ...

  optionDescription: {
    color: theme.colors.textSecondary,
    fontSize: rs(10, 'min'),           // ← Change from rs(11, 'min')
    lineHeight: rs(14, 'min'),         // ← Add
    marginTop: rs(6),                  // ← Increase spacing
    opacity: 0.75,                     // ← Add opacity
  },
});
```

### 2. SettingsCard.jsx

```javascript
const styles = StyleSheet.create({
  // ... existing styles ...

  description: {
    color: theme.colors.textLight,
    fontSize: rs(10, 'min'),           // ← Change from rs(11, 'min')
    lineHeight: rs(14, 'min'),         // ← Add
    marginTop: rs(8),                  // ← Change from rs(4)
    opacity: 0.8,                      // ← Add opacity
  },
});
```

### 3. SelectionCard.jsx

```javascript
const styles = StyleSheet.create({
  // ... existing styles ...

  description: {
    color: theme.colors.textSecondary,
    fontSize: compact ? rs(9, 'min') : rs(11, 'min'),
    fontWeight: fontWeights.regular,
    lineHeight: compact ? rs(12, 'min') : rs(15, 'min'),  // ← Add
    marginTop: rs(8),
    opacity: 0.8,                      // ← Add opacity
    textAlign: 'center',
  },
});
```

---

## Expected Visual Result

**Before:**
- All text feels equal weight
- Secondary descriptions don't clearly support primary action
- User has to read label AND description to understand setting

**After:**
- optionLabel (larger, full opacity) is clearly dominant
- optionDescription (smaller, faded) provides supporting context
- Visual hierarchy supports cognitive flow: "What is this?" (label) → "Why would I use it?" (description)
- User can skim labels and read descriptions only if interested

---

## Testing Checklist

- [ ] All optionDescription text is noticeably lighter than optionLabel
- [ ] SettingsCard descriptions are visually distinct from titles
- [ ] SelectionCard descriptions don't compete with labels
- [ ] Spacing between label and description is consistent (rs(6) or rs(8))
- [ ] Text is still readable at rs(10, 'min') and rs(9, 'min')
- [ ] Opacity doesn't reduce contrast below WCAG AA (7.5:1 for normal, 4.5:1 for large)
- [ ] Works on both light and dark themes
- [ ] Works on small phones (iPhone SE) and tablets (iPad)

---

## Follow-Up: Content Localization

Once styling changes are approved, consider:
1. Audit all t() lookups in SettingsPanel for consistency
2. Update translated descriptions to use benefit/consequence language
3. Ensure French descriptions are concise (max 60 chars) to fit on phone screens
4. Apply same pattern to other supported languages (15 total)

