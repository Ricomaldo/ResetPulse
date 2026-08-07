/**
 * @fileoverview SheetSettingsPanel — sous-écran « Réglages » du sheet
 * (recomposition sheet-racine, maquette CD validée 04/08, codé pilote sur
 * autorisation Eric).
 * @description Absorbe ce qui encombrait la racine : le segmenté Sens de
 * rotation (P1-6), le VERROU D'ÉCHELLE (nouveau — retour Eric item 6 :
 * « bloquer l'échelle à une heure » ; Switch + ligne d'explication, un
 * toggle seul ne dirait pas ce qui se passe), et les 3 toggles (écran
 * allumé, temps, halo). Même pattern back/‹ que PalettesPanel/SoundsPanel.
 * La racine ne garde que : Mode, 4 rangées, guichet — sans scroll.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

export default function SheetSettingsPanel({ onBack }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { clockwise, scaleMode },
    setClockwise,
    display: { shouldPulse, showTime, lockedScale },
    setShouldPulse,
    setShowTime,
    setLockedScale,
    system: { keepAwakeEnabled },
    setKeepAwakeEnabled,
  } = useTimerConfig();

  const ROTATION_OPTIONS = [
    { key: 'counterclockwise', value: false, label: t('aside.rotation.counterclockwise') },
    { key: 'clockwise', value: true, label: t('aside.rotation.clockwise') },
  ];

  const toggles = [
    { key: 'keepAwake', label: t('accessibility.keepAwake'), value: keepAwakeEnabled, onChange: setKeepAwakeEnabled },
    { key: 'showTime', label: t('accessibility.showTime'), value: showTime, onChange: setShowTime },
    { key: 'shouldPulse', label: t('settings.options.pulseAnimation'), value: shouldPulse, onChange: setShouldPulse },
  ];

  const styles = StyleSheet.create({
    // Zone de tap alignée sur le reste du repo (PalettesPanel/SoundsPanel/
    // RitualsPanel…) : minHeight/minWidth 44 (HIG) — le seul absent ici
    // causait un chevron quasi-inratable en visuel mais ~22×32pt réel
    // (retour device Eric 05/08 : le ‹ ne répondait pas au tap).
    backButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: theme.spacing.sm,
    },
    backChevron: {
      color: theme.colors.text,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.semibold,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    optionLabel: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(15, 'min'),
    },
    optionRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border + '30',
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    rotationLabel: {
      color: theme.colors.text,
      fontSize: rs(15, 'min'),
      marginBottom: theme.spacing.xs,
    },
    // Ligne d'explication du verrou (maquette CD : « un toggle seul ne le
    // dirait pas ») — petite, textSecondary, sous la rangée du Switch.
    scaleLockHint: {
      color: theme.colors.textSecondary,
      fontSize: rs(12.5, 'min'),
      lineHeight: rs(17, 'min'),
      marginBottom: theme.spacing.sm,
      marginTop: -theme.spacing.xs,
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      flex: 1,
      paddingVertical: theme.spacing.sm,
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.text,
    },
    segmentText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.medium,
    },
    segmentTextActive: {
      color: theme.colors.background,
      fontWeight: fontWeights.semibold,
    },
    segmentedControl: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border + '30',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      padding: rs(3, 'min'),
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(19, 'min'),
      fontWeight: fontWeights.bold,
    },
  });

  return (
    <View testID="aside.settingsPanel">
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            haptics.selection().catch(() => {});
            onBack();
          }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          activeOpacity={0.7}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('aside.settingsRow')}</Text>
      </View>

      {/* Sens de rotation — segmenté (P1-6), déménagé de la racine */}
      <Text style={styles.rotationLabel}>{t('accessibility.rotationDirection')}</Text>
      <View style={styles.segmentedControl}>
        {ROTATION_OPTIONS.map(({ key, value, label }) => {
          const isActive = clockwise === value;
          return (
            <TouchableOpacity
              key={key}
              accessible
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              onPress={() => {
                haptics.selection().catch(() => {});
                setClockwise(value);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Verrou d'échelle — ON = cadran horloge FIXE 60 (défaut, hyp. Eric 07/08),
          OFF = échelle adaptative (dérivée de la durée). Verrouille sur '60min' EN
          DUR (pas l'échelle courante) → ON↔OFF réversible, retour garanti à 60. */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>{t('aside.scaleLock')}</Text>
        <Switch
          accessible
          accessibilityLabel={t('aside.scaleLock')}
          accessibilityRole="switch"
          accessibilityState={{ checked: !!lockedScale }}
          value={!!lockedScale}
          onValueChange={(value) => {
            haptics.switchToggle().catch(() => {});
            setLockedScale(value ? '60min' : null);
          }}
          {...theme.styles.switch(!!lockedScale)}
        />
      </View>
      <Text style={styles.scaleLockHint}>{t('aside.scaleLockHint')}</Text>

      {toggles.map((toggle, index) => {
        const isLast = index === toggles.length - 1;
        return (
          <View key={toggle.key} style={[styles.optionRow, isLast && styles.optionRowLast]}>
            <Text style={styles.optionLabel}>{toggle.label}</Text>
            <Switch
              accessible
              accessibilityLabel={toggle.label}
              accessibilityRole="switch"
              accessibilityState={{ checked: toggle.value }}
              value={toggle.value}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => {});
                toggle.onChange(value);
              }}
              {...theme.styles.switch(toggle.value)}
            />
          </View>
        );
      })}
    </View>
  );
}

SheetSettingsPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
};
