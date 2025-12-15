/**
 * @fileoverview TimerDial component tests
 * Tests for visual timer dial display
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerDial from '../../src/components/timer/TimerDial';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF' },
      textSecondary: '#8E8E93',
      text: '#000000',
    },
    spacing: { sm: 4, md: 12, lg: 16 },
    shadow: () => ({}),
  }),
}));

// Mock useDialOrientation hook
jest.mock('../../src/hooks/useDialOrientation', () => ({
  useDialOrientation: () => ({
    getGraduationMarks: () => [],
    getNumberPositions: () => [],
    getAngleForMinutes: () => 0,
    calculateTapPosition: () => ({ minutes: 0, isValid: true }),
  }),
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

// Mock timer constants
jest.mock('../../src/components/timer/timerConstants', () => ({
  TIMER_SVG: {
    PADDING: 40,
    STROKE_WIDTH: 16,
  },
  TIMER_PROPORTIONS: {
    NUMBER_RADIUS: 25,
  },
  TIMER_VISUAL: {
    TICK_WIDTH_MAJOR: 2,
    TICK_WIDTH_MINOR: 1,
    TICK_OPACITY_MAJOR: 0.8,
    TICK_OPACITY_MINOR: 0.4,
  },
  COLORS: {},
  DIAL_INTERACTION: {},
  getDialMode: () => '60min',
  DRAG: {},
  VISUAL: {},
}));

// Mock dial components
jest.mock('../../src/components/timer/dial/DialBase', () => 'DialBase');
jest.mock('../../src/components/timer/dial/DialProgress', () => 'DialProgress');
jest.mock('../../src/components/timer/dial/DialCenter', () => 'DialCenter');

describe('TimerDial', () => {
  const defaultProps = {
    progress: 1,
    duration: 1500, // 25 minutes in seconds
    color: '#007AFF',
    clockwise: false,
    scaleMode: '60min',
    isRunning: false,
    isCompleted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render Svg component', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} />);
    });

    const instance = component.root;
    const svgs = instance.findAllByType('Svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render DialBase component', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} />);
    });

    const instance = component.root;
    const dialBase = instance.findAllByType('DialBase');
    expect(dialBase.length).toBe(1);
  });

  it('should render DialProgress component', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} />);
    });

    const instance = component.root;
    const dialProgress = instance.findAllByType('DialProgress');
    expect(dialProgress.length).toBe(1);
  });

  it('should render DialCenter component', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} />);
    });

    const instance = component.root;
    const dialCenter = instance.findAllByType('DialCenter');
    expect(dialCenter.length).toBe(1);
  });

  it('should pass progress prop to DialProgress', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} progress={0.5} />);
    });

    const instance = component.root;
    const dialProgress = instance.findByType('DialProgress');
    expect(dialProgress.props.progress).toBe(0.5);
  });

  it('should pass color prop to DialProgress', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} color="#FF0000" />);
    });

    const instance = component.root;
    const dialProgress = instance.findByType('DialProgress');
    expect(dialProgress.props.color).toBe('#FF0000');
  });

  it('should handle clockwise rotation', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} clockwise={true} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle counter-clockwise rotation', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} clockwise={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle isRunning state', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} isRunning={true} />);
    });

    const instance = component.root;
    const dialCenter = instance.findByType('DialCenter');
    expect(dialCenter.props.isRunning).toBe(true);
  });

  it('should handle isCompleted state', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} isCompleted={true} />);
    });

    const instance = component.root;
    const dialCenter = instance.findByType('DialCenter');
    expect(dialCenter.props.isCompleted).toBe(true);
  });

  it('should accept custom size prop', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} size={320} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle activity emoji display', () => {
    let component;
    act(() => {
      component = create(
        <TimerDial
          {...defaultProps}
          activityEmoji="💻"
          showActivityEmoji={true}
        />
      );
    });

    const instance = component.root;
    const dialCenter = instance.findByType('DialCenter');
    expect(dialCenter.props.activityEmoji).toBe('💻');
  });

  it('should hide activity emoji when showActivityEmoji is false', () => {
    let component;
    act(() => {
      component = create(
        <TimerDial
          {...defaultProps}
          activityEmoji="💻"
          showActivityEmoji={false}
        />
      );
    });

    const instance = component.root;
    const dialCenter = instance.findByType('DialCenter');
    expect(dialCenter.props.showActivityEmoji).toBe(false);
  });

  it('should accept onGraduationTap callback', () => {
    const mockCallback = jest.fn();
    let component;

    act(() => {
      component = create(
        <TimerDial {...defaultProps} onGraduationTap={mockCallback} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should accept onDialTap callback', () => {
    const mockCallback = jest.fn();
    let component;

    act(() => {
      component = create(
        <TimerDial {...defaultProps} onDialTap={mockCallback} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle shouldPulse prop', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} shouldPulse={false} />);
    });

    const instance = component.root;
    const dialCenter = instance.findByType('DialCenter');
    expect(dialCenter.props.shouldPulse).toBe(false);
  });

  it('should handle showNumbers prop', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} showNumbers={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle showGraduations prop', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} showGraduations={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle different scale modes', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} scaleMode="30min" />);
    });

    expect(component.toJSON()).toBeTruthy();

    act(() => {
      component.update(<TimerDial {...defaultProps} scaleMode="120min" />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should update when progress changes', () => {
    let component;
    act(() => {
      component = create(<TimerDial {...defaultProps} progress={1} />);
    });

    let instance = component.root;
    let dialProgress = instance.findByType('DialProgress');
    expect(dialProgress.props.progress).toBe(1);

    // Update progress
    act(() => {
      component.update(<TimerDial {...defaultProps} progress={0.5} />);
    });

    instance = component.root;
    dialProgress = instance.findByType('DialProgress');
    expect(dialProgress.props.progress).toBe(0.5);
  });
});
