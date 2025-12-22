# Query Claude Code — Onboarding v2.1 Phase 3

## Contexte

Phases 0-2 complétées :

- ✅ Structure fichiers préparée
- ✅ Filter-020-tool (choix outil favori)
- ✅ Filter-030-creation (création custom activity)
- ✅ Filter-040-test-start (mesure tap timing)
- ✅ Filter-050-test-stop (mesure release + révélation persona)

**Phase 3** : Orchestration — Refonte paywall, premier timer guidé, et OnboardingFlow complet.

**Documents de référence** :

- `_internal/docs/decisions/adr-010-onboarding-v2-vision-finale.md`
- `_internal/docs/decisions/adr-003-monetization-conversion.md`

---

## 3.1 Refondre Filter-080-paywall.jsx

**Chemin** : `src/screens/onboarding/filters/Filter-080-paywall.jsx`

**Fonction** : Paywall personnalisé avec résumé de ce que l'user a créé/configuré

**UX** :

```
"Tu as créé ton premier moment"

🎸 Guitare — 20 min
Profil : 🎯 Ritualiste

Envie d'en créer d'autres ?

━━━━━━━━━━━━━━━━━━━━━━━━━

15 palettes · 16 activités · Créations illimitées

4,99€ — Une fois, pour toujours

[Essai gratuit 7 jours]

[Peut-être plus tard]
```

```jsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePurchase } from '../../../contexts/PurchaseContext';
import { Button } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';
import { getPersonaById } from '../personaConstants';
import { useAnalytics } from '../../../hooks/useAnalytics';
import * as haptics from '../../../utils/haptics';

export default function Filter080Paywall({
  onContinue,
  customActivity, // From Filter-030
  persona, // From Filter-050 (persona object or id)
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { startTrial, purchaseProduct } = usePurchase();
  const analytics = useAnalytics();

  // Resolve persona if only ID passed
  const personaData = typeof persona === 'string' ? getPersonaById(persona) : persona;

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleStartTrial = useCallback(async () => {
    haptics.success();
    analytics.trackTrialStarted('onboarding');

    try {
      await startTrial();
      onContinue({ purchaseResult: 'trial' });
    } catch (error) {
      // Error handled by PurchaseContext
      console.warn('Trial start failed:', error);
    }
  }, [startTrial, onContinue, analytics]);

  const handleSkip = useCallback(() => {
    haptics.light();
    analytics.trackPaywallSkipped('onboarding');
    onContinue({ purchaseResult: 'skipped' });
  }, [onContinue, analytics]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.paywall.title')}</Text>

        {/* Custom Activity Summary */}
        {customActivity && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.activityEmoji}>{customActivity.emoji}</Text>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityName, { color: colors.text }]}>
                {customActivity.name || customActivity.label}
              </Text>
              <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>
                {formatDuration(customActivity.defaultDuration)}
              </Text>
            </View>
          </View>
        )}

        {/* Persona Badge */}
        {personaData && (
          <View style={styles.personaBadge}>
            <Text style={[styles.personaLabel, { color: colors.textSecondary }]}>
              {t('onboarding.paywall.profile')}
            </Text>
            <Text style={[styles.personaValue, { color: colors.text }]}>
              {personaData.emoji} {t(personaData.labelKey)}
            </Text>
          </View>
        )}

        {/* Question */}
        <Text style={[styles.question, { color: colors.text }]}>
          {t('onboarding.paywall.question')}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Value Proposition */}
        <Text style={[styles.valueProposition, { color: colors.textSecondary }]}>
          {t('onboarding.paywall.valueProposition')}
        </Text>

        {/* Price */}
        <Text style={[styles.price, { color: colors.text }]}>{t('onboarding.paywall.price')}</Text>
      </View>

      {/* CTAs */}
      <View style={styles.footer}>
        <Button
          title={t('onboarding.paywall.ctaTrial')}
          onPress={handleStartTrial}
          variant="primary"
          style={styles.primaryButton}
        />
        <Button
          title={t('onboarding.paywall.ctaSkip')}
          onPress={handleSkip}
          variant="text"
          style={styles.skipButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: rs(21),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: rs(24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(21),
  },
  // Summary card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(16),
    borderRadius: rs(12),
    marginVertical: rs(13),
    width: '100%',
    maxWidth: rs(300),
  },
  activityEmoji: {
    fontSize: rs(40),
    marginRight: rs(16),
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: rs(18),
    fontWeight: '600',
  },
  activityDuration: {
    fontSize: rs(14),
    marginTop: rs(4),
  },
  // Persona badge
  personaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rs(13),
  },
  personaLabel: {
    fontSize: rs(15),
    marginRight: rs(8),
  },
  personaValue: {
    fontSize: rs(17),
    fontWeight: '600',
  },
  // Question
  question: {
    fontSize: rs(20),
    fontWeight: '500',
    textAlign: 'center',
    marginTop: rs(21),
    marginBottom: rs(21),
  },
  // Divider
  divider: {
    height: 1,
    width: '80%',
    marginVertical: rs(21),
  },
  // Value proposition
  valueProposition: {
    fontSize: rs(15),
    textAlign: 'center',
    marginBottom: rs(8),
  },
  price: {
    fontSize: rs(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  // Footer
  footer: {
    padding: rs(21),
    paddingBottom: rs(34),
  },
  primaryButton: {
    marginBottom: rs(13),
  },
  skipButton: {
    opacity: 0.7,
  },
});
```

