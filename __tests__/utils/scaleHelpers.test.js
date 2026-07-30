// __tests__/utils/scaleHelpers.test.js
// hotfix-porte-1 B2 : deriveScaleMode est la fonction pure qui remplace le
// scaleMode persisté/déprécié '25min' — seul item du lot qui mérite un test
// (mission hotfix-porte-1.md).
import {
  deriveScaleMode,
  getOptimalScale,
  scaleToMode,
  modeToScale,
  isSupportedScale,
  SCALE_STEPS,
  getNextScaleUp,
  shouldEscalateOnRelease,
} from '../../src/utils/scaleHelpers';
import { DIAL_MODES } from '../../src/components/dial/timerConstants';

describe('scaleHelpers — deriveScaleMode (hotfix-porte-1 B2)', () => {
  test('duration -> scaleMode : plus petite échelle dont maxMinutes >= durée', () => {
    expect(deriveScaleMode(1 * 60)).toBe('5min');     // 1min
    expect(deriveScaleMode(5 * 60)).toBe('5min');      // borne exacte 5min
    expect(deriveScaleMode(6 * 60)).toBe('15min');
    expect(deriveScaleMode(15 * 60)).toBe('15min');    // borne exacte 15min
    expect(deriveScaleMode(20 * 60)).toBe('30min');    // ex-défaut dev (meditation)
    expect(deriveScaleMode(25 * 60)).toBe('30min');    // ex-défaut prod '25min' déprécié
    expect(deriveScaleMode(30 * 60)).toBe('30min');    // borne exacte 30min
    expect(deriveScaleMode(31 * 60)).toBe('45min');
    expect(deriveScaleMode(45 * 60)).toBe('45min');    // borne exacte 45min
    expect(deriveScaleMode(50 * 60)).toBe('60min');    // rituel "Deep Work" (audit)
    expect(deriveScaleMode(60 * 60)).toBe('60min');    // borne exacte 60min
  });

  test('durée nulle ou absente ne crashe pas — retombe sur la plus petite échelle', () => {
    expect(deriveScaleMode(0)).toBe('5min');
    expect(deriveScaleMode(undefined)).toBe('5min');
    expect(deriveScaleMode(null)).toBe('5min');
  });

  test('toute valeur retournée est une échelle valide de DIAL_MODES (migration douce)', () => {
    const durations = [0, 30, 60, 300, 900, 1200, 1500, 1800, 2700, 3000, 3600, 7200];
    durations.forEach((seconds) => {
      const mode = deriveScaleMode(seconds);
      expect(DIAL_MODES[mode]).toBeDefined();
      expect(isSupportedScale(mode)).toBe(true);
    });
  });

  test("l'échelle dépréciée '25min' n'est plus jamais produite", () => {
    // Tout l'intervalle qui utilisait autrefois '25min' (repli 30min) doit
    // désormais retomber proprement sur '30min', jamais sur une clé absente
    // de DIAL_MODES.
    for (let minutes = 16; minutes <= 30; minutes += 1) {
      expect(deriveScaleMode(minutes * 60)).toBe('30min');
    }
  });

  test('deriveScaleMode compose getOptimalScale + scaleToMode', () => {
    expect(deriveScaleMode(42 * 60)).toBe(scaleToMode(getOptimalScale(42)));
  });
});

describe('scaleHelpers — helpers existants (non testés jusqu\'ici)', () => {
  test('getOptimalScale couvre les 5 paliers actifs', () => {
    expect(getOptimalScale(3)).toBe(5);
    expect(getOptimalScale(12)).toBe(15);
    expect(getOptimalScale(25)).toBe(30);
    expect(getOptimalScale(42)).toBe(45);
    expect(getOptimalScale(58)).toBe(60);
    expect(getOptimalScale(60)).toBe(60);   // borne exacte 60
    expect(getOptimalScale(90)).toBe(120);  // porte-2 : échelle 2h
    expect(getOptimalScale(120)).toBe(120); // borne exacte 120
  });

  test('scaleToMode / modeToScale sont symétriques sur les 5 échelles actives', () => {
    [5, 15, 30, 45, 60].forEach((scale) => {
      expect(modeToScale(scaleToMode(scale))).toBe(scale);
    });
  });
});

// ============================================================
// PROTO drag-échelle (branche proto-drag-echelle) — logique scaleFloor
// ============================================================

describe('proto drag-échelle — SCALE_STEPS et voisinage', () => {
  test('SCALE_STEPS est le miroir ordonné des 6 échelles de DIAL_MODES', () => {
    expect(SCALE_STEPS).toEqual([5, 15, 30, 45, 60, 120]);
    SCALE_STEPS.forEach((scale) => {
      expect(DIAL_MODES[scaleToMode(scale)]).toBeDefined();
    });
  });

  test('getNextScaleUp : cran supérieur, null au plafond ou pour une échelle inconnue', () => {
    expect(getNextScaleUp(5)).toBe(15);
    expect(getNextScaleUp(15)).toBe(30);
    expect(getNextScaleUp(30)).toBe(45);
    expect(getNextScaleUp(45)).toBe(60);
    expect(getNextScaleUp(60)).toBe(120);
    expect(getNextScaleUp(120)).toBeNull();
    expect(getNextScaleUp(25)).toBeNull(); // échelle dépréciée : jamais un cran
  });

});

describe('drag-échelle « Relâcher » — shouldEscalateOnRelease (porte-3 V3)', () => {
  test('escalade au max exact de l’échelle du geste', () => {
    expect(shouldEscalateOnRelease(30 * 60, 30)).toBe(true);
    expect(shouldEscalateOnRelease(5 * 60, 5)).toBe(true);
    expect(shouldEscalateOnRelease(45 * 60, 45)).toBe(true);
    expect(shouldEscalateOnRelease(60 * 60, 60)).toBe(true); // 60 → 120 existe
  });

  test('pas d’escalade sous le max', () => {
    expect(shouldEscalateOnRelease(30 * 60 - 1, 30)).toBe(false);
    expect(shouldEscalateOnRelease(0, 5)).toBe(false);
  });

  test('pas d’escalade à 120 : pas de cran au-dessus', () => {
    expect(shouldEscalateOnRelease(120 * 60, 120)).toBe(false);
  });
});
