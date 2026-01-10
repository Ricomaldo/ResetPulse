# Query Claude Code — Onboarding v2.1 Phase 5

## Contexte

Phases 0-4 complétées :

- ✅ Structure + Fondations
- ✅ Détection comportementale
- ✅ Orchestration flow complet
- ✅ Polish (i18n, animations, edge cases)

**Phase 5** : Notifications rappels post-skip — Ramener les users qui ont skip le paywall.

**Document de référence** :

- `_internal/docs/decisions/adr-010-onboarding-v2-vision-finale.md` (section Post-Skip Reminder Tactics)

---

## IMPORTANT : Consultation Préalable

**Avant de coder**, consulter :

```
@src/hooks/useNotificationTimer.js  → Infrastructure notifications existante
@src/services/analytics/            → Patterns analytics
@src/contexts/TimerConfigContext.jsx → Où stocker les flags
```

---

## Rappel Stratégie (ADR-010)

5 niveaux de rappels post-skip :

| #   | Trigger                | Délai               | Message                              |
| --- | ---------------------- | ------------------- | ------------------------------------ |
| 1   | TwoTimersModal         | 2ème timer complété | "🎉 2 timers complétés !"            |
| 2   | Tap contenu premium    | Immédiat            | DiscoveryModal → PremiumModal        |
| 3   | Tap "+" custom (limit) | Immédiat            | "Tu as déjà créé ton moment gratuit" |
| 4   | **Notification J+3**   | 3 jours post-skip   | "Ta [activité] t'attend 🎸"          |
| 5   | **Notification J+7**   | 7 jours post-skip   | "Dernière chance : essai gratuit"    |

**Cette phase implémente #4 et #5** (notifications locales programmées).

---

## 5.1 Créer service notifications rappels

**Fichier** : `src/services/reminderNotifications.js` (nouveau)

```javascript
/**
 * @fileoverview Reminder notifications for post-skip users
 * Schedules local notifications at J+3 and J+7 after paywall skip
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

// Storage keys
const STORAGE_KEYS = {
  PAYWALL_SKIP_DATE: '@ResetPulse:paywallSkipDate',
  REMINDER_SCHEDULED: '@ResetPulse:reminderScheduled',
  CUSTOM_ACTIVITY: '@ResetPulse:onboardingCustomActivity',
};

// Notification IDs (pour pouvoir les annuler)
const NOTIFICATION_IDS = {
  DAY_3: 'reminder-day-3',
  DAY_7: 'reminder-day-7',
};

// Délais en secondes
const DELAYS = {
  DAY_3: 3 * 24 * 60 * 60, // 3 jours
  DAY_7: 7 * 24 * 60 * 60, // 7 jours
};

/**
 * Enregistre la date du skip paywall et programme les notifications
 * @param {Object} customActivity - L'activité créée pendant l'onboarding
 */
export const schedulePostSkipReminders = async (customActivity) => {
  try {
    // Vérifier permission notifications
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notifications not permitted, skipping reminders');
      return;
    }

    // Sauvegarder date du skip
    const skipDate = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.PAYWALL_SKIP_DATE, skipDate);

    // Sauvegarder activité pour personnalisation
    if (customActivity) {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_ACTIVITY, JSON.stringify(customActivity));
    }

    // Programmer notification J+3
    await scheduleDay3Notification(customActivity);

    // Programmer notification J+7
    await scheduleDay7Notification();

    // Marquer comme programmé
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SCHEDULED, 'true');

    console.log('Post-skip reminders scheduled');
  } catch (error) {
    console.error('Failed to schedule reminders:', error);
  }
};

/**
 * Notification J+3 : Personnalisée avec l'activité créée
 * "Ta guitare t'attend 🎸 — 20 min pour toi ?"
 */
const scheduleDay3Notification = async (customActivity) => {
  const title = i18n.t('notifications.reminder.day3.title');

  // Message personnalisé si activité disponible
  let body;
  if (customActivity?.emoji && customActivity?.name) {
    body = i18n.t('notifications.reminder.day3.bodyPersonalized', {
      emoji: customActivity.emoji,
      name: customActivity.name,
      duration: Math.floor(customActivity.defaultDuration / 60),
    });
  } else {
    body = i18n.t('notifications.reminder.day3.bodyGeneric');
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DAY_3,
    content: {
      title,
      body,
      data: {
        type: 'reminder_day_3',
        activityId: customActivity?.id,
      },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: DELAYS.DAY_3,
    },
  });
};

/**
 * Notification J+7 : Dernière chance trial
 * "Dernière chance : essai gratuit 7 jours expire bientôt"
 */
const scheduleDay7Notification = async () => {
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DAY_7,
    content: {
      title: i18n.t('notifications.reminder.day7.title'),
      body: i18n.t('notifications.reminder.day7.body'),
      data: {
        type: 'reminder_day_7',
        action: 'open_paywall',
      },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: DELAYS.DAY_7,
    },
  });
};

/**
 * Annule toutes les notifications de rappel
 * À appeler quand l'user devient premium
 */
export const cancelPostSkipReminders = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAY_3);
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAY_7);
    await AsyncStorage.removeItem(STORAGE_KEYS.REMINDER_SCHEDULED);
    console.log('Post-skip reminders cancelled');
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
};

/**
 * Vérifie si les rappels sont déjà programmés
 */
export const areRemindersScheduled = async () => {
  const scheduled = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SCHEDULED);
  return scheduled === 'true';
};

/**
 * Récupère la date du skip pour analytics
 */
export const getPaywallSkipDate = async () => {
  const dateStr = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_SKIP_DATE);
  return dateStr ? new Date(dateStr) : null;
};
```

