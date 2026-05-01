import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_STORAGE_KEY = '@resetpulse_errors';
const MAX_STORED_ERRORS = 10;

// ANSI color codes for Metro console
const C = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
  gray:   '\x1b[90m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  blue:   '\x1b[34m',
};

class Logger {
  constructor() {
    this.isDev = __DEV__;
    this._t0 = null;

    // Boot sequence tracker — timeline relative au démarrage app
    // Usage: logger.boot.start() → logger.boot.step('phase', 'label') → logger.boot.visible/complete()
    this.boot = {
      start: () => {
        this._t0 = Date.now();
      },
      step: (phase, label, data) => {
        if (!this.isDev) return;
        const elapsed = this._t0 !== null ? `+${String(Date.now() - this._t0).padStart(4)}ms` : '  +?ms';
        const prefix  = `${C.dim}[Boot]${C.reset} ${C.gray}${elapsed}${C.reset}`;
        const tag     = `${C.cyan}[${phase}]${C.reset}`;
        const msg     = data !== undefined
          ? `${label}  ${C.yellow}${data}${C.reset}`
          : label;
        console.log(`${prefix}  ${tag}  ${msg}`);
      },
      visible: () => {
        if (!this.isDev) return;
        const ms = this._t0 !== null ? Date.now() - this._t0 : '?';
        console.log(`${C.dim}[Boot]${C.reset}  ${C.blue}${C.bold}◎ UI visible${C.reset}  ${C.gray}${ms}ms${C.reset}`);
      },
      complete: () => {
        if (!this.isDev) return;
        const ms = this._t0 !== null ? Date.now() - this._t0 : '?';
        console.log(`${C.dim}[Boot]${C.reset}  ${C.green}${C.bold}✓ boot complete${C.reset}  ${C.gray}${ms}ms${C.reset}`);
      },
    };
  }

  // Log simple en dev
  log(message, data) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      data !== undefined ? console.log(`[ResetPulse] ${message}`, data) : console.log(`[ResetPulse] ${message}`);
    }
  }

  // Warning en dev seulement
  warn(message, data) {
    if (this.isDev) {
      data !== undefined ? console.warn(`[ResetPulse] ${message}`, data) : console.warn(`[ResetPulse] ${message}`);
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
      if (!errors) {
        return [];
      }
      try {
        return JSON.parse(errors);
      } catch (parseError) {
        // Malformed JSON, clear and return empty
        await AsyncStorage.removeItem(ERROR_STORAGE_KEY);
        return [];
      }
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