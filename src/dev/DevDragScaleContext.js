// src/dev/DevDragScaleContext.js
// PROTO drag-échelle (branche proto-drag-echelle) : sélecteur runtime de la
// mécanique de changement d'échelle par drag, piloté depuis le DevFab.
// Pattern calqué sur DevPremiumContext (state runtime simple, fallback no-op
// hors provider). À supprimer avec la branche si aucune mécanique n'est
// retenue ; à consolider hors dev/ si une mécanique gagne.

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

/** Les 3 positions du sélecteur « Drag échelle » du DevFab. */
export const DRAG_SCALE_MECHANICS = {
  OFF: 'off', // comportement actuel : le drag sature au max de l'échelle
  RELEASE: 'release', // mécanique A — « Relâche et ça respire »
  HOLD: 'hold', // mécanique B — « Maintien au bord »
};

const DevDragScaleContext = createContext(null);

export function DevDragScaleProvider({ children }) {
  const [dragScaleMechanic, setDragScaleMechanic] = useState(
    DRAG_SCALE_MECHANICS.OFF
  );

  return (
    <DevDragScaleContext.Provider
      value={{ dragScaleMechanic, setDragScaleMechanic }}
    >
      {children}
    </DevDragScaleContext.Provider>
  );
}

DevDragScaleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDevDragScale() {
  const context = useContext(DevDragScaleContext);
  // Hors provider (production) : mécanique OFF, comportement actuel
  if (!context) {
    return {
      dragScaleMechanic: DRAG_SCALE_MECHANICS.OFF,
      setDragScaleMechanic: () => {},
    };
  }
  return context;
}

export { DevDragScaleContext };
