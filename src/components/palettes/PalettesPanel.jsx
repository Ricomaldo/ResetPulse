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
 * Lot 3b (soft-gating, mandat Eric) : toujours aucun mur — un FREE peut
 * appliquer une palette Ambiances librement (comportement inchangé). Quand
 * la palette active est Ambiances et l'utilisateur FREE, une ligne
 * d'invitation discrète apparaît sous la grille (registre DS : petite
 * taille, textSecondary). Le retour au dernier inclus au redémarrage vit
 * dans usePaletteGating (TimerScreen), pas ici.
 */
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useModalStack } from '../../contexts/ModalStackContext';
import { TIMER_PALETTES, isPalettePremium } from '../../config/timer-palettes';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const PALETTE_KEYS = Object.keys(TIMER_PALETTES);
const INCLUDED_KEYS = PALETTE_KEYS.filter((key) => !TIMER_PALETTES[key].isPremium);
const AMBIANCE_KEYS = PALETTE_KEYS.filter((key) => TIMER_PALETTES[key].isPremium);

export default function PalettesPanel({ onBack, maxHeight }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();
  const { isPremium } = usePremiumStatus();
  const modalStack = useModalStack();
  const {
    palette: { currentPalette },
    setPalette,
  } = useTimerConfig();

  const handleApply = (key) => {
    haptics.impact('light').catch(() => {});
    setPalette(key);
    analytics.trackPaletteSelected(key);
  };

  // Ligne d'invitation : jamais pour un premium, seulement quand la palette
  // active est Ambiances. « Une fois par ouverture du panel » — un ref
  // (pas un state) qui verrouille dès le premier affichage de ce montage,
  // pas à chaque re-render/changement de palette pendant que le panel reste
  // ouvert.
  const showAmbiancesHint = !isPremium && isPalettePremium(currentPalette);
  const hasTrackedShownRef = useRef(false);
  useEffect(() => {
    if (showAmbiancesHint && !hasTrackedShownRef.current) {
      hasTrackedShownRef.current = true;
      analytics.trackAmbiancesInvitationShown('palettes');
    }
  }, [showAmbiancesHint, analytics]);

  const handleDiscoverAmbiances = () => {
    analytics.trackAmbiancesInvitationTapped('palettes');
    modalStack.push('premium', { highlightedFeature: 'palettes' });
  };

  const styles = StyleSheet.create({
    // A2 (hotfix-porte-1) : la liste dépendait entièrement du scroll
    // extérieur d'AsideZone (même dette que RitualForm) — bornée + scroll
    // propre, elle ne débordera plus quand elle grandira.
    panelContainer: {
      height: maxHeight,
    },
    scrollBody: {
      flex: 1,
    },
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
    ambiancesHint: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
    },
    ambiancesHintText: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
    },
    ambiancesHintLink: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.semibold,
      textDecorationLine: 'underline',
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
    <View style={styles.panelContainer}>
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

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('palettesPanel.included')}</Text>
        {INCLUDED_KEYS.map(renderPaletteRow)}

        <Text style={styles.sectionTitle}>{t('palettesPanel.ambiances')}</Text>
        {AMBIANCE_KEYS.map(renderPaletteRow)}

        {showAmbiancesHint && (
          <View style={styles.ambiancesHint}>
            <Text style={styles.ambiancesHintText}>
              {t('palettesPanel.ambiancesTrialHint')}
              {' · '}
              <Text
                style={styles.ambiancesHintLink}
                onPress={handleDiscoverAmbiances}
                accessible
                accessibilityRole="button"
              >
                {t('palettesPanel.ambiancesDiscover')}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
