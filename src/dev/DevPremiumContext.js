// src/dev/DevPremiumContext.js
// Contexte pour override le mode premium en dev

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PREMIUM, DEV_MODE } from '../config/test-mode';

const DevPremiumContext = createContext(null);

/**
 * Provider for dev premium override context
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export function DevPremiumProvider({ children }) {
  const [devPremiumOverride, setDevPremiumOverride] = useState(
    DEV_MODE ? DEFAULT_PREMIUM : null
  );

  return (
    <DevPremiumContext.Provider value={{ devPremiumOverride, setDevPremiumOverride }}>
      {children}
    </DevPremiumContext.Provider>
  );
}

DevPremiumProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDevPremium() {
  const context = useContext(DevPremiumContext);
  // Si pas de contexte (production), retourner null
  if (!context) {
    return { devPremiumOverride: null, setDevPremiumOverride: () => {} };
  }
  return context;
}

export { DevPremiumContext };
