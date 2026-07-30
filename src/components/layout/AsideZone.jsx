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
 * 3c (immersion) : prop `hidden` — le drawer entier (bande fermée comprise)
 * s'efface en fondu/glissement quand la séance devient décor (TimerScreen).
 * Jamais démonté : isOpen/sous-écrans survivent à l'immersion.
 * 3c (export) : bloc 5 « garder en fond d'écran » — composition dédiée
 * (`WallpaperComposition`) montée hors-écran, capturée à la demande
 * (react-native-view-shot) puis partagée (expo-sharing). Modules natifs
 * requis en lazy dans le handler (jamais top-level) : dégrade en feedback
 * discret si absents du dev client courant.
 */
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  withTiming,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { usePersistedState } from '../../hooks/usePersistedState';
import { useAnalytics } from '../../hooks/useAnalytics';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import RitualsPanel from '../rituals/RitualsPanel';
import PalettesPanel from '../palettes/PalettesPanel';
import WallpaperComposition from '../export/WallpaperComposition';

// 2 snaps : fermé (bande CLOSED_VISIBLE) / ouvert (hauteur du contenu, openY).
// Porte Eric 25/07 : la bande fermée vivait dans la zone gestuelle iOS (home
// indicator) — tap dessus = geste home, sheet inaccessible au doigt (prouvé au
// tap-robot). Cause racine : les snaps étaient calculés en % de l'ÉCRAN alors
// que le drawer est positionné dans la SafeArea du parent (~62 pt d'offset
// haut) — tout était décalé vers le bas depuis le début. Désormais : repère =
// hauteur MESURÉE du conteneur (onLayout), bande fermée FIXE de 92 pt — la
// barre du handle reste ~65 pt au-dessus de la zone système, sur tout device.
const CLOSED_VISIBLE = 92;
// Plafond : le sheet ne couvre jamais plus de 65% de l'écran — le dial reste visible
const MAX_OPEN_COVERAGE = 0.65;
const HANDLE_HEIGHT = 28; // handleContainer paddingTop(14)+paddingBottom(8) + handleIndicator height(6)
const BOTTOM_SAFETY = rs(24); // == scrollContent.paddingBottom

