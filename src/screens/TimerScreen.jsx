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
import { useDormantTips } from '../hooks/useDormantTips';
import { useBorrowCoach, resolveCoachChannel } from '../hooks/useBorrowCoach';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSessionImmersion } from '../hooks/useSessionImmersion';
import { useLiveActivity } from '../hooks/useLiveActivity';
import { rs } from '../styles/responsive';
import TimeTimer from '../components/dial/TimeTimer';
import AsideZone, { CLOSED_VISIBLE } from '../components/layout/AsideZone';
import FirstRunTips from '../components/first-run/FirstRunTips';
import FirstRunThreshold from '../components/first-run/FirstRunThreshold';
import { buildRitualApplyPayload, findRitualToKeep, deriveRitualName } from '../config/rituals';
import { useRituals } from '../hooks/useRituals';
import { useCustomActivities } from '../hooks/useCustomActivities';
import { useSessionCount } from '../hooks/useSessionCount';
import { usePaletteGating } from '../hooks/usePaletteGating';
import { useSoundGating } from '../hooks/useSoundGating';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useModalStack } from '../contexts/ModalStackContext';
import { getPaletteInfo } from '../config/timer-palettes';
import { getSoundById } from '../config/sounds';
import { pickDistraction } from '../components/dial/movements/pickDistraction';
import { pickVariant } from '../components/dial/movements/movements';
import { shouldShowBreatheInvitation } from '../utils/breatheInvitation';
import haptics from '../utils/haptics';

// Immersion (cadrage 3c) : durée du fondu chrome ↔ décor, et l'échelle que
// prend le disque quand il devient décor plein cadre.
const IMMERSION_FADE_MS = 600;
const IMMERSION_DIAL_SCALE = 1.12;

// Seuil composé Focus (P2-Focus, réponses §4 CD validées) : une séance
// pleine >= cette durée compte comme « longue » pour resolveDormantTip
// (cf. useDormantTips) — posé ICI (pas dans useTimer, sacré) car ce fichier
// connaît déjà la durée pleine du Moment accompli (cf. handleKeepMomentTap).
const LONG_SESSION_THRESHOLD_SECONDS = 1800; // 30 minutes

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
              analytics.trackRitualApplied('home_row');
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

// Canal du coach (Lambda C, généralisé Lambda V) : même famille visuelle
// que le dé (pill blanche, ombre légère) — une ligne discrète, jamais un
// mur. Base partagée entre les astuces dormantes et les lignes du prêt.
// Tappable seulement quand onPress est fourni (ligne de retour d'emprunt :
// la LIGNE ENTIÈRE ouvre la modale Ambiances) — sinon View muette, comme
// l'astuce d'origine.
function CoachPill({ text, onPress, testID }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    pill: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.round,
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      ...theme.shadow('sm'),
    },
    text: {
      color: theme.colors.text,
      fontSize: rs(12, 'min'),
      textAlign: 'center',
    },
  });

  if (!text) {
    return null;
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.pill}
        testID={testID}
        onPress={onPress}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.pill} testID={testID}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

