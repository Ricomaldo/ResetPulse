---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: ADR
adr-id: 'resetpulse-01'
---

# ADR-resetpulse-01: Internal Structure Convention

## Status

**Accepted** (Project-specific deviation from system ADR-01)

## Context

The system-level ADR-01 (Architecture V2) defines naming conventions for project meta-directories:

```
# System ADR-01 Convention
__cockpit__/     # Operations (double underscore)
_docs_/          # Documentation (underscore + suffix)
```

ResetPulse uses a different structure:

```
# ResetPulse Convention
_internal/
├── cockpit/     # Operations
└── docs/        # Documentation
```

This deviation was established during the M1-M4 development phase (Sept-Oct 2025) before ADR-01 was finalized at the system level.

## Decision

**Accept `_internal/` as the project-specific convention for ResetPulse.**

### Rationale

1. **Migration Cost**: Renaming to `__cockpit__/` + `_docs_/` would require updating:
   - 50+ internal references
   - CLAUDE.md and all README files
   - Git history would lose context
   - Risk of broken links during active development

2. **Functional Equivalence**: The `_internal/` structure provides identical functionality:
   - Clear separation of operations (cockpit) and documentation (docs)
   - Same workflow patterns apply
   - Compatible with cockpit framework

3. **Single Wrapper Benefit**: Having both cockpit and docs under `_internal/` provides a cleaner root directory:
   ```
   resetpulse/
   ├── _internal/    # All project meta-files (single entry point)
   ├── _external/    # External integrations
   ├── src/          # Source code
   └── ...
   ```

4. **Documentation**: This ADR formally documents the deviation, making it explicit rather than implicit.

## Consequences

### Positive

- No migration required during active M8 milestone
- Clean single-folder meta-structure
- Explicit documentation of convention

### Negative

- Inconsistent with system ADR-01 (requires mental translation)
- May confuse new agents reading system conventions first

### Mitigations

1. CLAUDE.md clearly documents the `_internal/` structure
2. This ADR is referenced in architecture audits
3. Cockpit framework features work identically

## Alternatives Considered

### Option A: Migrate to ADR-01 Compliant Names

```
_internal/cockpit/ → __cockpit__/
_internal/docs/    → _docs_/
```

**Rejected**: High migration cost, low benefit, risk during active development

### Option B: Hybrid Approach

Keep `_internal/` but rename contents:
```
_internal/
├── __cockpit__/
└── _docs_/
```

**Rejected**: Awkward nesting, no clear benefit

### Option C: Accept Deviation (Selected)

Document deviation as project-specific ADR.

**Selected**: Low cost, clear documentation, functional equivalence.

## Compliance

| Convention | System ADR-01 | ResetPulse | Status |
|------------|---------------|------------|--------|
| Cockpit location | `__cockpit__/` | `_internal/cockpit/` | Deviated |
| Docs location | `_docs_/` | `_internal/docs/` | Deviated |
| Internal structure | - | `_internal/workflow/`, etc. | Custom |
| Documentation standard | Same | Same | Compliant |
| Frontmatter standard | Same | Same | Compliant |

## References

- System ADR-01: `~/dev/_ref/standards/ADR-01-architecture-v2.md`
- Cockpit Framework: `~/dev/_ref/frameworks/cockpit.md`
- Project CLAUDE.md: `./CLAUDE.md`

---

**Decision Date**: 2025-12-14
**Author**: Atlas/Claude-Architect
**Reviewed By**: Pending Eric approval
