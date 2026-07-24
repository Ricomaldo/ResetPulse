/**
 * @fileoverview AsideZone - Sheet léger custom Reanimated 4 (SCR-10, ADR-014)
 * V3 (2026-05-01) : migration @gorhom/bottom-sheet → Gesture.Pan + Reanimated 4.
 * Recentrage (2026-07-23) : 3 snaps / 7 sections → 2 états (fermé / ouvert
 * au swipe up) et 4 blocs.
 * Cycle 3 (Lot 2) : adoption — mécanisme + 4 blocs nés de la spec, gardés tels
 * quels. Bloc 1 câblé sur `mode` (écrit la valeur ; Mixte seul rend, C4/C5
 * brancheront Focus/Complet). Blocs 3/4 ramenés à des lignes placeholder
 * inertes (contenu réel : C6) — les carrousels qu'ils embarquaient dupliquaient
 * déjà `CompactRow` sans être la cible spec (liste SCR-16 / sous-écran PALC-PALE).
 * `labelOverlay`/`MessageZone` retirés : legacy pré-Lot 2, dupliquait l'affichage
 * de message que `TimerScreen` gère déjà nativement depuis C1/C2 (ADR-007).
 * Cycle 4 : affûtage « signature des modes » (porte C3, Eric) — en Focus, le
 * sheet ne montre plus que le segmenté (bloc 1). Un mode s'affirme par ce
 * qu'il interdit : en Focus, on ne règle rien, on ne peut qu'en sortir.
 * Cycle 5 (porte C4) : sheet trop grand pour son contenu — snap ouvert calculé
 * sur la hauteur réelle mesurée (`onLayout`, plus poignée), plafonné à 65 % de
 * l'écran. Le sheet ne couvre plus 80 % pour 2-4 lignes, le dial reste visible
 * sheet ouvert. Toggle « emoji au centre » retiré (signature ADR-014, pas une
 * option, veto Eric à la porte C4) — 2 réglages globaux restants.
 * Cycle 6.1 : bloc 4 Palettes câblé — sous-écran réel (`PalettesPanel`), même
 * mécanisme que le bloc 3 Rituels. `CompactRow` (TimerScreen) corrigé pour
 * suivre la palette courante (lisait `serenity` en dur).
 * Cycle 6.2 (fidélité au rendu) : Complet meurt (acté Eric 25/07 ×2) —
 * segmenté à 2 entrées, libellés i18n provisoires [Standard | Focus] (clé
 * interne `mixte` inchangée, naming définitif à la passe CD). Sélection
 * segmenté sombre (#2D2520), plus doré. Palette : sous-écran ne referme plus
 * le sheet au tap (préviz live, porte C6.1).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import RitualsPanel from '../rituals/RitualsPanel';
import PalettesPanel from '../palettes/PalettesPanel';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 2 snaps : fermé (handle visible) / ouvert (hauteur du contenu réel, cf. openY)
const SNAP_Y_CLOSED = SCREEN_HEIGHT * 0.92;
// Plafond : le sheet ne couvre jamais plus de 65% de l'écran — le dial reste visible
const MAX_OPEN_COVERAGE = 0.65;
const HANDLE_HEIGHT = 25; // handleContainer paddingVertical(10)*2 + handleIndicator height(5)
const BOTTOM_SAFETY = rs(24); // == scrollContent.paddingBottom

// Complet meurt (C6.2, acté Eric 25/07 ×2) — segmenté à 2 entrées. Clé
// interne `mixte` conservée (naming définitif à la passe CD, piste : le
// défaut ne se nomme pas) ; libellé affiché "Standard" (i18n, provisoire).
export default function AsideZone({ isTimerRunning }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    timer: { clockwise },
    setClockwise,
    system: { keepAwakeEnabled },
    setKeepAwakeEnabled,
    display: { showTime },
    setShowTime,
    mode: { current: currentMode },
    setMode,
  } = useTimerConfig();

  const isFocus = currentMode === 'focus';

  const MODES = [
    { key: 'mixte', label: t('mode.standard') },
    { key: 'focus', label: t('mode.focus') },
  ];

  const [isOpen, setIsOpen] = useState(false);
  // Sous-écran Rituels (bloc 3, C6) — remplace les blocs 1-4 quand ouvert.
  const [ritualsOpen, setRitualsOpen] = useState(false);
  // Sous-écran Palettes (bloc 4, C6.1) — même mécanisme.
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Hauteur mesurée des blocs réels (varie avec le mode : Focus n'affiche que
  // le segmenté). Fallback avant le premier onLayout : proche de l'ancien 80%.
  const [contentHeight, setContentHeight] = useState(SCREEN_HEIGHT * 0.6);

  const openY = Math.max(
    SCREEN_HEIGHT * (1 - MAX_OPEN_COVERAGE),
    SCREEN_HEIGHT - HANDLE_HEIGHT - contentHeight - BOTTOM_SAFETY
  );

  const handleContentLayout = (e) => {
    setContentHeight(e.nativeEvent.layout.height);
  };

  const translateY = useSharedValue(SNAP_Y_CLOSED);
  const startY = useSharedValue(SNAP_Y_CLOSED);

  const snapTo = (open) => {
    translateY.value = withSpring(open ? openY : SNAP_Y_CLOSED, {
      damping: 80,
      stiffness: 450,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
    setIsOpen(open);
  };

  // Auto-collapse when timer starts
  useEffect(() => {
    if (isTimerRunning && isOpen) {
      snapTo(false);
    }
  }, [isTimerRunning]); // volontairement limité : réagit au seul démarrage du timer

  // Sheet fermé (swipe, auto-collapse ou application d'un rituel/palette) :
  // les sous-écrans ne restent pas ouverts pour la prochaine ouverture.
  useEffect(() => {
    if (!isOpen) {
      setRitualsOpen(false);
      setPaletteOpen(false);
    }
  }, [isOpen]);

  // Recale la position ouverte si le contenu mesuré change pendant que le
  // sheet est ouvert (ex: bascule de mode qui ajoute/retire des blocs)
  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(openY, {
        damping: 80,
        stiffness: 450,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
    }
  }, [openY]);

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-15, 15])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newY = startY.value + e.translationY;
      translateY.value = Math.max(openY, Math.min(SNAP_Y_CLOSED, newY));
    })
    .onEnd((e) => {
      const midpoint = (openY + SNAP_Y_CLOSED) / 2;
      let open = translateY.value < midpoint;
      if (e.velocityY > 500) { open = false; }
      if (e.velocityY < -500) { open = true; }
      translateY.value = withSpring(open ? openY : SNAP_Y_CLOSED, {
        damping: 80,
        stiffness: 450,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
      runOnJS(setIsOpen)(open);
    }),
  [translateY, startY, openY]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [openY, SNAP_Y_CLOSED],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }), [openY]);

  const styles = StyleSheet.create({
    asideContainer: {
      bottom: 0,
      left: 0,
      pointerEvents: 'box-none',
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 50,
    },
    content: {
      flex: 1,
    },
    drawer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      height: SCREEN_HEIGHT,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    handleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    handleIndicator: {
      borderRadius: 3,
      height: 5,
      width: 50,
    },
    inertChevron: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
    },
    inertRowLabel: {
      color: theme.colors.text,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },
    optionLabel: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },
    optionRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: rs(12),
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    scrollContent: {
      paddingBottom: rs(24),
      paddingHorizontal: rs(16),
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      paddingVertical: rs(8),
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.text,
    },
    segmentText: {
      color: theme.colors.text,
      fontSize: rs(12, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },
    segmentTextActive: {
      color: theme.colors.fixed.white,
    },
    segmentedControl: {
      backgroundColor: theme.colors.segmentInactive,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      flexDirection: 'row',
      marginTop: rs(4),
      padding: rs(2),
    },
    togglesCard: {
      marginTop: rs(16),
    },
  });

  const toggles = [
    {
      key: 'keepAwake',
      label: t('accessibility.keepAwake'),
      value: keepAwakeEnabled,
      onChange: setKeepAwakeEnabled,
    },
    {
      key: 'clockwise',
      label: t('accessibility.rotationDirection'),
      value: clockwise,
      onChange: setClockwise,
    },
    {
      key: 'showTime',
      label: t('accessibility.showTime'),
      value: showTime,
      onChange: setShowTime,
    },
  ];

  return (
    <View style={styles.asideContainer}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawer, drawerAnimatedStyle, theme.shadow('xl')]}>
          {/* Handle — affordance discrète du swipe up */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleIndicator, { backgroundColor: theme.colors.textSecondary }]} />
          </View>

          {/* SCR-10 : 4 blocs */}
          <Animated.View style={[styles.content, contentAnimatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              scrollEnabled={isOpen}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View onLayout={handleContentLayout}>
                {ritualsOpen ? (
                  /* Sous-écran Rituels (bloc 3, C6) — remplace les 4 blocs le
                     temps de la liste/formulaire (SCR-16/17). */
                  <RitualsPanel
                    onBack={() => setRitualsOpen(false)}
                    onApplied={() => snapTo(false)}
                  />
                ) : paletteOpen ? (
                  /* Sous-écran Palettes (bloc 4, C6.1/C6.2) — la liste reste
                     ouverte au tap (préviz live, porte C6.1) : pas d'onApplied. */
                  <PalettesPanel onBack={() => setPaletteOpen(false)} />
                ) : (
                  <>
                    {/* Bloc 1 : segmenté Mode — écrit le réglage global. En Focus,
                        pas de segmenté (deux tabs pour un mode sans réglage = absurde,
                        porte Eric 25/07) : une seule action, sortir. L'affordance
                        définitive d'entrée/sortie de Focus = question ouverte CD. */}
                    {isFocus ? (
                      <TouchableOpacity
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={t('aside.exitFocus')}
                        style={{
                          alignItems: 'center',
                          backgroundColor: theme.colors.text,
                          borderRadius: theme.borderRadius.md,
                          paddingVertical: theme.spacing.sm,
                        }}
                        onPress={() => {
                          haptics.selection().catch(() => {});
                          setMode('mixte');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: theme.colors.fixed.white, fontSize: rs(13, 'min'), fontWeight: '600' }}>
                          {t('aside.exitFocus')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.segmentedControl}>
                        {MODES.map(({ key, label }) => {
                          const isActive = currentMode === key;
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
                                setMode(key);
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
                    )}

                    {/* Blocs 2-4 : masqués en Focus — on ne règle rien, on ne peut
                        qu'en sortir (cf. header). */}
                    {!isFocus && (
                      <>
                        {/* Bloc 2 : 2 toggles */}
                        <View style={styles.togglesCard}>
                          {toggles.map((toggle, index) => (
                            <View
                              key={toggle.key}
                              style={[styles.optionRow, index === toggles.length - 1 && styles.optionRowLast]}
                            >
                              <Text style={styles.optionLabel}>{toggle.label}</Text>
                              <Switch
                                accessible={true}
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
                          ))}
                        </View>

                        {/* Bloc 3 : Mes rituels — sous-écran réel (C6) */}
                        <TouchableOpacity
                          style={styles.optionRow}
                          accessible
                          accessibilityRole="button"
                          accessibilityLabel={t('rituals.sheetRow')}
                          onPress={() => {
                            haptics.selection().catch(() => {});
                            setRitualsOpen(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('rituals.sheetRow')}</Text>
                          <Text style={styles.inertChevron}>›</Text>
                        </TouchableOpacity>

                        {/* Bloc 4 : Palettes — sous-écran réel (C6.1) */}
                        <TouchableOpacity
                          style={[styles.optionRow, styles.optionRowLast]}
                          accessible
                          accessibilityRole="button"
                          accessibilityLabel={t('palettesPanel.sheetRow')}
                          onPress={() => {
                            haptics.selection().catch(() => {});
                            setPaletteOpen(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('palettesPanel.sheetRow')}</Text>
                          <Text style={styles.inertChevron}>›</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
