/**
 * @fileoverview RitualForm — formulaire unique SCR-16 (création + édition)
 * @description 4 champs dans l'ordre (spec recentrage) : Emoji → Couleur →
 * Durée → Son de fin. Emoji custom (SCR-17) : clavier système, crée une
 * Activité anonyme à la volée (ADR-015) — invisible pour l'user.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { getActivityById } from '../../config/activities';
import { deriveRitualName, resolveRitualActivity, shouldDeriveNameFromActivity, suggestedColorFor } from '../../config/rituals';
import { DEFAULT_SOUND_ID } from '../../config/sounds';
import { getAllPalettes, TIMER_PALETTES } from '../../config/timer-palettes';
import DurationSlider from '../pickers/DurationSlider';
import SoundPicker from '../pickers/SoundPicker';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const FORM_ACTIVITY_IDS = ['meditation', 'break', 'work'];

/**
 * Carrousel de couleurs paginé LOCAL au formulaire (C2/D7, hotfix-porte-1) —
 * remplace les 4 pastilles tirées de la palette globale courante (résidu de
 * portage : la couleur d'un rituel est stockée EN VALEUR hex, ADR-015, elle
 * n'a pas à suivre la palette active de l'écran). Une page = une palette
 * possédée (`getAllPalettes(isPremium)`) ; la sélection reste locale au
 * formulaire (prop `color`/`onSelectColor`, pas le contexte global). N'est
 * PAS le PaletteCarousel legacy (mort en C3, couplé au contexte global).
 */
