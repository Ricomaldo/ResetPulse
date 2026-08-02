/**
 * @fileoverview SoundsPanel — sous-écran « Sons » (bloc 5, SCR-10, Lambda L)
 * @description Monté dans AsideZone à la place des blocs 1-4 quand ouvert —
 * miroir de PalettesPanel (même mécanique, domaine son). Liste des sons
 * (`config/sounds.js`) — tap ÉCOUTE (préviz in-app, useSimpleAudio, ADR-018
 * §① : rien à voir avec le canal notification) ET applique le son en direct
 * (`setSelectedSoundId`) ; la liste reste ouverte, retour par ‹.
 * Aucun gating premium au tap (ADR-017 §6/§7, mandat Eric — même grammaire
 * « essai libre » que les palettes, étendue aux sons) : 4 sons Inclus / 8
 * Ambiances, un FREE peut appliquer un son Ambiances librement. Quand le son
 * actif est Ambiances et l'utilisateur FREE, une ligne d'invitation discrète
 * apparaît sous la liste (registre DS identique à PalettesPanel). Le retour
 * au dernier inclus au redémarrage vit dans useSoundGating (TimerScreen),
 * pas ici.
 */
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useModalStack } from '../../contexts/ModalStackContext';
import { TIMER_SOUNDS, isSoundPremium } from '../../config/sounds';
import useSimpleAudio from '../../hooks/useSimpleAudio';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const INCLUDED_SOUNDS = TIMER_SOUNDS.filter((sound) => !sound.isPremium);
const AMBIANCE_SOUNDS = TIMER_SOUNDS.filter((sound) => sound.isPremium);

export default function SoundsPanel({ onBack, maxHeight }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();
  const { isPremium } = usePremiumStatus();
  const modalStack = useModalStack();
  const {
    timer: { selectedSoundId },
    setSelectedSoundId,
  } = useTimerConfig();
  const { playSound, isPlaying } = useSimpleAudio(selectedSoundId);

  const handleApply = (soundId) => {
    haptics.impact('light').catch(() => {});
    setSelectedSoundId(soundId);
    playSound(soundId).catch(() => {});
    analytics.trackSoundSelected(soundId);
  };

  // Ligne d'invitation : jamais pour un premium, seulement quand le son
  // actif est Ambiances — même verrou « une fois par ouverture du panel »
  // que PalettesPanel (ref, pas state : ne se redéclenche pas à chaque
  // re-render pendant que le panel reste ouvert).
  const showAmbiancesHint = !isPremium && isSoundPremium(selectedSoundId);
  const hasTrackedShownRef = useRef(false);
  useEffect(() => {
    if (showAmbiancesHint && !hasTrackedShownRef.current) {
      hasTrackedShownRef.current = true;
      analytics.trackAmbiancesInvitationShown('sounds');
    }
  }, [showAmbiancesHint, analytics]);

  const handleDiscoverAmbiances = () => {
    analytics.trackAmbiancesInvitationTapped('sounds');
    modalStack.push('premium', { highlightedFeature: 'sounds' });
  };

  const styles = StyleSheet.create({
    // Même dette/parade que PalettesPanel (A2, hotfix-porte-1) : bornée +
    // scroll propre, ne débordera plus quand la liste grandira.
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
    soundEmoji: {
      fontSize: rs(18, 'min'),
      marginRight: theme.spacing.sm,
    },
    soundName: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    soundRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      paddingVertical: rs(10),
    },
    sectionTitle: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      textTransform: 'uppercase',
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

  const renderSoundRow = (sound) => {
    const isActive = selectedSoundId === sound.id;
    return (
      <TouchableOpacity
        key={sound.id}
        style={styles.soundRow}
        onPress={() => handleApply(sound.id)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={t('accessibility.soundItem', { name: sound.name })}
      >
        <Text style={styles.soundEmoji}>{sound.emoji}</Text>
        <Text style={styles.soundName}>{sound.name}</Text>
        {isActive && (
          <Text style={styles.checkmark}>{isPlaying ? '♪' : '✓'}</Text>
        )}
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
        <Text style={styles.title}>{t('soundsPanel.title')}</Text>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('soundsPanel.included')}</Text>
        {INCLUDED_SOUNDS.map(renderSoundRow)}

        <Text style={styles.sectionTitle}>{t('soundsPanel.ambiances')}</Text>
        {AMBIANCE_SOUNDS.map(renderSoundRow)}

        {showAmbiancesHint && (
          <View style={styles.ambiancesHint}>
            <Text style={styles.ambiancesHintText}>
              {t('soundsPanel.ambiancesTrialHint')}
              {' · '}
              <Text
                style={styles.ambiancesHintLink}
                onPress={handleDiscoverAmbiances}
                accessible
                accessibilityRole="button"
              >
                {t('soundsPanel.ambiancesDiscover')}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
