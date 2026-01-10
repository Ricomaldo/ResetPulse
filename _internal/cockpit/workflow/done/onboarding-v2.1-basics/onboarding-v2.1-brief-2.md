# Query Claude Code — Onboarding v2.1 Phase 2

## Contexte

Phase 0+1 complétée. Structure fichiers prête, Filter-020-tool et Filter-030-creation implémentés.

**Phase 2** : Détection comportementale (ADR-008) — mesurer les interactions utilisateur pour déterminer son persona.

**Documents de référence** :

- `_internal/docs/decisions/adr-010-onboarding-v2-vision-finale.md`
- `_internal/docs/decisions/adr-008-users-profiles-personalisation.md`

---

## Rappel ADR-008 : Matrice Persona

| Start (tap)          | Stop (release)     | Persona         |
| -------------------- | ------------------ | --------------- |
| < 800ms (rapid)      | < 2500ms (early)   | ⚡ Véloce       |
| < 800ms (rapid)      | ≥ 2500ms (patient) | 🏃 Abandonniste |
| ≥ 800ms (deliberate) | < 2500ms (early)   | 🚀 Impulsif     |
| ≥ 800ms (deliberate) | ≥ 2500ms (patient) | 🎯 Ritualiste   |

**Seuils** :

- `START_THRESHOLD = 800` (ms)
- `STOP_THRESHOLD = 2500` (ms)
- `STOP_ANIMATION_DURATION = 5000` (ms) — durée du cercle qui se remplit

---

## 2.1 Créer constantes persona

**Fichier** : `src/screens/onboarding/personaConstants.js` (nouveau)

```javascript
/**
 * @fileoverview Persona detection constants and utilities (ADR-008)
 */

// Timing thresholds (milliseconds)
export const START_THRESHOLD = 800;
export const STOP_THRESHOLD = 2500;
export const STOP_ANIMATION_DURATION = 5000;

// Persona definitions
export const PERSONAS = {
  veloce: {
    id: 'veloce',
    emoji: '⚡',
    labelKey: 'personas.veloce.label',
    descriptionKey: 'personas.veloce.description',
    // Timer config
    startRequiresLongPress: false,
    stopRequiresLongPress: false,
  },
  abandonniste: {
    id: 'abandonniste',
    emoji: '🏃',
    labelKey: 'personas.abandonniste.label',
    descriptionKey: 'personas.abandonniste.description',
    startRequiresLongPress: false,
    stopRequiresLongPress: true,
  },
  impulsif: {
    id: 'impulsif',
    emoji: '🚀',
    labelKey: 'personas.impulsif.label',
    descriptionKey: 'personas.impulsif.description',
    startRequiresLongPress: true,
    stopRequiresLongPress: false,
  },
  ritualiste: {
    id: 'ritualiste',
    emoji: '🎯',
    labelKey: 'personas.ritualiste.label',
    descriptionKey: 'personas.ritualiste.description',
    startRequiresLongPress: true,
    stopRequiresLongPress: true,
  },
};

/**
 * Determine persona from behavioral measurements
 * @param {number} startTiming - Press duration in ms (Filter-040)
 * @param {number} stopTiming - Release timing in ms (Filter-050)
 * @returns {Object} Persona object from PERSONAS
 */
export const detectPersona = (startTiming, stopTiming) => {
  const isRapidStart = startTiming < START_THRESHOLD;
  const isEarlyStop = stopTiming < STOP_THRESHOLD;

  if (isRapidStart && isEarlyStop) return PERSONAS.veloce;
  if (isRapidStart && !isEarlyStop) return PERSONAS.abandonniste;
  if (!isRapidStart && isEarlyStop) return PERSONAS.impulsif;
  return PERSONAS.ritualiste;
};

/**
 * Get persona by ID
 * @param {string} personaId
 * @returns {Object|null}
 */
export const getPersonaById = (personaId) => {
  return PERSONAS[personaId] || null;
};
```

---

## 2.2 Créer Filter-040-test-start.jsx

**Chemin** : `src/screens/onboarding/filters/Filter-040-test-start.jsx`

**Fonction** : Mesurer le timing du tap (durée de pression)

**UX** :

- Message "Quand tu es prêt, appuie"
- PulseButton au centre
- Aucune indication de timing — mesure naturelle
- Passe au filtre suivant avec `startTiming`

