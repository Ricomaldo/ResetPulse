# Testing Strategy for ResetPulse

## Architecture de Tests

### 1. Configuration Jest Évolutive

Pour gérer les `transformIgnorePatterns` de manière systématique:

#### Approche 1: Liste Maintenue (Actuelle)
```javascript
const packagesToTransform = [
  'react-native',
  '@react-native',
  'expo',
  'expo-.*',
  // Ajouter au fur et à mesure
];
```

**Avantages:**
- Performance optimale (transforme seulement le nécessaire)
- Contrôle explicite
- Build times plus rapides

**Inconvénients:**
- Maintenance manuelle
- Erreurs "Unexpected token" lors d'ajout de nouvelles dépendances

#### Approche 2: Pattern Inclusif
```javascript
transformIgnorePatterns: [
  'node_modules/(?!.*\\.(jsx?|tsx?|mjs)$)',
]
```

**Avantages:**
- Zero maintenance
- Fonctionne avec toute nouvelle dépendance

**Inconvénients:**
- Tests plus lents (transforme trop de modules)
- Peut masquer de vrais problèmes

#### Approche 3: Détection Automatique (Recommandée)
Utiliser le script `scripts/detect-transform-needs.js` pour:
1. Scanner périodiquement les modules
2. Identifier ceux nécessitant transformation
3. Mettre à jour la configuration

```bash
npm run detect:transforms  # À ajouter dans package.json
```

### 2. Stratégie de Tests Sans Mocks Temporels (Implémentée)

Pour éviter les tests flaky avec `useTimer`:

#### Tests Unitaires (État et Logique Pure) ✅
- Tester les transitions d'état
- Vérifier les calculs de progress
- Valider les edge cases

#### Pattern TimeController (Créé dans test-utils/timer-helpers.js)
```javascript
export class TimeController {
  constructor(initialTime = 0) {
    this.currentTime = initialTime;
    this.callbacks = [];
  }

  advance(ms) {
    this.currentTime += ms;
    this.callbacks.forEach(cb => cb(this.currentTime));
    return this.currentTime;
  }
}

// Usage dans les tests
const timeController = new TimeController();
timeController.advance(1000); // Avance de 1 seconde
```

#### Tests d'Intégration avec Temps Réel
Pour les tests critiques (completion callback):
```javascript
it('should call onComplete when timer reaches zero', async () => {
  const onComplete = jest.fn();
  const { result } = renderHook(() => useTimer(1, onComplete)); // 1 seconde

  act(() => result.current.toggleRunning());

  // Attendre réellement 1 seconde
  await waitFor(
    () => expect(onComplete).toHaveBeenCalled(),
    { timeout: 1500 }
  );
});
```

### 3. Patterns de Test Recommandés

#### Pour les Hooks React Native
```javascript
// Wrapper pour gérer les warnings act()
const renderHookSafe = (hook) => {
  let result;
  act(() => {
    result = renderHook(hook);
  });
  return result;
};
```

#### Pour les Animations/Timers
```javascript
// Test de comportement, pas d'implémentation
it('should complete after duration', async () => {
  const onComplete = jest.fn();
  const { result } = renderHook(() => useTimer(1, onComplete));

  act(() => result.current.toggleRunning());

  // Attendre la completion réelle (1ms)
  await waitFor(() => expect(onComplete).toHaveBeenCalled(), {
    timeout: 100
  });
});
```

### 4. Coverage Pragmatique (État Actuel)

Plutôt que des pourcentages arbitraires, focus sur:

**Priorité 1 - Critical Path (Must Have)** ✅
- [x] Démarrage/arrêt timer (100% testé)
- [x] Reset à zéro (100% testé)
- [x] Conversions angle/minutes (100% testé)
- [x] Modes 25/60 min (100% testé)

**Priorité 2 - Edge Cases (Should Have)** ✅
- [x] Timer à 0 → Start (testé)
- [x] Changements rapides d'état (testé)
- [x] Valeurs limites (angles négatifs, >360°) (testé)

**Priorité 3 - Integration (Nice to Have)**
- [ ] Gestures pan (à venir)
- [ ] Haptic feedback (mocké)
- [ ] Persistence state (à venir)

**Métriques Actuelles (2025-09-27)**
- Tests totaux: 64
- Pass rate: 89% (57/64)
- useDialOrientation: 100% (27/27)
- useTimer: 81% (30/37)

### 5. CI/CD Integration

```yaml
# .github/workflows/test.yml
test:
  script: |
    npm test -- --coverage
    # Fail seulement si critical paths non couverts
    npm run test:critical
```

### 6. Maintenance

**Hebdomadaire:**
- Vérifier les warnings de tests
- Update dependencies de test si nécessaire

**Mensuel:**
- Runner `detect-transform-needs.js`
- Ajuster transformIgnorePatterns
- Réviser les tests flaky

**Par Release:**
- Audit complet coverage
- Performance des tests
- Documentation mise à jour

## Commandes Utiles

```bash
# Test rapide sans coverage
npm test -- --no-coverage

# Test avec watch mode
npm test -- --watch

# Test un fichier spécifique
npm test -- useTimer.test.js

# Détecter les modules à transformer
node scripts/detect-transform-needs.js

# Tests avec détection de leaks
npm test -- --detectOpenHandles
```

## Ressources
- [Jest React Native Setup](https://jestjs.io/docs/tutorial-react-native)
- [Testing Library React Native](https://callstack.github.io/react-native-testing-library/)
- [Expo Jest Setup](https://docs.expo.dev/guides/testing-with-jest/)