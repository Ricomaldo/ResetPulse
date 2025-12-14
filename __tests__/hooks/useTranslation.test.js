// Tests for useTranslation hook - P2
import { renderHook } from '../test-utils';
import { useTranslation } from '../../src/hooks/useTranslation';

// Mock i18n module
jest.mock('../../src/i18n', () => ({
  t: jest.fn((key, options = {}) => {
    // Simulate i18n translation function
    const translations = {
      'settings.title': 'Paramètres',
      'settings.language': 'Langue',
      'timer.start': 'Démarrer',
      'timer.pause': 'Pause',
      'timer.reset': 'Réinitialiser',
      'onboarding.welcome': 'Bienvenue',
      'customActivities.create.title': 'Créer une activité',
      'customActivities.create.namePlaceholder': 'Nom de l\'activité',
      'errors.required': 'Ce champ est requis',
      // Test nested keys
      'nested.deep.key': 'Nested value',
    };

    // Handle interpolation
    let result = translations[key] || key;
    if (options.name) {
      result = result.replace('%{name}', options.name);
    }

    return result;
  }),
}));

describe('useTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic translation', () => {
    it('returns translation function', () => {
      const { result } = renderHook(() => useTranslation());

      expect(typeof result.current).toBe('function');
    });

    it('translates simple keys', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      expect(t('settings.title')).toBe('Paramètres');
      expect(t('timer.start')).toBe('Démarrer');
      expect(t('timer.pause')).toBe('Pause');
    });

    it('returns key when translation not found', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('Nested keys', () => {
    it('handles deeply nested keys', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      expect(t('customActivities.create.title')).toBe('Créer une activité');
      expect(t('nested.deep.key')).toBe('Nested value');
    });
  });

  describe('Memoization', () => {
    it('returns same function reference across renders', () => {
      const { result, rerender } = renderHook(() => useTranslation());
      const firstT = result.current;

      rerender();

      const secondT = result.current;
      expect(firstT).toBe(secondT);
    });
  });

  describe('Options handling', () => {
    it('passes options to i18n.t', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      // Call with options
      t('settings.title', { defaultValue: 'Settings' });

      // Verify i18n.t was called with options
      const i18n = require('../../src/i18n');
      expect(i18n.t).toHaveBeenCalledWith('settings.title', { defaultValue: 'Settings' });
    });

    it('works with empty options', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      const translation = t('timer.start');

      expect(translation).toBe('Démarrer');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string key', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      // Empty key should return empty string (as per key fallback)
      expect(t('')).toBe('');
    });

    it('handles keys with special characters', () => {
      const { result } = renderHook(() => useTranslation());
      const t = result.current;

      // Should handle keys with dots properly
      expect(t('customActivities.create.namePlaceholder')).toBe('Nom de l\'activité');
    });
  });
});
