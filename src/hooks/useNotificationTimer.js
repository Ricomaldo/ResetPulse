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
    console.log('ℹ️ Notifications not available (iOS Simulator or missing module)');
  }
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
      sound: 'bell_short.wav', // Son par défaut (bell_classic)
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

  // TEST : Notification immédiate pour vérifier permissions
  const testNotification = async () => {
    if (!notificationsAvailable) {
      console.log('🧪 Test notification skipped - notifications not available');
      return;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 Test notification",
          body: "Si tu vois ça, les permissions sont OK",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
      console.log(`🧪 Test notification schedulée (ID: ${id}) - déclenchement dans 2 secondes`);
    } catch (error) {
      console.error("❌ Test notification failed:", error);
    }
  };

  // Demander permission au mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // AVANT de demander - voir l'état réel
        const existingStatus = await Notifications.getPermissionsAsync();
        console.log('📱 Permissions AVANT requête:', existingStatus);
        console.log('   Status:', existingStatus.status);
        console.log('   Can ask again:', existingStatus.canAskAgain);
        console.log('   Granted:', existingStatus.granted);

        console.log('📱 Requesting notification permissions...');
        const result = await Notifications.requestPermissionsAsync();

        console.log('📱 Permissions APRÈS requête:', result);
        console.log('   Status:', result.status);
        console.log('   Can ask again:', result.canAskAgain);
        console.log('   Granted:', result.granted);

        if (result.status === 'granted' && result.granted) {
          console.log('✅ Notification permissions granted');
        } else {
          console.warn('❌ Notification permissions not granted');
          console.warn('   You may need to enable notifications in iPhone Settings > ResetPulse');
        }

        // Test notification 3s après le launch (seulement en dev)
        if (__DEV__ && result.status === 'granted') {
          setTimeout(testNotification, 3000);
        }
      } catch (error) {
        console.error('❌ Failed to request notification permissions:', error);
        console.error('   Error message:', error.message);
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
    // Skip si notifications non disponibles (iOS Simulator)
    if (!notificationsAvailable) {
      console.log('📱 Notification skipped - not available (simulator?)');
      return null;
    }

    try {
      // Annuler notification existante
      if (notificationIdRef.current) {
        console.log(`📱 Cancelling previous notification (ID: ${notificationIdRef.current})`);
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

      console.log(`📱 Scheduling notification for ${seconds}s from now...`);

      // Programmer nouvelle notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Timer terminé !",
          body: `Votre timer de ${Math.floor(seconds/60)}min ${seconds%60}s est terminé`,
          sound: 'bell_short.wav', // Son bell_classic
          // Pour Android 8+ le son du channel est utilisé
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, // Enum correct SDK 54
          seconds: Math.max(1, seconds), // Au minimum 1 seconde
          channelId: 'timer', // Android : utilise le channel créé
        },
      });

      notificationIdRef.current = id;

      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      console.log(`✅ Notification scheduled successfully!`);
      console.log(`   ID: ${id}`);
      console.log(`   Duration: ${minutes}min ${secs}s`);
      console.log(`   Start: ${now.toLocaleTimeString('fr-FR')}`);
      console.log(`   Expected trigger: ${timeString}`);

      return id;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      console.error('   Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n')[0]
      });
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