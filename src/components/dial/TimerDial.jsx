/**
 * @fileoverview Timer dial component with drag/tap interaction
 * Orchestrates dial sub-components for visual timer display
 * @created 2025-12-14
 * @updated 2025-12-19 - Migrated from PanResponder to Gesture API (RNGH v2)
 *
 * Animation layers to re-add (Reanimated 4 + New Arch):
 *   [ ] hint pulse on mount (hintOpacity withSequence)
 *   [ ] smooth graduation tap transition (animatedProgress withTiming)
 */
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useDialOrientation } from '../../hooks/useDialOrientation';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import {
  TIMER_SVG,
  TIMER_PROPORTIONS,
  TIMER_VISUAL,
  COLORS,
  getDialMode,
  DRAG,
  DIAL_LAYOUT,
} from './timerConstants';

/**
 * Quadratic ease-out for natural deceleration during drag
 * @param {number} t - Progress value 0-1
 * @returns {number} Eased value
 */
const easeOut = (t) => t * (2 - t);

// Import modular components
import DialBase from './dial/DialBase';
import DialProgress from './dial/DialProgress';
import DialGraduations from './dial/DialGraduations';
import DialCenter from './dial/DialCenter';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

/**
 * TimerDial - Main timer dial component
 * Orchestrates all dial sub-components
 */
