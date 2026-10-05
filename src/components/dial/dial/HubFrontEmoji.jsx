/**
 * @fileoverview HubFrontEmoji — emoji du moyeu « traversé par le front » (T3-2)
 * Deux couches : fantôme (ENOW_HUB_GHOST_OPACITY) + couche pleine découpée
 * par le secteur d'angle `frontProgress`, même sens que l'arc du cadran.
 * 0 → fantôme seul ; 1 → tout en couleur.
 */
import React, { useId } from 'react';
import PropTypes from 'prop-types';
import Svg, { Text as SvgText, Defs, ClipPath, Path } from 'react-native-svg';
import { useDialOrientation } from '../../../hooks/useDialOrientation';
import { ENOW_HUB_GHOST_OPACITY } from '../../../config/enow-sketch';

export default function HubFrontEmoji({ emoji, size, clockwise = false, frontProgress = 0 }) {
  const { getProgressPath } = useDialOrientation(clockwise, '60min');
  // useId peut contenir des caractères interdits dans une URL de clip.
  const clipId = `hubFront${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const c = size / 2;
  const fontSize = size * 0.59;
  // Rayon > diagonale du carré : le secteur couvre tout le glyphe.
  const clipPath = getProgressPath(frontProgress, c, c, size);
  const full = frontProgress >= 0.9999; // getProgressPath renvoie null
  const showFront = full || Boolean(clipPath);

  const glyph = (extra) => (
    <SvgText
      x={c}
      y={c}
      fontSize={fontSize}
      textAnchor="middle"
      alignmentBaseline="central"
      {...extra}
    >
      {emoji}
    </SvgText>
  );

  return (
    <Svg width={size} height={size} accessible={false} importantForAccessibility="no">
      {glyph({ opacity: ENOW_HUB_GHOST_OPACITY })}
      {showFront && !full && (
        <Defs>
          <ClipPath id={clipId}>
            <Path d={clipPath} />
          </ClipPath>
        </Defs>
      )}
      {showFront && glyph(full ? {} : { clipPath: `url(#${clipId})` })}
    </Svg>
  );
}

HubFrontEmoji.propTypes = {
  clockwise: PropTypes.bool,
  emoji: PropTypes.string.isRequired,
  frontProgress: PropTypes.number,
  size: PropTypes.number.isRequired,
};
