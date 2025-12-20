/**
 * @fileoverview Harmonized Sizes - Centralized responsive sizing formulas
 * @description Single source of truth for all responsive dimensions across components
 * @created 2025-12-20
 */
import { rs } from './responsive';

/**
 * Centralized responsive sizing system
 * Ensures visual harmony across ControlBar, ActivityCarousel, and PaletteCarousel
 */
export const harmonizedSizes = {
  // ============================================================================
  // CAROUSEL ITEM SIZES (ActivityItem, ColorButton)
  // ============================================================================
  // ActivityItem: 60px (primary decision)
  // ColorButton: 50px (secondary, light ambiance)
  carouselItem: {
    size: rs(60, 'min'), // 60px responsive (both width & height)
    iconSize: rs(32, 'min'), // Icon/emoji size inside item
    borderRadius: 'full', // Fully rounded
  },

  // Palette-specific (color buttons inside palette carousel)
  colorButton: {
    size: rs(50, 'min'), // Reduced from 60px - signals "secondary/light"
    padding: rs(4, 'min'), // Inner padding for color preview
  },

  // ============================================================================
  // SCROLLVIEW SIZING (Carousel containers)
  // ============================================================================
  // Fixed height for scrollable areas - standardized across carousels
  scrollView: {
    height: rs(70, 'min'), // Fixed carousel height
    // RATIONALE: On phones (390px base) = 70px
    //            On tablets: scales to ~113px (acceptable for expanded view)
  },

  // ============================================================================
  // CONTROLBAR SIZING (Solution A: True Center Play Button)
  // ============================================================================
  // Layout Strategy: [Timer (LEFT)] ← ← ← [PLAY CENTER] ← ← ← [Fit + Rotate (RIGHT)]
  //
  // Key insight: Play button is the primary action and must be optically centered
  // Using absolute positioning with marginLeft/marginTop offsets to achieve true centering
  // Container has fixed height (rs(80, 'min')) to contain all sections
  //
  controlBar: {
    // Container dimensions
    containerHeight: rs(80, 'min'), // Fixed height for absolute positioning layout
    containerPadding: {
      horizontal: rs(8), // Lateral padding for left/right sections
    },

    // DigitalTimer sizing
    timerFontSize: {
      compact: rs(20), // Compact mode font
      normal: rs(26), // Normal mode font
    },
    timerPadding: {
      horizontal: rs(8), // Responsive horizontal padding
      vertical: rs(6), // Responsive vertical padding
    },
    timerGap: {
      compact: rs(4), // Gap between controls in compact
      normal: rs(6), // Gap between controls in normal
    },

    // PulseButton sizing (PRIMARY ACTION - CENTERED)
    pulseButton: {
      compact: rs(52), // 48px in compact mode (was 44)
      normal: rs(52), // 52px in normal mode
      // Used to calculate marginLeft/marginTop offsets for true centering
      // offset = -pulseSize / 2
    },

    // Icon button sizes
    fitButton: {
      compact: 'small', // IconButton size preset
      normal: 'medium',
    },
    rotateToggle: {
      compact: rs(32), // Now responsive
      normal: rs(40), // Now responsive
    },

    // Spacing between control buttons (right section)
    buttonGap: {
      compact: rs(8), // Gap between Fit + Rotate (compact)
      normal: rs(13), // Gap between Fit + Rotate (normal)
    },
  },

  // ============================================================================
  // CAROUSEL CONTAINER SPACING
  // ============================================================================
  carouselSpacing: {
    // Container padding (applies to page/palette containers inside scroll)
    containerPadding: {
      horizontal: rs(6, 'width'), // Responsive width-based padding
      vertical: rs(4), // Responsive vertical padding (was theme.spacing.xxs)
    },

    // Gap between items
    itemGap: rs(13), // Responsive gap (was theme.spacing.md hardcoded)

    // Gap between outer container elements (carousels stacked)
    stackGap: rs(4), // Responsive gap between carousel sections
  },

  // ============================================================================
  // TOOLBOX WRAPPER SIZING - Visual Hierarchy (Solution B)
  // ============================================================================
  // Different variants create cognitive hierarchy:
  // - ControlBar: compact, informational (time already set)
  // - ActivityCarousel: DOMINANT, primary choice (semantic decision)
  // - PaletteCarousel: secondary, ambiance only (light, optional)
  toolboxItem: {
    // Default (fallback)
    padding: {
      horizontal: rs(13),
      vertical: rs(13),
    },
    minHeight: rs(70, 'min'),
    borderRadius: 'lg',
  },

  // Variant: controlBar (compact, squeezed)
  toolboxControlBar: {
    padding: {
      horizontal: rs(8), // Reduced horizontal
      vertical: rs(6), // Reduced vertical - signals "info only"
    },
    minHeight: rs(55, 'min'), // Smaller than others - compact info zone
    borderRadius: 'lg',
  },

  // Variant: activityCarousel (DOMINANT - primary choice)
  toolboxActivityCarousel: {
    padding: {
      horizontal: rs(13), // Standard horizontal
      vertical: rs(8), // Standard vertical - signals "important"
    },
    minHeight: rs(80, 'min'), // Larger than others - visual dominance
    borderRadius: 'lg',
  },

  // Variant: paletteCarousel (secondary, light)
  toolboxPaletteCarousel: {
    padding: {
      horizontal: rs(8), // Reduced horizontal
      vertical: rs(4), // Minimal vertical - signals "optional"
    },
    minHeight: rs(65, 'min'), // Slightly reduced - secondary status
    borderRadius: 'lg',
  },

  // ============================================================================
  // RESPONSIVE BREAKPOINT HELPER
  // ============================================================================
  /**
   * Get responsive spacing based on screen size
   * Used for dynamic adjustments in certain scenarios
   */
  getCompactMode: (width) => {
    // Compact mode for narrow screens (< 400px effective width)
    // This helps maintain UI at smaller device sizes
    return width < 400;
  },

  /**
   * Get device tier for conditional sizing
   * 'phone' | 'tablet' | 'large'
   */
  getDeviceTier: (width) => {
    if (width < 600) return 'phone';
    if (width < 1024) return 'tablet-small';
    return 'tablet-large';
  },
};

