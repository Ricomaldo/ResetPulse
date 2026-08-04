/**
 * @fileoverview RitualsPanel — sous-écran « Mes rituels » (bloc 3, SCR-10/16)
 * @description Monté dans AsideZone à la place des blocs 2-4 quand ouvert.
 * Liste → tap applique tout (activité/couleur/durée/son) et referme le sheet
 * (« un tap = tout est prêt ») ; édition discrète par rituel ; création via
 * le même formulaire, vide (ADR-015).
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useRituals } from '../../hooks/useRituals';
import { useTranslation } from '../../hooks/useTranslation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useModalStack } from '../../contexts/ModalStackContext';
import { buildRitualApplyPayload, resolveRitualActivity, isTemplateRitual, getDefaultRituals } from '../../config/rituals';
import { getActivityById } from '../../config/activities';
import { formatDuration } from '../../config/durations';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { usePersistedState } from '../../hooks/usePersistedState';
import RitualForm from './RitualForm';

// ADR-017 §1 : la frontière ne porte plus sur le TOTAL (3 templates figés +
// 1 slot personnel = 4 rituels visibles en free) mais sur le nombre de
// rituels PERSONNELS — 1 seul en gratuit, illimités en Ambiances. Le bouton +
// reste visible/actif : au-delà du cap personnel, il ouvre l'invitation
// Ambiances plutôt que le formulaire.
const FREE_PERSONAL_RITUALS_CAP = 1;

// Lambda U (2b, hero de la porte rituals_cap) : les emojis des 3 rituels de
// BASE (jamais les rituels vivants de l'user, potentiellement édités) —
// mandat explicite « lis-les depuis les rituels de base via config/rituals +
// activities, pas codés en dur ». Calculé une fois au chargement du module
// (getDefaultRituals est pur/déterministe).
const TEMPLATE_RITUAL_EMOJIS = getDefaultRituals()
  .map((ritual) => getActivityById(ritual.activityId)?.emoji)
  .filter(Boolean);

export default function RitualsPanel({ onBack, onApplied, onViewChange, maxHeight }) {
  const theme = useTheme();
  const t = useTranslation();
  const { rituals, createRitual, updateRitual, deleteRitual, getRitualById, restoreBaseRituals, hasMissingBaseRituals, favoriteRituals, toggleFavorite } = useRituals();
  const { customActivities, deleteActivity } = useCustomActivities();
  const { setCurrentActivity, setCurrentDuration, setSelectedSoundId, setColorByValue } = useTimerConfig();
  const { isPremium } = usePremiumStatus();
  const modalStack = useModalStack();
  const analytics = useAnalytics();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);
  // Renommage inline (ADR-017 §3) : appui long sur la ligne (quand
  // `editable`) bascule le nom en TextInput natif. Un seul rituel
  // renommable à la fois — id du rituel en cours d'édition inline, ou null.
  const [renamingId, setRenamingId] = useState(null);
  // Indice crayon (décision E, CD 04/08) : mini ✎ en overlay du nom des
  // rituels PERSONNELS tant qu'aucun renommage n'a jamais eu lieu — le
  // long-press est indécouvrable sans indice visuel. Disparaît pour
  // toujours au premier renommage réussi.
  const [hasRenamedRitual, setHasRenamedRitual] = usePersistedState('@ResetPulse:hasRenamedRitual', false);

  // A3/D5 (hotfix-porte-1) : remonte liste/form à AsideZone — elle arbitre
  // scroll extérieur + pan de fermeture selon le sous-écran actif.
  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const handleApply = (ritual) => {
    const payload = buildRitualApplyPayload(ritual, customActivities);
    haptics.impact('light').catch(() => {});
    setCurrentActivity(payload.activity);
    setCurrentDuration(payload.duration);
    setSelectedSoundId(payload.soundId);
    setColorByValue(payload.color);
    analytics.trackRitualApplied('list');
    onApplied();
  };

  const handleCreatePress = () => {
    haptics.selection().catch(() => {});
    const personalRitualsCount = rituals.filter((ritual) => !isTemplateRitual(ritual)).length;
    if (!isPremium && personalRitualsCount >= FREE_PERSONAL_RITUALS_CAP) {
      // Lambda U (2b) : hero = la rangée des 3 slots-templates + le 4ᵉ
      // pointillé — le cap qui vient d'être touché, rendu visible.
      modalStack.push('premium', {
        highlightedFeature: 'rituals_cap',
        hero: { type: 'ritualSlots', emojis: TEMPLATE_RITUAL_EMOJIS },
      });
      return;
    }
    setEditingId(null);
    setView('form');
  };

  // D8 (hotfix-porte-1) : la suppression reste libre, mais l'user peut se
  // retrouver sans base — ré-insère les rituels de base manquants (aucun
  // doublon, aucun écrasement d'un custom).
  const handleRestoreBase = () => {
    haptics.selection().catch(() => {});
    restoreBaseRituals();
  };

  const handleEditPress = (id) => {
    haptics.selection().catch(() => {});
    setEditingId(id);
    setView('form');
  };

  // ADR-017 §3 : appui long sur la ligne (nom compris) — seul geste qui ne
  // dispute pas le tap-pour-appliquer (le geste dominant, inchangé partout
  // ailleurs sur la ligne). Choix retenu plutôt que (a) détourner le tap du
  // nom — casserait le tap-pour-appliquer sur la zone la plus large de la
  // ligne — ou (b) une icône crayon dédiée — le ✎ existant ouvre déjà le
  // formulaire complet, une 2e icône aurait surchargé une ligne déjà dense.
  // Réservé aux rituels `editable` (posé par le lambda D, ADR-017 §1).
  const handleStartRename = (ritual) => {
    haptics.selection().catch(() => {});
    setRenamingId(ritual.id);
  };

  // Validation au submit (returnKeyType="done") ET au blur (tap ailleurs) —
  // les deux appellent ce même handler ; idempotent par construction (le
  // 2e appel ne change plus rien puisque le nom est déjà à jour). Nom vide
  // ou espaces → on garde l'ancien nom, silencieusement (pas d'erreur).
  const handleRenameSubmit = (id, rawValue) => {
    setRenamingId((current) => (current === id ? null : current));
    const trimmed = (rawValue ?? '').trim();
    if (!trimmed) {
      return;
    }
    const ritual = getRitualById(id);
    if (ritual && trimmed !== ritual.name) {
      updateRitual(id, { name: trimmed });
      setHasRenamedRitual(true);
    }
  };

  // Hygiène (fuite tracée au handoff porte-2, corrigeable depuis le contexte
  // partagé) : une activité custom ANONYME (créée à la volée par le
  // formulaire, ADR-015 — invisible pour l'user) devient orpheline quand plus
  // aucun rituel ne la référence. On la supprime au moment où sa dernière
  // référence disparaît : édition qui change d'emoji, ou suppression du
  // rituel. `rituals` est l'état d'AVANT le geste → on exclut le rituel
  // touché du comptage. Le cadran n'est pas affecté (setCurrentActivity
  // stocke l'OBJET activité, et resolveRitualActivity a un fallback
  // activité-manquante).
  const cleanupOrphanActivity = (oldActivityId, { excludeRitualId, newActivityId = null }) => {
    if (!oldActivityId || !oldActivityId.startsWith('custom_')) {return;}
    if (oldActivityId === newActivityId) {return;}
    const stillReferenced = rituals.some(
      (r) => r.id !== excludeRitualId && r.activityId === oldActivityId
    );
    if (!stillReferenced) {
      deleteActivity(oldActivityId);
    }
  };

  const handleFormSave = (fields) => {
    if (editingId) {
      const previousActivityId = getRitualById(editingId)?.activityId;
      updateRitual(editingId, fields);
      cleanupOrphanActivity(previousActivityId, {
        excludeRitualId: editingId,
        newActivityId: fields.activityId,
      });
    } else {
      createRitual(fields);
    }
    setEditingId(null);
    setView('list');
  };

  const handleDeleteRitual = (ritual) => {
    deleteRitual(ritual.id);
    cleanupOrphanActivity(ritual.activityId, { excludeRitualId: ritual.id });
  };

  const handleFormDelete = (id) => {
    const ritual = getRitualById(id);
    if (ritual) {
      handleDeleteRitual(ritual);
    }
    setEditingId(null);
    setView('list');
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
    createRow: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: rs(12),
    },
    createText: {
      color: theme.colors.brand.primary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
    },
    durationBadge: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      marginRight: theme.spacing.sm,
    },
    editAffordance: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
      minHeight: 36,
      minWidth: 36,
    },
    editAffordanceText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
    },
    emoji: {
      fontSize: rs(20, 'min'),
      marginRight: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      paddingVertical: rs(12),
    },
    restoreRow: {
      alignItems: 'center',
      paddingVertical: rs(10),
    },
    restoreText: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    renameHintPencil: {
      color: theme.colors.textSecondary,
      fontSize: rs(10, 'min'),
      marginLeft: rs(4, 'min'),
    },
    ritualName: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    ritualNameInput: {
      borderBottomColor: theme.colors.brand.primary,
      borderBottomWidth: StyleSheet.hairlineWidth,
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
      paddingVertical: 0,
    },
    deleteAction: {
      alignItems: 'center',
      backgroundColor: '#A85B42', // terracotta du DS — destructif sans crier
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      marginVertical: rs(2),
      paddingHorizontal: theme.spacing.md,
    },
    deleteActionText: {
      color: '#FFFFFF',
      fontSize: rs(13, 'min'),
      fontWeight: '600',
    },
    favoriteAffordance: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 36,
    },
    favoriteStar: {
      color: theme.colors.textLight,
      fontSize: rs(18, 'min'),
    },
    favoriteStarActive: {
      color: '#D4A853', // l'or « done » du DS — jamais le vert
    },
    ritualRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      paddingVertical: rs(10),
    },
    ritualTouchable: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  if (view === 'form') {
    const initialRitual = editingId ? getRitualById(editingId) : null;
    return (
      <RitualForm
        initialRitual={initialRitual}
        onSave={handleFormSave}
        onCancel={() => { setEditingId(null); setView('list'); }}
        onDelete={handleFormDelete}
        maxHeight={maxHeight}
      />
    );
  }

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
        <Text style={styles.title}>{t('rituals.list.title')}</Text>
      </View>

      {rituals.length === 0 && (
        <Text style={styles.emptyText}>{t('rituals.list.empty')}</Text>
      )}

      {rituals.map((ritual) => {
        const activity = resolveRitualActivity(ritual, customActivities);
        const isFavorite = favoriteRituals.some((fav) => fav.id === ritual.id);
        // ADR-017 §1 : les 3 templates figés (free) n'ont AUCUNE UX
        // d'édition — masquée, pas grisée. Un template devient un rituel
        // normal (édition + suppression) dès isPremium.
        const editable = isPremium || !isTemplateRitual(ritual);
        const isRenaming = editable && renamingId === ritual.id;
        return (
          // porte-2 (retour Eric) : swipe gauche = supprimer (Swipeable RNGH),
          // étoile = élire aux 3 favoris de la rangée d'accueil.
          <Swipeable
            key={ritual.id}
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            renderRightActions={editable ? () => (
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                  haptics.impact('medium').catch(() => {});
                  handleDeleteRitual(ritual);
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('accessibility.deleteRitual', { name: ritual.name })}
              >
                <Text style={styles.deleteActionText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            ) : undefined}
          >
            <View style={styles.ritualRow}>
              <TouchableOpacity
                style={styles.favoriteAffordance}
                onPress={() => {
                  const changed = toggleFavorite(ritual.id);
                  haptics.selection().catch(() => {});
                  if (!changed && !isFavorite) {
                    // 4e étoile refusée : libérer une place d'abord (max 3)
                    haptics.impact('light').catch(() => {});
                  }
                }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ selected: isFavorite }}
                accessibilityLabel={t('accessibility.favoriteRitual', { name: ritual.name })}
              >
                <Text style={[styles.favoriteStar, isFavorite && styles.favoriteStarActive]}>
                  {isFavorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              {isRenaming ? (
                // Ligne en mode renommage : un simple View (pas un
                // TouchableOpacity) — le TextInput doit rester seul
                // récepteur du toucher pour le focus/curseur natif, un
                // touchable englobant le lui disputerait. Le
                // tap-pour-appliquer est donc naturellement suspendu tant
                // que le renommage est actif (état explicite, temporaire).
                <View style={styles.ritualTouchable}>
                  <Text style={styles.emoji}>{activity?.emoji}</Text>
                  <TextInput
                    style={styles.ritualNameInput}
                    defaultValue={ritual.name}
                    autoFocus
                    selectTextOnFocus
                    returnKeyType="done"
                    onSubmitEditing={(e) => handleRenameSubmit(ritual.id, e.nativeEvent.text)}
                    onBlur={(e) => handleRenameSubmit(ritual.id, e.nativeEvent.text)}
                    accessible
                    accessibilityLabel={t('accessibility.renameRitual', { name: ritual.name })}
                  />
                  <Text style={styles.durationBadge}>{formatDuration(ritual.duration)}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.ritualTouchable}
                  onPress={() => handleApply(ritual)}
                  onLongPress={editable ? () => handleStartRename(ritual) : undefined}
                  delayLongPress={450}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={t('accessibility.applyRitual', { name: ritual.name })}
                  accessibilityHint={editable ? t('accessibility.renameRitualHint') : undefined}
                >
                  <Text style={styles.emoji}>{activity?.emoji}</Text>
                  <Text style={styles.ritualName}>{ritual.name}</Text>
                  {editable && !isTemplateRitual(ritual) && !hasRenamedRitual && (
                    <Text style={styles.renameHintPencil}>✎</Text>
                  )}
                  <Text style={styles.durationBadge}>{formatDuration(ritual.duration)}</Text>
                </TouchableOpacity>
              )}
              {editable && (
                <TouchableOpacity
                  style={styles.editAffordance}
                  onPress={() => handleEditPress(ritual.id)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={t('accessibility.editRitual', { name: ritual.name })}
                >
                  <Text style={styles.editAffordanceText}>✎</Text>
                </TouchableOpacity>
              )}
            </View>
          </Swipeable>
        );
      })}

      <TouchableOpacity
        style={styles.createRow}
        onPress={handleCreatePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.createRitual')}
      >
        <Text style={styles.createText}>{t('rituals.list.createRow')}</Text>
      </TouchableOpacity>

      {hasMissingBaseRituals && (
        <TouchableOpacity
          style={styles.restoreRow}
          onPress={handleRestoreBase}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('rituals.restoreBase')}
        >
          <Text style={styles.restoreText}>{t('rituals.restoreBase')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
