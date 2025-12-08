---
created: '2025-09-27'
updated: '2025-09-27'
status: active
milestone: M1-M2
confidence: high
---

# Error Boundaries & Logging Architecture

## Contexte
Phase 2 de la version 1.0.4 - Mise en place d'une gestion d'erreurs robuste et d'un système de logging centralisé pour ResetPulse.

## Architecture Proposée

### 1. Error Boundaries React

#### Structure en Couches
```
App
├── RootErrorBoundary (Erreurs fatales)
│   └── NavigationErrorBoundary (Erreurs de navigation)
│       └── ScreenErrorBoundary (Erreurs par écran)
│           └── ComponentErrorBoundary (Erreurs localisées)
```

#### Implementation Minimale
```javascript
// src/components/errors/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to centralized system
    ErrorLogger.logError(error, {
      ...errorInfo,
      boundary: this.props.name,
      level: this.props.level || 'component'
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 2. Système de Logging Centralisé

#### Logger Modulaire
```javascript
// src/utils/logger.js
class Logger {
  constructor() {
    this.handlers = [];
    this.enabled = __DEV__;
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  log(level, message, metadata = {}) {
    if (!this.enabled && level !== 'error') return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      deviceInfo: getDeviceInfo()
    };

    this.handlers.forEach(handler => handler(logEntry));
  }

  error(message, error, metadata = {}) {
    this.log('error', message, {
      ...metadata,
      error: error?.message,
      stack: error?.stack
    });
  }

  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }
}

export default new Logger();
```

#### Handlers Spécifiques
```javascript
// Console Handler (Dev)
const consoleHandler = (logEntry) => {
  if (__DEV__) {
    console[logEntry.level](logEntry.message, logEntry.metadata);
  }
};

// AsyncStorage Handler (Production)
const storageHandler = async (logEntry) => {
  if (logEntry.level === 'error') {
    await ErrorStorage.store(logEntry);
  }
};

// Sentry Handler (Future)
const sentryHandler = (logEntry) => {
  if (logEntry.level === 'error' && !__DEV__) {
    // Sentry.captureException(...)
  }
};
```

### 3. Stratégie de Fallback

#### Fallbacks par Niveau
```javascript
// Niveau App - Écran de récupération
const AppErrorFallback = ({ reset }) => (
  <SafeAreaView style={styles.container}>
    <Text>Une erreur inattendue s'est produite</Text>
    <TouchableOpacity onPress={reset}>
      <Text>Redémarrer l'application</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

// Niveau Composant - Placeholder
const ComponentErrorFallback = ({ componentName }) => (
  <View style={styles.errorContainer}>
    <Text>Impossible de charger {componentName}</Text>
  </View>
);

// Niveau Timer - État sûr
const TimerErrorFallback = () => (
  <TimerDial
    duration={0}
    remaining={0}
    running={false}
    disabled={true}
  />
);
```

### 4. Intégration avec Hooks Existants

#### Wrapper pour useTimer
```javascript
export function useTimerSafe(...args) {
  try {
    return useTimer(...args);
  } catch (error) {
    Logger.error('useTimer error', error);
    return {
      duration: 0,
      remaining: 0,
      running: false,
      progress: 0,
      toggleRunning: () => {},
      resetTimer: () => {},
      error: true
    };
  }
}
```

### 5. Stockage des Erreurs

#### Schema AsyncStorage
```javascript
const ErrorStorage = {
  MAX_ERRORS: 50,
  KEY: '@resetpulse_errors',

  async store(error) {
    const errors = await this.getAll();
    errors.unshift(error);

    // Garder seulement les 50 dernières
    if (errors.length > this.MAX_ERRORS) {
      errors.pop();
    }

    await AsyncStorage.setItem(this.KEY, JSON.stringify(errors));
  },

  async getAll() {
    const data = await AsyncStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  },

  async clear() {
    await AsyncStorage.removeItem(this.KEY);
  }
};
```

### 6. Tests

#### Tests Error Boundary
```javascript
describe('ErrorBoundary', () => {
  it('should catch and display fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary fallback={<Text>Error caught</Text>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Error caught')).toBeTruthy();
  });

  it('should log errors to logger', () => {
    const logSpy = jest.spyOn(Logger, 'error');
    // Trigger error
    expect(logSpy).toHaveBeenCalled();
  });
});
```

## Décisions Clés

1. **Pas de Bibliothèque Externe Initially**
   - Implementation native React pour contrôle total
   - Ajout de Sentry/Bugsnag plus tard si nécessaire

2. **Logging Conditionnel**
   - Verbose en dev, minimal en production
   - Erreurs toujours loggées

3. **Stockage Local First**
   - AsyncStorage pour persistance
   - Export manuel des logs si besoin

4. **Fallbacks Gracieux**
   - Jamais de crash complet
   - Toujours une action de récupération

## Plan d'Implementation

### Phase 1: Foundation (Sprint 1)
- [ ] ErrorBoundary de base
- [ ] Logger centralisé
- [ ] Tests unitaires

### Phase 2: Integration (Sprint 2)
- [ ] Wrapper des hooks critiques
- [ ] Fallbacks UI
- [ ] Storage des erreurs

### Phase 3: Monitoring (Sprint 3)
- [ ] Dashboard de debug
- [ ] Export des logs
- [ ] Métriques d'erreur

## Métriques de Succès

- **Crash Rate:** < 0.1%
- **Error Recovery:** 100% des erreurs non-fatales
- **Log Performance:** < 5ms impact
- **Storage Size:** < 1MB logs stockés

## Risques et Mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Performance des logs | Medium | Batching, async writes |
| Storage overflow | Low | Rotation automatique |
| Fallback loops | High | Circuit breaker pattern |

## Références

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Native Error Handling](https://reactnative.dev/docs/debugging#error-boundaries)
- [Logging Best Practices](https://12factor.net/logs)