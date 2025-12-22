# Query Claude Code — Onboarding v2.1 Phase 4

## Contexte

Phases 0-3 complétées :

- ✅ Structure fichiers + fondations
- ✅ Détection comportementale (ADR-008)
- ✅ Orchestration flow complet (9 filtres)

**Phase 4** : Polish complet — i18n 15 langues, animations, micro-interactions, tests.

---

## IMPORTANT : Consultation Préalable

**Avant de coder**, consulter ces fichiers pour assurer cohérence :

### Design System & Styles

```
@src/styles/responsive.js        → Fonction rs() pour sizing
@src/styles/harmonized-sizes.js  → Tailles standardisées
@src/styles/animations.js        → Patterns animations existants
@src/styles/shadows.js           → Ombres cohérentes
@src/theme/tokens.js             → Tokens design (spacing, fontSize)
@src/theme/colors.js             → Couleurs thème
```

### ADRs & Décisions

```
@_internal/docs/decisions/adr-010-onboarding-v2-vision-finale.md  → Vision OB
@_internal/docs/decisions/adr-008-users-profiles-personalisation.md → Personas
@_internal/docs/decisions/adr-005-architecture-dialzone-asidezone.md → Layout
```

### Reports (état actuel)

```
@_internal/docs/reports/design-system.md    → Cohérence visuelle
@_internal/docs/reports/accessibility.md    → Contraintes a11y
@_internal/docs/reports/ux-conversion.md    → Points friction
```

---

## 4.1 i18n — 15 Langues Complètes

### Keys à traduire (créées en Phases 1-3)

```json
{
  "onboarding": {
    "tool": {
      "title": "Qu'est-ce qui te correspond le mieux ?",
      "creative": "Créatif",
      "minimalist": "Minimaliste",
      "multitask": "Multi-tâches",
      "rational": "Rationnel"
    },
    "creation": {
      "title": "Crée ton premier moment",
      "subtitle": "Choisis un emoji, un nom et une durée"
    },
    "testStart": {
      "title": "Quand tu es prêt, appuie",
      "hint": ""
    },
    "testStop": {
      "title": "Maintenant, lâche quand tu veux",
      "hint": "",
      "revealTitle": "Tu es"
    },
    "sound": {
      "title": "Quel son pour te signaler la fin ?"
    },
    "paywall": {
      "title": "Tu as créé ton premier moment",
      "profile": "Profil :",
      "question": "Envie d'en créer d'autres ?",
      "valueProposition": "15 palettes · 16 activités · Créations illimitées",
      "price": "4,99€ — Une fois, pour toujours",
      "ctaTrial": "Essai gratuit 7 jours",
      "ctaSkip": "Peut-être plus tard"
    },
    "firstTimer": {
      "title": "Ton timer est prêt",
      "profile": "Profil",
      "tool": "Outil",
      "moment": "Moment",
      "startButton": "Lancer mon premier timer"
    }
  },
  "personas": {
    "veloce": {
      "label": "Véloce",
      "description": "Tu sais ce que tu veux. Ton timer répondra instantanément."
    },
    "abandonniste": {
      "label": "Abandonniste",
      "description": "Tu as du mal à tenir jusqu'au bout. Ton timer te protégera des arrêts impulsifs."
    },
    "impulsif": {
      "label": "Impulsif",
      "description": "Tu démarres vite, tu as besoin de freiner. Ton timer demandera confirmation pour démarrer."
    },
    "ritualiste": {
      "label": "Ritualiste",
      "description": "Les actions délibérées te correspondent. Ton timer s'adaptera à ton rythme."
    }
  }
}
```

### Langues cibles (15)

| Code      | Langue     | Priorité |
| --------- | ---------- | -------- |
| `fr`      | Français   | Source   |
| `en`      | English    | P0       |
| `es`      | Español    | P1       |
| `de`      | Deutsch    | P1       |
| `it`      | Italiano   | P1       |
| `pt`      | Português  | P1       |
| `nl`      | Nederlands | P2       |
| `ja`      | 日本語     | P2       |
| `ko`      | 한국어     | P2       |
| `zh-Hans` | 简体中文   | P2       |
| `zh-Hant` | 繁體中文   | P2       |
| `ar`      | العربية    | P2       |
| `ru`      | Русский    | P2       |
| `sv`      | Svenska    | P2       |
| `no`      | Norsk      | P2       |

