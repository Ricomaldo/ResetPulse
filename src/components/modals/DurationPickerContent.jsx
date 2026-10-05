/**
 * @fileoverview DurationPickerContent — roue iOS native de durée (T3-2)
 * Ouverte au tap sur le compteur au repos : deux colonnes natives
 * (`@react-native-picker/picker`), minutes 0..60 et secondes 0..59, bornées
 * à 0:01..60:00, validées par « OK ».
 * En séance (`initialSeconds` + `onConfirm`), la roue part du temps restant
 * et OK délègue à l'appelant au lieu de poser la durée.
 * Remplace le mode countdown de DateTimePicker (heures/minutes seulement, et
 * lu dans le fuseau local : 60 min s'affichaient « 22 hours »).
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimerConfig } from '../../contexts/TimerConfigContext';

const MAX_SECONDS = 3600;
const DEFAULT_SECONDS = 15 * 60;
const MINUTES = Array.from({ length: 61 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

// Plafond 60:00, plancher 0:01 (0:00 ne lance rien).
export const clampDuration = (seconds) => Math.max(1, Math.min(seconds, MAX_SECONDS));

export default function DurationPickerContent({ onClose, initialSeconds = null, onConfirm = null }) {
  const theme = useTheme();
  const t = useTranslation();
  const { timer: { currentDuration }, setCurrentDuration } = useTimerConfig();
  const base = initialSeconds != null ? initialSeconds : currentDuration;
  const initial = base > 0
    ? Math.min(base, MAX_SECONDS)
    : DEFAULT_SECONDS;
  const [minutes, setMinutes] = useState(Math.floor(initial / 60));
  const [seconds, setSeconds] = useState(initial % 60);

  const handleOk = useCallback(() => {
    const picked = clampDuration(minutes * 60 + seconds);
    if (onConfirm) {
      onConfirm(picked);
    } else {
      setCurrentDuration(picked);
    }
    onClose?.();
  }, [minutes, seconds, setCurrentDuration, onClose, onConfirm]);

  const itemStyle = { color: theme.colors.text, fontSize: 22 };

  return (
    <View style={styles.container} testID="duration-picker">
      <View style={styles.wheels}>
        <Picker
          style={styles.wheel}
          itemStyle={itemStyle}
          selectedValue={minutes}
          onValueChange={(m) => {
            setMinutes(m);
            if (m === 60) {setSeconds(0);}
          }}
          testID="duration-picker.minutes"
        >
          {MINUTES.map((m) => <Picker.Item key={m} label={`${m} min`} value={m} />)}
        </Picker>
        <Picker
          style={styles.wheel}
          itemStyle={itemStyle}
          selectedValue={minutes === 60 ? 0 : seconds}
          onValueChange={(s) => setSeconds(minutes === 60 ? 0 : s)}
          testID="duration-picker.seconds"
        >
          {SECONDS.map((s) => <Picker.Item key={s} label={`${s} s`} value={s} />)}
        </Picker>
      </View>
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
  initialSeconds: PropTypes.number,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
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
  wheel: {
    flex: 1,
  },
  wheels: {
    flexDirection: 'row',
    width: '100%',
  },
});
