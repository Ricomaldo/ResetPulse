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
 * Astuces dormantes v1 (ADR-016 §4, Lambda C) : prop `onPaletteOpened`,
 * appelée au moment où le sous-écran Palettes s'ouvre — marque le flag
 * "fonction touchée" côté TimerScreen (useDormantTips). Callback prop
 * plutôt qu'une deuxième instance de usePersistedState sur la même clé ici :
 * évite la fenêtre de désynchronisation RAM entre deux instances.
 * Cycle 6.2 (fidélité au rendu) : Complet meurt (acté Eric 25/07 ×2) —
 * segmenté à 2 entrées, libellés i18n provisoires [Standard | Focus] (clé
 * interne `mixte` inchangée, naming définitif à la passe CD). Sélection
 * segmenté sombre (#2D2520), plus doré. Palette : sous-écran ne referme plus
 * le sheet au tap (préviz live, porte C6.1).
 * 3c (immersion) : prop `hidden` — le drawer entier (bande fermée comprise)
 * s'efface en fondu/glissement quand la séance devient décor (TimerScreen).
 * Jamais démonté : isOpen/sous-écrans survivent à l'immersion.
 * porte-3 V4 : l'export « garder en fond d'écran » est MORT (ligne de spec
 * ère-CD mal interprétée) — l'idée d'origine d'Eric (image perso en FOND de
 * l'app, item Ambiances) est tracée au backlog.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native';
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
import { useAnalytics } from '../../hooks/useAnalytics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useAmbiancesPrice } from '../../hooks/useAmbiancesPrice';
import { useModalStack } from '../../contexts/ModalStackContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';
import RitualsPanel from '../rituals/RitualsPanel';
import PalettesPanel from '../palettes/PalettesPanel';
import SoundsPanel from '../sounds/SoundsPanel';
import SheetSettingsPanel from './SheetSettingsPanel';
import { TIMER_PALETTES } from '../../config/timer-palettes';

// 2 snaps : fermé (bande CLOSED_VISIBLE) / ouvert (hauteur du contenu, openY).
// Porte Eric 25/07 : la bande fermée vivait dans la zone gestuelle iOS (home
// indicator) — tap dessus = geste home, sheet inaccessible au doigt (prouvé au
// tap-robot). Cause racine : les snaps étaient calculés en % de l'ÉCRAN alors
// que le drawer est positionné dans la SafeArea du parent (~62 pt d'offset
// haut) — tout était décalé vers le bas depuis le début. Désormais : repère =
// hauteur MESURÉE du conteneur (onLayout), bande fermée FIXE de 92 pt — la
// barre du handle reste ~65 pt au-dessus de la zone système, sur tout device.
// Exportée (QA visuelle #5, bug 1) : TimerScreen ancre la pill coach
// au-dessus de cette même bande — une valeur scalée (`rs`) approcherait
// cette constante FIXE sans jamais la garantir sur tout device (sous 390pt
// de large ou 844 de haut, `rs('min')` réduit sous 92 — la pill repasserait
// sous la bande sur petit écran). La FIXITÉ est le point : on la partage,
// pas on la ré-approxime.
export const CLOSED_VISIBLE = 92;
// Plafond : le sheet ne couvre jamais plus de 65% de l'écran — le dial reste visible
const MAX_OPEN_COVERAGE = 0.65;
const HANDLE_HEIGHT = 28; // handleContainer paddingTop(14)+paddingBottom(8) + handleIndicator height(6)
const BOTTOM_SAFETY = rs(24); // == scrollContent.paddingBottom

// Complet meurt (C6.2, acté Eric 25/07 ×2) — segmenté à 2 entrées. Clé
// interne `mixte` conservée (naming définitif à la passe CD, piste : le
// défaut ne se nomme pas) ; libellé affiché "Standard" (i18n, provisoire).
// Lambda V (pédagogie du prêt) : `onAmbianceBorrowed(kind, key)` — relayé
// aux panels Palettes/Sons, appelé quand un FREE applique un item
// Ambiances. L'affichage de la ligne coach vit côté TimerScreen
// (useBorrowCoach) — même pattern callback-prop que onPaletteOpened.
// `onOpenChange(isOpen)` (QA visuelle #5, bug 2) : remonte l'état
// ouvert/fermé du sheet à TimerScreen — l'emprunt (moment 1) s'y fait
// TOUJOURS sheet ouvert, useBorrowCoach a besoin de savoir quand il se
// ferme pour différer sa ligne. Même pattern callback-prop, pas une
// deuxième source de vérité sur `isOpen`.
// `onRitualApplied()` (Lambda R2, Q3b — chip intelligent) : relayé depuis
// RitualsPanel.onApplied, qui se déclenche sur CHAQUE apply du panneau «
// Mes rituels » — TOUJOURS un apply complet (cf. RitualsPanel.handleApply,
// non touché). TimerScreen nettoie son tracker Moment sur ce signal, même
// pattern callback-prop que les autres remontées ci-dessus.
export default function AsideZone({ isTimerRunning, hidden = false, onPaletteOpened, onAmbianceBorrowed, onOpenChange, onRitualApplied }) {
  const theme = useTheme();
  const t = useTranslation();
  const analytics = useAnalytics();
  const modalStack = useModalStack();
  // Guichet Ambiances (Lambda T, 1a) — masqué pour un premium, rien à
  // vendre. Prix dynamique même source RevenueCat que PremiumModalContent
  // (cf. useAmbiancesPrice) ; repli '4,99 €' tant que l'offre ne répond pas.
  const { isPremium } = usePremiumStatus();
  const ambiancesPrice = useAmbiancesPrice();
  const counterSwatchColors = TIMER_PALETTES.serenity.colors;
  // Continuité paysage (3c) : useWindowDimensions (pas Dimensions.get figé
  // au chargement du module) — la hauteur totale du drawer (style `drawer`)
  // doit suivre la rotation, sinon son contenu se retrouve borné par la
  // hauteur de l'ORIENTATION AU DÉMARRAGE de l'app (clip possible du
  // ScrollView si on démarre en paysage puis pivote en portrait).
  const { height: windowHeight } = useWindowDimensions();
  const {
    mode: { current: currentMode },
    setMode,
  } = useTimerConfig();

  // Rappel doux (Lot 3e, opt-in strict) — la permission n'est demandée qu'au
  // geste d'opt-in (toggle ON), jamais au boot ni à chaque changement de
  // créneau (pattern permission contextuelle existant, cf. useTimer.startTimer).


  const isFocus = currentMode === 'focus';

  const MODES = [
    { key: 'mixte', label: t('mode.standard') },
    { key: 'focus', label: t('mode.focus') },
  ];

  const [isOpen, setIsOpen] = useState(false);
  // Remonte CHAQUE transition d'isOpen (snapTo, pan gesture, auto-collapse
  // au démarrage du timer) — un seul point de sortie, pas un rappel par
  // site d'appel de setIsOpen.
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  // Sous-écran Rituels (bloc 3, C6) — remplace les blocs 1-4 quand ouvert.
  const [ritualsOpen, setRitualsOpen] = useState(false);
  // Sous-écran Palettes (bloc 4, C6.1) — même mécanisme.
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Sous-écran Sons (bloc 5, Lambda L) — même mécanisme, sous Palettes.
  const [soundsOpen, setSoundsOpen] = useState(false);
  // Sous-écran Réglages (sheet-racine, maquette CD 04/08).
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Miroir de l'état interne liste/formulaire de RitualsPanel (hotfix-porte-1
  // A3/D5) — remonté via onViewChange, pour arbitrer scroll extérieur et pan
  // de fermeture sans qu'AsideZone connaisse le détail du sous-écran.
  const [ritualsView, setRitualsView] = useState('list');

  // Hauteur mesurée des blocs réels (varie avec le mode : Focus n'affiche que
  // le segmenté). Fallback avant le premier onLayout : proche de l'ancien 80%.
  const [contentHeight, setContentHeight] = useState(windowHeight * 0.6);
  // Hauteur RÉELLE du conteneur (SafeArea du parent) — le seul repère honnête
  // pour positionner le drawer (cf. commentaire CLOSED_VISIBLE).
  const [containerH, setContainerH] = useState(windowHeight);
  const snapClosed = containerH - CLOSED_VISIBLE;

  // porte-2 (retour Eric « ça donne le tournis ») : hauteur d'ouverture
  // FIXE — le drawer s'ouvre TOUJOURS à 65 % du conteneur, quel que soit le
  // contenu (toggles, liste, formulaire). Le contenu vit DEDANS (scroll si
  // débordement) : plus aucun yo-yo entre sous-écrans. L'ancienne hauteur-
  // de-contenu (C5) meurt ici.
  const openY = containerH * (1 - MAX_OPEN_COVERAGE);

  // A2 (hotfix-porte-1) : hauteur utile pour un sous-écran à scroll propre
  // (RitualForm, PalettesPanel) — le plafond des 65%, moins la poignée et la
  // marge basse. Toujours calculée et transmise (pas seulement quand
  // `boundedSubScreen` est vrai) : évite un frame où le sous-écran rendrait
  // sans hauteur bornée pendant que le miroir d'état (ritualsView) remonte.
  const subScreenHeight = Math.max(0, containerH * MAX_OPEN_COVERAGE - HANDLE_HEIGHT - BOTTOM_SAFETY);

  // A3/D5 : le pan de fermeture ET le scroll extérieur cèdent la main à un
  // sous-écran qui gère son propre scroll — Palettes, Sons, ou le formulaire
  // de Rituels (pas sa liste : elle reste sur le scroll extérieur, plus courte).
  const boundedSubScreen = paletteOpen || soundsOpen || (ritualsOpen && ritualsView === 'form');

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
      setSoundsOpen(false);
      setSettingsOpen(false);
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

  // Fabrique du pan drag/snap — deux instances du MÊME geste (un builder
  // Gesture ne peut pas vivre dans deux GestureDetector) :
  //   - `panGesture` (drawer entier) : coupé sur sous-écran à scroll propre
  //     (A3/D5), sinon il volerait le scroll interne de Palettes/Sons/Form ;
  //   - `handlePanGesture` (poignée seule) : TOUJOURS actif — retour Eric
  //     03/08, la poignée ne fermait plus le sheet sous-écran ouvert, car
  //     `.enabled(!boundedSubScreen)` tuait le pan partout, poignée comprise.
  //     La poignée n'a pas de scroll à protéger : elle garde le geste.
  // offsetY paramétrable (QA visuelle #1, bug 2) : `panGesture` recouvre le
  // ScrollView (l.552/587) — bidirectionnel [-20,20], il gagnait la course
  // au geste AVANT que le ScrollView natif n'ait la moindre chance de
  // scroller (le guichet Ambiances, sous Sons, restait hors d'atteinte,
  // aucun swipe ne faisait défiler le contenu). `activeOffsetY(20)` (borne
  // positive seule) ne configure QUE le seuil de fermeture (drag vers le
  // bas) ; le seuil négatif reste au sentinel RNGH « ignoré » (confirmé
  // source native PanGestureHandler.kt shouldActivate — un critère non
  // configuré ne vote jamais l'activation, minDist par défaut est aussi
  // désactivé dès qu'un offset custom est posé), donc un drag vers le HAUT
  // ne déclenche plus jamais ce pan : le ScrollView reste seul maître de
  // cette direction. Le drag de fermeture (vers le bas, depuis le contenu)
  // est inchangé. `handlePanGesture` (poignée seule, pas de ScrollView
  // dessous) garde le bidirectionnel par défaut — ouverture ET fermeture
  // depuis cette petite zone.
  const makePanGesture = (enabled, offsetY = [-20, 20]) => Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY(offsetY)
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
    });

  const panGesture = useMemo(() => makePanGesture(!boundedSubScreen, 20),
    [translateY, startY, openY, snapClosed, boundedSubScreen]);
  const handlePanGesture = useMemo(() => makePanGesture(true),
    [translateY, startY, openY, snapClosed]);

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

  const styles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
    asideContainer: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 50,
    },
    // Lambda Y (bug guichet intouchable, QA visuelle ×2) : hauteur bornée à
    // la zone visible du snap ouvert — même repère que `subScreenHeight`
    // (utilisé par les sous-écrans Rituels/Palettes/Sons). AVANT ce cycle,
    // `content` était `flex: 1` dans un `drawer` haut de `windowHeight` : le
    // ScrollView racine héritait d'un espace disponible bien plus grand que
    // la zone réellement visible (clippée par le physique de l'écran via
    // `translateY`, pas par un `overflow: hidden`). RN compare la hauteur
    // mesurée du contenu à la hauteur de SON PROPRE composant ScrollView —
    // pas à ce qui est visible à l'écran — donc tant que le contenu tenait
    // dans cet espace surdimensionné, RN jugeait qu'il n'y avait rien à
    // scroller : swipes inertes, et toute rangée au-delà de la zone visible
    // (le guichet Ambiances) rendait hors-écran, ni vue ni tappable. Borner
    // `content` à `subScreenHeight` rend au ScrollView une hauteur honnête,
    // identique à celle qu'utilisent déjà les sous-écrans.
    content: {
      height: subScreenHeight,
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
    // porte-2 (retour Eric « pas sérieux ») : registre DS — capitale
    // discrète, interlettre large, encre légère. Un seul élément, pas de
    // caret orphelin : la barre-poignée porte déjà le geste.
    closedLabelText: {
      color: theme.colors.textLight,
      fontSize: rs(11, 'min'),
      fontWeight: '600',
      letterSpacing: rs(11, 'min') * 0.14,
      textTransform: 'uppercase',
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
    // Même pattern que PalettesPanel/SoundsPanel/RitualForm (A2, hotfix-
    // porte-1) : `flex: 1` sur `style` (pas `contentContainerStyle`) pour
    // que le ScrollView remplisse le conteneur borné (`content` ci-dessus)
    // au lieu de ne mesurer que son propre contenu.
    scrollBody: {
      flex: 1,
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
      // Couple inversé `text`/`background` (retour Eric 03/08) : `fixed.white`
      // sur fond `text` devenait blanc sur blanc en dark (`text` y est clair).
      color: theme.colors.background,
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
    // Guichet Ambiances (Lambda T, 1a) — rangée DISTINCTE des rangées
    // d'usage ci-dessus : fond `background` (crème chaud #F4EFE7, proche du
    // #FAF3E9 esprit CD) sur le drawer `surface` (blanc), même écart que
    // TimerScreen/Drawer (cf. CLAUDE.md § Color System Architecture). Pas de
    // couleur brand ici — « un guichet, pas une pub ».
    counterRow: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      marginTop: rs(16),
      padding: rs(12),
    },
    counterSwatch: {
      borderRadius: rs(6),
      flexDirection: 'row',
      height: rs(26, 'min'),
      overflow: 'hidden',
      width: rs(26, 'min'),
    },
    counterSwatchColor: {
      flex: 1,
    },
    counterTextBlock: {
      flex: 1,
      marginLeft: rs(10),
    },
    counterTitle: {
      color: theme.colors.text,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
    },
    counterSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: rs(11, 'min'),
      marginTop: rs(2),
    },
    counterPrice: {
      color: theme.colors.text,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      marginLeft: rs(8),
    },
  });

  // Sens de rotation (P1-6, review design) : Switch binaire remplacé par un
  // segmenté 2 valeurs — même pattern visuel que le segmenté Mode ci-dessus
  // (styles.segmentedControl/segmentButton/segmentButtonActive/segmentText/
  // segmentTextActive). Un Switch ON/OFF ne dit pas CE VERS QUOI on bascule
  // (« sens de rotation : activé » ne veut rien dire) — le segmenté nomme
  // les deux états. Anti-horaire en premier : défaut de l'app ET convention
  // Time Timer physique. Libellés fr/en FLAGGÉS review CD (clés neuves,
  // texte provisoire — même statut que les libellés Standard/Focus du
  // segmenté Mode, cf. commentaire plus haut) ; 13 locales gelées retombent
  // sur l'anglais (i18n `enableFallback`).


  return (
    <View
      style={styles.asideContainer}
      onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
      pointerEvents={hidden ? 'none' : 'box-none'}
    >
      {/* porte-2 (retour Eric) : tap à l'extérieur = fermer — la base de
          l'affordance d'un bottom sheet. Voile très léger pour la profondeur,
          monté seulement ouvert. */}
      {isOpen && (
        <Pressable
          testID="aside.backdrop"
          style={styles.backdrop}
          accessible={false}
          onPress={() => {
            haptics.selection().catch(() => {});
            snapTo(false);
          }}
        />
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View testID="aside.sheet" style={[styles.drawer, drawerAnimatedStyle, theme.shadow('xl')]}>
          {/* Handle — affordance du sheet : swipe up OU tap (porte Eric 25/07,
              la bande fermée doit s'ouvrir au doigt, pas seulement au geste).
              GestureDetector dédié (`handlePanGesture`, jamais désactivé) :
              la poignée ferme TOUJOURS le sheet, sous-écran ouvert compris —
              le pan du drawer, lui, reste coupé sur sous-écran (A3/D5). */}
          <GestureDetector gesture={handlePanGesture}>
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
          </GestureDetector>

          {/* Bande fermée (A1/D4) : sœur de `content`, opacité inverse —
              visible fermé, s'efface à l'ouverture. */}
          <Animated.View style={[styles.closedLabel, closedLabelAnimatedStyle]} pointerEvents="none">
            <Text style={styles.closedLabelText}>{t('aside.closedLabel')}</Text>
          </Animated.View>

          {/* SCR-10 : 4 blocs */}
          <Animated.View style={[styles.content, contentAnimatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              scrollEnabled={isOpen && !boundedSubScreen && contentHeight > subScreenHeight}
              bounces={false}
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
                    onApplied={() => {
                      snapTo(false);
                      onRitualApplied?.();
                    }}
                    onViewChange={setRitualsView}
                    maxHeight={subScreenHeight}
                  />
                ) : paletteOpen ? (
                  /* Sous-écran Palettes (bloc 4, C6.1/C6.2) — la liste reste
                     ouverte au tap (préviz live, porte C6.1) : pas d'onApplied.
                     maxHeight borne son propre scroll (A2 — même dette que le
                     formulaire de rituel, elle explosera avec la liste). */
                  <PalettesPanel
                    onBack={() => setPaletteOpen(false)}
                    maxHeight={subScreenHeight}
                    onBorrowed={(key) => onAmbianceBorrowed?.('palette', key)}
                  />
                ) : soundsOpen ? (
                  /* Sous-écran Sons (bloc 5, Lambda L) — même mécanisme que
                     Palettes : liste ouverte, écoute + apply au tap. */
                  <SoundsPanel
                    onBack={() => setSoundsOpen(false)}
                    maxHeight={subScreenHeight}
                    onBorrowed={(soundId) => onAmbianceBorrowed?.('sound', soundId)}
                  />
                ) : settingsOpen ? (
                  /* Sous-écran Réglages (sheet-racine) : rotation + verrou
                     d'échelle + toggles — la racine respire, le guichet
                     remonte au-dessus du pli. */
                  <SheetSettingsPanel onBack={() => setSettingsOpen(false)} />
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
                        {/* `background` sur fond `text` : lisible dans les deux
                            thèmes (fixed.white = blanc sur blanc en dark). */}
                        <Text style={{ color: theme.colors.background, fontSize: rs(13, 'min'), fontWeight: '600' }}>
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
                                    // porte-3 (5e point Eric, fix immédiat) :
                                    // l'épure ne laisse pas traîner une nappe
                                    // blanche — basculer sur Focus referme le
                                    // sheet. (La grammaire complète des
                                    // transitions vers l'épure reste OUVERTE,
                                    // à griller avec Eric.)
                                    snapTo(false);
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
                      </>
                    )}

                    {/* Blocs 2-4 : masqués en Focus — on ne règle rien, on ne peut
                        qu'en sortir (cf. header). */}
                    {!isFocus && (
                      <>
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
                            onPaletteOpened?.();
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('palettesPanel.sheetRow')}</Text>
                          <Text style={styles.inertChevron}>›</Text>
                        </TouchableOpacity>

                        {/* Bloc 5 : Sons — sous-écran réel (Lambda L),
                            dernière rangée */}
                        <TouchableOpacity
                          style={styles.optionRow}
                          accessible
                          accessibilityRole="button"
                          accessibilityLabel={t('soundsPanel.sheetRow')}
                          onPress={() => {
                            haptics.selection().catch(() => {});
                            setSoundsOpen(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('soundsPanel.sheetRow')}</Text>
                          <Text style={styles.inertChevron}>›</Text>
                        </TouchableOpacity>

                        {/* Bloc 6 : Réglages — sous-écran (sheet-racine,
                            maquette CD) : absorbe rotation + verrou + toggles.
                            Badge « nouveau » retiré (veto Eric 05/08) —
                            rangée identique aux autres. */}
                        <TouchableOpacity
                          style={[styles.optionRow, styles.optionRowLast]}
                          accessible
                          accessibilityRole="button"
                          accessibilityLabel={t('aside.settingsRow')}
                          onPress={() => {
                            haptics.selection().catch(() => {});
                            setSettingsOpen(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inertRowLabel}>{t('aside.settingsRow')}</Text>
                          <Text style={styles.inertChevron}>›</Text>
                        </TouchableOpacity>

                        {/* Guichet Ambiances (Lambda T, 1a) — l'unique entrée
                            VOLONTAIRE vers Ambiances (constat Eric : toutes
                            les autres sont réactives). Tap → paywall
                            générique, SANS highlightedFeature (décision CD :
                            le guichet n'a pas de héros). Masqué en premium. */}
                        {!isPremium && (
                          <TouchableOpacity
                            testID="aside.ambiancesCounter"
                            style={styles.counterRow}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={`${t('ambiances.title')} — ${t('ambiances.counterSubtitle')}`}
                            onPress={() => {
                              haptics.selection().catch(() => {});
                              modalStack.push('premium', { source: 'counter' });
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.counterSwatch}>
                              {counterSwatchColors.map((color, index) => (
                                <View
                                  key={index}
                                  style={[styles.counterSwatchColor, { backgroundColor: color }]}
                                />
                              ))}
                            </View>
                            <View style={styles.counterTextBlock}>
                              <Text style={styles.counterTitle}>{t('ambiances.title')}</Text>
                              <Text style={styles.counterSubtitle}>{t('ambiances.counterSubtitle')}</Text>
                            </View>
                            <Text style={styles.counterPrice}>{ambiancesPrice || '4,99 €'}</Text>
                          </TouchableOpacity>
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
    </View>
  );
}
