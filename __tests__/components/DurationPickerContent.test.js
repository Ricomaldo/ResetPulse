import React from 'react';
import { create, act } from 'react-test-renderer';
import DurationPickerContent from '../../src/components/modals/DurationPickerContent';

const mockSetCurrentDuration = jest.fn();
let mockCurrentDuration = 0;

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return { __esModule: true, default: (props) => React.createElement('DateTimePicker', props) };
});
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { brand: { primary: '#000' } } }),
}));
jest.mock('../../src/hooks/useTranslation', () => ({ useTranslation: () => (k) => k }));
jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    timer: { currentDuration: mockCurrentDuration },
    setCurrentDuration: mockSetCurrentDuration,
  }),
}));

const MIN = 60000;
const mount = (onClose = jest.fn()) => {
  let r;
  act(() => {
    r = create(<DurationPickerContent onClose={onClose} />);
  });
  return { r, onClose };
};
const picker = (r) => r.root.findByType('DateTimePicker');
const change = (r, ms) => act(() => picker(r).props.onChange({}, new Date(ms)));
const pressOk = (r) => act(() => r.root.findByProps({ testID: 'duration-picker.ok' }).props.onPress());

describe('DurationPickerContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentDuration = 0;
  });

  it('rend la roue countdown, 15 min par défaut si durée 0', () => {
    const { r } = mount();
    expect(picker(r).props.mode).toBe('countdown');
    expect(picker(r).props.display).toBe('spinner');
    expect(picker(r).props.value.getTime()).toBe(15 * MIN);
  });

  it('part de la durée courante', () => {
    mockCurrentDuration = 1200;
    const { r } = mount();
    expect(picker(r).props.value.getTime()).toBe(20 * MIN);
  });

  it('OK enregistre la valeur choisie et ferme', () => {
    const { r, onClose } = mount();
    change(r, 25 * MIN);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(1500);
    expect(onClose).toHaveBeenCalled();
  });

  it('borne à 3600 s au-delà de 60 min', () => {
    const { r } = mount();
    change(r, 90 * MIN);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(3600);
  });

  it('ignore 0 : garde la dernière valeur valide', () => {
    const { r } = mount();
    change(r, 0);
    pressOk(r);
    expect(mockSetCurrentDuration).toHaveBeenCalledWith(900);
  });
});