---

## 5.2 i18n keys notifications

**Ajouter dans tous les fichiers locales** :

```json
{
  "notifications": {
    "reminder": {
      "day3": {
        "title": "Un moment pour toi ?",
        "bodyPersonalized": "Ta {{name}} t'attend {{emoji}} — {{duration}} min pour toi ?",
        "bodyGeneric": "Ton timer t'attend — prends un moment pour toi"
      },
      "day7": {
        "title": "Dernière chance",
        "body": "Essai gratuit 7 jours — profites-en avant qu'il expire"
      }
    }
  }
}
```

**Traductions EN** :

```json
{
  "notifications": {
    "reminder": {
      "day3": {
        "title": "A moment for yourself?",
        "bodyPersonalized": "Your {{name}} awaits {{emoji}} — {{duration}} min for you?",
        "bodyGeneric": "Your timer awaits — take a moment for yourself"
      },
      "day7": {
        "title": "Last chance",
        "body": "7-day free trial — grab it before it expires"
      }
    }
  }
}
```

---

## 5.3 Intégrer dans Filter-080-paywall

**Fichier** : `src/screens/onboarding/filters/Filter-080-paywall.jsx`

**Modifier handleSkip** :

```jsx
import { schedulePostSkipReminders } from '../../../services/reminderNotifications';

const handleSkip = useCallback(async () => {
  haptics.light();
  analytics.trackPaywallSkipped('onboarding');

  // Programmer notifications de rappel
  await schedulePostSkipReminders(customActivity);

  onContinue({ purchaseResult: 'skipped' });
}, [onContinue, analytics, customActivity]);
```

---

## 5.4 Annuler rappels si premium

**Fichier** : `src/contexts/PurchaseContext.jsx`

**Modifier** la logique de détection premium :

```jsx
import { cancelPostSkipReminders } from '../services/reminderNotifications';

// Dans le useEffect qui détecte le changement de statut premium
useEffect(() => {
  if (isPremium) {
    // L'user est devenu premium, annuler les rappels
    cancelPostSkipReminders();
  }
}, [isPremium]);
```

---

## 5.5 Handler tap notification

**Fichier** : `App.js` (ou créer `src/services/notificationHandler.js`)

**Gérer l'ouverture de l'app via notification** :

```jsx
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

// Dans App.js
export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Handler quand user tap sur notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data.type === 'reminder_day_3') {
        // Ouvrir app avec l'activité créée
        // Navigation vers TimerScreen avec activité pré-sélectionnée
        handleReminderDay3(data.activityId);
      }

      if (data.type === 'reminder_day_7') {
        // Ouvrir paywall
        handleReminderDay7();
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleReminderDay3 = async (activityId) => {
    // Si activityId fourni, charger l'activité et la sélectionner
    // Sinon, juste ouvrir l'app normalement
    if (activityId) {
      // TODO: Navigation avec activité pré-sélectionnée
      // Dépend de la structure de navigation
    }

    // Track analytics
    analytics.track('reminder_day_3_tapped', { activityId });
  };

  const handleReminderDay7 = () => {
    // Ouvrir le paywall via ModalStack
    // TODO: Implémenter selon structure navigation

    // Track analytics
    analytics.track('reminder_day_7_tapped');
  };

  // ... reste du App.js
}
```

