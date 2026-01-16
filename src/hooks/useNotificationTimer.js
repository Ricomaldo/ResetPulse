// src/hooks/useNotificationTimer.js
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

// Configuration pour les notifications (SDK 54+)
// Protection contre les modules natifs manquants (iOS Simulator notamment)
let notificationsAvailable = false;
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,  // Bannière en haut
      shouldShowList: true,    // Dans le centre de notifications
      shouldPlaySound: true,   // Son système par défaut
      shouldSetBadge: false,
    }),
  });
  notificationsAvailable = true;
} catch (error) {
  // Silent fail sur iOS Simulator - les notifications ne sont pas disponibles
  if (__DEV__) {
    console.warn('ℹ️ Notifications not available (iOS Simulator or missing module)');
  }
}

// Créer le channel Android pour les notifications du timer
// REQUIS pour Android 8.0+ (API 26+)
const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') {return;}

  try {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Notifications',
      description: 'Notifications when timer completes',
      importance: Notifications.AndroidImportance.HIGH, // Bannière + son
      sound: '634089__aj_heels__timercomplete01.wav', // Son par défaut (bell_classic)
      vibrationPattern: [0, 250, 250, 250], // Vibration courte
      enableLights: true,
      lightColor: '#4A5568', // Couleur thème app
      enableVibrate: true,
      showBadge: true,
    });

    if (__DEV__) {
      console.warn('✅ Android notification channel "timer" created');
    }
  } catch (error) {
    console.warn('⚠️ Failed to create Android notification channel:', error.message);
  }
};

// Initialiser le channel au chargement du module
setupAndroidChannel();

export default function useNotificationTimer() {
  const notificationIdRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Demander permission au mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
        }
      } catch (error) {
        console.warn('⚠️ Failed to request notification permissions:', error.message);
      }
    };

    requestPermissions();

    // Listener pour l'état de l'app
    const subscription = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Programmer une notification pour la fin du timer
  // @param {number} seconds - Temps avant fin en secondes
  // @param {Object} activity - Activité avec emoji et label
  // @param {string} endMessage - Message de fin depuis timerMessages (ex: "Centré 🪷")
  const scheduleTimerNotification = async (seconds, activity, endMessage) => {
    // Skip si notifications non disponibles (iOS Simulator)
    if (!notificationsAvailable) {
      return null;
    }

    try {
      // Annuler notification existante
      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      }

      // Format 2: emoji + endMessage (sans durée)
      const activityEmoji = activity?.emoji || '⏰';
      const title = `${activityEmoji} ${endMessage || 'Terminé'}`;

      // Programmer nouvelle notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: '', // Corps vide - tout est dans le titre
          sound: '634089__aj_heels__timercomplete01.wav', // Son bell_classic
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
        const timeString = endTime.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        console.warn(`📱 [${now.toLocaleTimeString('fr-FR')}] Notif programmée dans ${minutes}min ${secs}s → "${title}" à ${timeString}`);
      }

      return id;
    } catch (error) {
      console.warn('⚠️ Error scheduling notification:', error.message);
      // Fail silently - don't crash the app
      return null;
    }
  };

  // Annuler la notification
  const cancelTimerNotification = async () => {
    // Skip si notifications non disponibles
    if (!notificationsAvailable) {
      return;
    }

    try {
      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;

        if (__DEV__) {
          console.warn('📱 Notification annulée');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error canceling notification:', error.message);
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
    isAppInBackground
  };
}