// Astuce dormante v1 (ADR-016 §4, Lambda C) — habillage inchangé, rendue
// via la base CoachPill. Textes i18n FLAGGÉS pour review Claude design
// (formulation provisoire, cf. dormantTips.palettes/focus dans locales/).
// Cas spécial `ritualsRow` (mandat W, P1-8) : troisième tip résolu par
// useDormantTips, mais sa clé i18n vit sous `coach.*` (demandé tel quel par
// le mandat — cohérence avec les autres lignes du canal coach) plutôt que
// `dormantTips.*` — seule cette bascule de namespace justifie le if.
function DormantTipPill({ tip }) {
  const t = useTranslation();

  if (!tip) {
    return null;
  }

  if (tip === 'ritualsRow') {
    return <CoachPill text={t('coach.ritualsRow')} testID="coach.ritualsRow" />;
  }

  return <CoachPill text={t(`dormantTips.${tip}`)} testID={`dormantTip.${tip}`} />;
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
  const t = useTranslation();
  const analytics = useAnalytics();
  const { completedSessions, incrementSessionCount, isLoading: sessionCountLoading } = useSessionCount();
  const { isPremium } = usePremiumStatus();
  const modalStack = useModalStack();
  // Soft-gating palettes (Lot 3b) : mémoire du dernier inclus + retour au
  // lancement si FREE et Ambiances actif — monté une fois ici, cf.
  // usePaletteGating. Lambda V : la retombée exposée nourrit le coach
  // (« %{name} est rentrée »), cf. useBorrowCoach plus bas.
  const { returnedPalette } = usePaletteGating();
  // Soft-gating sons (Lambda L, miroir palettes) — hook séparé, même
  // mécanique, domaine indépendant. Cf. useSoundGating.
  const { returnedSoundId } = useSoundGating();
  const {
    mode: { current: currentMode },
    setMode,
    timer: { currentDuration, currentActivity, selectedSoundId, clockwise },
    palette: { currentColor },
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
  // Différé du raccord snapshot (fix « Maximum update depth exceeded »,
  // lot-fix-drag) : voir handleTimerRef ci-dessous pour le mécanisme.
  const pendingSnapshotTimeoutRef = useRef(null);
  const [snapshot, setSnapshot] = useState({
    running: false,
    remaining: 0,
    isCompleted: false,
    displayMessage: '',
  });

  // Purge le différé en vol au démontage — pas de setState après unmount.
  useEffect(() => {
    return () => {
      if (pendingSnapshotTimeoutRef.current != null) {
        clearTimeout(pendingSnapshotTimeoutRef.current);
      }
    };
  }, []);

  // ADR-014 : ne bloque jamais rien — démarrer le timer complète la
  // Première fois à N'IMPORTE QUEL moment (pas seulement au moment 4).
  // Ce point de passage n'a lieu qu'UNE fois dans la vie de l'app (garde
  // !hasSeenFirstRun) : c'est aussi le premier démarrage de timer, donc le
  // point de mesure `first_moment_started` (ADR-016 §6).
  useEffect(() => {
    if (snapshot.running && !hasCompletedFirstRunRef.current && !firstRun.hasSeenFirstRun) {
      hasCompletedFirstRunRef.current = true;
      firstRun.completeFirstRun();
      analytics.trackFirstMomentStarted();
    }
  }, [snapshot.running]);

  // Applique le snapshot depuis timerRef.current — jamais depuis l'argument
  // reçu au moment de la programmation : au moment où ce différé s'exécute,
  // timerRef.current porte toujours la valeur la PLUS FRAÎCHE (une
  // notification plus récente a pu arriver et annuler ce différé pour le
  // remplacer par le sien, cf. handleTimerRef).
  const applySnapshotFromRef = useCallback(() => {
    pendingSnapshotTimeoutRef.current = null;
    const timer = timerRef.current;
    if (!timer) {
      return;
    }
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

  const handleTimerRef = useCallback(
    (timer) => {
      // Synchrone et immédiat : handleDialTap (tap start/stop/reset) lit
      // timerRef.current directement, sans attendre le différé ci-dessous.
      timerRef.current = timer;

      // Casse la chaîne imbriquée (mandat lot-fix-drag) : TimeTimer notifie
      // depuis un effet passif ; en drag rapide au repos, `remaining` change
      // RÉELLEMENT à chaque frame (pas de bail possible), donc chaque
      // notification programmait un setSnapshot synchrone dans la même
      // chaîne de rendus imbriqués — React finissait par dépasser son
      // compteur de 50 mises à jour imbriquées (crash « Maximum update depth
      // exceeded »). setTimeout(0) — plutôt qu'une microtâche — sort
      // GARANTI de la tâche JS en cours (donc du décompte de React) : au tick
      // suivant de la boucle d'événements, il ne reste plus de chaîne
      // synchrone à casser.
      // Une seule mise à jour en vol : une notification plus fraîche annule
      // le différé précédent (jamais deux setSnapshot empilés pour un même
      // geste).
      if (pendingSnapshotTimeoutRef.current != null) {
        clearTimeout(pendingSnapshotTimeoutRef.current);
      }
      pendingSnapshotTimeoutRef.current = setTimeout(applySnapshotFromRef, 0);
    },
    [applySnapshotFromRef],
  );

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

  // Seuil composé Focus (P2-Focus) : « 1re séance accomplie >= 30 min » —
  // posé une fois pour toutes (one-shot, jamais désarmé), lu par
  // resolveDormantTip via useDormantTips plus bas. Ajouté au Vanilla/
  // Découverte d'App.js.
  const [hadLongSession, setHadLongSession] = usePersistedState('@ResetPulse:hadLongSession', false);

  // Compteur global de séances (Lot 3b, mandat Eric) : callback de fin de
  // séance existant (useTimer → TimeTimer.onTimerComplete), jamais câblé
  // jusqu'ici. Ne se déclenche QUE sur la fin naturelle (remaining atteint
  // 0) — jamais au stop/rembobinage manuel (tap pendant la séance), cf.
  // useTimer.js:150 (onCompleteRef appelé uniquement dans la branche
  // hasTriggeredCompletion, pas dans stopTimer).
  const handleTimerComplete = useCallback(() => {
    // completedSessions vaut encore la valeur D'AVANT l'incrément ici (lu
    // depuis la closure) : 0 signifie que ce Moment est le tout premier
    // accompli de la vie de l'app — c'est le passage 0→1 (ADR-016 §6).
    if (completedSessions === 0) {
      analytics.trackFirstMomentCompleted();
    }
    incrementSessionCount();
    // Même lecture que handleKeepMomentTap : la durée PLEINE de la séance
    // qui vient de finir (timerRef.current.duration, pas snapshot.remaining
    // qui vaut 0 à la fin).
    const duration = timerRef.current?.duration ?? currentDuration;
    if (duration >= LONG_SESSION_THRESHOLD_SECONDS && !hadLongSession) {
      setHadLongSession(true);
    }
  }, [completedSessions, incrementSessionCount, analytics, currentDuration, hadLongSession, setHadLongSession]);

  // Invitation « fais-le respirer » (Lot 3b, mandat Eric) : jamais un mur —
  // une ligne discrète sous le message de fin, une seule fois dans la vie de
  // l'app (persistée, tappée ou non). Le flag se pose au moment de
  // l'AFFICHAGE, pas au tap (cf. shouldShowBreatheInvitation) ; un ref
  // "déjà déclenchée" garde la ligne visible cette occurrence-ci même après
  // que le flag persisté bascule à true (sinon elle disparaîtrait avant que
  // l'user ait pu la lire).
  const [hasSeenBreatheInvitation, setHasSeenBreatheInvitation, breatheInvitationLoading] =
    usePersistedState('@ResetPulse:hasSeenBreatheInvitation', false);
  const [breatheInvitationFired, setBreatheInvitationFired] = useState(false);
  const breatheInvitationFiredRef = useRef(false);

  useEffect(() => {
    if (breatheInvitationFiredRef.current) {
      return;
    }
    if (sessionCountLoading || breatheInvitationLoading) {
      return;
    }
    if (
      shouldShowBreatheInvitation({
        isCompleted: snapshot.isCompleted,
        isPremium,
        completedSessions,
        hasSeenInvitation: hasSeenBreatheInvitation,
      })
    ) {
      breatheInvitationFiredRef.current = true;
      setBreatheInvitationFired(true);
      analytics.trackAmbiancesInvitationShown('post_session');
      setHasSeenBreatheInvitation(true);
    }
  }, [
    snapshot.isCompleted,
    isPremium,
    completedSessions,
    hasSeenBreatheInvitation,
    sessionCountLoading,
    breatheInvitationLoading,
    analytics,
    setHasSeenBreatheInvitation,
  ]);

  // Visible seulement pendant que le message de fin l'est (elle en dépend
  // visuellement) — le flag "fired" reste vrai (mémoire de l'occurrence),
  // mais la ligne se tait avec le message dès qu'on quitte l'état complété.
  const showBreatheInvitation = breatheInvitationFired && snapshot.isCompleted;

  // Le ref + le flag persisté empêchent un nouveau DÉCLENCHEMENT — mais sans
  // ce reset, `breatheInvitationFired` reste vrai à vie une fois posé, et
  // `showBreatheInvitation` (ci-dessus) redeviendrait vrai à CHAQUE fin de
  // séance suivante (isCompleted recycle true→false→true). On relâche le
  // latch d'affichage à la sortie de l'état complété : « une fois, jamais
  // une campagne » porte sur ce qui se voit, pas seulement sur le tracking.
  useEffect(() => {
    if (!snapshot.isCompleted && breatheInvitationFired) {
      setBreatheInvitationFired(false);
    }
  }, [snapshot.isCompleted, breatheInvitationFired]);

  const handleBreatheInvitationTap = useCallback(() => {
    analytics.trackAmbiancesInvitationTapped('post_session');
    modalStack.push('premium', { highlightedFeature: 'breathe_invitation' });
  }, [analytics, modalStack]);

  // « garde ce moment ? » (ADR-016 §3) — naissance du Rituel, au sommet
  // émotionnel (fin du tout premier Moment). Même latch que l'invitation
  // Ambiances ci-dessus (fired + reset à la sortie de l'état complété).
  // Cohabitation : structurellement exclusive de showBreatheInvitation —
  // celle-ci exige completedSessions >= 2 (shouldShowBreatheInvitation),
  // celle-là exige completedSessions === 1 (le tout premier) : les deux
  // conditions ne peuvent jamais être vraies ensemble, même flag ou pas.
  const { rituals, updateRitual, createRitual, ensureRitualFavorite } = useRituals();
  const [hasSeenKeepMoment, setHasSeenKeepMoment, keepMomentLoading] =
    usePersistedState('@ResetPulse:hasSeenKeepMoment', false);
  const [keepMomentFired, setKeepMomentFired] = useState(false);
  const keepMomentFiredRef = useRef(false);
  // Confirmation discrète après le tap (« gardé ✨ ») — dure ce que dure
  // l'état complété, ne se repropose jamais (flag déjà posé à l'affichage).
  const [momentKept, setMomentKept] = useState(false);

  useEffect(() => {
    if (keepMomentFiredRef.current) {
      return;
    }
    if (sessionCountLoading || keepMomentLoading) {
      return;
    }
    if (snapshot.isCompleted && completedSessions === 1 && !hasSeenKeepMoment) {
      keepMomentFiredRef.current = true;
      setKeepMomentFired(true);
      setHasSeenKeepMoment(true);
    }
  }, [
    snapshot.isCompleted,
    completedSessions,
    hasSeenKeepMoment,
    sessionCountLoading,
    keepMomentLoading,
    setHasSeenKeepMoment,
  ]);

  const showKeepMoment = keepMomentFired && snapshot.isCompleted;

  useEffect(() => {
    if (!snapshot.isCompleted && keepMomentFired) {
      setKeepMomentFired(false);
      setMomentKept(false);
    }
  }, [snapshot.isCompleted, keepMomentFired]);

  const handleKeepMomentTap = useCallback(() => {
    if (momentKept) {
      return;
    }
    haptics.selection().catch(() => {});
    // La durée du Moment vécu = la durée TOTALE de la séance qui vient de
    // finir (timerRef.current.duration, exposé par useTimer) — PAS
    // `snapshot.remaining`, qui vaut 0 à la fin.
    const duration = timerRef.current?.duration ?? currentDuration;
    // ADR-017 §2 : « garder » ne touche plus jamais un template — crée ou
    // met à jour LE rituel personnel (slot 4) avec ce qui vient d'être vécu
    // (activité incluse : le rituel personnel existant peut être d'une
    // autre activité que celle-ci, findRitualToKeep ne matche plus par
    // activityId).
    const fields = {
      name: deriveRitualName(currentActivity),
      activityId: currentActivity?.id,
      color: currentColor,
      duration,
      soundId: selectedSoundId,
    };
    // ADR-017 §2 (décision pilote) : le rituel gardé doit apparaître SUR LA
    // RANGÉE D'ACCUEIL immédiatement — sinon le sommet émotionnel reste
    // invisible (constat Eric). Un rituel personnel naît en fin de tableau,
    // hors du repli implicite des 3 favoris (cf. ensureRitualFavorite) : il
    // faut l'élire explicitement, création ET mise à jour.
    const existingRitual = findRitualToKeep(rituals);
    if (existingRitual) {
      updateRitual(existingRitual.id, fields);
      ensureRitualFavorite(existingRitual.id);
    } else {
      const created = createRitual(fields);
      ensureRitualFavorite(created.id);
    }
    analytics.trackRitualKept();
    setMomentKept(true);
  }, [
    momentKept,
    rituals,
    currentActivity,
    currentColor,
    selectedSoundId,
    currentDuration,
    updateRitual,
    createRitual,
    ensureRitualFavorite,
    analytics,
  ]);

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

  // Live Activity (mission 3d) : écho de séance sur écran verrouillé +
  // Dynamic Island. Pur observateur de l'état déjà exposé ici (snapshot,
  // currentColor, currentActivity) — aucune logique neuve, aucun état
  // ajouté (cf. src/hooks/useLiveActivity.js). No-op silencieux hors iOS
  // 16.2+ (Android, Expo Go, device non éligible).
  useLiveActivity({
    running: snapshot.running,
    isCompleted: snapshot.isCompleted,
    duration: currentDuration,
    remaining: snapshot.remaining,
    colorHex: currentColor,
    emoji: currentActivity?.emoji,
    clockwise,
  });

  const immersionValue = useSharedValue(0);
  useEffect(() => {
    immersionValue.value = withTiming(immersed ? 1 : 0, { duration: IMMERSION_FADE_MS });
  }, [immersed, immersionValue]);

  // Astuces dormantes v1 (ADR-016 §4, Lambda C) : jamais pendant un Moment
  // qui tourne, jamais pendant la Première fois, jamais en immersion ni en
  // Focus — ce hook ne connaît aucune de ces conditions, elles vivent ici
  // (`enabled`), côté écran, comme prescrit par le brief.
  const canShowDormantTips =
    !snapshot.running && firstRun.hasSeenFirstRun && !immersed && !isFocus;
  // Sheet ouvert/fermé (QA visuelle #5, bug 2) : remonté par AsideZone
  // (`onOpenChange`) — l'emprunt Ambiances se fait TOUJOURS dedans, ouvert ;
  // useBorrowCoach en a besoin pour différer sa ligne à la fermeture (sinon
  // elle se consume derrière le sheet, invisible).
  const [sheetOpen, setSheetOpen] = useState(false);
  // La pédagogie du prêt (Lambda V) : mêmes gardes que les astuces
  // dormantes. Le prêt PRIME (il est contextuel à un geste) : tant qu'une
  // ligne coach parle, les astuces dormantes sont désarmées via `enabled`
  // — leur one-shot ne brûle pas dans le vide pendant que le prêt occupe
  // le canal (useDormantTips marque « montrée » dès la résolution).
  const borrowCoach = useBorrowCoach({
    enabled: canShowDormantTips,
    sheetOpen,
    returnedPalette,
    returnedSoundId,
  });
  // !snapshot.isCompleted dans `enabled` — ceinture ET bretelles avec le
  // garde déjà posé en tête de resolveDormantTip (cf. useDormantTips) :
  // depuis le seuil Focus composé, `focus` peut se résoudre dès la 1re
  // séance (hadLongSession) — exactement le moment où « garde ce moment ? »
  // occupe déjà la ligne de fin (completedSessions === 1). Sans ce garde,
  // une séance longue dès le 1er Moment ferait apparaître DEUX voix à la
  // fois (constat avisé en review, mandat W).
  const dormantTips = useDormantTips({
    enabled: canShowDormantTips && !borrowCoach.activeMessage && !snapshot.isCompleted,
    hadLongSession,
    isCompleted: snapshot.isCompleted,
  });
  const coachChannel = canShowDormantTips
    ? resolveCoachChannel({
      coachMessage: borrowCoach.activeMessage,
      dormantTip: dormantTips.activeTip,
    })
    : null;

  // Texte de la ligne coach — nom localisé pour les retours (get name()
  // des palettes, metadata des sons ; repli sur la clé brute, jamais vide).
  const coachMessage = borrowCoach.activeMessage;
  let coachMessageText = null;
  if (coachMessage?.type === 'paletteReturned') {
    coachMessageText = t('coach.paletteReturned', {
      name: getPaletteInfo(coachMessage.itemKey)?.name ?? coachMessage.itemKey,
    });
  } else if (coachMessage?.type === 'soundReturned') {
    coachMessageText = t('coach.soundReturned', {
      name: getSoundById(coachMessage.itemKey)?.name ?? coachMessage.itemKey,
    });
  } else if (coachMessage) {
    coachMessageText = t(`coach.${coachMessage.type}`);
  }

  // « la garder » / « le garder » : la ligne entière de retour ouvre la
  // modale Ambiances avec le héros 2c de l'item rentré (plomberie Lambda U).
  // L'emprunt (moment 1) reste une ligne muette au tap.
  const isCoachReturnMessage =
    coachMessage?.type === 'paletteReturned' || coachMessage?.type === 'soundReturned';
  const handleCoachPress = useCallback(() => {
    const message = borrowCoach.activeMessage;
    if (!message) {
      return;
    }
    if (message.type === 'paletteReturned') {
      modalStack.push('premium', {
        highlightedFeature: 'palettes',
        hero: { type: 'palette', paletteKey: message.itemKey },
      });
    } else if (message.type === 'soundReturned') {
      modalStack.push('premium', {
        highlightedFeature: 'sounds',
        hero: { type: 'sound', soundId: message.itemKey },
      });
    }
    borrowCoach.dismissActiveMessage();
  }, [borrowCoach.activeMessage, borrowCoach.dismissActiveMessage, modalStack]);

  // hasTriedFocus (Lambda C) : marqué au premier passage en Focus, quel que
  // soit le chemin (segmenté du sheet OU double-tap fond) — les deux
  // écrivent `currentMode` via TimerConfigContext, donc un seul effet ici
  // les capte tous.
  useEffect(() => {
    if (isFocus) {
      dormantTips.markFocusTried();
    }
  }, [isFocus]);

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
    dormantTips.dismissActiveTip();
    // Ne dismisse que l'emprunt — la ligne de retour est tappable, un
    // dismiss au touchStart annulerait son propre press (cf. useBorrowCoach).
    borrowCoach.handleScreenTouch();
    registerActivity();
  }, [dismissDistractionLabel, dormantTips, borrowCoach, registerActivity]);

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
    // Lot 3b : la hauteur réserve EN PERMANENCE la ligne d'invitation
    // Ambiances (opacity togglée comme completionMessage, jamais montée/
    // démontée) — sinon son apparition ferait grandir ce bloc, recentrerait
    // `content` (justifyContent: center) et ferait bouger le disque, ce que
    // ce fichier évite partout ailleurs (cf. TopTime, FocusHint). Coût :
    // quelques px d'espace toujours réservés sous le message de fin, même
    // pour qui ne verra jamais l'invitation.
    completionMessageWrap: {
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
      minHeight: rs(24, 'min') + rs(18, 'min'),
    },
    breatheInvitationText: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
      marginTop: rs(2, 'min'),
      textAlign: 'center',
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
    // Ancre de la ligne coach (bug 1, QA visuelle passe 5) : au-dessus de
    // la bande fermée du sheet (AsideZone, CLOSED_VISIBLE, FIXE = 92pt) +
    // une marge scalée — CLOSED_VISIBLE reste une constante fixe (importée,
    // pas ré-approximée) pour garantir la clairance sur tout device, y
    // compris petit écran où `rs('min')` seul aurait pu retomber sous 92pt
    // (cf. commentaire CLOSED_VISIBLE dans AsideZone). Sortie du flux
    // centré de `content` : sa position ne dépend plus de la hauteur du
    // contenu au-dessus (dial + message + rangée + dé).
    coachAnchor: {
      alignItems: 'center',
      bottom: CLOSED_VISIBLE + rs(12, 'min'),
      left: 0,
      position: 'absolute',
      right: 0,
    },
    // Overlay de sortie d'immersion (cadrage 3c) : monté SEULEMENT quand
    // immersed — au-dessus de tout (AsideZone = zIndex 50), il capte le
    // PREMIER toucher pour qu'il n'atteigne jamais le disque (sinon
    // stop-rembobinage involontaire, destructif).
    immersionOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 100,
    },
    // Le seuil (ADR-016 §1) : par-dessus TOUT, y compris AsideZone (50) et
    // l'overlay d'immersion (100) — rien du dessous n'est atteignable tant
    // qu'il est monté.
    firstRunThresholdOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 200,
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
                onTimerComplete={handleTimerComplete}
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
                  {/* Ligne partagée : « fais-le respirer » (>= 2 séances) et
                      « garde ce moment ? » (1re séance) ne coexistent jamais
                      (cf. showKeepMoment ci-dessus) — même slot réservé,
                      jamais les deux montées en même temps. */}
                  <Text
                    style={[
                      styles.breatheInvitationText,
                      !(showBreatheInvitation || showKeepMoment) && styles.completionMessageHidden,
                    ]}
                    numberOfLines={1}
                    onPress={
                      showBreatheInvitation
                        ? handleBreatheInvitationTap
                        : showKeepMoment && !momentKept
                          ? handleKeepMomentTap
                          : undefined
                    }
                    accessible={showBreatheInvitation || (showKeepMoment && !momentKept)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showBreatheInvitation
                        ? t('ambiances.breatheInvitation')
                        : momentKept
                          ? t('firstRun.momentKept')
                          : t('firstRun.keepMoment')
                    }
                  >
                    {showBreatheInvitation
                      ? t('ambiances.breatheInvitation')
                      : showKeepMoment
                        ? (momentKept ? t('firstRun.momentKept') : t('firstRun.keepMoment'))
                        : ' '}
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
          {/* QA visuelle passe 5, bug 1 : la ligne coach (prêt ou astuce
              dormante) vivait dans le flux de `chromeBelow`, centré par
              `content` — sur les stacks hautes (dé + message + rangée + dé
              à jouer), sa pill finissait sous la bande fermée du sheet
              (AsideZone, CLOSED_VISIBLE = 92pt), recouverte, illisible.
              Ancrée ici en absolu, comme FocusHint : garantie de vivre
              entre le dé et la bande, jamais dessous, quelle que soit la
              hauteur du contenu au-dessus. Une seule voix coach à la fois
              (Lambda V) : le prêt gagne le canal, l'astuce dormante sinon. */}
          {coachChannel && (
            <View style={styles.coachAnchor} pointerEvents="box-none">
              {coachChannel.kind === 'coach' && (
                <CoachPill
                  text={coachMessageText}
                  onPress={isCoachReturnMessage ? handleCoachPress : undefined}
                  testID={`coach.${coachChannel.message.type}`}
                />
              )}
              {coachChannel.kind === 'dormant' && <DormantTipPill tip={coachChannel.tip} />}
            </View>
          )}
          {isFocus && !snapshot.running && !snapshot.isCompleted && <FocusHint />}
          <AsideZone
            isTimerRunning={snapshot.running}
            hidden={immersed}
            onPaletteOpened={dormantTips.markPalettesOpened}
            onAmbianceBorrowed={borrowCoach.notifyBorrowed}
            onOpenChange={setSheetOpen}
          />
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
          {/* Le seuil (ADR-016 §1) : ne se rejoue JAMAIS (flag distinct
              hasSeenThreshold, Monde B) — par défaut false, donc les users
              existants (déjà passés par la 2.0 ou pas) REVOIENT le seuil une
              fois au premier lancement de la 3.0. Accepté (reborn assumé),
              pas de migration de flag prévue. */}
          {!firstRun.isLoading && !firstRun.hasSeenThreshold && (
            <View style={styles.firstRunThresholdOverlay} testID="firstRun.threshold.overlay">
              <FirstRunThreshold onComplete={firstRun.completeThreshold} />
            </View>
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
