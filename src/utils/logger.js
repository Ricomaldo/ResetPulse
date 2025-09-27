import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_STORAGE_KEY = '@resetpulse_errors';
const MAX_STORED_ERRORS = 10;

class Logger {
  constructor() {
    this.isDev = __DEV__;
  }

  // Log simple en dev
  log(message, data) {
    if (this.isDev) {
      console.log(`[ResetPulse] ${message}`, data || '');
    }
  }

  // Warning en dev seulement
  warn(message, data) {
    if (this.isDev) {
      console.warn(`[ResetPulse] ${message}`, data || '');
    }
  }

  // Erreurs : console en dev, storage en prod
  async error(message, data) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message,
      data: data || {}
    };

    if (this.isDev) {
      console.error(`[ResetPulse Error] ${message}`, data || '');
    } else {
      // En production, stocker les erreurs critiques
      await this.storeError(errorData);
    }
  }

  // Stockage minimal des erreurs en production
  async storeError(errorData) {
    try {
      const existingErrors = await this.getStoredErrors();

      // Garder seulement les 10 dernières erreurs
      const updatedErrors = [errorData, ...existingErrors].slice(0, MAX_STORED_ERRORS);

      await AsyncStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(updatedErrors));
    } catch (e) {
      // Silently fail - ne pas crasher à cause du logging
    }
  }

  // Récupérer les erreurs stockées (pour debug)
  async getStoredErrors() {
    try {
      const errors = await AsyncStorage.getItem(ERROR_STORAGE_KEY);
      return errors ? JSON.parse(errors) : [];
    } catch (e) {
      return [];
    }
  }

  // Nettoyer les erreurs stockées
  async clearErrors() {
    try {
      await AsyncStorage.removeItem(ERROR_STORAGE_KEY);
    } catch (e) {
      // Silently fail
    }
  }
}

export default new Logger();