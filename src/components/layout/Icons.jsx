/**
 * @fileoverview SVG icon components for the application
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';

export const PlayIcon = React.memo(({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 3l14 9-14 9V3z"
      fill={color}
    />
  </Svg>
));

export const PauseIcon = React.memo(({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
      fill={color}
    />
  </Svg>
));

export const ResetIcon = React.memo(({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"
      fill={color}
    />
  </Svg>
));

export const ReverseIcon = React.memo(({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
      fill={color}
    />
  </Svg>
));

export const SettingsIcon = React.memo(({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
      fill={color}
    />
  </Svg>
));

// Icon wrapper component
const iconMap = {
  play: PlayIcon,
  pause: PauseIcon,
  reset: ResetIcon,
  reverse: ReverseIcon,
  settings: SettingsIcon,
};

const Icons = ({ name, size = 24, color }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {return null;}
  return <IconComponent size={size} color={color} />;
};

export default Icons;