```jsx
import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { PulseButton } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';
import * as haptics from '../../../utils/haptics';

export default function Filter040TestStart({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const pressStartRef = useRef(null);

  const handlePressIn = useCallback(() => {
    pressStartRef.current = Date.now();
    haptics.light();
  }, []);

  const handlePressOut = useCallback(() => {
    if (pressStartRef.current) {
      const pressDuration = Date.now() - pressStartRef.current;
      haptics.medium();

      // Passer au filtre suivant avec le timing mesuré
      onContinue({ startTiming: pressDuration });
    }
  }, [onContinue]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.testStart.title')}
        </Text>

        <View style={styles.buttonContainer}>
          <PulseButton
            size={rs(120, 'min')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            showPulse={true}
          />
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {t('onboarding.testStart.hint')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(21),
  },
  title: {
    fontSize: rs(24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(55),
  },
  buttonContainer: {
    marginVertical: rs(34),
  },
  hint: {
    fontSize: rs(15),
    textAlign: 'center',
    marginTop: rs(55),
    opacity: 0.7,
  },
});
```

**i18n keys** :

```json
{
  "onboarding": {
    "testStart": {
      "title": "Quand tu es prêt, appuie",
      "hint": ""
    }
  }
}
```

**Note** : Le hint est vide intentionnellement — pas d'indication de timing.

---

## 2.3 Créer Filter-050-test-stop.jsx

**Chemin** : `src/screens/onboarding/filters/Filter-050-test-stop.jsx`

**Fonction** :

1. Phase Test : Cercle qui se remplit (5s), mesurer quand l'user lâche
2. Phase Révélation : Afficher le persona détecté immédiatement

**UX complexe** : Animation cercle + transition vers révélation

```jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { Button } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';
import * as haptics from '../../../utils/haptics';
import { STOP_ANIMATION_DURATION, detectPersona, PERSONAS } from '../personaConstants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circle dimensions
const CIRCLE_SIZE = rs(200, 'min');
const STROKE_WIDTH = rs(12);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Filter050TestStop({ onContinue, startTiming }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setInteractionProfile } = useTimerConfig();

  const [phase, setPhase] = useState('test'); // 'test' | 'reveal'
  const [detectedPersona, setDetectedPersona] = useState(null);

  const pressStartRef = useRef(null);
  const animationStartRef = useRef(null);
  const progress = useSharedValue(0);

  // Start animation when component mounts
  useEffect(() => {
    if (phase === 'test') {
      animationStartRef.current = Date.now();
      progress.value = withTiming(1, {
        duration: STOP_ANIMATION_DURATION,
        easing: Easing.linear,
      });
    }
  }, [phase]);

  const handlePressIn = useCallback(() => {
    pressStartRef.current = Date.now();
    haptics.light();
  }, []);

  const handlePressOut = useCallback(() => {
    if (animationStartRef.current && phase === 'test') {
      const stopTiming = Date.now() - animationStartRef.current;

      // Detect persona
      const persona = detectPersona(startTiming, stopTiming);
      setDetectedPersona(persona);

      // Persist to context
      setInteractionProfile(persona.id);

      // Haptic feedback
      haptics.success();

      // Transition to reveal phase
      setPhase('reveal');
    }
  }, [startTiming, phase, setInteractionProfile]);

  const handleContinue = useCallback(() => {
    onContinue({
      stopTiming: Date.now() - animationStartRef.current,
      persona: detectedPersona,
    });
  }, [onContinue, detectedPersona]);

  // Animated circle style
  const animatedCircleStyle = useAnimatedStyle(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Test Phase
  if (phase === 'test') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('onboarding.testStop.title')}
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.circleContainer}
          >
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              {/* Background circle */}
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Progress circle */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedCircleStyle}
                strokeLinecap="round"
                rotation="-90"
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            </Svg>
          </Pressable>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('onboarding.testStop.hint')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Reveal Phase
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.revealTitle, { color: colors.text }]}>
          {t('onboarding.testStop.revealTitle')}
        </Text>

        <View style={styles.personaCard}>
          <Text style={styles.personaEmoji}>{detectedPersona?.emoji}</Text>
          <Text style={[styles.personaLabel, { color: colors.text }]}>
            {t(detectedPersona?.labelKey)}
          </Text>
        </View>

        <Text style={[styles.personaDescription, { color: colors.textSecondary }]}>
          {t(detectedPersona?.descriptionKey)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title={t('common.continue')} onPress={handleContinue} variant="primary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(21),
  },
  title: {
    fontSize: rs(24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(55),
  },
  circleContainer: {
    marginVertical: rs(34),
  },
  hint: {
    fontSize: rs(15),
    textAlign: 'center',
    marginTop: rs(55),
    opacity: 0.7,
  },
  // Reveal phase
  revealTitle: {
    fontSize: rs(20),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: rs(34),
  },
  personaCard: {
    alignItems: 'center',
    marginVertical: rs(21),
  },
  personaEmoji: {
    fontSize: rs(64),
    marginBottom: rs(13),
  },
  personaLabel: {
    fontSize: rs(28),
    fontWeight: '700',
  },
  personaDescription: {
    fontSize: rs(17),
    textAlign: 'center',
    marginTop: rs(21),
    paddingHorizontal: rs(21),
    lineHeight: rs(24),
  },
  footer: {
    padding: rs(21),
    paddingBottom: rs(34),
  },
});
```