### Fichiers à modifier

```
src/i18n/locales/fr.json  → Source (vérifier keys présentes)
src/i18n/locales/en.json  → Traduire
src/i18n/locales/es.json  → Traduire
src/i18n/locales/de.json  → Traduire
... (12 autres)
```

### Approche traduction

Pour chaque langue, traduire en respectant :

- Ton informel/tutoiement (adapté neurodivergents)
- Concision (écrans mobiles)
- Émojis universels (pas de modification)

---

## 4.2 Animations Transitions

### Consulter d'abord

```
@src/styles/animations.js  → Patterns existants (fadeIn, slideUp, etc.)
```

### Pattern recommandé : Fade + Slide subtil

**Entre chaque filtre** :

```jsx
// Dans OnboardingFlow.jsx ou wrapper

import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

// Wrapper pour chaque filtre
<Animated.View
  entering={FadeIn.duration(300).delay(100)}
  exiting={FadeOut.duration(200)}
  style={{ flex: 1 }}
>
  {renderCurrentFilter()}
</Animated.View>;
```

### Animations spécifiques par filtre

| Filtre            | Animation entrée       | Notes              |
| ----------------- | ---------------------- | ------------------ |
| 010-opening       | FadeIn lent (500ms)    | Calme, respiration |
| 020-tool          | SlideInRight           | Progression        |
| 030-creation      | FadeIn                 | Focus contenu      |
| 040-test-start    | FadeIn + Scale(0.95→1) | Invitation         |
| 050-test-stop     | FadeIn                 | Continuité test    |
| 060-sound         | SlideInRight           | Progression        |
| 070-notifications | SlideInRight           | Progression        |
| 080-paywall       | FadeIn lent            | Moment important   |
| 090-first-timer   | FadeIn + Scale         | Célébration        |

### Timing cohérent

Utiliser les tokens existants ou créer dans `animations.js` :

```javascript
export const ONBOARDING_TRANSITIONS = {
  enterDuration: 300,
  exitDuration: 200,
  delayBetween: 100,
};
```

---

## 4.3 Micro-interactions & Haptics

### Consulter d'abord

```
@src/utils/haptics.js  → Patterns haptics existants
```

### Mapping haptics par action

| Action                   | Type Haptic    | Fonction           |
| ------------------------ | -------------- | ------------------ |
| Tap option (Tool, Sound) | `light`        | Feedback sélection |
| Sélection confirmée      | `medium`       | Validation         |
| Création activité        | `success`      | Accomplissement    |
| Persona révélé           | `success`      | Moment fort        |
| Start trial              | `success`      | Conversion         |
| Skip paywall             | `light`        | Neutre             |
| Timer complete           | `notification` | Signal             |
| Erreur                   | `warning`      | Alerte douce       |

### Vérifier cohérence

Chaque filtre doit appeler les haptics appropriés. Auditer les appels existants et standardiser.

---

## 4.4 Edge Cases & Robustesse

### Cas à gérer

| Scenario                         | Comportement attendu                   |
| -------------------------------- | -------------------------------------- |
| Back button Android              | Revenir au filtre précédent (sauf 010) |
| App backgrounded pendant OB      | Reprendre au même filtre               |
| Permission notifications refusée | Continuer sans bloquer                 |
| Erreur réseau paywall            | Message + retry option                 |
| Emoji keyboard indisponible      | Fallback liste prédéfinie              |
| Timer interrompu (090)           | Reprendre ou skip                      |

### Implémentation back button

Dans `OnboardingFlow.jsx` :

```jsx
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      return true; // Prevent default
    }
    return false; // Allow exit on step 1
  });

  return () => backHandler.remove();
}, [currentStep]);
```

### Persistence état OB

Si app killed pendant OB, reprendre au bon endroit :

```jsx
// Dans OnboardingFlow, persister currentStep + flowData
import { usePersistedState } from '../../hooks/usePersistedState';

const [savedStep, setSavedStep] = usePersistedState('@ResetPulse:onboardingStep', 1);
const [savedData, setSavedData] = usePersistedState('@ResetPulse:onboardingData', {});

// Initialiser depuis saved state
const [currentStep, setCurrentStep] = useState(savedStep);
const [flowData, setFlowData] = useState(savedData);

// Persister à chaque changement
useEffect(() => {
  setSavedStep(currentStep);
  setSavedData(flowData);
}, [currentStep, flowData]);

// Nettoyer à la fin
const handleComplete = () => {
  AsyncStorage.multiRemove(['@ResetPulse:onboardingStep', '@ResetPulse:onboardingData']);
  // ... reste du code
};
```