---

## 5.6 Analytics events

**Fichier** : `src/services/analytics/conversion-events.js`

**Ajouter** :

```javascript
// Reminder notifications
export const trackReminderScheduled = (type) => {
  Analytics.track('reminder_scheduled', {
    type, // 'day_3' | 'day_7'
  });
};

export const trackReminderTapped = (type, activityId = null) => {
  Analytics.track('reminder_tapped', {
    type,
    activity_id: activityId,
  });
};

export const trackReminderConverted = (type) => {
  Analytics.track('reminder_converted', {
    type,
    // Indique que l'user est devenu premium après un reminder
  });
};
```

---

## 5.7 Tests manuels

### Tester notifications (mode dev)

Pour tester sans attendre 3 jours, modifier temporairement les délais :

```javascript
// TEMPORAIRE - Pour tests uniquement
const DELAYS = {
  DAY_3: 30, // 30 secondes au lieu de 3 jours
  DAY_7: 60, // 60 secondes au lieu de 7 jours
};
```

### Checklist tests

```markdown
## Notifications Rappels

- [ ] Skip paywall → notifications programmées (vérifier console)
- [ ] Notification J+3 reçue (avec délai réduit)
- [ ] Notification J+3 personnalisée (emoji + nom activité)
- [ ] Notification J+7 reçue
- [ ] Tap notification J+3 → app ouvre
- [ ] Tap notification J+7 → app ouvre
- [ ] Devenir premium → notifications annulées
- [ ] Permission refusée → pas d'erreur, skip silencieux

## Edge cases

- [ ] App killed → notifications toujours délivrées
- [ ] Plusieurs skip (ne pas re-programmer si déjà fait)
- [ ] User refuse permission après skip → pas de crash
```

---

## 5.8 Commit Phase 5

```bash
git add -A
git commit -m "feat(ob): add post-skip reminder notifications - Phase 5

- Add reminderNotifications.js service
- Schedule J+3 notification (personalized with custom activity)
- Schedule J+7 notification (last chance trial)
- Cancel reminders when user becomes premium
- Add notification tap handlers in App.js
- Add analytics events for reminder funnel
- Add i18n keys for notifications (15 languages)"
```

---

## Validation Checklist Phase 5

### Service

- [ ] `reminderNotifications.js` créé
- [ ] `schedulePostSkipReminders()` fonctionne
- [ ] `cancelPostSkipReminders()` fonctionne
- [ ] Notifications utilisent bons identifiants

### Intégration

- [ ] Filter-080-paywall appelle `schedulePostSkipReminders` sur skip
- [ ] PurchaseContext appelle `cancelPostSkipReminders` si premium
- [ ] App.js gère tap sur notifications

### i18n

- [ ] Keys notification ajoutées (15 langues)
- [ ] Interpolation `{{name}}` fonctionne

### Analytics

- [ ] `reminder_scheduled` tracké
- [ ] `reminder_tapped` tracké

### Tests

- [ ] Notifications reçues (délai test 30s)
- [ ] Personnalisation OK
- [ ] Annulation OK si premium
- [ ] Pas d'erreur si permission refusée

---

## Notes Techniques

### Expo Notifications

Le projet utilise déjà `expo-notifications` (voir `useNotificationTimer.js`). Réutiliser les patterns existants.

### Identifiants uniques

Les `identifier` permettent d'annuler des notifications spécifiques. Important pour ne pas annuler les notifications timer.

### Deep linking (optionnel)

Pour navigation précise au tap, implémenter deep links :

- `resetpulse://timer?activity=custom_123`
- `resetpulse://paywall`

Peut être fait en Phase 6 si complexe.

### Limites iOS

iOS limite le nombre de notifications locales programmées (~64). Pas un problème ici (seulement 2).

---

## Prochaines Étapes

**Post Phase 5** :

- Déploiement TestFlight / Internal Testing
- Mesure métriques baseline (1 semaine)
- Itération data-driven

**Phase 6 (optionnelle)** :

- Deep linking précis
- A/B test messaging notifications
- Rappels in-app (banners)

---

**Généré par Chrysalis** — 2025-12-22
**Référence** : ADR-010 Post-Skip Reminder Tactics
