// src/hooks/useNotificationTimer.js
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

// Configuration pour les notifications (SDK 54+)
// Protection contre les modules natifs manquants
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,  // Bannière en haut
      shouldShowList: true,    // Dans le centre de notifications
      shouldPlaySound: true,   // Son système par défaut
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn('⚠️ Notifications configuration failed (native module missing):', error.message);
}

// Créer le channel Android pour les notifications du timer
// REQUIS pour Android 8.0+ (API 26+)
const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Notifications',
      description: 'Notifications when timer completes',
      importance: Notifications.AndroidImportance.HIGH, // Bannière + son
      sound: '407342__forthehorde68__fx_bell_short.wav', // Son par défaut (bell_classic)
      vibrationPattern: [0, 250, 250, 250], // Vibration courte
      enableLights: true,
      lightColor: '#4A5568', // Couleur thème app
      enableVibrate: true,
      showBadge: true,
    });

    if (__DEV__) {
      console.log('✅ Android notification channel "timer" created');
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
          console.log('Notification permissions not granted');
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
  const scheduleTimerNotification = async (seconds) => {
    try {
      // Annuler notification existante
      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      }

      // Calculer l'heure de fin
      const now = new Date();
      const endTime = new Date(now.getTime() + seconds * 1000);
      const timeString = endTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Programmer nouvelle notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Timer terminé !",
          body: `Votre timer de ${Math.floor(seconds/60)}min ${seconds%60}s est terminé`,
          sound: '407342__forthehorde68__fx_bell_short.wav', // Son bell_classic
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
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        console.log(`📱 [${now.toLocaleTimeString('fr-FR')}] Notification programmée dans ${minutes}min ${secs}s → déclenchement prévu à ${timeString}`);
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
    try {
      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;

        if (__DEV__) {
          console.log('📱 Notification annulée');
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