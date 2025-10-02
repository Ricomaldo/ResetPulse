# Testing Patterns ResetPulse

## Patterns Réutilisables Établis

### 1. Pattern: Hook Testing Sans Mocks Temporels

**Problème:** Les mocks temporels (jest.useFakeTimers) créent des tests fragiles et difficiles à maintenir.

**Solution:** Tests déterministes avec TimeController ou temps réel courts.

```javascript
// ❌ Éviter
jest.useFakeTimers();
act(() => {
  jest.advanceTimersByTime(5000);
});

// ✅ Préférer (temps réel court)
const { result } = renderHook(() => useTimer(1)); // 1 seconde
await waitFor(() => expect(condition).toBe(true), { timeout: 1500 });
```

### 2. Pattern: Critical Path Testing

**Principe:** Tester d'abord les chemins critiques qui cassent la production.

```javascript
describe('useTimer - Critical Path Tests', () => {
  describe('🎯 Critical Path 1: Start/Stop Timer', () => {
    // Tests essentiels pour le fonctionnement de base
  });

  describe('🎯 Critical Path 2: Reset Functionality', () => {
    // Tests du comportement de reset
  });
});
```

### 3. Pattern: Conversion Testing (Angle/Minutes)

**Pour les hooks de conversion géométrique:**

```javascript
describe('Conversions', () => {
  it('should handle cardinal points', () => {
    const { result } = renderHook(() => useDialOrientation(true, '60min'));

    // Points cardinaux
    expect(result.current.angleToMinutes(0)).toBe(0);     // Top
    expect(result.current.angleToMinutes(90)).toBe(15);   // Right
    expect(result.current.angleToMinutes(180)).toBe(30);  // Bottom
    expect(result.current.angleToMinutes(270)).toBe(45);  // Left
  });

  it('should handle edge cases', () => {
    // Angles négatifs
    expect(result.current.angleToMinutes(-90)).toBe(45);
    // Angles > 360
    expect(result.current.angleToMinutes(450)).toBe(15);
  });
});
```

### 4. Pattern: State Transition Testing

**Pour les hooks avec états complexes:**

```javascript
describe('State Transitions', () => {
  it('should transition correctly', () => {
    const { result } = renderHook(() => useTimer(300));

    // État initial
    expect(result.current.running).toBe(false);

    // Start → Running
    act(() => result.current.toggleRunning());
    expect(result.current.running).toBe(true);

    // Running → Paused
    act(() => result.current.toggleRunning());
    expect(result.current.running).toBe(false);
    expect(result.current.displayMessage).toBe('Pause');
  });
});
```

### 5. Pattern: Mock Minimal

**Mocker seulement les dépendances hardware/externes:**

```javascript
// jest.setup.js
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### 6. Pattern: Test Data Scenarios

**Créer des scénarios de test réutilisables:**

```javascript
export const timerScenarios = {
  pomodoro: { duration: 25 * 60, name: 'Pomodoro (25 min)' },
  shortBreak: { duration: 5 * 60, name: 'Short Break (5 min)' },
  longBreak: { duration: 15 * 60, name: 'Long Break (15 min)' },
  oneMinute: { duration: 60, name: 'One Minute' },
  zeroTimer: { duration: 0, name: 'Zero Timer' }
};

// Usage
Object.entries(timerScenarios).forEach(([key, scenario]) => {
  it(`should handle ${scenario.name}`, () => {
    const { result } = renderHook(() => useTimer(scenario.duration));
    // Test avec ce scénario
  });
});
```

### 7. Pattern: Boundary Testing Matrix

**Pour les valeurs limites:**

```javascript
const boundaryValues = {
  angles: [-720, -360, -180, -90, 0, 90, 180, 270, 360, 450, 720],
  minutes: [0, 1, 5, 12.5, 25, 30, 59, 60],
  durations: [-100, 0, 1, 60, 300, 3600]
};

boundaryValues.angles.forEach(angle => {
  it(`should handle angle ${angle}°`, () => {
    const minutes = convertAngleToMinutes(angle);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(maxMinutes);
  });
});
```

### 8. Pattern: Async State Updates

**Gérer les warnings React act():**

```javascript
// ❌ Provoque warning
const { result } = renderHook(() => useTimer());
result.current.toggleRunning();

// ✅ Correct
const { result } = renderHook(() => useTimer());
act(() => {
  result.current.toggleRunning();
});

// Pour les updates async
await act(async () => {
  result.current.asyncOperation();
  await waitForNextUpdate();
});
```

### 9. Pattern: Transform Detection

**Script pour détecter les modules nécessitant transformation:**

```javascript
// scripts/detect-transform-needs.js
function checkForESModules(dir) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
  );

  return packageJson.type === 'module' ||
         packageJson.module ||
         contentHasESModuleSyntax();
}
```

### 10. Pattern: Progressive Test Suite

**Organisation en couches:**

```bash
npm run test:critical    # Tests critiques uniquement (rapide)
npm run test:hooks       # Tous les tests de hooks
npm run test:integration # Tests d'intégration (plus lent)
npm run test:coverage    # Avec couverture complète
```

## Application aux Futures Fonctionnalités

### Audio System (à venir)
```javascript
describe('Audio System - Critical Paths', () => {
  // Mock Audio API
  beforeEach(() => {
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      volume: 1
    }));
  });
});
```

### Error Boundaries (à venir)
```javascript
describe('Error Boundaries', () => {
  it('should catch and log errors', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Trigger error
    // Verify boundary caught it

    errorSpy.mockRestore();
  });
});
```

## Métriques de Succès

- **Temps d'exécution:** < 5 secondes pour tests critiques
- **Flakiness:** 0% (aucun test aléatoire)
- **Couverture Critical Paths:** 100%
- **Maintenabilité:** Patterns documentés et réutilisables

## Ressources

- [Testing Library React Native Docs](https://callstack.github.io/react-native-testing-library/)
- [Jest React Native Guide](https://jestjs.io/docs/tutorial-react-native)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing-with-jest/)