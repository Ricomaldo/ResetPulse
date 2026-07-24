/**
 * @fileoverview PalettesPanel — sous-écran « Palettes » (bloc 4, SCR-10)
 * @description Monté dans AsideZone à la place des blocs 1-4 quand ouvert.
 * Liste des palettes de couleurs (`timer-palettes.js`) — tap applique la
 * palette (les 4 pastilles de la barre principale changent, couleur active
 * bascule sur la 1re teinte) ; la liste reste ouverte (préviz live, porte
 * C6.1) — retour par ‹ ou fermeture du sheet, pas d'auto-close au tap
 * (diffère de « Mes rituels », dont l'apply ferme tout : un rituel
 * applique 4 réglages d'un coup, une palette n'en change qu'un). Aucun
 * gating premium (Cycle 6.1) : la répartition gratuit/payant des palettes
 * est parquée, à trancher devant les écrans.
 * Verdicts CD (25/07) : 2 sections « Incluses »/« Ambiances » — Ambiances en
 * pleine couleur, aucun cadenas (gating réservé Lot 3b).
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TIMER_PALETTES } from '../../config/timer-palettes';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const PALETTE_KEYS = Object.keys(TIMER_PALETTES);
const INCLUDED_KEYS = PALETTE_KEYS.filter((key) => !TIMER_PALETTES[key].isPremium);
const AMBIANCE_KEYS = PALETTE_KEYS.filter((key) => TIMER_PALETTES[key].isPremium);

export default function PalettesPanel({ onBack }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    palette: { currentPalette },
    setPalette,
  } = useTimerConfig();

  const handleApply = (key) => {
    haptics.impact('light').catch(() => {});
    setPalette(key);
  };

  const styles = StyleSheet.create({
    backButton: {
      minHeight: 44,
      minWidth: 44,
      paddingRight: theme.spacing.sm,
    },
    backChevron: {
      color: theme.colors.text,
      fontSize: rs(20, 'min'),
    },
    checkmark: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      minWidth: rs(20, 'min'),
      textAlign: 'center',
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    paletteName: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    paletteRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      paddingVertical: rs(10),
    },
    swatch: {
      borderRadius: rs(4),
      flexDirection: 'row',
      height: rs(20, 'min'),
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
      width: rs(56, 'min'),
    },
    sectionTitle: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    swatchColor: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  const renderPaletteRow = (key) => {
    const { colors, name } = TIMER_PALETTES[key];
    const isActive = currentPalette === key;
    return (
      <TouchableOpacity
        key={key}
        style={styles.paletteRow}
        onPress={() => handleApply(key)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={t('accessibility.paletteItem', { name })}
      >
        <View style={styles.swatch}>
          {colors.map((color, index) => (
            <View key={index} style={[styles.swatchColor, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={styles.paletteName}>{name}</Text>
        {isActive && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('palettesPanel.title')}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t('palettesPanel.included')}</Text>
      {INCLUDED_KEYS.map(renderPaletteRow)}

      <Text style={styles.sectionTitle}>{t('palettesPanel.ambiances')}</Text>
      {AMBIANCE_KEYS.map(renderPaletteRow)}
    </View>
  );
}
