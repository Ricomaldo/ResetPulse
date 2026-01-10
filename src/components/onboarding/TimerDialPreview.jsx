/**
 * TimerDialPreview - Non-interactive timer dial for onboarding demo
 * Shows static preview - frozen snapshot of timer in use
 */
import React from 'react';
import PropTypes from 'prop-types';
import TimerDial from '../dial/TimerDial';

export default function TimerDialPreview({
  progress = 0.4,
  duration = 3600,
  color,
  scaleMode = '60min',
  size,
  centerImage = null,
}) {
  return (
    <TimerDial
      progress={progress}
      duration={duration}
      remaining={duration * progress}
      color={color}
      size={size}
      scaleMode={scaleMode}
      showNumbers={true}
      showGraduations={true}
      showActivityEmoji={false}
      showPlayButton={false}
      showCenterDisk={!centerImage}
      centerImage={centerImage}
      isRunning={false}
      // No interactivity
      onGraduationTap={null}
      onDialTap={null}
      onDialLongPress={null}
      currentActivity={null}
    />
  );
}

TimerDialPreview.propTypes = {
  progress: PropTypes.number,
  duration: PropTypes.number,
  color: PropTypes.string,
  scaleMode: PropTypes.string,
  size: PropTypes.number,
  centerImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};
