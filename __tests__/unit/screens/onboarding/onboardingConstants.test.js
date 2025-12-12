// Tests for onboarding constants and helper functions
import {
  rs,
  FREE_ACTIVITIES,
  NEEDS_OPTIONS,
  getSmartDefaults,
  getJourneyScenarios,
  DURATION_OPTIONS,
  STEP_NAMES,
} from '../../../../src/screens/onboarding/onboardingConstants';

describe('onboardingConstants', () => {
  describe('rs (responsive sizing)', () => {
    it('should return a number', () => {
      const result = rs(100);
      expect(typeof result).toBe('number');
    });

    it('should scale proportionally', () => {
      const small = rs(50);
      const large = rs(100);
      expect(large).toBeGreaterThan(small);
    });
  });

  describe('FREE_ACTIVITIES', () => {
    it('should have exactly 4 free activities', () => {
      expect(FREE_ACTIVITIES).toHaveLength(4);
    });

    it('should include required activity IDs', () => {
      const ids = FREE_ACTIVITIES.map(a => a.id);
      expect(ids).toContain('work');
      expect(ids).toContain('break');
      expect(ids).toContain('meditation');
      expect(ids).toContain('creativity');
    });

    it('each activity should have id, emoji, label, defaultDuration', () => {
      FREE_ACTIVITIES.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('emoji');
        expect(activity).toHaveProperty('label');
        expect(activity).toHaveProperty('defaultDuration');
        expect(typeof activity.defaultDuration).toBe('number');
      });
    });
  });

  describe('NEEDS_OPTIONS', () => {
    it('should have exactly 5 needs options', () => {
      expect(NEEDS_OPTIONS).toHaveLength(5);
    });

    it('should include required need IDs', () => {
      const ids = NEEDS_OPTIONS.map(n => n.id);
      expect(ids).toContain('meditation');
      expect(ids).toContain('work');
      expect(ids).toContain('creativity');
      expect(ids).toContain('time');
      expect(ids).toContain('neurodivergent');
    });

    it('each need should have id, emoji, labelKey', () => {
      NEEDS_OPTIONS.forEach(need => {
        expect(need).toHaveProperty('id');
        expect(need).toHaveProperty('emoji');
        expect(need).toHaveProperty('labelKey');
        expect(need.labelKey).toMatch(/^onboarding\.needs\./);
      });
    });
  });

  describe('getSmartDefaults', () => {
    const freePalettes = ['terre', 'softLaser'];

    it('should return default values when no needs selected', () => {
      const result = getSmartDefaults([], freePalettes);
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('palette');
      expect(result).toHaveProperty('colorIndex');
      expect(result.duration).toBe(15);
    });

    it('should return meditation defaults for meditation need', () => {
      const result = getSmartDefaults(['meditation'], freePalettes);
      expect(result.duration).toBe(20);
    });

    it('should return work defaults for work need', () => {
      const result = getSmartDefaults(['work'], freePalettes);
      expect(result.duration).toBe(25);
    });

    it('should return creativity defaults for creativity need', () => {
      const result = getSmartDefaults(['creativity'], freePalettes);
      expect(result.duration).toBe(45);
    });

    it('should return time defaults for time need', () => {
      const result = getSmartDefaults(['time'], freePalettes);
      expect(result.duration).toBe(15);
    });

    it('should return neurodivergent defaults for neurodivergent need', () => {
      const result = getSmartDefaults(['neurodivergent'], freePalettes);
      expect(result.duration).toBe(25);
    });

    it('should prioritize first matching need', () => {
      // meditation comes first in the check order
      const result = getSmartDefaults(['work', 'meditation'], freePalettes);
      expect(result.duration).toBe(20); // meditation default
    });

    it('should handle empty freePalettes array', () => {
      const result = getSmartDefaults(['work'], []);
      expect(result.palette).toBe('terre'); // fallback
    });
  });

  describe('getJourneyScenarios', () => {
    const mockColors = {
      success: '#6B8E23',
      accent: '#FF6B6B',
      primary: '#8B7355',
      info: '#4ECDC4',
    };

    // Mock translation function that returns a mapped value
    const mockT = (key) => {
      const translations = {
        'onboarding.v2.filter4.morning': 'Matin',
        'onboarding.v2.filter4.day': 'Journée',
        'onboarding.v2.filter4.break': 'Pause',
        'onboarding.v2.filter4.evening': 'Soir',
        'onboarding.v2.filter4.morningMeditation': 'Méditation matinale',
        'onboarding.v2.filter4.morningNeuro': 'Réveil en douceur',
        'onboarding.v2.filter4.morningGentle': 'Démarrage progressif',
        'onboarding.v2.filter4.dayWork': 'Pomodoro focus',
        'onboarding.v2.filter4.dayNeuro': 'Blocs avec breaks',
        'onboarding.v2.filter4.dayFocus': 'Concentration profonde',
        'onboarding.v2.filter4.breakNeuro': 'Reset sensoriel',
        'onboarding.v2.filter4.breakRelax': 'Pause détente',
        'onboarding.v2.filter4.eveningCreative': 'Création libre',
        'onboarding.v2.filter4.eveningMeditation': 'Retour au calme',
        'onboarding.v2.filter4.eveningRelax': 'Transition douce',
      };
      return translations[key] || key;
    };

    it('should return exactly 4 scenarios', () => {
      const scenarios = getJourneyScenarios([], mockColors, mockT);
      expect(scenarios).toHaveLength(4);
    });

    it('each scenario should have emoji, label, sublabel, color', () => {
      const scenarios = getJourneyScenarios([], mockColors, mockT);
      scenarios.forEach(scenario => {
        expect(scenario).toHaveProperty('emoji');
        expect(scenario).toHaveProperty('label');
        expect(scenario).toHaveProperty('sublabel');
        expect(scenario).toHaveProperty('color');
      });
    });

    it('should include Matin, Journée, Pause, Soir labels', () => {
      const scenarios = getJourneyScenarios([], mockColors, mockT);
      const labels = scenarios.map(s => s.label);
      expect(labels).toContain('Matin');
      expect(labels).toContain('Journée');
      expect(labels).toContain('Pause');
      expect(labels).toContain('Soir');
    });

    it('should customize sublabels for meditation need', () => {
      const scenarios = getJourneyScenarios(['meditation'], mockColors, mockT);
      const matin = scenarios.find(s => s.label === 'Matin');
      expect(matin.sublabel).toContain('Méditation');
    });

    it('should customize sublabels for work need', () => {
      const scenarios = getJourneyScenarios(['work'], mockColors, mockT);
      const journee = scenarios.find(s => s.label === 'Journée');
      expect(journee.sublabel).toContain('Pomodoro');
    });

    it('should customize sublabels for neurodivergent need', () => {
      const scenarios = getJourneyScenarios(['neurodivergent'], mockColors, mockT);
      const pause = scenarios.find(s => s.label === 'Pause');
      expect(pause.sublabel).toContain('Reset sensoriel');
    });

    it('should use fallback colors when colors is undefined', () => {
      const scenarios = getJourneyScenarios([], undefined, mockT);
      scenarios.forEach(scenario => {
        expect(scenario.color).toBeTruthy();
        expect(scenario.color).toMatch(/^#/);
      });
    });
  });

  describe('DURATION_OPTIONS', () => {
    it('should contain expected duration values', () => {
      expect(DURATION_OPTIONS).toContain(5);
      expect(DURATION_OPTIONS).toContain(15);
      expect(DURATION_OPTIONS).toContain(25);
      expect(DURATION_OPTIONS).toContain(60);
    });

    it('should be sorted in ascending order', () => {
      const sorted = [...DURATION_OPTIONS].sort((a, b) => a - b);
      expect(DURATION_OPTIONS).toEqual(sorted);
    });
  });

  describe('STEP_NAMES', () => {
    it('should have exactly 6 step names', () => {
      expect(STEP_NAMES).toHaveLength(6);
    });

    it('should contain all filter names in order', () => {
      expect(STEP_NAMES).toEqual([
        'opening',
        'needs',
        'creation',
        'test',
        'vision',
        'paywall',
      ]);
    });
  });
});
