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
import { AppState, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from '../hooks/useTranslation';
import { useFirstRun } from '../hooks/useFirstRun';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAnalytics } from '../hooks/useAnalytics';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import AsideZone from '../components/layout/AsideZone';
import FirstRunTips from '../components/first-run/FirstRunTips';
import { getFreeActivities } from '../config/activities';
import { pickDistraction } from '../components/dial/movements/pickDistraction';
import haptics from '../utils/haptics';

const FREE_ACTIVITIES = getFreeActivities();
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
    setColorIndex,
  } = useTimerConfig();

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
      {FREE_ACTIVITIES.map((activity) => {
        const isActive = currentActivity?.id === activity.id;
        return (
          <TouchableOpacity
            key={activity.id}
            testID={`activity.item.${activity.id}`}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.activity', {
              name: activity.label,
            })}
            accessibilityState={{ selected: isActive }}
            style={[styles.activityButton, isActive && styles.activityButtonActive]}
            onPress={() => {
              haptics.selection().catch(() => {});
              setCurrentActivity(activity);
              analytics.trackActivitySelected(activity.id);
              onActivityTouch?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
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
function TopTime({ seconds }) {
  const theme = useTheme();
  const t = useTranslation();
  const { display: { showTime }, setShowTime } = useTimerConfig();

  const styles = StyleSheet.create({
    text: {
      // brand.neutral donnait 2.37:1 sur le fond crème (#F4EFE7) — bien sous
      // WCAG AA (4.5:1), quasi illisible à 13px (trouvé en retest Eric,
      // rapporté comme "timer invisible"). textSecondary : 5.41:1.
      // Verdicts CD (25/07) : ui-monospace 700 26px, encre douce #5A5147
      // (= textSecondary), interlettre 0.03em — se distingue du wall-clock.
      color: theme.colors.textSecondary,
      fontSize: rs(26, 'min'),
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
      letterSpacing: rs(26, 'min') * 0.03,
    },
    glyph: {
      color: theme.colors.textLight,
      fontSize: rs(12, 'min'),
      marginRight: 6,
    },
    wrap: {
      alignItems: 'center',
      paddingTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        testID="timer.digital"
        onPress={() => {
          haptics.selection().catch(() => {});
          setShowTime(!showTime);
        }}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={showTime
          ? t('controls.digitalTimer.timeLabel', { time: formatTime(seconds) })
          : t('controls.digitalTimer.showTime')}
        accessibilityHint={showTime ? t('controls.digitalTimer.tapToHide') : t('controls.digitalTimer.tapToShow')}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Text style={styles.glyph}>⏱</Text>
          <Text style={styles.text}>{showTime ? formatTime(seconds) : '••:••'}</Text>
        </View>
      </TouchableOpacity>
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
  const [distractionMovement, setDistractionMovement] = useState(null);
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
    setDistractionMovement(next);
    haptics.selection().catch(() => {});
    distractionTimeoutRef.current = setTimeout(() => {
      setDistractionMovement(null);
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
      justifyContent: 'center',
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
      onTouchStart={dismissDistractionLabel}
    >
      {/* Fond nu = zone du double-tap (hors disque/rangée/dé/sheet, chacun
          capte son propre toucher avant qu'il ne remonte ici). */}
      <GestureDetector gesture={backgroundDoubleTap}>
        <View style={styles.container}>
          {!isFocus && <TopTime seconds={topTimeSeconds} />}
          <View style={styles.content}>
            <TimeTimer
              onDialTap={handleDialTap}
              onTimerRef={handleTimerRef}
              onDialRef={handleDialRef}
              distractionMovement={distractionMovement}
            />
            {!isFocus && (
              <View style={styles.completionMessageWrap}>
                <Text
                  style={[styles.completionMessage, !snapshot.isCompleted && styles.completionMessageHidden]}
                  numberOfLines={1}
                >
                  {snapshot.displayMessage || ' '}
                </Text>
              </View>
            )}
            {!isFocus && (
              <View ref={barRef} onLayout={handleBarLayout}>
                <CompactRow
                  onActivityTouch={firstRun.markActivityTouched}
                  onColorTouch={firstRun.markColorTouched}
                />
              </View>
            )}
            {!isFocus && (
              <DistractionButton
                showLabel={showDistractionLabel}
                onDistraction={handleDistraction}
              />
            )}
          </View>
          {isFocus && !snapshot.running && !snapshot.isCompleted && <FocusHint />}
          <AsideZone isTimerRunning={snapshot.running} />
          {!isFocus && (
            <FirstRunTips
              moment={firstRun.moment}
              barAnchor={barAnchor}
              dialAnchor={dialAnchor}
              onSkip={firstRun.skipFirstRun}
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
