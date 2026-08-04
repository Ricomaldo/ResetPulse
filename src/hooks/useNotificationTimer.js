// src/hooks/useNotificationTimer.js
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import logger from '../utils/logger';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from './useTranslation';
import { getNotificationSoundFile } from '../config/sounds';

// Règle ADR-018 §① — un instant = un canal. App au PREMIER PLAN : la fin de
// séance est déjà portée par l'app elle-même (son expo-audio + bloom +
// haptique) — la notification système ne double plus (ni bannière, ni
// liste, ni son). App en fond/inactive : la notification est le canal, elle
// porte tout (comportement d'origine intact).
// Fonction pure exportée pour le test — le handler ci-dessous la lit à
// CHAQUE présentation avec l'AppState de l'instant.
export const buildNotificationBehavior = (appState) => {
  const isForeground = appState === 'active';
  return {
    shouldShowBanner: !isForeground, // Bannière en haut
    shouldShowList: !isForeground,   // Dans le centre de notifications
    shouldPlaySound: !isForeground,  // Son (choisi par l'user sur iOS)
    shouldSetBadge: false,
  };
};

// Configuration pour les notifications (SDK 54+)
// Protection contre les modules natifs manquants (iOS Simulator notamment)
let notificationsAvailable = false;
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => buildNotificationBehavior(AppState.currentState),
  });
  notificationsAvailable = true;
} catch (error) {
  // Silent fail sur iOS Simulator - les notifications ne sont pas disponibles
  logger.log('ℹ️ Notifications not available (iOS Simulator or missing module)');
}

// Créer les channels Android — REQUIS pour Android 8.0+ (API 26+).
// Deux channels distincts (Lot 3e) : 'timer' (fin de séance, urgent) et
// séance pour une notification que l'user n'attend pas dans l'instant).
// Limitation Android connue et documentée (pas un raccourci pris ici) : le
// son d'un channel est figé à sa création et ne peut plus être changé — le
// channel 'timer' garde donc TOUJOURS le son par défaut, quel que soit
// selectedSoundId. Seul iOS (content.sound, par notification) respecte le
// son choisi par l'user. Résoudre côté Android nécessiterait un channel par
// son (clutter des réglages système) — hors scope de ce lot, signalé au
// rapport.
const setupAndroidChannels = async () => {
  if (Platform.OS !== 'android') {return;}

  try {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Fin de séance',
      description: 'Notification à la fin d\'un rituel',
      importance: Notifications.AndroidImportance.HIGH, // Bannière + son
      sound: 'aj_heels__timercomplete01.wav', // Son fixe (limitation channel Android, cf. commentaire ci-dessus)
      vibrationPattern: [0, 250, 250, 250], // Vibration courte
      enableLights: true,
      lightColor: '#4A5568', // Couleur thème app
      enableVibrate: true,
      showBadge: true,
    });
    logger.log('✅ Android notification channel "timer" created');
  } catch (error) {
    logger.warn('Failed to create Android notification channel', error.message);
  }
};

// Initialiser les channels au chargement du module
setupAndroidChannels();