// Complet meurt (C6.2, acté Eric 25/07 ×2) — segmenté à 2 entrées. Clé
// interne `mixte` conservée (naming définitif à la passe CD, piste : le
// défaut ne se nomme pas) ; libellé affiché "Standard" (i18n, provisoire).
export default function AsideZone({ isTimerRunning, hidden = false }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();
  // Continuité paysage (3c) : useWindowDimensions (pas Dimensions.get figé
  // au chargement du module) — la hauteur totale du drawer (style `drawer`)
  // doit suivre la rotation, sinon son contenu se retrouve borné par la
  // hauteur de l'ORIENTATION AU DÉMARRAGE de l'app (clip possible du
  // ScrollView si on démarre en paysage puis pivote en portrait).
  const { height: windowHeight } = useWindowDimensions();
  const {
    timer: { clockwise, currentActivity },
    setClockwise,
    system: { keepAwakeEnabled },
    setKeepAwakeEnabled,
    display: { showTime },
    setShowTime,
    mode: { current: currentMode },
    setMode,
    palette: { currentColor },
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
  // Miroir de l'état interne liste/formulaire de RitualsPanel (hotfix-porte-1
  // A3/D5) — remonté via onViewChange, pour arbitrer scroll extérieur et pan
  // de fermeture sans qu'AsideZone connaisse le détail du sous-écran.
  const [ritualsView, setRitualsView] = useState('list');

  // Apprentissage double-tap (verdicts CD 25/07) : légende visible les 2
  // PREMIÈRES ouvertures du sheet, puis plus jamais — compteur persisté,
  // incrémenté sur la seule transition fermé→ouvert (pas à chaque render).
  const [asideOpenCount, setAsideOpenCount, asideOpenCountLoading] =
    usePersistedState('@ResetPulse:asideOpenCount', 0);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && !asideOpenCountLoading) {
      setAsideOpenCount((count) => count + 1);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, asideOpenCountLoading, setAsideOpenCount]);
  const showDoubleTapHint = !asideOpenCountLoading && asideOpenCount <= 2;
  // Hauteur mesurée des blocs réels (varie avec le mode : Focus n'affiche que
  // le segmenté). Fallback avant le premier onLayout : proche de l'ancien 80%.
  const [contentHeight, setContentHeight] = useState(windowHeight * 0.6);
  // Hauteur RÉELLE du conteneur (SafeArea du parent) — le seul repère honnête
  // pour positionner le drawer (cf. commentaire CLOSED_VISIBLE).
  const [containerH, setContainerH] = useState(windowHeight);
  const snapClosed = containerH - CLOSED_VISIBLE;

  const openY = Math.max(
    containerH * (1 - MAX_OPEN_COVERAGE),
    containerH - HANDLE_HEIGHT - contentHeight - BOTTOM_SAFETY
  );

  // A2 (hotfix-porte-1) : hauteur utile pour un sous-écran à scroll propre
  // (RitualForm, PalettesPanel) — le plafond des 65%, moins la poignée et la
  // marge basse. Toujours calculée et transmise (pas seulement quand
  // `boundedSubScreen` est vrai) : évite un frame où le sous-écran rendrait
  // sans hauteur bornée pendant que le miroir d'état (ritualsView) remonte.
  const subScreenHeight = Math.max(0, containerH * MAX_OPEN_COVERAGE - HANDLE_HEIGHT - BOTTOM_SAFETY);

  // A3/D5 : le pan de fermeture ET le scroll extérieur cèdent la main à un
  // sous-écran qui gère son propre scroll — Palettes, ou le formulaire de
  // Rituels (pas sa liste : elle reste sur le scroll extérieur, plus courte).
  const boundedSubScreen = paletteOpen || (ritualsOpen && ritualsView === 'form');

  const handleContentLayout = (e) => {
    setContentHeight(e.nativeEvent.layout.height);
  };

  const translateY = useSharedValue(windowHeight); // offscreen avant mesure
  const startY = useSharedValue(windowHeight);

  // Immersion (cadrage 3c) : `hidden` fait disparaître la bande fermée en
  // fondu — opacité + léger glissement vers le bas — SANS démonter le
  // drawer, l'état (ouvert/fermé, sous-écran) survit à l'immersion.
  const hiddenValue = useSharedValue(0);
  useEffect(() => {
    hiddenValue.value = withTiming(hidden ? 1 : 0, { duration: 600 });
  }, [hidden, hiddenValue]);

  // Recale la position fermée dès que le conteneur est mesuré
  useEffect(() => {
    if (!isOpen) {
      translateY.value = snapClosed;
    }
  }, [snapClosed]);

  const snapTo = (open) => {
    translateY.value = withSpring(open ? openY : snapClosed, {
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
      setRitualsView('list');
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
    .enabled(!boundedSubScreen)
    .activeOffsetY([-20, 20])
    .failOffsetX([-15, 15])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newY = startY.value + e.translationY;
      translateY.value = Math.max(openY, Math.min(snapClosed, newY));
    })
    .onEnd((e) => {
      const midpoint = (openY + snapClosed) / 2;
      let open = translateY.value < midpoint;
      if (e.velocityY > 500) { open = false; }
      if (e.velocityY < -500) { open = true; }
      translateY.value = withSpring(open ? openY : snapClosed, {
        damping: 80,
        stiffness: 450,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
      runOnJS(setIsOpen)(open);
    }),
  [translateY, startY, openY, boundedSubScreen]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - hiddenValue.value,
    transform: [{ translateY: translateY.value + hiddenValue.value * CLOSED_VISIBLE }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [openY, snapClosed],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }), [openY, snapClosed]);

  // A1/D4 (hotfix-porte-1) : bande fermée muette — seule la poignée (28pt)
  // était visible, le reste des 92pt blanc nu (le contenu s'éteint à
  // opacité 0 avec `content`). Élément-SŒUR de `content` (pas dedans, sinon
  // il hérite de la même opacité) : opacité INVERSE, visible fermé, s'efface
  // à l'ouverture. pointerEvents none — jamais dans le chemin du tap/pan.
  const closedLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [openY, snapClosed],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }), [openY, snapClosed]);

  // Export « garder en fond d'écran » (cadrage 3c Q3) : une composition
  // dédiée (disque courant + emoji), rendue HORS ÉCRAN via
  // `WallpaperComposition` (ci-dessous, montée en position absolue loin du
  // viewport) et capturée via `react-native-view-shot` → partagée via
  // `expo-sharing` (le share sheet iOS offre « Enregistrer dans Photos »,
  // aucune permission à déclarer). react-native-view-shot/expo-sharing sont
  // des modules NATIFS potentiellement absents du dev client courant — un
  // require() PARESSEUX dans le handler (jamais un import top-level) évite
  // tout crash au boot du bundle ; l'échec dégrade en feedback discret.
  const wallpaperRef = useRef(null);
  const [wallpaperUnavailable, setWallpaperUnavailable] = useState(false);

  const handleWallpaperExport = useCallback(async () => {
    haptics.selection().catch(() => {});
    setWallpaperUnavailable(false);
    try {
      // eslint-disable-next-line global-require
      const { captureRef } = require('react-native-view-shot');
      // eslint-disable-next-line global-require
      const Sharing = require('expo-sharing');

      if (!wallpaperRef.current) {
        throw new Error('WallpaperComposition not mounted');
      }
      const uri = await captureRef(wallpaperRef, { format: 'png', quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Sharing.isAvailableAsync: false');
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('aside.wallpaperExport') });
    } catch (error) {
      setWallpaperUnavailable(true);
    }
  }, [t]);

  const styles = StyleSheet.create({
    asideContainer: {
      bottom: 0,
      left: 0,
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
      height: windowHeight,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    handleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      // Asymétrique : la barre vit dans le haut de la bande fermée, loin de
      // l'indicateur home iOS (porte Eric 25/07).
      paddingBottom: 8,
      paddingTop: 14,
    },
    handleIndicator: {
      borderRadius: 3,
      height: 6,
      width: 56,
    },
    closedLabel: {
      alignItems: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: HANDLE_HEIGHT,
    },
    closedLabelText: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
    },
    closedLabelChevron: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      marginTop: rs(2),
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
    doubleTapHint: {
      color: theme.colors.textSecondary,
      fontSize: rs(11, 'min'),
      marginTop: rs(8),
      textAlign: 'center',
    },
    wallpaperFeedback: {
      color: theme.colors.textSecondary,
      fontSize: rs(11, 'min'),
      paddingBottom: rs(8),
      textAlign: 'center',
    },
    // Composition d'export (3c) : montée mais jamais visible — loin du
    // viewport, capturée par react-native-view-shot au geste export.
    wallpaperOffscreen: {
      left: -9999,
      position: 'absolute',
      top: -9999,
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
    <View
      style={styles.asideContainer}
      onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
      pointerEvents={hidden ? 'none' : 'box-none'}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View testID="aside.sheet" style={[styles.drawer, drawerAnimatedStyle, theme.shadow('xl')]}>
          {/* Handle — affordance du sheet : swipe up OU tap (porte Eric 25/07,
              la bande fermée doit s'ouvrir au doigt, pas seulement au geste) */}
          <TouchableOpacity
            testID="aside.handle"
            style={styles.handleContainer}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('aside.handle')}
            onPress={() => {
              haptics.selection().catch(() => {});
              if (!isOpen) {
                analytics.trackSheetOpened();
              }
              snapTo(!isOpen);
            }}
          >
            <View style={[styles.handleIndicator, { backgroundColor: theme.colors.textSecondary }]} />
          </TouchableOpacity>

          {/* Bande fermée (A1/D4) : sœur de `content`, opacité inverse —
              visible fermé, s'efface à l'ouverture. */}
          <Animated.View style={[styles.closedLabel, closedLabelAnimatedStyle]} pointerEvents="none">
            <Text style={styles.closedLabelText}>{t('aside.closedLabel')}</Text>
            <Text style={styles.closedLabelChevron}>˄</Text>
          </Animated.View>

          {/* SCR-10 : 4 blocs */}
          <Animated.View style={[styles.content, contentAnimatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              scrollEnabled={isOpen && !boundedSubScreen}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View onLayout={handleContentLayout}>
                {ritualsOpen ? (
                  /* Sous-écran Rituels (bloc 3, C6) — remplace les 4 blocs le
                     temps de la liste/formulaire (SCR-16/17). maxHeight ne
                     sert qu'au formulaire (A2) ; onViewChange remonte
                     liste/form à AsideZone (A3/D5). */
                  <RitualsPanel
                    onBack={() => setRitualsOpen(false)}
                    onApplied={() => snapTo(false)}
                    onViewChange={setRitualsView}
                    maxHeight={subScreenHeight}
                  />
                ) : paletteOpen ? (
                  /* Sous-écran Palettes (bloc 4, C6.1/C6.2) — la liste reste
                     ouverte au tap (préviz live, porte C6.1) : pas d'onApplied.
                     maxHeight borne son propre scroll (A2 — même dette que le
                     formulaire de rituel, elle explosera avec la liste). */
                  <PalettesPanel onBack={() => setPaletteOpen(false)} maxHeight={subScreenHeight} />
                ) : (
                  <>
                    {/* Bloc 1 : segmenté Mode — écrit le réglage global. En Focus,
                        pas de segmenté (deux tabs pour un mode sans réglage = absurde,
                        porte Eric 25/07) : une seule action, sortir. L'affordance
                        définitive d'entrée/sortie de Focus = question ouverte CD. */}
                    {isFocus ? (
                      <TouchableOpacity
                        testID="aside.exit-focus"
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
                          analytics.trackFocusExited();
                          setMode('mixte');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: theme.colors.fixed.white, fontSize: rs(13, 'min'), fontWeight: '600' }}>
                          {t('aside.exitFocus')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <>
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
                                  if (key === 'focus' && !isActive) {
                                    analytics.trackFocusEntered('sheet');
                                  }
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
                        {/* Apprentissage double-tap (verdicts CD 25/07) — les 2
                            premières ouvertures du sheet seulement. */}
                        {showDoubleTapHint && (
                          <Text style={styles.doubleTapHint}>{t('aside.doubleTapHint')}</Text>
                        )}
                      </>
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
                          style={styles.optionRow}
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

                        {/* Bloc 5 : export fond d'écran (cadrage 3c Q3) —
                            action directe (pas un sous-écran), visible en
                            séance comme au repos : la composition prend la
                            couleur/emoji COURANTS. */}
                        <TouchableOpacity
                          testID="aside.wallpaper-export"
                          style={[styles.optionRow, styles.optionRowLast]}
                          accessible
                          accessibilityRole="button"
                          accessibilityLabel={t('aside.wallpaperExport')}
                          onPress={handleWallpaperExport}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('aside.wallpaperExport')}</Text>
                          <Text style={styles.inertChevron}>↓</Text>
                        </TouchableOpacity>
                        {wallpaperUnavailable && (
                          <Text style={styles.wallpaperFeedback}>{t('aside.wallpaperUnavailable')}</Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Composition d'export hors-écran (3c Q3) — jamais montrée, capturée
          au geste « garder en fond d'écran ». */}
      <View style={styles.wallpaperOffscreen} pointerEvents="none">
        <WallpaperComposition ref={wallpaperRef} color={currentColor} emoji={currentActivity?.emoji} />
      </View>
    </View>
  );
}