---

## 4.5 Accessibilité

### Consulter d'abord

```
@_internal/docs/reports/accessibility.md  → État actuel a11y
```

### Checklist par filtre

- [ ] `accessibilityLabel` sur tous les boutons
- [ ] `accessibilityRole` approprié (button, text, etc.)
- [ ] `accessibilityHint` pour actions non évidentes
- [ ] Contraste suffisant (WCAG AA)
- [ ] Focus order logique
- [ ] Annonces VoiceOver/TalkBack pour transitions

### Exemple

```jsx
<Button
  title={t('common.continue')}
  onPress={handleContinue}
  accessibilityLabel={t('common.continue')}
  accessibilityRole="button"
  accessibilityHint={t('a11y.continueToNextStep')}
/>
```

---

## 4.6 Tests

### Tests manuels (checklist)

```markdown
## Parcours complet FR

- [ ] 010: Animation respiration visible
- [ ] 020: 4 options affichées, sélection fonctionne
- [ ] 030: Emoji picker + nom + durée → création OK
- [ ] 040: Tap mesuré, transition fluide
- [ ] 050: Cercle animé, persona révélé correctement
- [ ] 060: Sons jouables, sélection persistée
- [ ] 070: Permission demandée (ou skip)
- [ ] 080: Résumé personnalisé visible, trial/skip fonctionnent
- [ ] 090: Summary affiché, timer 60s fonctionne, transition app

## Edge cases

- [ ] Back button Android → revient au filtre précédent
- [ ] Kill app en 050 → reprend en 050 au relaunch
- [ ] Permission refusée → continue sans bloquer
- [ ] Réseau off au paywall → message erreur + retry

## Multi-langue

- [ ] EN: Parcours complet sans crash
- [ ] ES: Vérifier traductions affichées
- [ ] DE: Vérifier traductions affichées
```

### Tests automatisés (optionnel, si Detox configuré)

```javascript
// e2e/onboarding.test.js
describe('Onboarding Flow', () => {
  it('completes full flow', async () => {
    await element(by.id('pulse-button')).tap(); // 010
    await element(by.id('tool-creative')).tap(); // 020
    await element(by.id('continue-button')).tap();
    // ... etc
  });
});
```

---

## 4.7 Commit Phase 4

```bash
git add -A
git commit -m "polish(ob): complete Phase 4 - i18n, animations, edge cases

- Add translations for 15 languages (onboarding + personas)
- Add transition animations between filters (Reanimated)
- Standardize haptic feedback across all filters
- Handle back button, persistence, error states
- Add accessibility labels and hints
- Manual test checklist verified"
```

---

## Validation Checklist Phase 4

### i18n

- [ ] FR keys complètes et correctes
- [ ] EN traduit
- [ ] 13 autres langues traduites
- [ ] Aucune key manquante (pas de fallback visible)

### Animations

- [ ] Transitions fluides entre tous les filtres
- [ ] Pas de flash blanc/noir
- [ ] Timing cohérent (~300ms)

### Micro-interactions

- [ ] Haptics sur toutes les actions
- [ ] Feedback visuel sélection

### Edge cases

- [ ] Back button fonctionne
- [ ] Persistence OB fonctionne
- [ ] Erreurs gérées gracieusement

### Accessibilité

- [ ] Labels sur tous les éléments interactifs
- [ ] Contraste OK (vérifier dark mode aussi)

### Tests

- [ ] Parcours complet FR OK
- [ ] Parcours complet EN OK
- [ ] Edge cases testés

---

## Notes Finales

### Priorité si temps limité

1. **i18n FR + EN** (bloquant)
2. **Transitions basiques** (FadeIn/Out)
3. **Back button** (UX critique Android)
4. **Persistence** (évite frustration)
5. **Autres langues** (peut être hotfix post-deploy)

### Cohérence Design System

Utiliser systématiquement :

- `rs()` pour tous les sizing
- `colors` du theme (pas de hardcoded)
- `tokens` pour spacing/fontSize
- Patterns `harmonized-sizes.js` pour éléments similaires

---

**Généré par Chrysalis** — 2025-12-22
**Référence** : ADR-010 + Design System Reports
