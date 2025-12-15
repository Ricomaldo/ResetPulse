/**
 * @fileoverview SettingsScreen component tests
 * Tests for settings screen with premium status and toggles
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import SettingsScreen from '../../src/screens/SettingsScreen';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF', secondary: '#0062CC' },
      text: '#000000',
      textSecondary: '#8E8E93',
      fixed: { white: '#FFFFFF' },
      border: '#E5E5EA',
      surfaceElevated: '#FFFFFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
    borderRadius: { lg: 12 },
  }),
}));

// Mock TimerOptionsContext
const mockTimerOptionsContext = {
  shouldPulse: true,
  setShouldPulse: jest.fn(),
  showDigitalTimer: true,
  setShowDigitalTimer: jest.fn(),
  clockwise: false,
  setClockwise: jest.fn(),
  useMinimalInterface: false,
  setUseMinimalInterface: jest.fn(),
};

jest.mock('../../src/contexts/TimerOptionsContext', () => ({
  useTimerOptions: () => mockTimerOptionsContext,
}));

// Mock PurchaseContext
const mockPurchaseContext = {
  restorePurchases: jest.fn(() =>
    Promise.resolve({ success: true, hasPremium: true })
  ),
};

jest.mock('../../src/contexts/PurchaseContext', () => ({
  usePurchases: () => mockPurchaseContext,
}));

// Mock premium status hook (free user by default)
const mockPremiumStatus = {
  isPremium: false,
};

jest.mock('../../src/hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => mockPremiumStatus,
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

// Mock PremiumModal
jest.mock('../../src/components/modals/PremiumModal', () => 'PremiumModal');

// Mock theme tokens
jest.mock('../../src/theme/tokens', () => ({
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPremiumStatus.isPremium = false;
    mockPurchaseContext.restorePurchases.mockResolvedValue({
      success: true,
      hasPremium: true,
    });
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render header with title', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const headerText = texts.find(t => t.props.children === 'Réglages');
    expect(headerText).toBeTruthy();
  });

  it('should render settings content', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    // Should have settings labels
    expect(texts.length).toBeGreaterThan(0);
  });

  it('should render premium section for free users', () => {
    mockPremiumStatus.isPremium = false;

    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const unlockText = texts.find(t =>
      t.props.children === 'Déverrouiller Premium'
    );
    expect(unlockText).toBeTruthy();
  });

  it('should render premium active badge for premium users', () => {
    mockPremiumStatus.isPremium = true;

    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const premiumText = texts.find(t => t.props.children === 'Premium Actif');
    expect(premiumText).toBeTruthy();

    const crownEmoji = texts.find(t => t.props.children === '👑');
    expect(crownEmoji).toBeTruthy();
  });

  it('should show unlock button for free users', () => {
    mockPremiumStatus.isPremium = false;

    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const unlockButtonText = texts.find(t =>
      t.props.children === 'Déverrouiller Premium'
    );
    expect(unlockButtonText).toBeTruthy();
  });

  it('should render premium modal component', () => {
    mockPremiumStatus.isPremium = false;

    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const premiumModal = instance.findByType('PremiumModal');

    // Modal should exist in component tree
    expect(premiumModal).toBeTruthy();
    expect(premiumModal.props.visible).toBe(false);
  });

  it('should render restore purchases button', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const restoreText = texts.find(t =>
      t.props.children === 'Restaurer mes achats'
    );
    expect(restoreText).toBeTruthy();
  });

  it('should have restore purchases functionality available', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    // Restore button text should exist
    const restoreText = texts.find(t =>
      t.props.children === 'Restaurer mes achats'
    );
    expect(restoreText).toBeTruthy();

    // restorePurchases function should be defined
    expect(mockPurchaseContext.restorePurchases).toBeDefined();
  });

  it('should render digital timer toggle setting', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const digitalTimerLabel = texts.find(t =>
      t.props.children === 'Chrono numérique'
    );
    expect(digitalTimerLabel).toBeTruthy();

    const digitalTimerDescription = texts.find(t =>
      t.props.children === 'Afficher le temps restant en chiffres'
    );
    expect(digitalTimerDescription).toBeTruthy();
  });

  it('should render pulse animation toggle switch', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const pulseLabel = texts.find(t =>
      t.props.children === 'Animation de pulsation'
    );
    expect(pulseLabel).toBeTruthy();
  });

  it('should render clockwise toggle switch', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const clockwiseLabel = texts.find(t =>
      t.props.children === 'Sens horaire'
    );
    expect(clockwiseLabel).toBeTruthy();
  });

  it('should render minimal interface toggle switch', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    const minimalLabel = texts.find(t =>
      t.props.children === 'Interface minimale'
    );
    expect(minimalLabel).toBeTruthy();
  });

  it('should render PremiumModal component', () => {
    let component;
    act(() => {
      component = create(<SettingsScreen />);
    });

    const instance = component.root;
    const premiumModal = instance.findAllByType('PremiumModal');
    expect(premiumModal.length).toBe(1);
  });
});