function TimerDial({
  progress = 1,
  duration = 0,
  remaining = 0,
  color,
  size = null,
  clockwise = false,
  scaleMode = '60min',
  activityEmoji: _activityEmoji = null, // Legacy prop, now using currentActivity.emoji
  isRunning = false,
  showActivityEmoji = true,
  onGraduationTap = null,
  onDialTap = null,
  isCompleted = false,
  currentActivity = null,
  showNumbers = true,
  showGraduations = true,
  showPlayButton = true,
  showCenterDisk = false,
  centerImage = null,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  // === PROGRESS (direct, no animation — smooth transition layer to re-add) ===
  const maxMinutesForScale = getDialMode(scaleMode).maxMinutes;
  const currentMinutesForScale = duration / 60;
  // Accompli plein-vert (arbitrage Eric, C2) : à l'état complete, le disque
  // entier se remplit — pas seulement l'arc proportionnel à la durée réglée
  // sur l'échelle du cadran. Affichage seulement, la state machine (progress
  // réel de useTimer) reste intouchée.
  const displayProgress = isCompleted
    ? 1
    : Math.min(1, currentMinutesForScale / maxMinutesForScale) * progress;

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive sizes
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING;
  const radiusOuter = circleSize / 2; // Radius for graduations (outer)
  const radiusBackground = radiusOuter - DIAL_LAYOUT.BACKGROUND_OFFSET; // Cercle blanc (laisse espace pour graduations)
  const strokeWidth = TIMER_SVG.STROKE_WIDTH;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Track previous minutes for wrap-around prevention
  const lastMinutesRef = useRef(null);
  // Track the offset between touch position and actual timer value
  const dragOffsetRef = useRef(0);
  // Track the last touch position to detect wrap-around
  const lastTouchMinutesRef = useRef(null);
  // Track timestamp for velocity calculation
  const lastMoveTimeRef = useRef(null);
  // Track if drag is valid (started outside dead zone)
  const isDragValid = useSharedValue(false);

  // Get graduation marks and numbers from centralized logic
  const graduationMarks = useMemo(() => {
    const marks = dial.getGraduationMarks(radiusBackground, centerX, centerY); // Sur le cercle blanc
    return marks.map((mark) => ({
      ...mark,
      strokeWidth: mark.isMajor ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR,
      opacity: mark.isMajor ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR,
    }));
  }, [dial, radiusBackground, centerX, centerY]);

  const minuteNumbers = useMemo(() => {
    const numberRadius = radiusBackground + TIMER_PROPORTIONS.NUMBER_RADIUS; // À l'extérieur du cercle blanc
    const positions = dial.getNumberPositions(numberRadius, centerX, centerY);
    return positions.map((pos, index) => ({
      key: `num-${index}`,
      x: pos.x,
      y: pos.y,
      minute: pos.value,
      fontSize: Math.max(
        TIMER_PROPORTIONS.MIN_NUMBER_FONT,
        circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO
      ),
    }));
  }, [dial, radiusBackground, centerX, centerY, circleSize]);

  // Calculate center zone for gesture exclusion
  const centerZoneRadius = radiusBackground * DIAL_LAYOUT.CENTER_ZONE_RATIO;
  const outerZoneMinRadius = radiusBackground * DIAL_LAYOUT.OUTER_ZONE_MIN_RATIO;

  // === JS CALLBACKS (called from worklets via runOnJS) ===
  // All gesture logic runs on JS thread because dial methods require JS

  // Handler for pan gesture start
  const handlePanStart = useCallback((touchX, touchY) => {
    // Dead zone check is now done in the worklet (panGesture.onStart)
    setIsDragging(true);

    // Calculate where the user touched
    const touchMinutes = dial.coordinatesToMinutes(touchX, touchY, centerX, centerY);
    const currentMinutesValue = duration / 60;

    // Store references for drag tracking
    dragOffsetRef.current = currentMinutesValue - touchMinutes;
    lastMinutesRef.current = currentMinutesValue;
    lastTouchMinutesRef.current = touchMinutes;
    lastMoveTimeRef.current = Date.now();

    return true;
  }, [dial, duration, centerX, centerY]);

  // Handler for pan gesture update (must be in JS thread for dial methods)
  const handlePanUpdate = useCallback((touchX, touchY) => {
    // Calculate where the user is touching now
    const touchMinutes = dial.coordinatesToMinutes(touchX, touchY, centerX, centerY);
    const maxMinutes = dial.maxMinutes;

    // Check if touch position wrapped around
    let touchDelta = 0;
    if (lastTouchMinutesRef.current !== null) {
      touchDelta = touchMinutes - lastTouchMinutesRef.current;

      // If touch jumped more than half the dial, it wrapped
      if (Math.abs(touchDelta) > maxMinutes / 2) {
        if (touchDelta > 0) {
          touchDelta = touchDelta - maxMinutes;
        } else {
          touchDelta = touchDelta + maxMinutes;
        }
      }
    }

    // Calculate velocity for dynamic resistance
    const now = Date.now();
    const deltaTime = Math.max(1, now - (lastMoveTimeRef.current || now));
    const velocity = Math.abs(touchDelta) / (deltaTime / 1000);

    // Apply dynamic resistance based on velocity
    const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
    const dynamicResistance = DRAG.BASE_RESISTANCE - velocityFactor * DRAG.VELOCITY_REDUCTION;

    // Apply ease-out curve for natural deceleration
    const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
    const resistedDelta = touchDelta * easedResistance;

    // Update time reference
    lastMoveTimeRef.current = now;

    // Calculate new value based on last value plus resisted delta
    let newMinutes = lastMinutesRef.current + resistedDelta;
    newMinutes = Math.max(0, Math.min(maxMinutes, newMinutes));

    // Update the timer with smooth position (no snap during drag)
    onGraduationTap?.(newMinutes, false);

    // Update references
    lastMinutesRef.current = newMinutes;
    lastTouchMinutesRef.current = touchMinutes;
    dragOffsetRef.current = newMinutes - touchMinutes;
  }, [dial, centerX, centerY, onGraduationTap]);

  // Handler for pan gesture end
  const handlePanEnd = useCallback(() => {
    // Apply snap on release
    if (lastMinutesRef.current !== null) {
      onGraduationTap?.(lastMinutesRef.current, true);
    }
    setIsDragging(false);
    lastMinutesRef.current = null;
    lastTouchMinutesRef.current = null;
    lastMoveTimeRef.current = null;
    dragOffsetRef.current = 0;
  }, [onGraduationTap]);

  // Handler for tap on graduations OR center (C6.2 : le tap reste sur tout
  // le disque — zone intérieure = start/stop, seule autorité du tap central
  // depuis le retrait du TouchableOpacity de PulseButton, cf. commentaire
  // DialCenter). Un seul gestionnaire, une seule source de vérité.
  const handleTapOnGraduation = useCallback((tapX, tapY) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(tapX - centerX, 2) + Math.pow(tapY - centerY, 2)
    );

    if (distanceFromCenter <= outerZoneMinRadius) {
      onDialTap?.();
      return;
    }

    if (onGraduationTap) {
      const tappedMinutes = dial.coordinatesToMinutes(tapX, tapY, centerX, centerY);
      onGraduationTap(tappedMinutes, true);
    }
  }, [dial, centerX, centerY, outerZoneMinRadius, onGraduationTap, onDialTap]);

  // === GESTURE: Pan (Drag to adjust duration) ===
  // All logic runs on JS thread via runOnJS (dial methods require JS)

  const panGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(10) // Minimum distance to start pan (differentiates from tap)
      // Régression tap-start (2e cause, trouvée en retest avec Eric) :
      // Gesture.Race(pan, tap) donne la main au PREMIER geste qui devient
      // ACTIVE — au niveau natif, pas au niveau de ce worklet. Un tap au
      // centre avec ne serait-ce que 10px de jitter (courant, doigt réel)
      // satisfaisait déjà minDistance(10) et faisait ACTIVER pan (donc
      // annuler tap dans la Race) AVANT que le check de zone morte ci-dessous
      // ne s'exécute — celui-ci ne faisait plus alors que neutraliser pan
      // (isDragValid=false), sans jamais redonner la main à tap. Résultat :
      // rien ne se produit. Fix : `onTouchesDown` fait échouer pan dès le
      // toucher initial si on est dans la zone morte, AVANT toute mesure de
      // distance — pan ne peut alors plus jamais gagner la course au centre.
      .onTouchesDown((event, stateManager) => {
        'worklet';
        const touch = event.changedTouches[0];
        if (!touch) {
          return;
        }
        const dx = touch.x - centerX;
        const dy = touch.y - centerY;
        if (Math.sqrt(dx * dx + dy * dy) <= centerZoneRadius) {
          stateManager.fail();
        }
      })
      .onStart((event) => {
        'worklet';
        // Calculate distance from center in worklet (can modify SharedValue here)
        const dx = event.x - centerX;
        const dy = event.y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        // Check if touch is outside dead zone (38% of radius)
        if (distanceFromCenter > centerZoneRadius) {
          isDragValid.value = true;
          runOnJS(handlePanStart)(event.x, event.y);
        } else {
          isDragValid.value = false;
        }
      })
      .onUpdate((event) => {
        'worklet';
        // Only process drag if it started outside dead zone
        if (isDragValid.value) {
          runOnJS(handlePanUpdate)(event.x, event.y);
        }
      })
      .onEnd(() => {
        'worklet';
        if (isDragValid.value) {
          runOnJS(handlePanEnd)();
        }
        isDragValid.value = false; // Reset for next gesture
      })
      .onFinalize(() => {
        'worklet';
        // Always reset flag, even if gesture was cancelled
        if (isDragValid.value) {
          runOnJS(handlePanEnd)();
        }
        isDragValid.value = false;
      }),
  [handlePanStart, handlePanUpdate, handlePanEnd, centerX, centerY, centerZoneRadius]
  );

  // === GESTURE: Tap (on graduations OR center, to set duration / start-stop) ===
  // Pas de maxDuration custom (régression C6.2 point 1) : à 200ms, RNGH fait
  // échouer le geste AVANT l'état ACTIVE dès qu'un tap dépasse cette fenêtre
  // — `onEnd` ne se déclenche que depuis ACTIVE (doc RNGH), donc un tap
  // humain normal (souvent >200ms) ne relance plus rien au centre. Le tap
  // central partage ce même gestionnaire depuis le retrait du
  // TouchableOpacity de PulseButton — la fenêtre doit couvrir les deux
  // usages. Repli sur le défaut RNGH (500ms), pas de valeur maison.
  const tapGesture = useMemo(() =>
    Gesture.Tap()
      .onEnd((event) => {
        'worklet';
        runOnJS(handleTapOnGraduation)(event.x, event.y);
      }),
  [handleTapOnGraduation]
  );

  // === COMPOSED GESTURE ===
  // Race: First gesture to activate wins, others are cancelled
  const composedGesture = useMemo(() =>
    Gesture.Race(panGesture, tapGesture),
  [panGesture, tapGesture]
  );

  // Use provided color or default energy color
  const arcColor = color || theme.colors.energy;

  // Calculate accessibility information
  const durationMinutes = Math.round(duration / 60);
  const activityName = currentActivity?.label || t('activities.none');

  // Build accessibility label
  const dialAccessibilityLabel = t('accessibility.timer.dial', {
    minutes: durationMinutes,
    activity: activityName,
  });

  // Build accessibility hint
  const dialAccessibilityHint = isRunning
    ? t('accessibility.timer.dialTapToToggle')
    : t('accessibility.timer.dialAdjustable') + ' ' + t('accessibility.timer.dialTapToToggle');

  // isZeroState uses displayProgress for animation-aware rendering
  const isZeroState = !isRunning && remaining === 0;

  // Compute handle segment position on the edge of the progress arc
  // Uses displayProgress for smooth animation on graduation taps
  const handleAngleDeg = displayProgress * 360;
  const handleAngleRad = (handleAngleDeg * Math.PI) / 180;

  // Direction vector (radial - pointing outward from center)
  const radialX = clockwise ? Math.sin(handleAngleRad) : -Math.sin(handleAngleRad);
  const radialY = -Math.cos(handleAngleRad);

  // Poignée de drag (verdicts CD 25/07) : repère R = radiusBackground (rayon
  // du cercle de graduations). Valeurs spec données pour R=105 — mise à
  // l'échelle proportionnelle (handleScale) pour tout autre rayon. JAMAIS de
  // rayon plein centre→bord : repos R−16→R+2, drag R−20→R+4.
  const R = radiusBackground;
  const handleScale = R / 105;
  const handleInnerRadius = isDragging ? R - 20 * handleScale : R - 16 * handleScale;
  const handleOuterRadius = isDragging ? R + 4 * handleScale : R + 2 * handleScale;
  const handleStrokeWidth = (isDragging ? 5 : 4) * handleScale;
  const handleOpacity = isDragging ? 1.0 : 0.55;
  const handleHaloRadius = (22 * handleScale) / 2;
  const handleX1 = centerX + radialX * handleInnerRadius;
  const handleY1 = centerY + radialY * handleInnerRadius;
  const handleX2 = centerX + radialX * handleOuterRadius;
  const handleY2 = centerY + radialY * handleOuterRadius;

  // Static styles (moved outside render for performance)
  const staticStyles = StyleSheet.create({
    absoluteOverlay: {
      position: 'absolute',
    },
    root: {
      alignItems: 'center',
    },
  });

  // Dynamic style memoized
  const svgContainerStyle = useMemo(
    () => ({
      alignItems: 'center',
      height: svgSize,
      justifyContent: 'center',
      width: svgSize,
    }),
    [svgSize]
  );

  return (
    <View style={staticStyles.root}>
      <GestureDetector gesture={composedGesture}>
        <View
          testID="timer.dial"
          style={svgContainerStyle}
          accessible={true}
          accessibilityRole={isRunning ? 'timer' : 'adjustable'}
          accessibilityLabel={dialAccessibilityLabel}
          accessibilityHint={dialAccessibilityHint}
          accessibilityValue={{
            min: 0,
            max: getDialMode(scaleMode).maxMinutes,
            now: durationMinutes,
            text: `${durationMinutes} minutes`,
          }}
          accessibilityActions={[
            { name: 'increment', label: t('controls.digitalTimer.increaseDuration') },
            { name: 'decrement', label: t('controls.digitalTimer.decreaseDuration') },
            { name: 'activate', label: isRunning ? t('accessibility.timer.stopTimer') : t('accessibility.timer.startTimer') },
          ]}
          onAccessibilityAction={(event) => {
            const { actionName } = event.nativeEvent;
            if (actionName === 'increment' && onGraduationTap) {
              const newDuration = Math.min(duration + 60, getDialMode(scaleMode).maxMinutes * 60);
              onGraduationTap(newDuration / 60, true);
            } else if (actionName === 'decrement' && onGraduationTap) {
              const newDuration = Math.max(0, duration - 60);
              onGraduationTap(newDuration / 60, true);
            } else if (actionName === 'activate' && onDialTap) {
              onDialTap();
            }
          }}
        >
          {/* Base layer: static elements (background circle + numbers) */}
          <DialBase
            svgSize={svgSize}
            centerX={centerX}
            centerY={centerY}
            radius={radiusBackground}
            strokeWidth={strokeWidth}
            minuteNumbers={minuteNumbers}
            showNumbers={showNumbers}
            color={color}
          />

          {/* Progress layer: animated arc */}
          {/* Uses displayProgress for smooth graduation tap animation */}
          <DialProgress
            svgSize={svgSize}
            centerX={centerX}
            centerY={centerY}
            outerRadius={radiusBackground}
            strokeWidth={strokeWidth}
            progress={displayProgress}
            color={arcColor}
            isClockwise={clockwise}
            scaleMode={scaleMode}
            animatedColor={null} // fin = couleur du rituel, disque plein — le vert générique est mort (verdicts CD Q5)
            isRunning={isRunning}
          />

          {/* Graduation marks overlay: rendered above progress arc */}
          <DialGraduations
            svgSize={svgSize}
            graduationMarks={graduationMarks}
            showGraduations={showGraduations}
          />

          {/* Zero-state radial segment from center to 12 o'clock (visual cue) */}
          {isZeroState && (
            <Svg
              width={svgSize}
              height={svgSize}
              style={staticStyles.absoluteOverlay}
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
            >
              <Line
                x1={centerX}
                y1={centerY}
                x2={centerX}
                y2={centerY - radiusBackground}
                stroke={theme.colors.textSecondary}
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          )}

          {/* Drag handle: barre radiale sur le bord de l'arc (verdicts CD
              25/07) — jamais un rayon plein centre→bord, bouts ronds.
              Visible même en séance pour permettre l'ajustement du temps. */}
          {displayProgress > 0 && (
            <View style={staticStyles.absoluteOverlay} pointerEvents="none">
              <Svg
                width={svgSize}
                height={svgSize}
                accessible={false}
                importantForAccessibility="no"
              >
                {isDragging && (
                  <Circle
                    cx={handleX2}
                    cy={handleY2}
                    r={handleHaloRadius}
                    fill={theme.colors.text}
                    opacity={0.08}
                  />
                )}
                <Line
                  x1={handleX1}
                  y1={handleY1}
                  x2={handleX2}
                  y2={handleY2}
                  stroke={theme.colors.text}
                  strokeWidth={handleStrokeWidth}
                  strokeLinecap="round"
                  opacity={handleOpacity}
                />
              </Svg>
            </View>
          )}

          {/* Physical fixation dots - hide when PulseButton is displayed */}
          {(showActivityEmoji || isRunning) && (
            <Svg
              width={svgSize}
              height={svgSize}
              style={staticStyles.absoluteOverlay}
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
            >
              <Circle
                cx={centerX}
                cy={centerY}
                r={radiusBackground * 0.08}
                fill={theme.colors.neutral}
                opacity={0.8}
              />
              <Circle
                cx={centerX}
                cy={centerY}
                r={radiusBackground * 0.04}
                fill={theme.colors.text}
                opacity={0.4}
              />
            </Svg>
          )}

          {/* Bloom de fin (verdicts CD 25/07) : halo radial statique derrière
              le hub, Ø ≈ 40 % du cadran, aucune animation (layer Lot 3). Ne
              touche ni la state machine ni le timing d'auto-reset. */}
          {isCompleted && (
            <Svg
              width={svgSize}
              height={svgSize}
              style={staticStyles.absoluteOverlay}
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no"
            >
              <Defs>
                <RadialGradient id="bloomGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFF4E6" stopOpacity={1} />
                  <Stop offset="100%" stopColor="#FFF4E6" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle
                cx={centerX}
                cy={centerY}
                r={circleSize * 0.2}
                fill="url(#bloomGradient)"
              />
            </Svg>
          )}

          {/* Center layer: PulseButton (ADR-007) — petit disque discret dans
              la couleur courante (fidélité au rendu C6.2), purement visuel :
              le tap est géré par `handleTapOnGraduation` ci-dessus. */}
          {showPlayButton && (
            <DialCenter
              activity={showActivityEmoji ? currentActivity : null}
              isRunning={isRunning}
              isCompleted={isCompleted}
              color={arcColor}
              clockwise={clockwise}
              size={circleSize * 0.34} // hub structurel Ø 34 % du cadran (verdicts CD 25/07)
            />
          )}

          {/* Empty center disk for preview (no button, no emoji) */}
          {!showPlayButton && showCenterDisk && !centerImage && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={svgSize} height={svgSize}>
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={circleSize * 0.125}
                  fill={theme.colors.surface}
                  opacity={1}
                />
              </Svg>
            </View>
          )}

          {/* Center image for preview (logo) */}
          {!showPlayButton && centerImage && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View
                style={{
                  position: 'absolute',
                  top: centerY - (circleSize * 0.125),
                  left: centerX - (circleSize * 0.125),
                  width: circleSize * 0.25,
                  height: circleSize * 0.25,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={centerImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

TimerDial.propTypes = {
  progress: PropTypes.number,
  duration: PropTypes.number,
  remaining: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  clockwise: PropTypes.bool,
  scaleMode: PropTypes.string,
  activityEmoji: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  isRunning: PropTypes.bool,
  showActivityEmoji: PropTypes.bool,
  onGraduationTap: PropTypes.func,
  onDialTap: PropTypes.func,
  isCompleted: PropTypes.bool,
  currentActivity: PropTypes.object,
  showNumbers: PropTypes.bool,
  showGraduations: PropTypes.bool,
  showPlayButton: PropTypes.bool,
  showCenterDisk: PropTypes.bool,
  centerImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};

// Export memoized version
export default React.memo(TimerDial, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.duration === nextProps.duration &&
    prevProps.remaining === nextProps.remaining &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.clockwise === nextProps.clockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.activityEmoji === nextProps.activityEmoji &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.onDialTap === nextProps.onDialTap &&
    prevProps.onGraduationTap === nextProps.onGraduationTap &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity &&
    prevProps.showNumbers === nextProps.showNumbers &&
    prevProps.showGraduations === nextProps.showGraduations &&
    prevProps.showActivityEmoji === nextProps.showActivityEmoji &&
    prevProps.showPlayButton === nextProps.showPlayButton &&
    prevProps.showCenterDisk === nextProps.showCenterDisk &&
    prevProps.centerImage === nextProps.centerImage
  );
});
