import * as sketch from '../../src/config/enow-sketch';

describe('enow-sketch flags', () => {
  it.each([
    ['ENOW_FILL_UP', 'boolean'],
    ['ENOW_START_EMPTY', 'boolean'],
    ['ENOW_TAP_PAUSE', 'boolean'],
    ['ENOW_FINE_DRAG', 'boolean'],
    ['ENOW_SESSION_DIAL', 'boolean'],
    ['ENOW_HANDLE', 'boolean'],
    ['ENOW_GRADUATIONS', 'boolean'],
    ['ENOW_HUB_GHOST_OPACITY', 'number'],
    ['ENOW_DEFAULT_DURATION', 'number'],
    ['ENOW_GHOST_OPACITY', 'number'],
    ['ENOW_SNAP_MIN_VELOCITY', 'number'],
  ])('%s est un %s', (name, type) => {
    expect(typeof sketch[name]).toBe(type);
  });

  it('les opacités sont dans [0, 1]', () => {
    expect(sketch.ENOW_HUB_GHOST_OPACITY).toBeGreaterThanOrEqual(0);
    expect(sketch.ENOW_HUB_GHOST_OPACITY).toBeLessThanOrEqual(1);
  });
});