**i18n keys** :

```json
{
  "onboarding": {
    "paywall": {
      "title": "Tu as créé ton premier moment",
      "profile": "Profil :",
      "question": "Envie d'en créer d'autres ?",
      "valueProposition": "15 palettes · 16 activités · Créations illimitées",
      "price": "4,99€ — Une fois, pour toujours",
      "ctaTrial": "Essai gratuit 7 jours",
      "ctaSkip": "Peut-être plus tard"
    }
  }
}
```

---

## 3.2 Créer Filter-090-first-timer.jsx

**Chemin** : `src/screens/onboarding/filters/Filter-090-first-timer.jsx`

**Fonction** :

1. Phase Résumé : Afficher config complète (profil, outil, moment)
2. Phase Timer : Timer guidé 60s avec l'activité créée

```jsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { Button } from '../../../components/buttons';
import { TimerDial } from '../../../components/dial';
import { MessageZone } from '../../../components/messaging';
import { useTimer } from '../../../hooks/useTimer';
import { rs } from '../../../styles/responsive';
import { getPersonaById } from '../personaConstants';
import * as haptics from '../../../utils/haptics';

const FIRST_TIMER_DURATION = 60; // 60 seconds

const TOOL_LABELS = {
  colors: { emoji: '🎨', labelKey: 'onboarding.tool.creative' },
  none: { emoji: '☯', labelKey: 'onboarding.tool.minimalist' },
  activities: { emoji: '🔄', labelKey: 'onboarding.tool.multitask' },
  commands: { emoji: '⏱', labelKey: 'onboarding.tool.rational' },
};

export default function Filter090FirstTimer({
  onContinue,
  customActivity,
  persona,
  favoriteToolMode,
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setCurrentActivity, setCurrentDuration } = useTimerConfig();

  const [phase, setPhase] = useState('summary'); // 'summary' | 'timer'

  // Resolve persona
  const personaData = typeof persona === 'string' ? getPersonaById(persona) : persona;

  // Tool info
  const toolInfo = TOOL_LABELS[favoriteToolMode] || TOOL_LABELS.commands;

  // Timer hook for phase 'timer'
  const { timeRemaining, isRunning, isCompleted, startTimer, resetTimer } = useTimer({
    initialDuration: FIRST_TIMER_DURATION,
    onComplete: () => {
      haptics.success();
      // Small delay before continuing
      setTimeout(() => {
        onContinue({ firstTimerCompleted: true });
      }, 2000);
    },
  });

  // Set activity when entering timer phase
  useEffect(() => {
    if (phase === 'timer' && customActivity) {
      setCurrentActivity(customActivity);
      setCurrentDuration(FIRST_TIMER_DURATION);
    }
  }, [phase, customActivity, setCurrentActivity, setCurrentDuration]);

  const handleStartTimer = useCallback(() => {
    haptics.medium();
    setPhase('timer');
    // Start timer after short delay for transition
    setTimeout(() => {
      startTimer();
    }, 500);
  }, [startTimer]);

  // Summary Phase
  if (phase === 'summary') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('onboarding.firstTimer.title')}
          </Text>

          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            {/* Persona */}
            {personaData && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryIcon]}>👤</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('onboarding.firstTimer.profile')}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {personaData.emoji} {t(personaData.labelKey)}
                </Text>
              </View>
            )}

            {/* Tool */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryIcon]}>🛠</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('onboarding.firstTimer.tool')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {toolInfo.emoji} {t(toolInfo.labelKey)}
              </Text>
            </View>

            {/* Custom Activity */}
            {customActivity && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryIcon]}>⏱</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('onboarding.firstTimer.moment')}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {customActivity.emoji} {customActivity.name || customActivity.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={t('onboarding.firstTimer.startButton')}
            onPress={handleStartTimer}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Timer Phase
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.timerContainer}>
        {/* Timer Dial */}
        <View style={styles.dialWrapper}>
          <TimerDial
            duration={FIRST_TIMER_DURATION}
            remaining={timeRemaining}
            isRunning={isRunning}
            activity={customActivity}
            size={rs(280, 'min')}
          />
        </View>

        {/* Message Zone */}
        <MessageZone activity={customActivity} isRunning={isRunning} isCompleted={isCompleted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: rs(21),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: rs(24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(34),
  },
  // Summary card
  summaryCard: {
    width: '100%',
    maxWidth: rs(320),
    borderRadius: rs(16),
    padding: rs(21),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  summaryIcon: {
    fontSize: rs(20),
    width: rs(32),
  },
  summaryLabel: {
    fontSize: rs(14),
    flex: 1,
  },
  summaryValue: {
    fontSize: rs(16),
    fontWeight: '600',
  },
  // Footer
  footer: {
    padding: rs(21),
    paddingBottom: rs(34),
  },
  // Timer phase
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialWrapper: {
    marginBottom: rs(34),
  },
});
```

