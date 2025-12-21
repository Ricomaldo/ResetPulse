---
created: '2025-12-14'
updated: '2025-01-XX'
status: active
audit: '#6 - Test Coverage'
source: 'Post-refactor test suite restoration (2025-01-XX)'
---

# Test Coverage - ResetPulse (January 2025)

> État actuel de la suite de tests après refonte majeure (décembre 2025) et restauration complète

## Executive Summary

**Overall Status**: ✅ EXCELLENT — 100% des tests passent après refonte

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Test Pass Rate | 220/220 (100%) | 100% | ✅ |
| Test Suites | 20/20 (100%) | 100% | ✅ |
| Coverage - Statements | 44.52% | 80% | ⚠️ |
| Coverage - Branches | 35.42% | 70% | ⚠️ |
| Component Tests | 7 files | >5 | ✅ |
| Hook Tests | 6 files | >5 | ✅ |
| Context Tests | 1 file | >1 | ✅ |
| Screen Tests | 2 files | >1 | ✅ |

**Dernière mise à jour**: Janvier 2025 (après refonte décembre 2025)

---

## Test Suite Inventory

### Test Files by Category (20 total)

#### Component Tests (7 files)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `Button.test.js` | 14 | ✅ | Variants: Primary, Secondary, Destructive, Text |
| `CircularToggle.test.js` | 4 | ✅ | Rotation direction toggle |
| `DurationSlider.test.js` | 8 | ✅ | Duration presets |
| `DiscoveryModal.test.js` | 12 | ✅ | Premium discovery modal |
| `ActivityItem.test.js` | 2 | ✅ | Carousel item |
| `StepIndicator.test.js` | 10 | ✅ | Onboarding progress |
| `PremiumModal.test.js` | 2 | ✅ | Paywall modal |
| **Subtotal** | **52** | | |

#### Hook Tests (6 files)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `useTimer.test.js` | 16 | ✅ | Core timer functionality |
| `useDialOrientation.test.js` | 16 | ✅ | Dial angle calculations |
| `useCustomActivities.test.js` | 27 | ✅ | Custom activity management |
| `useTranslation.test.js` | 16 | ✅ | i18n functionality |
| `useAnalytics.test.js` | 8 | ✅ | Analytics tracking |
| `usePremiumStatus.test.js` | 4 | ✅ | Premium status checks |
| **Subtotal** | **87** | | |

#### Context Tests (1 file)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `TimerOptionsContext.test.js` | 8 | ✅ | Timer options state management |

#### Screen Tests (2 files)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `TimerScreen.test.js` | 5 | ✅ | Main timer screen |
| `OnboardingFlow.test.js` | ? | ✅ | Onboarding flow |

#### Service Tests (1 file)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `analytics.test.js` | 16 | ✅ | Analytics service |

#### Config Tests (2 files)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `onboardingConstants.test.js` | 33 | ✅ | Onboarding constants |
| `timerPalettes.test.js` | 17 | ✅ | Timer palette configs |

#### Unit Tests (1 file)
| File | Tests | Status | Notes |
|------|-------|--------|-------|
| `simple.test.js` | 2 | ✅ | Basic smoke tests |

**TOTAL**: **220 tests** across **20 test suites**

### Coverage Summary (Janvier 2025)

| Metric | Coverage | Target | Status |
|--------|----------|--------|--------|
| Statements | 44.52% (753/1691) | 80% | ⚠️ À améliorer |
| Branches | 35.42% (327/923) | 70% | ⚠️ À améliorer |
| Functions | 37.46% (148/395) | 70% | ⚠️ À améliorer |
| Lines | 44.97% (734/1632) | 80% | ⚠️ À améliorer |

**Note**: La couverture est basse car de nombreux composants UI ne sont pas encore testés. Les hooks et services sont mieux couverts.

---

## Test Infrastructure

### Mocks Centralisés (`jest.setup.js`)

Tous les mocks sont centralisés pour éviter la duplication :

#### Native Modules
- ✅ `expo-haptics` - Haptic feedback
- ✅ `expo-notifications` - Notifications (avec `SchedulableTriggerInputTypes`)
- ✅ `expo-audio` - Audio playback
- ✅ `mixpanel-react-native` - Analytics
- ✅ `react-native-purchases` - RevenueCat
- ✅ `@react-native-async-storage/async-storage` - Storage

#### React Native Components
- ✅ `react-native-reanimated` - Animations (avec `createAnimatedComponent`)
- ✅ `react-native-gesture-handler` - Gestures
- ✅ `react-native-svg` - SVG rendering
- ✅ `react-native-worklets` - Worklets support

#### Theme & Contexts
- ✅ `ThemeProvider` - Mock complet avec `colors.fixed.transparent`
- ✅ `theme/tokens` - Design tokens

### Test Utilities (`__tests__/test-utils.js`)

- ✅ `renderHook` - Hook testing helper (react-test-renderer based)
- ✅ `act` - React act wrapper

---

## Corrections Post-Refonte (Janvier 2025)

### Problèmes Résolus

