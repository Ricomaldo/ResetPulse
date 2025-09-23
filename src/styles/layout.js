import { StyleSheet, Dimensions } from 'react-native';
import { theme } from './theme';
import { rs } from './responsive';

const { width } = Dimensions.get('window');

// Export from responsive.js for backward compatibility
export const responsiveSize = (size) => rs(size, 'width');

// Golden dimensions calculator
export const getGoldenDimensions = (baseSize, type = 'rectangle') => {
  if (type === 'rectangle') {
    return {
      width: baseSize,
      height: baseSize / theme.golden,
    };
  }
  return {
    width: baseSize,
    height: baseSize,
  };
};

export const layoutStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerPadded: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  
  // Flex layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Spacing utilities
  marginXs: { margin: theme.spacing.xs },
  marginSm: { margin: theme.spacing.sm },
  marginMd: { margin: theme.spacing.md },
  marginLg: { margin: theme.spacing.lg },
  marginXl: { margin: theme.spacing.xl },
  
  paddingXs: { padding: theme.spacing.xs },
  paddingSm: { padding: theme.spacing.sm },
  paddingMd: { padding: theme.spacing.md },
  paddingLg: { padding: theme.spacing.lg },
  paddingXl: { padding: theme.spacing.xl },
  
  // Margin specific
  marginTopXs: { marginTop: theme.spacing.xs },
  marginTopSm: { marginTop: theme.spacing.sm },
  marginTopMd: { marginTop: theme.spacing.md },
  marginTopLg: { marginTop: theme.spacing.lg },
  marginTopXl: { marginTop: theme.spacing.xl },
  
  marginBottomXs: { marginBottom: theme.spacing.xs },
  marginBottomSm: { marginBottom: theme.spacing.sm },
  marginBottomMd: { marginBottom: theme.spacing.md },
  marginBottomLg: { marginBottom: theme.spacing.lg },
  marginBottomXl: { marginBottom: theme.spacing.xl },
  
  marginLeftXs: { marginLeft: theme.spacing.xs },
  marginLeftSm: { marginLeft: theme.spacing.sm },
  marginLeftMd: { marginLeft: theme.spacing.md },
  marginLeftLg: { marginLeft: theme.spacing.lg },
  marginLeftXl: { marginLeft: theme.spacing.xl },
  
  marginRightXs: { marginRight: theme.spacing.xs },
  marginRightSm: { marginRight: theme.spacing.sm },
  marginRightMd: { marginRight: theme.spacing.md },
  marginRightLg: { marginRight: theme.spacing.lg },
  marginRightXl: { marginRight: theme.spacing.xl },
  
  // Padding specific
  paddingTopXs: { paddingTop: theme.spacing.xs },
  paddingTopSm: { paddingTop: theme.spacing.sm },
  paddingTopMd: { paddingTop: theme.spacing.md },
  paddingTopLg: { paddingTop: theme.spacing.lg },
  paddingTopXl: { paddingTop: theme.spacing.xl },
  
  paddingBottomXs: { paddingBottom: theme.spacing.xs },
  paddingBottomSm: { paddingBottom: theme.spacing.sm },
  paddingBottomMd: { paddingBottom: theme.spacing.md },
  paddingBottomLg: { paddingBottom: theme.spacing.lg },
  paddingBottomXl: { paddingBottom: theme.spacing.xl },
  
  paddingLeftXs: { paddingLeft: theme.spacing.xs },
  paddingLeftSm: { paddingLeft: theme.spacing.sm },
  paddingLeftMd: { paddingLeft: theme.spacing.md },
  paddingLeftLg: { paddingLeft: theme.spacing.lg },
  paddingLeftXl: { paddingLeft: theme.spacing.xl },
  
  paddingRightXs: { paddingRight: theme.spacing.xs },
  paddingRightSm: { paddingRight: theme.spacing.sm },
  paddingRightMd: { paddingRight: theme.spacing.md },
  paddingRightLg: { paddingRight: theme.spacing.lg },
  paddingRightXl: { paddingRight: theme.spacing.xl },
  
  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardElevated: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  // Button styles
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  
  // Position utilities
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  
  // Golden ratio utilities
  goldenWidth: {
    width: `${100 / theme.spacing.golden}%`,
  },
  goldenHeight: {
    height: `${100 / theme.spacing.golden}%`,
  },
});
