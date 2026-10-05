import React from 'react';
import { create, act } from 'react-test-renderer';
import RippleLayer from '../../src/components/dial/dial/RippleLayer';
import useRippleHalo from '../../src/components/dial/movements/useRippleHalo';

let mockDisplay;
jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({ display: mockDisplay }),
}));

const props = { active: true, size: 200, color: '#97DFC6', surfaceColor: '#fff', centerX: 150, centerY: 150 };
const render = (el) => {
  let r;
  act(() => {
    r = create(el);
  });
  return r;
};

describe('RippleLayer', () => {
  beforeEach(() => {
    mockDisplay = { shouldPulse: true, haloRipple: true, haloPeriodSec: 4 };
  });

  it('rend deux disques quand tout est réuni', () => {
    const tree = render(<RippleLayer {...props} />);
    expect(tree.toJSON()).not.toBeNull();
    expect(tree.root.findAllByProps({ testID: undefined }).length).toBeGreaterThan(0);
  });

  it.each([
    ['haloRipple off', { haloRipple: false }, {}],
    ['shouldPulse off', { shouldPulse: false }, {}],
    ['séance inactive', {}, { active: false }],
  ])('rend null : %s', (_n, display, p) => {
    mockDisplay = { ...mockDisplay, ...display };
    expect(render(<RippleLayer {...props} {...p} />).toJSON()).toBeNull();
  });
});

describe('useRippleHalo', () => {
  it('renvoie deux styles', () => {
    let out;
    const C = () => {
      out = useRippleHalo({ active: false, period: 1000 });
      return null;
    };
    render(<C />);
    expect(out).toHaveProperty('styleA');
    expect(out).toHaveProperty('styleB');
  });
});
