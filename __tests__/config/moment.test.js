// __tests__/config/moment.test.js
/**
 * @fileoverview moment.js — helper pur, transitions SALE/VIERGE.
 * Cf. src/config/moment.js pour le vocabulaire (Lambda R2, Q3b).
 */
import {
  MOMENT_VIERGE,
  MOMENT_SALE,
  MOMENT_EVENTS,
  nextMomentState,
  isMomentDirty,
} from '../../src/config/moment';

describe('moment — nextMomentState (pur)', () => {
  it('DURATION_COMMIT_REST salit un Moment vierge', () => {
    expect(nextMomentState(MOMENT_VIERGE, MOMENT_EVENTS.DURATION_COMMIT_REST)).toBe(MOMENT_SALE);
  });

  it('COLOR_SELECT salit un Moment vierge', () => {
    expect(nextMomentState(MOMENT_VIERGE, MOMENT_EVENTS.COLOR_SELECT)).toBe(MOMENT_SALE);
  });

  it('un Moment déjà sale reste sale sur un nouvel événement salissant', () => {
    expect(nextMomentState(MOMENT_SALE, MOMENT_EVENTS.COLOR_SELECT)).toBe(MOMENT_SALE);
  });

  it.each([
    MOMENT_EVENTS.RITUAL_APPLIED,
    MOMENT_EVENTS.STOP_REMBOBINAGE,
    MOMENT_EVENTS.COMPLETION,
    MOMENT_EVENTS.RESET,
  ])('%s remet un Moment sale à vierge', (event) => {
    expect(nextMomentState(MOMENT_SALE, event)).toBe(MOMENT_VIERGE);
  });

  it('les événements de nettoyage sur un Moment déjà vierge le laissent vierge', () => {
    expect(nextMomentState(MOMENT_VIERGE, MOMENT_EVENTS.RITUAL_APPLIED)).toBe(MOMENT_VIERGE);
  });

  it('un événement inconnu ne change rien (repli permissif)', () => {
    expect(nextMomentState(MOMENT_SALE, 'start-timer')).toBe(MOMENT_SALE);
    expect(nextMomentState(MOMENT_VIERGE, 'start-timer')).toBe(MOMENT_VIERGE);
  });

  it('une séquence réaliste : réglage main → rituel complet → réglage main → rembobinage', () => {
    let state = MOMENT_VIERGE;
    state = nextMomentState(state, MOMENT_EVENTS.DURATION_COMMIT_REST);
    expect(isMomentDirty(state)).toBe(true);
    state = nextMomentState(state, MOMENT_EVENTS.RITUAL_APPLIED);
    expect(isMomentDirty(state)).toBe(false);
    state = nextMomentState(state, MOMENT_EVENTS.COLOR_SELECT);
    expect(isMomentDirty(state)).toBe(true);
    state = nextMomentState(state, MOMENT_EVENTS.STOP_REMBOBINAGE);
    expect(isMomentDirty(state)).toBe(false);
  });
});

describe('moment — isMomentDirty (pur)', () => {
  it('vrai seulement pour MOMENT_SALE', () => {
    expect(isMomentDirty(MOMENT_SALE)).toBe(true);
    expect(isMomentDirty(MOMENT_VIERGE)).toBe(false);
  });
});
