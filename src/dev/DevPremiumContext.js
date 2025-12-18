// src/dev/DevPremiumContext.js
// Contexte pour override dev (premium + favorite tool)

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PREMIUM, DEV_MODE } from '../config/test-mode';

const DevPremiumContext = createContext(null);

/**
 * Provider for dev overrides context (premium override only)
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export function DevPremiumProvider({ children }) {
  const [devPremiumOverride, setDevPremiumOverride] = useState(
    DEV_MODE ? DEFAULT_PREMIUM : null
  );

  return (
    <DevPremiumContext.Provider
      value={{
        devPremiumOverride,
        setDevPremiumOverride,
      }}
    >
      {children}
    </DevPremiumContext.Provider>
  );
}

DevPremiumProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDevPremium() {
  const context = useContext(DevPremiumContext);
  // Si pas de contexte (production), retourner defaults
  if (!context) {
    return {
      devPremiumOverride: null,
      setDevPremiumOverride: () => {},
    };
  }
  return context;
}

export { DevPremiumContext };