**i18n keys** :

```json
{
  "onboarding": {
    "firstTimer": {
      "title": "Ton timer est prêt",
      "profile": "Profil",
      "tool": "Outil",
      "moment": "Moment",
      "startButton": "Lancer mon premier timer"
    }
  }
}
```

---

## 3.3 Refondre OnboardingFlow.jsx

**Chemin** : `src/screens/onboarding/OnboardingFlow.jsx`

**Fonction** : Orchestrer les 9 filtres linéaires, passer les données entre eux

```jsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { StepIndicator } from '../../components/onboarding';
import { useAnalytics } from '../../hooks/useAnalytics';

// Import all filters
import {
  Filter010Opening,
  Filter020Tool,
  Filter030Creation,
  Filter040TestStart,
  Filter050TestStop,
  Filter060Sound,
  Filter070Notifications,
  Filter080Paywall,
  Filter090FirstTimer,
} from './filters';

const TOTAL_STEPS = 9;

export default function OnboardingFlow({ onComplete }) {
  const analytics = useAnalytics();
  const { setOnboardingCompleted } = useTimerConfig();

  // Current step (1-indexed for display)
  const [currentStep, setCurrentStep] = useState(1);

  // Collected data from filters
  const [flowData, setFlowData] = useState({
    favoriteToolMode: null,
    customActivity: null,
    startTiming: null,
    stopTiming: null,
    persona: null,
    selectedSoundId: null,
    notificationPermission: null,
    purchaseResult: null,
    firstTimerCompleted: false,
  });

  // Generic continue handler
  const handleContinue = useCallback(
    (stepData = {}) => {
      // Merge new data
      setFlowData((prev) => ({ ...prev, ...stepData }));

      // Track step completion
      analytics.trackOnboardingStepCompleted(currentStep, stepData);

      // Move to next step
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Onboarding complete
        setOnboardingCompleted(true);
        analytics.trackOnboardingCompleted(flowData);
        onComplete();
      }
    },
    [currentStep, flowData, analytics, setOnboardingCompleted, onComplete]
  );

  // Render current filter
  const renderCurrentFilter = () => {
    const commonProps = { onContinue: handleContinue };

    switch (currentStep) {
      case 1:
        return <Filter010Opening {...commonProps} />;

      case 2:
        return <Filter020Tool {...commonProps} />;

      case 3:
        return <Filter030Creation {...commonProps} />;

      case 4:
        return <Filter040TestStart {...commonProps} />;

      case 5:
        return <Filter050TestStop {...commonProps} startTiming={flowData.startTiming} />;

      case 6:
        return <Filter060Sound {...commonProps} />;

      case 7:
        return <Filter070Notifications {...commonProps} />;

      case 8:
        return (
          <Filter080Paywall
            {...commonProps}
            customActivity={flowData.customActivity}
            persona={flowData.persona}
          />
        );

      case 9:
        return (
          <Filter090FirstTimer
            {...commonProps}
            customActivity={flowData.customActivity}
            persona={flowData.persona}
            favoriteToolMode={flowData.favoriteToolMode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator - Hidden on first and last step */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <StepIndicator current={currentStep} total={TOTAL_STEPS} />
      )}

      {/* Current Filter */}
      <View style={styles.filterContainer}>{renderCurrentFilter()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flex: 1,
  },
});
```

---

## 3.4 Mettre à jour Filter-060-sound.jsx

**Chemin** : `src/screens/onboarding/filters/Filter-060-sound.jsx`

Si le fichier existe (renommé depuis Filter-080-sound-personalize.jsx), vérifier qu'il :

- Accepte `onContinue` prop
- Appelle `onContinue({ selectedSoundId })` à la fin
- Utilise le composant `SoundPicker` existant

Si besoin de refactorer :

```jsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { SoundPicker } from '../../../components/pickers';
import { Button } from '../../../components/buttons';
import { rs } from '../../../styles/responsive';

export default function Filter060Sound({ onContinue }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { selectedSoundId, setSelectedSoundId } = useTimerConfig();
  const [localSound, setLocalSound] = useState(selectedSoundId || 'bell');

  const handleSoundSelect = useCallback((soundId) => {
    setLocalSound(soundId);
  }, []);

  const handleContinue = useCallback(() => {
    setSelectedSoundId(localSound);
    onContinue({ selectedSoundId: localSound });
  }, [localSound, setSelectedSoundId, onContinue]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.sound.title')}</Text>

        <SoundPicker selectedSound={localSound} onSelectSound={handleSoundSelect} />
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
    padding: rs(21),
    justifyContent: 'center',
  },
  title: {
    fontSize: rs(24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(34),
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
    "sound": {
      "title": "Quel son pour te signaler la fin ?"
    }
  }
}
```

---

## 3.5 Mettre à jour Filter-070-notifications.jsx

Vérifier que le fichier (renommé depuis Filter-050-notifications.jsx) :

- Accepte `onContinue` prop
- Appelle `onContinue({ notificationPermission, shouldRequestLater })` à la fin

---

## 3.6 Mettre à jour index.js exports

**Fichier** : `src/screens/onboarding/filters/index.js`

Version finale complète :

```javascript
export { default as Filter010Opening } from './Filter-010-opening';
export { default as Filter020Tool } from './Filter-020-tool';
export { default as Filter030Creation } from './Filter-030-creation';
export { default as Filter040TestStart } from './Filter-040-test-start';
export { default as Filter050TestStop } from './Filter-050-test-stop';
export { default as Filter060Sound } from './Filter-060-sound';
export { default as Filter070Notifications } from './Filter-070-notifications';
export { default as Filter080Paywall } from './Filter-080-paywall';
export { default as Filter090FirstTimer } from './Filter-090-first-timer';
```

---

## 3.7 Analytics events supplémentaires

**Fichier** : `src/services/analytics/onboarding-events.js`

Ajouter :

```javascript
export const trackOnboardingStepCompleted = (stepNumber, stepData) => {
  Analytics.track('onboarding_step_completed', {
    step: stepNumber,
    ...stepData,
  });
};

export const trackPaywallSkipped = (source) => {
  Analytics.track('paywall_skipped', { source });
};

export const trackFirstTimerCompleted = (durationSeconds) => {
  Analytics.track('first_timer_completed', {
    duration_seconds: durationSeconds,
  });
};
```

---

## 3.8 Commit Phase 3

```bash
git add -A
git commit -m "feat(ob): complete flow orchestration - Phase 3

- Refactor Filter-080-paywall with personalized summary
- Add Filter-090-first-timer (summary + guided timer)
- Refactor OnboardingFlow.jsx (9 linear steps, data passing)
- Update Filter-060-sound and Filter-070-notifications
- Add analytics events for flow tracking
- Add i18n keys for paywall and first timer"
```

---

## Validation Checklist Phase 3

- [ ] `Filter-080-paywall.jsx` affiche résumé personnalisé
- [ ] `Filter-090-first-timer.jsx` a 2 phases (summary + timer)
- [ ] `OnboardingFlow.jsx` orchestre 9 filtres linéaires
- [ ] Données passées entre filtres (customActivity, persona, etc.)
- [ ] StepIndicator visible (sauf step 1 et 9)
- [ ] `Filter-060-sound.jsx` fonctionnel
- [ ] `Filter-070-notifications.jsx` fonctionnel
- [ ] index.js exporte tous les filtres
- [ ] Analytics trackent chaque step
- [ ] i18n keys ajoutées
- [ ] Flow complet testable de bout en bout
- [ ] App compile sans erreurs

---

## Notes Techniques

### Passage de données

`OnboardingFlow` maintient `flowData` state. Chaque filtre reçoit ce dont il a besoin en props et retourne ses outputs via `onContinue({ key: value })`.

### Timer dans Filter-090

Utilise le hook `useTimer` existant. Le timer de 60s est fixe pour l'onboarding (pas la durée de l'activité créée).

### StepIndicator

Le composant `StepIndicator` existe dans `src/components/onboarding/StepIndicator.jsx`. Vérifier qu'il accepte `current` et `total` props.

### Transition vers App

Quand `Filter-090-first-timer` appelle `onContinue({ firstTimerCompleted: true })`, `OnboardingFlow` appelle `setOnboardingCompleted(true)` et `onComplete()`, ce qui déclenche le passage à `TimerScreen`.

---

## Prochaines Phases

- **Phase 4** : Polish (animations transitions, i18n 15 langues, tests E2E)
- **Phase 5** : Rappels post-skip (notifications J+3, J+7)

---

**Généré par Chrysalis** — 2025-12-22
**Référence** : ADR-010 Onboarding v2.1 Vision Finale
