/**
 * @fileoverview reminderSlots - Créneaux préréglés du rappel doux (Lot 3e)
 * @description Rappel quotidien opt-in strict (ADR-014, _docs/specs/recentrage.md
 * §Notifications) : 3 créneaux fixes, JS pur — pas de time-picker natif, aucune
 * dépendance nouvelle. Fonctions pures, testables sans mock de module natif :
 * expo-notifications reste hors de ce fichier, c'est le hook appelant
 * (useNotificationTimer) qui attache le type de trigger calendaire.
 */

export const REMINDER_SLOTS = {
  morning: { hour: 8, minute: 0 },
  midday: { hour: 12, minute: 30 },
  evening: { hour: 20, minute: 30 },
};

// Ordre d'affichage des pills dans le sheet (matin → midi → soir)
export const REMINDER_SLOT_IDS = ['morning', 'midday', 'evening'];

export const DEFAULT_REMINDER_SLOT = 'evening';

// Identifiant stable de la notification quotidienne (scheduleNotificationAsync
// `identifier`) — permet de l'annuler/la replanifier sans conserver l'id
// généré par l'OS, qui ne survit pas à un redémarrage de l'app.
export const REMINDER_NOTIFICATION_ID = 'daily-reminder';

/**
 * Heure du créneau demandé — repli silencieux sur le défaut si l'id est
 * invalide (valeur persistée corrompue ou d'une version antérieure).
 * @param {string} slotId - 'morning' | 'midday' | 'evening'
 * @returns {{hour: number, minute: number}}
 */
export const getReminderTime = (slotId) => REMINDER_SLOTS[slotId] || REMINDER_SLOTS[DEFAULT_REMINDER_SLOT];

/**
 * Normalise un id de créneau — utile pour choisir la bonne clé i18n
 * (`reminder.notification.{slot}`) sans dupliquer le repli ci-dessus.
 * @param {string} slotId
 * @returns {string}
 */
export const normalizeReminderSlot = (slotId) => (REMINDER_SLOTS[slotId] ? slotId : DEFAULT_REMINDER_SLOT);
