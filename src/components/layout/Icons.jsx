/**
 * @fileoverview SVG icon components for the application
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

export const PlayIcon = React.memo(function PlayIcon({ size = 24, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 3l14 9-14 9V3z"
        fill={color}
      />
    </Svg>
  );
});

PlayIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export const StopIcon = React.memo(function StopIcon({ size = 24, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6h12v12H6V6z"
        fill={color}
      />
    </Svg>
  );
});

StopIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export const ResetIcon = React.memo(function ResetIcon({ size = 24, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"
        fill={color}
      />
    </Svg>
  );
});

ResetIcon.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};