export default function useNotificationTimer() {
  const t = useTranslation();
  const {
    timer: { selectedSoundId },
  } = useTimerConfig();
  const notificationIdRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const schedulingInProgressRef = useRef(false); // Prevent race conditions
  const schedulingPromiseRef = useRef(null); // Track in-flight schedule operation

  // Listener pour l'état de l'app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Permission contextuelle (recentrage C2) : demandée au premier start de
  // séance (useTimer.startTimer), plus au mount/boot. Idempotent côté OS —
  // une fois tranchée (accordée/refusée), un appel ultérieur ne re-prompt pas.
  const requestNotificationPermission = async () => {
    if (!notificationsAvailable) {
      return;
    }
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        logger.warn('Notification permissions not granted');
      }
    } catch (error) {
      logger.warn('Failed to request notification permissions', error.message);
    }
  };

  // Programmer une notification pour la fin du timer
  // @param {number} seconds - Temps avant fin en secondes
  // @param {Object} activity - Activité avec emoji et label
  // @param {string} endMessage - Message de fin depuis timerMessages (ex: "Centré 🪷")
  const scheduleTimerNotification = async (seconds, activity, endMessage) => {
    // Skip si notifications non disponibles (iOS Simulator)
    if (!notificationsAvailable) {
      return null;
    }

    // Prevent race conditions: wait for any in-progress scheduling to complete
    if (schedulingInProgressRef.current && schedulingPromiseRef.current) {
      logger.log('Scheduling already in progress, waiting…');
      // Wait for previous scheduling to complete before proceeding
      await schedulingPromiseRef.current;
    }

    schedulingInProgressRef.current = true;

    // Create and store the scheduling promise
    const schedulePromise = (async () => {
      try {
        // Annuler notification existante (defensive, should already be null)
        if (notificationIdRef.current) {
          await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
          notificationIdRef.current = null;
        }

        // Voix de l'Activité (recentrage, ADR-014) : emoji + endMessage i18n
        // de l'Activité — jamais un libellé générique ("Temps écoulé !" etc).
        // Repli sur le endMessage neutre ('none', "Bravo 🎉"/"Well done 🎉")
        // si l'appelant n'en fournit pas — jamais un mot brut en dur.
        const activityEmoji = activity?.emoji || '⏰';
        const title = `${activityEmoji} ${endMessage || t('timerMessages.none.endMessage')}`;

        // Programmer nouvelle notification
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: '', // Corps vide - tout est dans le titre
            // Son du rituel courant (selectedSoundId) — respecté sur iOS,
            // où `sound` est lu par notification. Sur Android, le son est
            // celui du channel 'timer' (fixe, cf. commentaire à la création
            // du channel plus haut) : limitation plateforme, pas un
            // raccourci pris ici (channel-sound immuable après création).
            sound: getNotificationSoundFile(selectedSoundId),
            // Pour Android 8+ le son du channel est utilisé
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, // Enum correct SDK 54
            seconds: Math.max(1, seconds), // Au minimum 1 seconde
            channelId: 'timer', // Android : utilise le channel créé
          },
        });

        notificationIdRef.current = id;

        if (__DEV__) {
          const now = new Date();
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          const endTime = new Date(now.getTime() + seconds * 1000);
          const timeString = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logger.log(`📱 [${now.toLocaleTimeString('fr-FR')}] Notif dans ${minutes}min ${secs}s → "${title}" à ${timeString}`);
        }

        return id;
      } catch (error) {
        logger.warn('Error scheduling notification', error.message);
        return null;
      } finally {
        schedulingInProgressRef.current = false;
        schedulingPromiseRef.current = null;
      }
    })();

    schedulingPromiseRef.current = schedulePromise;
    return schedulePromise;
  };

  // Annuler la notification
  const cancelTimerNotification = async () => {
    // Skip si notifications non disponibles
    if (!notificationsAvailable) {
      return;
    }

    // CRITICAL: Wait for any in-progress scheduling to complete first
    // This prevents race conditions where cancel runs before schedule finishes
    if (schedulingInProgressRef.current && schedulingPromiseRef.current) {
      logger.log('Waiting for in-progress schedule before canceling…');
      await schedulingPromiseRef.current;
    }

    try {
      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;

        logger.log('📱 Notification annulée');
      }
    } catch (error) {
      logger.warn('Error canceling notification', error.message);
      // Fail silently
    }
  };

  // Vérifier si l'app est en arrière-plan
  const isAppInBackground = () => {
    return appStateRef.current === 'background' || appStateRef.current === 'inactive';
  };

  return {
    scheduleTimerNotification,
    cancelTimerNotification,
    isAppInBackground,
    requestNotificationPermission,
  };
}