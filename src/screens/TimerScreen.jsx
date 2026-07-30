/**
 * @fileoverview TimerScreen — écran principal, modes Mixte + Focus (ADR-014)
 * Reconstruction Lot 2 (2026-07-23) : écran neuf, construit depuis
 * `_docs/specs/recentrage.md`. Récolte des primitives prouvées (TimeTimer,
 * ActivityItem, activities.js, timer-palettes.js) — pas de layout hérité.
 * Cycle 1 : état repos (SCR-1). Cycle 2 : séance + fin (SCR-2/3) — tap sur le
 * disque pilote start/stop(rembobinage)/reset via la state machine récoltée
 * (useTimer, ADR-007) — aucune logique neuve, juste le branchement écran.
 * Cycle 3 : sheet SCR-10 (`AsideZone`, adopté — né de la spec) monté en swipe
 * up depuis Mixte.
 * Cycle 4 (SCR-4/5/6) : mode Focus branché sur le réglage global `mode`.
 * `TimeTimer` reste monté en continu quel que soit le mode (state machine
 * ADR-007 intouchable au changement de mode) — seul le chrome autour
 * (rangée, 🎲, chiffre, message de fin) est conditionné par le mode. Focus
 * n'ajoute qu'un hint discret au repos ; la fin ✨ plein-vert est déjà portée
 * par le dial (`DialCenter`), pas par ce fichier.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, View, Text, TouchableOpacity, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from '../hooks/useTranslation';
import { useFirstRun } from '../hooks/useFirstRun';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSessionImmersion } from '../hooks/useSessionImmersion';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import AsideZone from '../components/layout/AsideZone';
import FirstRunTips from '../components/first-run/FirstRunTips';
import { buildRitualApplyPayload } from '../config/rituals';
import { useRituals } from '../hooks/useRituals';
import { useCustomActivities } from '../hooks/useCustomActivities';
import { pickDistraction } from '../components/dial/movements/pickDistraction';
import { pickVariant } from '../components/dial/movements/movements';
import haptics from '../utils/haptics';

// Immersion (cadrage 3c) : durée du fondu chrome ↔ décor, et l'échelle que
// prend le disque quand il devient décor plein cadre.
const IMMERSION_FADE_MS = 600;
const IMMERSION_DIAL_SCALE = 1.12;

const ACTIVITY_SIZE = rs(40, 'min');
const COLOR_DOT_SIZE = rs(26, 'min');

function CompactRow({ onActivityTouch, onColorTouch }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();
  const {
    timer: { currentActivity },
    palette: { currentColor, paletteColors },
    setCurrentActivity,
    setCurrentDuration,
    setSelectedSoundId,
    setColorByValue,
    setColorIndex,
  } = useTimerConfig();
  // porte-2 (retour Eric « activer un rituel demande 3 taps ») : la rangée
  // d'accueil montre les 3 rituels FAVORIS — le lançable, pas l'atome. Un
  // tap = activité + couleur + durée + son, tout est prêt (la signature
  // remonte à la surface). Créer/étoiler un rituel met la rangée à jour
  // (même store useRituals). Les couleurs restent à côté : réglage en direct.
  const { favoriteRituals } = useRituals();
  const { customActivities } = useCustomActivities();

  const styles = StyleSheet.create({
    activityButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.chipBorder,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: ACTIVITY_SIZE,
      justifyContent: 'center',
      width: ACTIVITY_SIZE,
    },
    activityButtonActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    activityEmoji: {
      fontSize: rs(20, 'min'),
    },
    colorDot: {
      borderColor: theme.colors.shadow,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: COLOR_DOT_SIZE,
      padding: 3,
      width: COLOR_DOT_SIZE,
    },
    colorDotActive: {
      borderColor: theme.colors.text,
      borderWidth: 2,
    },
    colorDotInner: {
      borderRadius: theme.borderRadius.round,
      flex: 1,
    },
    row: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      ...theme.shadow('sm'),
    },
    separator: {
      backgroundColor: theme.colors.border,
      height: rs(24, 'min'),
      marginHorizontal: theme.spacing.xxs,
      width: StyleSheet.hairlineWidth * 2,
    },
  });

  return (
    <View style={styles.row}>
      {favoriteRituals.map((ritual) => {
        const payload = buildRitualApplyPayload(ritual, customActivities);
        const isActive = currentActivity?.id === payload.activity?.id;
        return (
          <TouchableOpacity
            key={ritual.id}
            testID={`ritual.item.${ritual.id}`}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.applyRitual', {
              name: ritual.name,
            })}
            accessibilityState={{ selected: isActive }}
            style={[styles.activityButton, isActive && styles.activityButtonActive]}
            onPress={() => {
              haptics.impact('light').catch(() => {});
              setCurrentActivity(payload.activity);
              setCurrentDuration(payload.duration);
              setSelectedSoundId(payload.soundId);
              setColorByValue(payload.color);
              analytics.trackActivitySelected(payload.activity?.id);
              onActivityTouch?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.activityEmoji}>{payload.activity?.emoji}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.separator} />

      {paletteColors.map((color, index) => (
        <TouchableOpacity
          key={color}
          testID={`palette.dot.${index}`}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.colorNumber', { number: index + 1 })}
          accessibilityState={{ selected: currentColor === color }}
          style={[
            styles.colorDot,
            currentColor === color && styles.colorDotActive,
          ]}
          onPress={() => {
            haptics.selection().catch(() => {});
            setColorIndex(index);
            analytics.trackColorSelected(color);
            onColorTouch?.();
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.colorDotInner, { backgroundColor: color }]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Dé Distraction (verdicts CD 25/07 + MOT-f Lot 3a) : rejoint la FAMILLE des
// contrôles — même carte blanche arrondie que la rangée (CompactRow.row),
// plus un cercle flottant orphelin. Masqué en Focus (inchangé, géré par le
// parent). Le tirage/timeout vit dans TimerScreen (`onDistraction`, lifté
// pour redescendre jusqu'à PulseButton via TimeTimer → TimerDial →
// DialCenter) — ce composant reste un déclencheur sobre, sans état.
function DistractionButton({ showLabel, onDistraction }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      paddingHorizontal: showLabel ? theme.spacing.sm : rs(13, 'min'),
      paddingVertical: theme.spacing.xs,
      ...theme.shadow('sm'),
    },
    emoji: {
      fontSize: rs(22, 'min'),
    },
    label: {
      color: theme.colors.text,
      fontSize: rs(13, 'min'),
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      testID="timer.dice"
      accessible
      accessibilityRole="button"
      accessibilityLabel={t('accessibility.distraction')}
      activeOpacity={0.7}
      onPress={() => {
        analytics.trackDiceRolled();
        onDistraction?.();
      }}
    >
      <Text style={styles.emoji}>🎲</Text>
      {showLabel && <Text style={styles.label}>{t('controls.distraction.tryMe')}</Text>}
    </TouchableOpacity>
  );
}

function formatTime(totalSecondsRaw) {
  const totalSeconds = Math.floor(totalSecondsRaw);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// C6.2 (fidélité au rendu) : temps digital toujours monté EN HAUT d'écran,
// hors du bloc centré — le start ne déplace plus rien sous le disque
// (remplace l'ancien DigitalTimer conditionnel sur `running`, seule source
// du saut de layout repos→séance).
// hotfix-porte-1 B3/D3 : pur affichage, plus de tap ici — montrer/masquer
// vit dans le sheet (toggle `showTime` existant, AsideZone). Masqué : ni le
// temps ni le glyphe ⏱ ne montent (plus de `••:••` fantôme).
function TopTime({ seconds }) {
  const theme = useTheme();
  const { display: { showTime } } = useTimerConfig();

  const styles = StyleSheet.create({
    text: {
      // brand.neutral donnait 2.37:1 sur le fond crème (#F4EFE7) — bien sous
      // WCAG AA (4.5:1), quasi illisible à 13px (trouvé en retest Eric,
      // rapporté comme "timer invisible"). textSecondary : 5.41:1.
      // Verdicts CD (25/07) : ui-monospace 700, encre douce #5A5147
      // (= textSecondary), interlettre 0.03em — se distingue du wall-clock.
      color: theme.colors.textSecondary,
      fontSize: rs(22, 'min'),
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
      letterSpacing: rs(22, 'min') * 0.03,
    },
    glyph: {
      color: theme.colors.textLight,
      fontSize: rs(12, 'min'),
      marginRight: 6,
    },
    // porte-2 (retour Eric ×2 « trop haut, aucun design, le cadran bouge ») :
    // 1) SLOT à hauteur CONSTANTE, toujours monté — montrer/masquer ne
    //    déplace plus jamais le cadran (l'ancien `return null` retirait
    //    l'espace réservé) ;
    // 2) descendu du bord (paddingTop lg) ;
    // 3) habillé famille : la pill blanche des contrôles (CompactRow, dé).
    slot: {
      alignItems: 'center',
      height: rs(64, 'min'),
      justifyContent: 'center',
      paddingTop: theme.spacing.lg,
    },
    pill: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xxs,
      ...theme.shadow('sm'),
    },
  });

  return (
    <View style={styles.slot} testID="timer.digital">
      {showTime && (
        <View style={styles.pill}>
          <Text style={styles.glyph}>⏱</Text>
          <Text style={styles.text}>{formatTime(seconds)}</Text>
        </View>
      )}
    </View>
  );
}

// Focus, affûté C6.2 (fidélité au rendu) : hint discret ANCRÉ EN BAS
// d'écran (plus centré sous le disque — hors du bloc centré `content`,
// donc son montage/démontage ne déplace jamais le dial), i18n (fin de
// l'exception hardcode C4).
function FocusHint() {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    hint: {
      // Même correctif que TopTime : brand.neutral = 2.37:1 sur le fond
      // crème, sous WCAG AA. textSecondary = 5.41:1.
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      textAlign: 'center',
    },
    wrap: {
      alignItems: 'center',
      // Au-dessus de la poignée du sheet fermé (~60px + safe area) — à
      // spacing.lg le hint se cachait DERRIÈRE elle (zIndex AsideZone
      // supérieur) : invisible en Focus repos (boucle visuelle pilote 25/07).
      bottom: rs(96, 'min'),
      left: 0,
      position: 'absolute',
      right: 0,
    },
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.hint}>{t('focus.hint')}</Text>
    </View>
  );
}

function TimerScreenContent() {
  const theme = useTheme();
  const analytics = useAnalytics();
  const {
    mode: { current: currentMode },
    setMode,
    timer: { currentDuration, currentActivity },
  } = useTimerConfig();
  const isFocus = currentMode === 'focus';
  // porte-2 (retour Eric « le mode horizontal est complètement raté ») :
  // en paysage l'écran devient une RANGÉE — disque à gauche, chrome en
  // colonne à droite. La colonne empilée débordait et clippait le disque.
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape = winW > winH;

  // Double-tap fond → bascule Focus (verdicts CD 25/07). Ignoré 1,5s après
  // un retour AppState 'active' (anti-poche/réveil). Non destructif : ne
  // touche jamais au timer (bascule uniquement le réglage global `mode`).
  const lastActiveAtRef = useRef(Date.now());
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        lastActiveAtRef.current = Date.now();
      }
    });
    return () => subscription.remove();
  }, []);

  const handleBackgroundDoubleTap = useCallback(() => {
    if (Date.now() - lastActiveAtRef.current < 1500) {
      return;
    }
    haptics.selection().catch(() => {});
    if (!isFocus) {
      analytics.trackFocusEntered('double_tap');
    }
    setMode(isFocus ? 'mixte' : 'focus');
  }, [isFocus, setMode, analytics]);

  // GestureDetector posé en ancêtre du contenu (cf. return) : les vues
  // interactives descendantes (TimeTimer, CompactRow, dé, AsideZone — chacune
  // avec son propre geste/Touchable) captent le toucher dans leurs propres
  // bornes en premier ; seul le fond nu (hors disque, rangée, dé, sheet)
  // laisse remonter ce Tap. Un drag (sheet ou cadran) dépasse le seuil de
  // déplacement du Tap et le fait échouer naturellement — pas de conflit.
  const backgroundDoubleTap = useMemo(() =>
    Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(300)
      .onEnd((_event, success) => {
        'worklet';
        if (success) {
          runOnJS(handleBackgroundDoubleTap)();
        }
      }),
  [handleBackgroundDoubleTap]
  );

  // Première fois (Lot 2, C7) — flag persisté + moment dérivé de la
  // progression réelle du rituel en construction (cf. useFirstRun).
  const firstRun = useFirstRun();
  const [barAnchor, setBarAnchor] = useState(null);
  const [dialAnchor, setDialAnchor] = useState(null);
  const initialDurationRef = useRef(currentDuration);
  const hasCompletedFirstRunRef = useRef(false);
  const barRef = useRef(null);

  // Pastille « surprends-moi » (verdicts CD 25/07) : un seul affichage, au
  // tout premier montage post-première-fois — flag persisté distinct de
  // useFirstRun (ne se rejoue jamais). Disparaît au premier geste sur
  // l'écran (onTouchStart racine, cf. return) ou après 4 s.
  const [hasSeenDistractionLabel, setHasSeenDistractionLabel, distractionLabelLoading] =
    usePersistedState('@ResetPulse:hasSeenDistractionLabel', false);
  const [showDistractionLabel, setShowDistractionLabel] = useState(false);

  useEffect(() => {
    if (distractionLabelLoading || hasSeenDistractionLabel) {
      return;
    }
    setShowDistractionLabel(true);
    const timeout = setTimeout(() => {
      setShowDistractionLabel(false);
      setHasSeenDistractionLabel(true);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [distractionLabelLoading, hasSeenDistractionLabel]);

  const dismissDistractionLabel = useCallback(() => {
    setShowDistractionLabel((wasShown) => {
      if (wasShown) {
        setHasSeenDistractionLabel(true);
      }
      return false;
    });
  }, [setHasSeenDistractionLabel]);

  // Distraction MOT-f (Lot 3a) : tap → mouvement aléatoire ~2 s, jamais deux
  // fois le même d'affilée (pickDistraction), retour à l'anim de séance.
  // N'affecte ni durée ni timer — aucun contact avec useTimer/timerRef.
  // `lastDistractionRef` survit au reset à null (pas cleared au timeout) :
  // c'est la mémoire "dernier mouvement montré", pas l'état d'affichage —
  // sinon deux taps espacés de plus de 2s pourraient répéter le même MOT.
  // Exclusions du tirage : dernier montré + mouvement de l'activité + `breathe`
  // (pouls ambiant du repos) — garantit un changement VISIBLE à chaque tap,
  // quel que soit l'état du timer (l'état running vit dans TimeTimer, pas ici ;
  // exclure les deux ambiants possibles évite de le faire remonter).
  const [distraction, setDistraction] = useState(null);
  const lastDistractionRef = useRef(null);
  const distractionTimeoutRef = useRef(null);

  const handleDistraction = useCallback(() => {
    if (distractionTimeoutRef.current) {
      clearTimeout(distractionTimeoutRef.current);
    }
    const next = pickDistraction([
      lastDistractionRef.current,
      currentActivity?.movement,
      'breathe',
    ]);
    lastDistractionRef.current = next;
    // Double tirage (retour Eric) : le mouvement ET son intensité — même MOT,
    // effet différent d'un tap à l'autre (Tourne 90° ou 360°, Flotte jusqu'à
    // la disparition totale…).
    setDistraction({ movement: next, variant: pickVariant(next) });
    haptics.selection().catch(() => {});
    distractionTimeoutRef.current = setTimeout(() => {
      setDistraction(null);
      distractionTimeoutRef.current = null;
    }, 2000);
  }, [currentActivity]);

  useEffect(() => () => {
    if (distractionTimeoutRef.current) {
      clearTimeout(distractionTimeoutRef.current);
    }
  }, []);

  const handleBarLayout = useCallback(() => {
    barRef.current?.measureInWindow((x, y, width, height) => {
      setBarAnchor({ x, y, width, height });
    });
  }, []);

  const handleDialRef = useCallback((node) => {
    if (!node) {
      return;
    }
    // measureInWindow juste après le layout initial (dial monté en continu,
    // cf. header) — mesure approximative, suffisante pour un tip ancré.
    requestAnimationFrame(() => {
      node.measureInWindow?.((x, y, width, height) => {
        setDialAnchor({ x, y, width, height });
      });
    });
  }, []);

  // Cadran touché (moment 2 → 3) : détecté via l'écart à la durée observée
  // au montage — pas de plomberie neuve sur le geste de drag (TimerDial
  // intouché). Repli permissif : une couleur choisie saute direct au
  // moment 4 (cf. useFirstRun), donc cette détection reste secondaire.
  useEffect(() => {
    if (currentDuration !== initialDurationRef.current) {
      firstRun.markDialTouched();
    }
  }, [currentDuration]);

  // Pont écran ↔ state machine récoltée (useTimer, via TimeTimer.onTimerRef).
  // Aucune logique de séance neuve : on lit running/isCompleted/remaining tels
  // que la machine ADR-007 les produit déjà, pour piloter l'affichage sous le
  // disque et le tap (start / stop-rembobinage / reset).
  const timerRef = useRef(null);
  const [snapshot, setSnapshot] = useState({
    running: false,
    remaining: 0,
    isCompleted: false,
    displayMessage: '',
  });

  // ADR-014 : ne bloque jamais rien — démarrer le timer complète la
  // Première fois à N'IMPORTE QUEL moment (pas seulement au moment 4).
  useEffect(() => {
    if (snapshot.running && !hasCompletedFirstRunRef.current && !firstRun.hasSeenFirstRun) {
      hasCompletedFirstRunRef.current = true;
      firstRun.completeFirstRun();
    }
  }, [snapshot.running]);

  const handleTimerRef = useCallback((timer) => {
    timerRef.current = timer;
    setSnapshot((prev) => {
      if (
        prev.running === timer.running &&
        prev.remaining === timer.remaining &&
        prev.isCompleted === timer.isCompleted &&
        prev.displayMessage === timer.displayMessage
      ) {
        return prev;
      }
      return {
        running: timer.running,
        remaining: timer.remaining,
        isCompleted: timer.isCompleted,
        displayMessage: timer.displayMessage,
      };
    });
  }, []);

  const handleDialTap = useCallback(() => {
    const timer = timerRef.current;
    if (!timer) {
      return;
    }
    if (timer.isCompleted) {
      timer.resetTimer();
    } else if (timer.running) {
      timer.stopTimer(); // ADR-007 : tap pendant la séance = rembobinage
    } else {
      timer.startTimer();
    }
  }, []);

  // Immersion (cadrage 3c) : RUNNING + IMMERSION_DELAY sans toucher → le
  // chrome s'efface, le disque devient décor. Machine d'état extraite
  // (useSessionImmersion) — ce composant ne fait qu'observer running/
  // isCompleted et piloter le fondu/l'échelle à l'écran.
  // porte-3 V2 (verdict Eric) : FOCUS UNIQUEMENT — en standard, l'immersion
  // imposait un Focus de fait et cachait le changement de couleur en direct
  // (le cœur de la signature). Gaté à la source : hors Focus la machine ne
  // s'arme jamais (et sortir de Focus en séance dissout l'immersion).
  const { immersed, registerActivity } = useSessionImmersion({
    running: snapshot.running && isFocus,
    isCompleted: snapshot.isCompleted,
  });

  const immersionValue = useSharedValue(0);
  useEffect(() => {
    immersionValue.value = withTiming(immersed ? 1 : 0, { duration: IMMERSION_FADE_MS });
  }, [immersed, immersionValue]);

  // Chrome (TopTime, rangée compacte, dé) : fondu d'opacité pur — le layout
  // garde sa place réservée, seul le disque se recentre par transform (cf.
  // dialAnimatedStyle) pour ne jamais faire rejouer la géométrie SVG.
  const chromeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - immersionValue.value,
  }));

  // Hauteurs mesurées du chrome au-dessus/en-dessous du disque (TopTime vs
  // message+rangée+dé) — recentrage vertical du disque en immersion, PUR
  // transform (translateY + scale), zéro redraw du dial (TimerDial/SVG
  // intouchés). Se remesure naturellement à la rotation (onLayout).
  const [aboveChromeHeight, setAboveChromeHeight] = useState(0);
  const [belowChromeHeight, setBelowChromeHeight] = useState(0);
  // Paysage : chromeBelow est À CÔTÉ du disque (rangée), pas dessous — seul
  // TopTime compte dans le recentrage d'immersion.
  const dialOffsetY = isLandscape
    ? aboveChromeHeight / 2
    : (aboveChromeHeight - belowChromeHeight) / 2;

  const dialAnimatedStyle = useAnimatedStyle(() => {
    const t = immersionValue.value;
    return {
      transform: [
        { translateY: t * dialOffsetY },
        { scale: 1 + t * (IMMERSION_DIAL_SCALE - 1) },
      ],
    };
  }, [dialOffsetY]);

  const handleRootTouchStart = useCallback(() => {
    dismissDistractionLabel();
    registerActivity();
  }, [dismissDistractionLabel, registerActivity]);

  const styles = StyleSheet.create({
    completionMessage: {
      color: theme.colors.textSecondary, // encre douce — le vert générique est mort (verdicts CD Q5)
      fontSize: rs(18, 'min'),
      fontWeight: '600',
      textAlign: 'center',
    },
    completionMessageHidden: {
      opacity: 0,
    },
    completionMessageWrap: {
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
      minHeight: rs(24, 'min'),
    },
    container: {
      flex: 1,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      flexDirection: isLandscape ? 'row' : 'column',
      gap: isLandscape ? theme.spacing.lg : 0,
      justifyContent: 'center',
    },
    // Wrappers du chrome fondu en immersion : `alignItems: center` préserve
    // le comportement d'avant (chaque bloc centré, taille intrinsèque) —
    // sans lui, le groupement sous un seul Animated.View les ferait
    // s'étirer en largeur (`stretch`, défaut flexbox).
    chromeAbove: {
      alignItems: 'center',
    },
    chromeBelow: {
      alignItems: 'center',
    },
    // Overlay de sortie d'immersion (cadrage 3c) : monté SEULEMENT quand
    // immersed — au-dessus de tout (AsideZone = zIndex 50), il capte le
    // PREMIER toucher pour qu'il n'atteigne jamais le disque (sinon
    // stop-rembobinage involontaire, destructif).
    immersionOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 100,
    },
  });

  // Temps digital (top bar) : restant en séance/fin, durée réglée au repos —
  // toujours le même élément, seuls les chiffres changent (zéro saut).
  const topTimeSeconds = snapshot.running || snapshot.isCompleted
    ? snapshot.remaining
    : currentDuration;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      onTouchStart={handleRootTouchStart}
    >
      {/* Fond nu = zone du double-tap (hors disque/rangée/dé/sheet, chacun
          capte son propre toucher avant qu'il ne remonte ici). */}
      <GestureDetector gesture={backgroundDoubleTap}>
        <View style={styles.container}>
          {!isFocus && (
            <Animated.View
              style={[styles.chromeAbove, chromeAnimatedStyle]}
              onLayout={(e) => setAboveChromeHeight(e.nativeEvent.layout.height)}
              pointerEvents={immersed ? 'none' : 'auto'}
            >
              <TopTime seconds={topTimeSeconds} />
            </Animated.View>
          )}
          <View style={styles.content}>
            {/* Le disque devient décor en immersion : transform pur
                (scale + recentrage vertical), zéro redraw du dial. */}
            <Animated.View style={dialAnimatedStyle}>
              <TimeTimer
                onDialTap={handleDialTap}
                onTimerRef={handleTimerRef}
                onDialRef={handleDialRef}
                distraction={distraction}
              />
            </Animated.View>
            {!isFocus && (
              <Animated.View
                style={[styles.chromeBelow, chromeAnimatedStyle]}
                onLayout={(e) => setBelowChromeHeight(e.nativeEvent.layout.height)}
                pointerEvents={immersed ? 'none' : 'auto'}
              >
                <View style={styles.completionMessageWrap}>
                  <Text
                    style={[styles.completionMessage, !snapshot.isCompleted && styles.completionMessageHidden]}
                    numberOfLines={1}
                  >
                    {snapshot.displayMessage || ' '}
                  </Text>
                </View>
                <View ref={barRef} onLayout={handleBarLayout}>
                  <CompactRow
                    onActivityTouch={firstRun.markActivityTouched}
                    onColorTouch={firstRun.markColorTouched}
                  />
                </View>
                <DistractionButton
                  showLabel={showDistractionLabel}
                  onDistraction={handleDistraction}
                />
              </Animated.View>
            )}
          </View>
          {isFocus && !snapshot.running && !snapshot.isCompleted && <FocusHint />}
          <AsideZone isTimerRunning={snapshot.running} hidden={immersed} />
          {!isFocus && (
            <FirstRunTips
              moment={firstRun.moment}
              barAnchor={barAnchor}
              dialAnchor={dialAnchor}
              onSkip={firstRun.skipFirstRun}
            />
          )}
          {/* Sortie d'immersion (cadrage 3c Q1) : premier toucher CONSOMMÉ
              ici, jamais transmis au disque. */}
          {immersed && (
            <Pressable
              testID="immersion.overlay"
              accessible={false}
              style={styles.immersionOverlay}
              onPressIn={registerActivity}
            />
          )}
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}

export default function TimerScreen() {
  return (
    <SafeAreaProvider>
      <TimerScreenContent />
    </SafeAreaProvider>
  );
}
