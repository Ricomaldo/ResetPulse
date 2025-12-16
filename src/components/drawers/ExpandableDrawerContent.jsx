/**
 * @fileoverview Expandable drawer that shows options (now simplified to 3 sections)
 * Settings moved to separate modal - no longer in drawer
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import PropTypes from 'prop-types';
import OptionsDrawerContent from './OptionsDrawerContent';

/**
 * ExpandableDrawerContent - Now just passes through OptionsDrawerContent
 * 2-level architecture: Drawer shows Couleur/Activité/Échelle
 *                      Settings opened separately via modal
 */
export default function ExpandableDrawerContent({
  currentDuration,
  onSelectPreset,
  drawerVisible,
  onOpenSettings,
}) {
  return (
    <OptionsDrawerContent
      currentDuration={currentDuration}
      onSelectPreset={onSelectPreset}
      drawerVisible={drawerVisible}
      onOpenSettings={onOpenSettings}
    />
  );
}

ExpandableDrawerContent.propTypes = {
  currentDuration: PropTypes.number,
  onSelectPreset: PropTypes.func,
  drawerVisible: PropTypes.bool,
  onOpenSettings: PropTypes.func,
};