#### 1. Mocks de Thème Incomplets ✅
**Problème**: Tests échouaient car `theme.colors.fixed.transparent` manquait  
**Solution**: Mock centralisé du thème dans `jest.setup.js` avec structure complète

#### 2. React Native Reanimated Non Mocké ✅
**Problème**: `CircularToggle` utilisait Reanimated mais le mock était absent  
**Solution**: Mock complet de `react-native-reanimated` avec `createAnimatedComponent`

#### 3. Configuration Jest - Conflit jsdom ✅
**Problème**: `PremiumModal.test.js` utilisait `@jest-environment jsdom`  
**Solution**: Retrait de l'environnement jsdom (non nécessaire pour React Native)

#### 4. Imports Cassés ✅
**Problème**: `TimerScreen.test.js` référençait `components/bars` (supprimé)  
**Solution**: Mise à jour pour utiliser `DialZone` et `AsideZone`

#### 5. Fonctions Manquantes dans Mocks ✅
**Problème**: `TimerOptionsContext.test.js` manquait `getActivityById`  
**Solution**: Ajout de la fonction dans le mock `activities`

#### 6. Constantes Manquantes ✅
**Problème**: `useTimer.test.js` manquait `SchedulableTriggerInputTypes.TIME_INTERVAL`  
**Solution**: Ajout des constantes dans le mock `expo-notifications`

#### 7. Logique de Test Obsolète ✅
**Problème**: `useDialOrientation.test.js` s'attendait à des valeurs arrondies  
**Solution**: Mise à jour pour accepter des valeurs fractionnelles (pas d'arrondi automatique)

#### 8. Couleurs de Fallback Manquantes ✅
**Problème**: `onboardingConstants.test.js` échouait quand `colors` était `undefined`  
**Solution**: Ajout de couleurs de fallback dans `getJourneyScenarios`

---

## Tests Manquants (Phase T1 Non Complétée)

### Composants Documentés mais Tests Absents

Ces composants existent dans le code source mais leurs tests n'ont pas été créés :

| Composant | Fichier Source | Tests Manquants | Priorité |
|-----------|----------------|-----------------|----------|
| `PaletteCarousel` | `src/components/carousels/PaletteCarousel.jsx` | 10 tests | P2 |
| `ActivityCarousel` | `src/components/carousels/ActivityCarousel.jsx` | 12 tests | P2 |
| `TimerDial` | `src/components/dial/TimerDial.jsx` | 18 tests | P2 |

**Note**: Ces tests étaient documentés dans la Phase T1 (décembre 2025) mais n'ont jamais été créés ou ont été supprimés lors de la refonte.

---

## Commandes Utiles

```bash
# Exécuter tous les tests
npm test

# Exécuter avec couverture
npm run test:coverage

# Exécuter un fichier spécifique
npm test -- __tests__/components/Button.test.js

# Exécuter tous les tests de composants
npm test __tests__/components/

# Exécuter tous les tests de hooks
npm run test:hooks

# Mode watch pour développement
npm run test:watch
```

---

## Bonnes Pratiques

### 1. Utiliser les Mocks Centralisés

**❌ Ne pas faire**:
```javascript
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { ... } }),
}));
```

**✅ Faire**:
```javascript
// ThemeProvider est mocké globalement dans jest.setup.js
// Pas besoin de mock local
```

### 2. Tests de Composants

- Utiliser `react-test-renderer` (déjà disponible via jest-expo)
- Wrapper tous les renders dans `act()`
- Mocker uniquement les dépendances externes (native modules, contexts)

### 3. Tests de Hooks

- Utiliser `renderHook` de `__tests__/test-utils.js`
- Tester les états et les effets
- Vérifier les callbacks et les side effects

### 4. Tests de Contexts

- Créer un wrapper avec le Provider
- Tester les valeurs initiales
- Tester les setters et les helpers

---

## Prochaines Étapes Recommandées

### Priorité P1 - Tests Manquants Critiques

1. **Créer les tests manquants de la Phase T1**
   - `PaletteCarousel.test.js` (10 tests)
   - `ActivityCarousel.test.js` (12 tests)
   - `TimerDial.test.js` (18 tests)

### Priorité P2 - Amélioration Coverage

2. **Augmenter la couverture de code**
   - Cibler 80% statements
   - Cibler 70% branches

3. **Tests d'intégration**
   - User flows complets
   - Onboarding → Timer → Completion
   - Premium unlock flow

### Priorité P3 - Tests Avancés

4. **Tests d'accessibilité**
   - Screen reader compatibility
   - Keyboard navigation

5. **Tests de performance**
   - Timer accuracy
   - Animation smoothness

---

## Références

- **Stratégie d'analyse**: `_internal/cockpit/testing/STRATEGIE-ANALYSE-TESTS-CASSES.md` (supprimé après résolution)
- **Infrastructure Jest**: `jest.setup.js`
- **Test utilities**: `__tests__/test-utils.js`
- **Audit source**: `_internal/cockpit/knowledge/findings/2025-12-14_06-test-coverage.md`

---

**Dernière mise à jour**: Janvier 2025  
**Statut**: ✅ Tous les tests passent (220/220)  
**Prochaine révision**: Après ajout des tests manquants Phase T1
