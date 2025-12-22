// src/services/reminderNotifications.js
/**
 * @fileoverview Reminder notifications for post-skip users
 * Schedules local notifications at J+3 and J+7 after paywall skip
 * ADR-010 implementation - Post-Skip Reminder Tactics
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

    // Vérifier si déjà programmé (ne pas re-programmer)
    const alreadyScheduled = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SCHEDULED);
    if (alreadyScheduled === 'true') {
      console.log('Reminders already scheduled, skipping');
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

    console.log('Post-skip reminders scheduled successfully');
  } catch (error) {
    console.error('Failed to schedule reminders:', error);
    // Fail silently - don't crash the app
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
    await AsyncStorage.removeItem(STORAGE_KEYS.PAYWALL_SKIP_DATE);
    console.log('Post-skip reminders cancelled successfully');
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
    // Fail silently
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
