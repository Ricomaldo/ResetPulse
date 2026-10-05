import React from 'react';
import { create, act } from 'react-test-renderer';
import DurationPickerContent, { clampDuration } from '../../src/components/modals/DurationPickerContent';

const mockSetCurrentDuration = jest.fn();
let mockCurrentDuration = 0;

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = (props) => React.createElement('Picker', props, props.children);
  Picker.Item = (props) => React.createElement('PickerItem', props);
  return { __esModule: true, Picker };
});
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { brand: { primary: '#000' }, text: '#111' } }),
}));
jest.mock('../../src/hooks/useTranslation', () => ({ useTranslation: () => (k) => k }));
jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    timer: { currentDuration: mockCurrentDuration },
    setCurrentDuration: mockSetCurrentDuration,
  }),
}));

const mount = (onClose = jest.fn()) => {
  let r;
  act(() => {
    r = create(<DurationPickerContent onClose={onClose} />);
  });
  return { r, onClose };
};
const wheel = (r, id) => r.root.findByProps({ testID: `duration-picker.${id}` });
const pick = (r, id, v) => act(() => wheel(r, id).props.onValueChange(v));
const pressOk = (r) => act(() => r.root.findByProps({ testID: 'duration-picker.ok' }).props.onPress());

describe('DurationPickerContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentDuration = 0;
  });

  it('rend deux roues minutes / secondes, 15:00 par défaut si durée 0', () => {
    const { r } = mount();
    expect(wheel(r, 'minutes').props.selectedValue).toBe(15);
    expect(wheel(r, 'seconds').props.selectedValue).toBe(0);
  });

  it('part de la durée courante (60:00 → 60 min 0 s, 20:30 → 20 min 30 s)', () => {
    mockCurrentDuration = 3600;
    expect(wheel(mount().r, 'minutes').props.selectedValue).toBe(60);
    mockCurrentDuration = 1230;
    const { r } = mount();
    expect(wheel(r, 'minutes').props.selectedValue).toBe(20);
    expect(wheel(r, 'seconds').props.selectedValue).toBe(30);
  });

  it('OK enregistre minutes et secondes et ferme', () => {
    const { r, onClose } = mount();
    pick(r, 'minutes', 25);
    pick(r, 'seconds', 40);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1540);
    expect(onClose).toHaveBeenCalled();
  });

  it('60 min force les secondes à 0 (plafond 60:00)', () => {
    const { r } = mount();
    pick(r, 'seconds', 30);
    pick(r, 'minutes', 60);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(3600);
  });

  it('0:00 est relevé à 0:01', () => {
    const { r } = mount();
    pick(r, 'minutes', 0);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1);
  });

  it('clampDuration borne à 1..3600', () => {
    expect(clampDuration(0)).toBe(1);
    expect(clampDuration(5000)).toBe(3600);
    expect(clampDuration(90)).toBe(90);
  });
});
