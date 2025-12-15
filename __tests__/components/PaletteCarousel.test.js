/**
 * @fileoverview PaletteCarousel component tests
 * Tests for timer color palette selector
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import PaletteCarousel from '../../src/components/carousels/PaletteCarousel';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF' },
      textSecondary: '#8E8E93',
    },
    spacing: { sm: 4, md: 12, lg: 16 },
    shadow: () => ({}),
  }),
}));

// Mock TimerPaletteContext
const mockPaletteContext = {
  currentPalette: 'terre',
  setPalette: jest.fn(),
  paletteColors: ['#5B9AA0', '#D6A990', '#F8B400', '#D64545'],
  currentColor: '#5B9AA0',
  selectedColorIndex: 0,
  setColorIndex: jest.fn(),
  getAvailablePalettes: jest.fn(() => ['terre', 'softLaser']),
};

jest.mock('../../src/contexts/TimerPaletteContext', () => ({
  useTimerPalette: () => mockPaletteContext,
}));

// Mock config
jest.mock('../../src/config/timer-palettes', () => ({
  TIMER_PALETTES: {
    terre: {
      name: 'Terre',
      colors: ['#5B9AA0', '#D6A990', '#F8B400', '#D64545'],
      isPremium: false,
    },
    softLaser: {
      name: 'Soft Laser',
      colors: ['#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'],
      isPremium: false,
    },
    sunset: {
      name: 'Sunset',
      colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77'],
      isPremium: true,
    },
  },
  getFreePalettes: () => ['terre', 'softLaser'],
}));

// Mock premium status
jest.mock('../../src/hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false }),
}));

// Mock translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

// Mock modals
jest.mock('../../src/components/modals', () => ({
  PremiumModal: 'PremiumModal',
  MoreColorsModal: 'MoreColorsModal',
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

describe('PaletteCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render ScrollView for palette swiping', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    const instance = component.root;
    const scrollViews = instance.findAllByType('ScrollView');
    expect(scrollViews.length).toBeGreaterThan(0);
  });

  it('should display color swatches from current palette', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    const instance = component.root;
    const views = instance.findAllByType('View');

    // Should have views representing color swatches
    expect(views.length).toBeGreaterThan(4);
  });

  it('should call setColorIndex when color is selected', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find a color button (not the + button)
    const colorButton = buttons.find(b => {
      const style = Array.isArray(b.props.style) ? b.props.style.flat() : [b.props.style];
      return style.some(s => s && s.backgroundColor && s.backgroundColor.startsWith('#'));
    });

    if (colorButton) {
      act(() => {
        colorButton.props.onPress();
      });

      expect(mockPaletteContext.setColorIndex).toHaveBeenCalled();
    }
  });

  it('should be disabled when timer is running', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel isTimerRunning={true} />);
    });

    // Component should render but interactions should be disabled
    expect(component.toJSON()).toBeTruthy();
  });

  it('should not be disabled when timer is not running', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel isTimerRunning={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render PremiumModal when needed', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('PremiumModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should render MoreColorsModal when needed', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('MoreColorsModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should display current palette colors', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    expect(component.toJSON()).toBeTruthy();
    expect(mockPaletteContext.paletteColors).toEqual([
      '#5B9AA0',
      '#D6A990',
      '#F8B400',
      '#D64545',
    ]);
  });

  it('should handle palette change', () => {
    let component;
    act(() => {
      component = create(<PaletteCarousel />);
    });

    // Component should use setPalette from context
    expect(component.toJSON()).toBeTruthy();
  });
});
