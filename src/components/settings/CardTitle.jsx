/**
 * @fileoverview CardTitle - Reusable title component with icon for settings cards
 * @created 2025-12-20
 */

import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { rs } from '../../styles/responsive';

/**
 * CardTitle - Render card title with Lucide icon
 *
 * @param {React.Component} Icon - Lucide icon component
 * @param {string} label - Title text
 * @param {object} theme - Theme object from useTheme()
 */
export const CardTitle = ({ Icon, label, theme }) => (
  <View style={{ alignItems: 'center', flexDirection: 'row', gap: rs(12) }}>
    <Icon color={theme.colors.brand.primary} size={rs(20, 'min')} strokeWidth={1.5} />
    <Text style={{ color: theme.colors.text, fontSize: rs(16, 'min'), fontWeight: '600', flex: 1 }}>
      {label}
    </Text>
  </View>
);

CardTitle.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

export default CardTitle;
