// src/hooks/useNotificationTimer.js
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

// Configuration pour les notifications (SDK 54+)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Bannière en haut
    shouldShowList: true,    // Dans le centre de notifications
    shouldPlaySound: true,   // Son système par défaut
    shouldSetBadge: false,
  }),
});

export default function useNotificationTimer() {
  const notificationIdRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Demander permission au mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
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
          sound: true, // Utilise le son système par défaut
          // Pour un son custom, il faut configurer dans app.json
        },
        trigger: {
          type: 'timeInterval', // IMPORTANT : spécifier le type !
          seconds: Math.max(1, seconds), // Au minimum 1 seconde
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
      console.log('Error scheduling notification:', error);
      return null;
    }
  };

  // Annuler la notification
  const cancelTimerNotification = async () => {
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;

      if (__DEV__) {
        console.log('📱 Notification annulée');
      }
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