/**
 * Platform-specific overrides (if needed)
 */
export const platformSizes = {
  ios: {
    borderWidth: 'hairline', // Uses StyleSheet.hairlineWidth
  },
  android: {
    borderWidth: 1, // Standard 1px border
  },
};

/**
 * HARMONY REFERENCE
 * ================================================================================
 *
 * With these centralized values, all components maintain visual consistency:
 *
 * 1. CAROUSEL ITEMS (harmonized at 60px)
 *    - ActivityItem: 60×60px with rs(32) icon/emoji
 *    - ColorButton: 60×60px with rs(4) padding for color preview
 *
 * 2. CAROUSEL HEIGHTS (synchronized at rs(70, 'min'))
 *    - ActivityCarousel scrollView: rs(70, 'min')
 *    - PaletteCarousel scrollView: rs(70, 'min')
 *    - ToolboxItem minHeight: rs(70, 'min')
 *
 * 3. SPACING ALL RESPONSIVE
 *    - All padding/margin/gap use rs() utility
 *    - No hardcoded theme.spacing tokens
 *    - Consistent scaling across phone/tablet devices
 *
 * 4. CONTROLBAR UNIFIED
 *    - All sizes responsive via harmonizedSizes.controlBar
 *    - CircularToggle now responsive (32→40px)
 *    - Gaps between columns responsive
 *
 * 5. DEVICE SCALING PREDICTABLE
 *    - Phone (390px): sizes scale at 1.0x
 *    - Phone Pro (430px): sizes scale at ~1.1x
 *    - Tablet (1024px): sizes scale at ~2.6x
 *    - All use same formula via rs() with consistent 'width'/'min' basis
 *
 * ================================================================================
 */
