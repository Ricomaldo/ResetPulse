/**
 * @fileoverview DurationPickerContent — roue iOS native de durée (T3-2)
 * Ouverte au tap sur le compteur au repos : `DateTimePicker` en mode
 * countdown, bornée à 1..60 min, validée par « OK ».
 * Fuseau forcé en UTC : la durée = heures/minutes UTC du timestamp, pour ne
 * pas dépendre du décalage local.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimerConfig } from '../../contexts/TimerConfigContext';

const MAX_SECONDS = 3600;
const DEFAULT_SECONDS = 15 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

const secondsToDate = (seconds) => new Date(seconds * 1000);
const dateToSeconds = (date) => {
  const ms = ((date.getTime() % DAY_MS) + DAY_MS) % DAY_MS;
  return Math.floor(ms / 60000) * 60;
};

export default function DurationPickerContent({ onClose }) {
  const theme = useTheme();
  const t = useTranslation();
  const { timer: { currentDuration }, setCurrentDuration } = useTimerConfig();
  const initial = currentDuration > 0 ? Math.min(currentDuration, MAX_SECONDS) : DEFAULT_SECONDS;
  const [seconds, setSeconds] = useState(initial);

  const handleChange = useCallback((_event, date) => {
    if (!date) {return;}
    const picked = dateToSeconds(date);
    if (picked <= 0) {return;} // 0 ignoré : la roue garde la dernière valeur valide
    setSeconds(Math.min(picked, MAX_SECONDS));
  }, []);

  const handleOk = useCallback(() => {
    setCurrentDuration(seconds);
    onClose?.();
  }, [seconds, setCurrentDuration, onClose]);

  return (
    <View style={styles.container} testID="duration-picker">
      <DateTimePicker
        value={secondsToDate(seconds)}
        mode="countdown"
        display="spinner"
        minuteInterval={1}
        timeZoneName="UTC"
        onChange={handleChange}
      />
      <TouchableOpacity
        style={[styles.ok, { backgroundColor: theme.colors.brand?.primary }]}
        onPress={handleOk}
        accessibilityRole="button"
        testID="duration-picker.ok"
      >
        <Text style={styles.okText}>{t('common.ok')}</Text>
      </TouchableOpacity>
    </View>
  );
}

DurationPickerContent.propTypes = {
  onClose: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  ok: {
    alignItems: 'center',
    borderRadius: 24,
    marginTop: 8,
    minWidth: 160,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  okText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
