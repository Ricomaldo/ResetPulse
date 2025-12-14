---
created: '2025-12-14'
updated: '2025-12-14'
status: archived
type: code-archive
---

# Legacy Components Archive — 2025-12-14

## Summary

7 deprecated components from `src/components/legacy/` archived during Audit #7 Architecture Review cleanup.

**Reason for archival**: No active imports found in codebase. Components replaced by new implementations with better UX/architecture.

---

## Archived Components

| Component | Original Path | Replacement | Reason |
|-----------|---------------|-------------|--------|
| **ColorSelector.jsx** | `src/components/legacy/` | Integrated in DialCenter | Simplified: color selection now embedded in timer dial |
| **PaletteSelector.jsx** | `src/components/legacy/` | `PaletteCarousel.jsx` | Carousel UX superior to grid selector for mobile |
| **DurationPopover.jsx** | `src/components/legacy/` | `DurationPicker.jsx` (in pickers/) | New picker with better accessibility |
| **ControlButtons.jsx** | `src/components/legacy/` | Inline controls in TimerScreen | Integrated directly into main screen layout |
| **DigitalTimerToggle.jsx** | `src/components/legacy/` | Settings option | Moved to SettingsModal as persistent preference |
| **TimerOptions.jsx** | `src/components/legacy/` | `OptionsDrawer.jsx` | Drawer UX with better organization |
| **index.js** | `src/components/legacy/` | N/A | Export aggregator (no longer needed) |

---

## Timeline

| Date | Event |
|------|-------|
| **Pre-M7** | Components active in codebase |
| **M7-M8** | Gradual replacement with new implementations |
| **2025-12-14** | Audit #7 confirmed zero active imports → archived |

---

## Key Improvements in Replacements

### 1. **Carousel Pattern** (vs Grid Selectors)
- **Old**: Grid-based selectors (PaletteSelector, ColorSelector)
- **New**: Horizontal carousels with haptic feedback
- **Benefit**: Better mobile UX, easier one-handed use, clearer focus

### 2. **Drawer Architecture** (vs Modal Popovers)
- **Old**: Multiple popovers (DurationPopover, TimerOptions)
- **New**: Unified drawer system (OptionsDrawer, ExpandableDrawer)
- **Benefit**: Consistent interaction pattern, better screen real estate

### 3. **Context Integration** (vs Prop Drilling)
- **Old**: Components received all state via props
- **New**: Use TimerPaletteContext, TimerOptionsContext directly
- **Benefit**: Cleaner component tree, easier state management

### 4. **Accessibility** (WCAG AA)
- **Old**: Limited screen reader support, unclear touch targets
- **New**: Full accessibility labels, 44×44pt minimum targets
- **Benefit**: Usable by neurodiverse users with assistive tech

---

## Code Preservation Rationale

**Why archive instead of delete?**

1. **Reference**: Implementation patterns may inform future features
2. **Regression Safety**: If new implementation has issues, old code available for comparison
3. **Learning**: Shows evolution of codebase architecture (M1-M8)
4. **Audit Trail**: Preserves "why" decisions were made

---

## Migration Notes

**If you need to restore a legacy component temporarily:**

```bash
# Copy from archive back to src/components/legacy/
cp _internal/docs/legacy/code-archive/components-legacy-2025-12-14/ComponentName.jsx \
   src/components/legacy/

# Remember to add imports where needed
```

**Not recommended** — replacements are superior in UX/a11y/architecture.

---

## Related Documentation

- **Architecture Audit**: `_internal/cockpit/knowledge/findings/2025-12-14_07-architecture.v2.md`
- **Onboarding Evolution**: `_internal/docs/guides/features/onboarding-brief.md`
- **Component Structure**: `_internal/docs/architecture/README.md`

---

## Metadata

**Archived by**: Eleonore/Claude-Quality
**Audit**: #7 Architecture Review
**Import Scan**: 2025-12-14 (zero active imports confirmed)
**Files**: 7 total (6 components + 1 index)
**Size**: ~15KB total

---

**End of Archive Documentation**