function RitualColorCarousel({ color, onSelectColor }) {
  const theme = useTheme();
  const t = useTranslation();
  const { isPremium } = usePremiumStatus();
  const paletteKeys = getAllPalettes(isPremium);
  const initialPage = Math.max(0, paletteKeys.findIndex((key) => TIMER_PALETTES[key].colors.includes(color)));
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef(null);
  const hasScrolledToInitial = useRef(false);

  useEffect(() => {
    if (containerWidth > 0 && !hasScrolledToInitial.current) {
      hasScrolledToInitial.current = true;
      if (initialPage > 0) {
        scrollRef.current?.scrollTo({ x: initialPage * containerWidth, animated: false });
      }
    }
  }, [containerWidth, initialPage]);

  const styles = StyleSheet.create({
    colorDot: {
      borderColor: theme.colors.shadow,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: rs(32, 'min'),
      padding: 3,
      width: rs(32, 'min'),
    },
    colorDotActive: {
      borderColor: theme.colors.text,
      borderWidth: 2,
    },
    colorDotInner: {
      borderRadius: theme.borderRadius.round,
      flex: 1,
    },
    colorRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    page: {
      alignItems: 'center',
    },
    pageName: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.medium,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
  });

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {paletteKeys.map((key) => {
          const { colors, name } = TIMER_PALETTES[key];
          return (
            <View key={key} style={[styles.page, { width: containerWidth }]}>
              <Text style={styles.pageName}>{name}</Text>
              <View style={styles.colorRow}>
                {colors.map((paletteColor, index) => (
                  <TouchableOpacity
                    key={paletteColor}
                    style={[styles.colorDot, color === paletteColor && styles.colorDotActive]}
                    onPress={() => {
                      haptics.selection().catch(() => {});
                      onSelectColor(paletteColor);
                    }}
                    activeOpacity={0.7}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={t('accessibility.colorNumber', { number: index + 1 })}
                    accessibilityState={{ selected: color === paletteColor }}
                  >
                    <View style={[styles.colorDotInner, { backgroundColor: paletteColor }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// porte-2 (retour Eric ×2 « le + n'ouvre pas le clavier emoji ») : cause
// racine réelle — iOS n'offre AUCUN moyen d'ouvrir programmatiquement le
// clavier emoji (focus = clavier standard de l'utilisateur, le design C6
// reposait sur une capacité qui n'existe pas). Fix robuste : une grille
// intégrée, zéro clavier. Sélection curée, ton chaleureux de l'app.
const CUSTOM_EMOJI_CHOICES = [
  '🎨', '📖', '📚', '✍️', '🧠', '🎯',
  '💪', '🚶', '🚴', '🧘‍♀️', '🛁', '😴',
  '👨‍🍳', '🍵', '🌱', '🐕', '🎵', '🎸',
  '🧹', '📝', '🎮', '🌙', '🔧', '🧺',
];

export default function RitualForm({ initialRitual, onSave, onCancel, onDelete, maxHeight }) {
  const theme = useTheme();
  const t = useTranslation();
  const { customActivities, createActivity } = useCustomActivities();
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  // porte-3 (demande Eric) : « autre… » — en complément de la grille curée,
  // un TextInput VISIBLE (le clavier emoji ne s'ouvre pas programmatiquement
  // sur iOS ; l'utilisateur bascule lui-même via le globe 🌐) — accès à TOUS
  // les emojis. Premier contenu saisi = emoji retenu, même chemin que la grille.
  const [showFreeEmojiInput, setShowFreeEmojiInput] = useState(false);

  const initialActivity = initialRitual
    ? resolveRitualActivity(initialRitual, customActivities)
    : getActivityById(FORM_ACTIVITY_IDS[0]);
  const initialBuiltInId = FORM_ACTIVITY_IDS.includes(initialActivity?.id) ? initialActivity.id : null;

  const [selectedActivityId, setSelectedActivityId] = useState(initialBuiltInId);
  const [pendingCustomEmoji, setPendingCustomEmoji] = useState(
    initialBuiltInId ? null : initialActivity?.emoji || null
  );
  const [color, setColor] = useState(
    initialRitual ? initialRitual.color : suggestedColorFor(initialActivity)
  );
  const [duration, setDuration] = useState(
    initialRitual ? initialRitual.duration : initialActivity?.defaultDuration
  );
  const [soundId, setSoundId] = useState(initialRitual?.soundId || DEFAULT_SOUND_ID);

  const handleSelectBuiltIn = (activityId) => {
    haptics.selection().catch(() => {});
    setSelectedActivityId(activityId);
    setPendingCustomEmoji(null);
  };

  const handleOpenCustomEmoji = () => {
    haptics.selection().catch(() => {});
    setShowEmojiGrid((visible) => !visible);
  };

  const handlePickCustomEmoji = (emoji) => {
    haptics.selection().catch(() => {});
    setPendingCustomEmoji(emoji);
    setSelectedActivityId(null);
    setShowEmojiGrid(false);
    setShowFreeEmojiInput(false);
  };

  const handleFreeEmojiChange = (text) => {
    const value = text.trim();
    if (!value) {return;}
    // iOS livre l'emoji complet (multi-codepoints compris) en UN événement —
    // on le prend tel quel et on referme (grille + input + clavier).
    Keyboard.dismiss();
    handlePickCustomEmoji(value);
  };

  const handleSave = () => {
    let activityId = selectedActivityId;
    let name;

    if (shouldDeriveNameFromActivity(activityId, initialRitual)) {
      // C1b : ne re-dérive le nom que si l'activité a réellement changé vs
      // initialRitual — sinon un nom custom survit à un save qui n'y touche pas.
      name = deriveRitualName(getActivityById(activityId));
    } else if (pendingCustomEmoji && pendingCustomEmoji !== initialActivity?.emoji) {
      const created = createActivity(
        pendingCustomEmoji,
        t('rituals.form.customActivityName'),
        duration,
        { isPremium: false }
      );
      activityId = created.id;
      name = deriveRitualName(created);
    } else if (initialRitual) {
      activityId = initialRitual.activityId;
      name = initialRitual.name;
    } else {
      return; // pas de sélection possible — le premier bouton est présélectionné
    }

    onSave({ name, activityId, color, duration, soundId });
  };

  const handleDelete = () => {
    Alert.alert(
      t('rituals.form.deleteConfirmTitle'),
      t('rituals.form.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rituals.form.deleteButton'), style: 'destructive', onPress: () => onDelete(initialRitual.id) },
      ]
    );
  };

  const styles = StyleSheet.create({
    // A2 (hotfix-porte-1) : hauteur bornée passée par AsideZone (via
    // RitualsPanel) — sans elle, le footer Save débordait hors champ au lieu
    // de scroller (le ScrollView interne n'avait rien pour borner sa hauteur
    // disponible). header/footer en flux normal, ScrollView flex:1 prend le
    // reste — pas de calcul manuel de leurs hauteurs.
    formContainer: {
      height: maxHeight,
    },
    scrollBody: {
      flex: 1,
    },
    cancelButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      padding: theme.spacing.sm,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.semibold,
    },
    closeButton: {
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.xs,
    },
    closeButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(18, 'min'),
    },
    deleteButton: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
      minHeight: 44,
      padding: theme.spacing.sm,
    },
    deleteButtonText: {
      color: theme.colors.danger,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },
    emojiButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      height: rs(48, 'min'),
      justifyContent: 'center',
      width: rs(48, 'min'),
    },
    emojiButtonActive: {
      borderColor: theme.colors.brand.primary,
    },
    emojiButtonText: {
      fontSize: rs(22, 'min'),
    },
    emojiCustomButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.medium,
    },
    emojiRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    // C3 (hotfix-porte-1) : 0×0 refusait le focus iOS (pas de clavier emoji
    // au tap) — 1×1 reste visuellement invisible (opacity 0) mais focusable.
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    freeEmojiHint: {
      color: theme.colors.textSecondary,
      flex: 1,
      fontSize: rs(11, 'min'),
    },
    freeEmojiInput: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      fontSize: rs(22, 'min'),
      minHeight: rs(48, 'min'),
      minWidth: rs(64, 'min'),
      paddingHorizontal: theme.spacing.sm,
      textAlign: 'center',
    },
    freeEmojiRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      flex: 2,
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      padding: theme.spacing.sm,
    },
    saveButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.semibold,
    },
    section: {
      marginTop: theme.spacing.md,
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.xs,
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(17, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {initialRitual ? t('rituals.form.editTitle') : t('rituals.form.createTitle')}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.closeRitualForm')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBody} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {/* 1. Emoji */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.emojiLabel')}</Text>
          <View style={styles.emojiRow}>
            {FORM_ACTIVITY_IDS.map((activityId) => {
              const activity = getActivityById(activityId);
              const isActive = selectedActivityId === activityId;
              return (
                <TouchableOpacity
                  key={activityId}
                  style={[styles.emojiButton, isActive && styles.emojiButtonActive]}
                  onPress={() => handleSelectBuiltIn(activityId)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={activity.label}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={styles.emojiButtonText}>{activity.emoji}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.emojiButton, !selectedActivityId && pendingCustomEmoji && styles.emojiButtonActive]}
              onPress={handleOpenCustomEmoji}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.chooseCustomEmoji')}
            >
              {!selectedActivityId && pendingCustomEmoji ? (
                <Text style={styles.emojiButtonText}>{pendingCustomEmoji}</Text>
              ) : (
                <Text style={styles.emojiCustomButtonText}>+</Text>
              )}
            </TouchableOpacity>
          </View>
          {showEmojiGrid && (
            <View style={styles.emojiGrid}>
              {CUSTOM_EMOJI_CHOICES.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiButton, pendingCustomEmoji === emoji && styles.emojiButtonActive]}
                  onPress={() => handlePickCustomEmoji(emoji)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={emoji}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              {/* « autre… » : ouvre le TextInput libre ci-dessous */}
              <TouchableOpacity
                style={[styles.emojiButton, showFreeEmojiInput && styles.emojiButtonActive]}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  setShowFreeEmojiInput((visible) => !visible);
                }}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('rituals.form.customEmojiOther')}
              >
                <Text style={styles.emojiCustomButtonText}>…</Text>
              </TouchableOpacity>
            </View>
          )}
          {showEmojiGrid && showFreeEmojiInput && (
            <View style={styles.freeEmojiRow}>
              <TextInput
                style={styles.freeEmojiInput}
                autoFocus
                value=""
                onChangeText={handleFreeEmojiChange}
                maxLength={16}
                placeholder={t('rituals.form.customEmojiPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                accessible
                accessibilityLabel={t('rituals.form.customEmojiPlaceholder')}
              />
              <Text style={styles.freeEmojiHint}>{t('rituals.form.customEmojiHint')}</Text>
            </View>
          )}
        </View>

        {/* 2. Couleur — carrousel paginé LOCAL au formulaire (C2/D7) : la
            couleur d'un rituel est une valeur hex (ADR-015), elle ne suit
            plus la palette globale de l'écran. */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.colorLabel')}</Text>
          <RitualColorCarousel color={color} onSelectColor={setColor} />
        </View>

        {/* 3. Durée */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.durationLabel')}</Text>
          <DurationSlider value={duration} onValueChange={setDuration} />
        </View>

        {/* 4. Son de fin */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.soundLabel')}</Text>
          <SoundPicker selectedSoundId={soundId} onSoundSelect={setSoundId} />
        </View>

        {initialRitual && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('rituals.form.deleteButton')}
          >
            <Text style={styles.deleteButtonText}>{t('rituals.form.deleteButton')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{t('rituals.form.saveButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