**i18n keys** :

```json
{
  "onboarding": {
    "testStop": {
      "title": "Maintenant, lâche quand tu veux",
      "hint": "",
      "revealTitle": "Tu es"
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

---

## 2.4 Mettre à jour TimerConfigContext

**Fichier** : `src/contexts/TimerConfigContext.jsx`

**Vérifier** que `interaction` namespace contient :

- `interactionProfile` (string: 'veloce' | 'abandonniste' | 'impulsif' | 'ritualiste')
- `setInteractionProfile` (setter)

Si absent, ajouter dans le state initial et les setters.

```javascript
// Dans le state initial interaction:
interaction: {
  interactionProfile: null, // 'veloce' | 'abandonniste' | 'impulsif' | 'ritualiste'
  longPressConfirmDuration: 2500,
  longPressStartDuration: 800,
  startAnimationDuration: 300,
},

// Setter
const setInteractionProfile = useCallback((profileId) => {
  setConfig(prev => ({
    ...prev,
    interaction: {
      ...prev.interaction,
      interactionProfile: profileId,
    },
  }));
}, []);
```

---

## 2.5 Mettre à jour index.js exports

**Fichier** : `src/screens/onboarding/filters/index.js`

Ajouter :

```javascript
export { default as Filter040TestStart } from './Filter-040-test-start';
export { default as Filter050TestStop } from './Filter-050-test-stop';
```

---

## 2.6 Analytics events

**Fichier** : `src/services/analytics/onboarding-events.js`

Ajouter :

```javascript
// Behavioral detection
export const trackBehaviorStartMeasured = (timingMs) => {
  const behavior = timingMs < 800 ? 'rapid' : 'deliberate';
  Analytics.track('behavior_start_measured', {
    timing_ms: timingMs,
    behavior,
  });
};

export const trackBehaviorStopMeasured = (timingMs) => {
  const behavior = timingMs < 2500 ? 'early' : 'patient';
  Analytics.track('behavior_stop_measured', {
    timing_ms: timingMs,
    behavior,
  });
};

export const trackPersonaDetected = (personaId) => {
  Analytics.track('persona_detected', { persona: personaId });
};
```

---

## 2.7 Commit Phase 2

```bash
git add -A
git commit -m "feat(ob): add behavioral detection (ADR-008) - Phase 2

- Add personaConstants.js with PERSONAS and detectPersona()
- Add Filter-040-test-start.jsx (tap timing measurement)
- Add Filter-050-test-stop.jsx (release timing + persona reveal)
- Update TimerConfigContext with interactionProfile
- Add analytics events for behavioral detection
- Add i18n keys for personas (FR + EN)"
```

---

## Validation Checklist Phase 2

- [ ] `personaConstants.js` créé avec matrice 2×2
- [ ] `Filter-040-test-start.jsx` mesure durée de pression
- [ ] `Filter-050-test-stop.jsx` affiche cercle animé + révélation
- [ ] Persona détecté correctement selon seuils (800ms / 2500ms)
- [ ] `interactionProfile` persisté dans TimerConfigContext
- [ ] Transition test → reveal fluide
- [ ] Analytics events trackés
- [ ] i18n keys ajoutées (FR + EN minimum)
- [ ] App compile sans erreurs
- [ ] Tests passent

---

## Notes Techniques

### PulseButton props

Vérifier que `PulseButton` accepte `onPressIn` et `onPressOut`. Si non, modifier le composant pour exposer ces callbacks.

### AnimatedCircle

Le cercle animé utilise `react-native-reanimated` + `react-native-svg`. Pattern standard pour progress circles.

### Passage de données entre filtres

`startTiming` est passé de Filter-040 à Filter-050 via les props de OnboardingFlow. À implémenter dans Phase 3.

---

## Prochaines Phases

- **Phase 3** : Orchestration (OnboardingFlow refonte, Filter-080-paywall, Filter-090-first-timer)
- **Phase 4** : Polish (animations transitions, i18n complet 15 langues)
- **Phase 5** : Rappels post-skip (notifications J+3, J+7)

---

**Généré par Chrysalis** — 2025-12-22
**Référence** : ADR-008 + ADR-010
