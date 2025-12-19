/**
 * @fileoverview Timer dial component with drag/tap interaction
 * Orchestrates dial sub-components for visual timer display
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
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
import Svg, { Circle, Line } from 'react-native-svg';

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
  activityEmoji = null,
  isRunning = false,
  showActivityEmoji = true,
  onGraduationTap = null,
  onDialTap = null,
  onDialLongPress = null,
  isCompleted = false,
  currentActivity = null,
  showNumbers = true,
  showGraduations = true,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive sizes
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING;
  const radiusOuter = (circleSize / 2); // Radius for graduations (outer)
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

  // Get graduation marks and numbers from centralized logic
  const graduationMarks = useMemo(() => {
    const marks = dial.getGraduationMarks(radiusBackground, centerX, centerY); // Sur le cercle blanc
    return marks.map(mark => ({
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
      fontSize: Math.max(TIMER_PROPORTIONS.MIN_NUMBER_FONT, circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO),
    }));
  }, [dial, radiusBackground, centerX, centerY, circleSize]);

  // Pan responder for drag interaction + tap detection
  const gestureStartTimeRef = useRef(null);
  const gestureStartPosRef = useRef(null);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Capture all touches
      onMoveShouldSetPanResponder: () => !!onGraduationTap, // Allow drag anytime (even when running for skipping ahead)

      onPanResponderGrant: (evt) => {
        gestureStartTimeRef.current = Date.now();
        gestureStartPosRef.current = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };

        setIsDragging(true);

        // Calculate where the user touched
        const touchMinutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );

        // Calculate current timer value in minutes
        const currentMinutesValue = duration / 60;

        // Store the offset between touch position and current value
        dragOffsetRef.current = currentMinutesValue - touchMinutes;

        // Store references for wrap-around detection
        lastMinutesRef.current = currentMinutesValue;
        lastTouchMinutesRef.current = touchMinutes;
        lastMoveTimeRef.current = Date.now();
      },

      onPanResponderMove: (evt) => {
        // Calculate where the user is touching now
        const touchMinutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );

        const maxMinutes = dial.maxMinutes;

        // Check if touch position wrapped around
        let touchDelta = 0;
        if (lastTouchMinutesRef.current !== null) {
          touchDelta = touchMinutes - lastTouchMinutesRef.current;

          // If touch jumped more than half the dial, it wrapped
          if (Math.abs(touchDelta) > maxMinutes / 2) {
            // Adjust the delta to represent the actual movement
            if (touchDelta > 0) {
              // Wrapped counter-clockwise (60→0)
              touchDelta = touchDelta - maxMinutes;
            } else {
              // Wrapped clockwise (0→60)
              touchDelta = touchDelta + maxMinutes;
            }
          }
        }

        // Calculate velocity for dynamic resistance
        const now = Date.now();
        const deltaTime = Math.max(1, now - (lastMoveTimeRef.current || now));
        const velocity = Math.abs(touchDelta) / (deltaTime / 1000); // minutes per second

        // Apply dynamic resistance based on velocity
        // Faster movements get more resistance for smoother control
        const velocityFactor = Math.min(1, velocity / DRAG.VELOCITY_THRESHOLD);
        const dynamicResistance = DRAG.BASE_RESISTANCE - (velocityFactor * DRAG.VELOCITY_REDUCTION);

        // Apply ease-out curve for natural deceleration
        const easedResistance = DRAG.BASE_RESISTANCE * easeOut(dynamicResistance / DRAG.BASE_RESISTANCE);
        const resistedDelta = touchDelta * easedResistance;

        // Update time reference
        lastMoveTimeRef.current = now;

        // Calculate new value based on last value plus resisted delta
        let newMinutes = lastMinutesRef.current + resistedDelta;

        // Critical: Clamp to valid range to prevent any jumps
        newMinutes = Math.max(0, Math.min(maxMinutes, newMinutes));

        // Update the timer with smooth position (no snap during drag)
        onGraduationTap?.(newMinutes, false); // false = dragging, no snap

        // Update references
        lastMinutesRef.current = newMinutes;
        lastTouchMinutesRef.current = touchMinutes;

        // Adjust offset to maintain the drag relationship
        dragOffsetRef.current = newMinutes - touchMinutes;
      },

      onPanResponderRelease: (evt) => {
        const now = Date.now();
        const timeDelta = now - (gestureStartTimeRef.current || now);
        const startPos = gestureStartPosRef.current;

        // Calculate movement distance
        let movementDistance = 0;
        if (startPos) {
          const dx = evt.nativeEvent.locationX - startPos.x;
          const dy = evt.nativeEvent.locationY - startPos.y;
          movementDistance = Math.sqrt(dx * dx + dy * dy);
        }

        // Detect tap: quick release (<200ms) with minimal movement (<10px)
        const isTap = timeDelta < 200 && movementDistance < 10;

        // Detect long press: held (>=500ms) with minimal movement (<10px)
        const isLongPress = timeDelta >= 500 && movementDistance < 10;

        // Calculate distance from center for tap zone detection
        const tapX = evt.nativeEvent.locationX;
        const tapY = evt.nativeEvent.locationY;
        const distanceFromCenter = Math.sqrt(
          Math.pow(tapX - centerX, 2) + Math.pow(tapY - centerY, 2)
        );

        // Define tap zones
        const centerZoneRadius = radiusBackground * DIAL_LAYOUT.CENTER_ZONE_RATIO;
        const outerZoneMinRadius = radiusBackground * DIAL_LAYOUT.OUTER_ZONE_MIN_RATIO;
        const isTapOnCenter = distanceFromCenter < centerZoneRadius;
        const isTapOnGraduation = distanceFromCenter > outerZoneMinRadius;

        // Apply snap on release (but not for tap or long press)
        if (!isTap && !isLongPress && onGraduationTap && lastMinutesRef.current !== null) {
          // This is a drag release - apply subtle snap
          onGraduationTap(lastMinutesRef.current, true); // true = release, apply snap
        }

        // Handle tap or long press based on zone
        if (isLongPress && onDialLongPress) {
          onDialLongPress();
        } else if (isTap) {
          if (isTapOnGraduation && onGraduationTap) {
            // Tap on graduation/number - set duration to that time
            const tappedMinutes = dial.coordinatesToMinutes(tapX, tapY, centerX, centerY);
            onGraduationTap(tappedMinutes, true); // true = apply snap
          } else if (isTapOnCenter && onDialTap) {
            // Tap on center - start/pause timer
            onDialTap();
          }
          // Middle zone (between center and graduations) - do nothing
        }

        setIsDragging(false);
        lastMinutesRef.current = null;
        lastTouchMinutesRef.current = null;
        lastMoveTimeRef.current = null;
        dragOffsetRef.current = 0;
        gestureStartTimeRef.current = null;
        gestureStartPosRef.current = null;
      },
    }),
  [dial, isRunning, onGraduationTap, onDialTap, onDialLongPress, duration, clockwise, centerX, centerY, radiusBackground]
  );

  // Use provided color or default energy color
  const arcColor = color || theme.colors.energy;

  // Calculate accessibility information
  const durationMinutes = Math.round(duration / 60);
  const activityName = currentActivity?.label || t('activities.none');

  // Build accessibility label
  const dialAccessibilityLabel = t('accessibility.timer.dial', {
    minutes: durationMinutes,
    activity: activityName
  });

  // Build accessibility hint
  const dialAccessibilityHint = isRunning
    ? t('accessibility.timer.dialTapToToggle')
    : t('accessibility.timer.dialAdjustable') + ' ' + t('accessibility.timer.dialTapToToggle');

  // Pre-calc scaled progress (0..1) based on current scale mode
  const maxMinutesForScale = getDialMode(scaleMode).maxMinutes;
  const currentMinutesForScale = duration / 60;
  const scaledProgress = Math.min(1, currentMinutesForScale / maxMinutesForScale) * progress;
  const isZeroState = !isRunning && remaining === 0;

  // Compute handle position on the draggable side of the arc
  // Place the handle on the outer edge (radiusBackground) where graduation marks end
  const handleAngleDeg = scaledProgress * 360;
  const handleAngleRad = (handleAngleDeg * Math.PI) / 180;
  // Position on the outer edge (radiusBackground) for better visibility and affordance
  const handleDistance = radiusBackground;
  const handleX = clockwise
    ? centerX + handleDistance * Math.sin(handleAngleRad)
    : centerX - handleDistance * Math.sin(handleAngleRad);
  const handleY = centerY - handleDistance * Math.cos(handleAngleRad);

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
  const svgContainerStyle = useMemo(() => ({
    alignItems: 'center',
    height: svgSize,
    justifyContent: 'center',
    width: svgSize,
  }), [svgSize]);

  return (
    <View style={staticStyles.root}>
      <View
        {...panResponder.panHandlers}
        style={svgContainerStyle}
        accessible={true}
        accessibilityRole={isRunning ? 'timer' : 'adjustable'}
        accessibilityLabel={dialAccessibilityLabel}
        accessibilityHint={dialAccessibilityHint}
        accessibilityValue={{
          min: 0,
          max: getDialMode(scaleMode).maxMinutes,
          now: durationMinutes,
          text: `${durationMinutes} minutes`
        }}
        accessibilityActions={!isRunning ? [
          { name: 'increment', label: 'Increase duration' },
          { name: 'decrement', label: 'Decrease duration' },
          { name: 'activate', label: 'Start timer' },
        ] : [
          { name: 'activate', label: 'Pause timer' },
        ]}
        onAccessibilityAction={(event) => {
          const { actionName } = event.nativeEvent;
          if (actionName === 'increment' && onGraduationTap && !isRunning) {
            const newDuration = Math.min(duration + 60, getDialMode(scaleMode).maxMinutes * 60);
            onGraduationTap(newDuration / 60, true); // true = apply snap (increment is discrete action)
          } else if (actionName === 'decrement' && onGraduationTap && !isRunning) {
            const newDuration = Math.max(0, duration - 60);
            onGraduationTap(newDuration / 60, true); // true = apply snap (decrement is discrete action)
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
        {/* IMPORTANT: Scale progress based on dial mode */}
        <DialProgress
          svgSize={svgSize}
          centerX={centerX}
          centerY={centerY}
          outerRadius={radiusBackground}
          strokeWidth={strokeWidth}
          progress={scaledProgress}
          color={arcColor}
          isClockwise={clockwise}
          scaleMode={scaleMode}
          animatedColor={isCompleted ? COLORS.COMPLETION_GREEN : null}
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
          <Svg width={svgSize} height={svgSize} style={staticStyles.absoluteOverlay} pointerEvents="none" accessible={false} importantForAccessibility="no">
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

        {/* Drag handle indicator at the movable end of the arc */}
        {!isRunning && (
          <Svg width={svgSize} height={svgSize} style={staticStyles.absoluteOverlay} pointerEvents="none" accessible={false} importantForAccessibility="no">
            {/* Needle/radius line from center to handle */}
            <Line
              x1={centerX}
              y1={centerY}
              x2={handleX}
              y2={handleY}
              stroke={theme.colors.brand.primary}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={isDragging ? 1 : 0.7}
            />

            {/* Glow / Shadow effect when dragging */}
            {isDragging && (
              <Circle
                cx={handleX}
                cy={handleY}
                r={rs(DIAL_LAYOUT.HANDLE_GLOW_SIZE)}
                fill={theme.colors.brand.primary}
                opacity={0.2}
              />
            )}

            {/* Outer border of the handle */}
            <Circle
              cx={handleX}
              cy={handleY}
              r={rs(DIAL_LAYOUT.HANDLE_SIZE)}
              fill={theme.colors.surface}
              stroke={theme.colors.brand.primary}
              strokeWidth={2.5}
              opacity={1}
            />

            {/* Inner dot for brand consistency */}
            <Circle
              cx={handleX}
              cy={handleY}
              r={rs(DIAL_LAYOUT.HANDLE_INNER_SIZE)}
              fill={theme.colors.brand.primary}
              opacity={isDragging ? 1 : 0.8}
            />
          </Svg>
        )}

        {/* Physical fixation dots - hide when PulseButton is displayed */}
        {(showActivityEmoji || isRunning) && (
          <Svg width={svgSize} height={svgSize} style={staticStyles.absoluteOverlay} pointerEvents="none" accessible={false} importantForAccessibility="no">
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

        {/* Center layer: PulseButton (ADR-007) */}
        <DialCenter
          activityEmoji={showActivityEmoji ? activityEmoji : null}
          isRunning={isRunning}
          isCompleted={isCompleted}
          onTap={onDialTap}
          onLongPressComplete={onDialLongPress}
          clockwise={clockwise}
          size={circleSize * 0.25}
        />
      </View>
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
  onDialLongPress: PropTypes.func,
  isCompleted: PropTypes.bool,
  currentActivity: PropTypes.object,
  showNumbers: PropTypes.bool,
  showGraduations: PropTypes.bool,
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
    prevProps.onDialLongPress === nextProps.onDialLongPress &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity &&
    prevProps.showNumbers === nextProps.showNumbers &&
    prevProps.showGraduations === nextProps.showGraduations &&
    prevProps.showActivityEmoji === nextProps.showActivityEmoji
  );
});