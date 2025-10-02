// src/constants/gridLayout.js
import { rs } from '../styles/responsive';

/**
 * Grid Layout constants based on Golden Ratio (φ = 1.618)
 *
 * Screen structure:
 * ┌────────────────────────────────┐
 * │ Header (50px)                  │
 * ├────────────────────────────────┤
 * │ Activities (80px) ← 50 × φ     │
 * ├────────────────────────────────┤
 * │ Timer (flex: 1)                │
 * │   - Circle centered            │
 * │   - Controls absolute          │
 * ├────────────────────────────────┤
 * │ Palette (80px)                 │
 * └────────────────────────────────┘
 */

// Golden Ratio
const PHI = 1.618;

// Fixed heights (in base pixels, will be scaled with rs())
export const GRID_HEIGHTS = {
  HEADER: 50,
  ACTIVITIES: 80,  // 50 × 1.618 ≈ 80
  PALETTE: 80,     // Same as activities for symmetry
};

// Responsive heights - This is ALL Grid needs to provide
export const getGridHeights = () => ({
  header: rs(GRID_HEIGHTS.HEADER, 'height'),
  activities: rs(GRID_HEIGHTS.ACTIVITIES, 'height'),
  palette: rs(GRID_HEIGHTS.PALETTE, 'height'),
});
