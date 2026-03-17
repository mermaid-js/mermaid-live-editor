# Plan Report: Modern & Refined Visual Theme

**Date:** 2026-03-17
**Plan location:** `plans/260317-1643-modern-refined-visual-theme/`
**Status:** Ready for implementation

## Scope

Full visual theme overhaul for Mermaid Live Editor across 13 files, 9 phases.

## Key Decisions

- **Dark mode accent:** Replace `hsl(340 100% 44%)` (harsh magenta) → `hsl(173 50% 45%)` (teal). Matches light mode's teal accent for cross-mode consistency.
- **Dark mode background:** Replace loud `hsl(214 100% 28%)` (bright blue) → `hsl(222 47% 11%)` (deep navy). Professional, reduces eye strain.
- **Monaco themes:** Material Palenight-inspired dark palette. Light theme colors verified for WCAG AA contrast on white.
- **Grid pattern:** Dots → fine line grid (24px). Engineering-tool aesthetic.
- **Button hover:** Add `-translate-y-px` lift + `shadow-md` on hover for tactile feel. Ghost buttons toned down from full `bg-primary` to subtle `bg-muted`.
- **FloatingToolbar:** Glassmorphism with `backdrop-blur-sm` + `bg-card/80`.
- **Canvas:** `rounded-xl border shadow-sm` wrapper for clear editor/view separation.

## Files Touched (13)

| Priority | File                                               | Phase     |
| -------- | -------------------------------------------------- | --------- |
| P0       | `src/app.css`                                      | 1         |
| P0       | `src/lib/util/monacoExtra.ts`                      | 3         |
| P1       | `src/lib/components/View.svelte`                   | 2, 5B     |
| P1       | `src/lib/components/ui/button/button.svelte`       | 4A        |
| P1       | `src/lib/components/Card/Card.svelte`              | 4B        |
| P1       | `src/lib/components/FloatingToolbar.svelte`        | 4C        |
| P2       | `src/lib/components/Navbar.svelte`                 | 4D        |
| P2       | `src/routes/edit/+page.svelte`                     | 4E, 5A, 6 |
| P2       | `src/lib/components/ui/toggle/toggle.svelte`       | 4F        |
| P2       | `src/lib/components/Card/Tabs.svelte`              | 4G        |
| P3       | `src/lib/components/ui/separator/separator.svelte` | 7         |
| P3       | `src/lib/components/DesktopEditor.svelte`          | 8         |
| P3       | `src/lib/components/MainMenu.svelte`               | 9         |

## Risk Assessment

- **Low risk:** All changes are CSS/styling only. No logic changes.
- **Medium risk:** Monaco theme colors may need tuning after visual inspection.
- **Mitigation:** Test all diagram types (flowchart, sequence, ER, gantt, etc.) in both modes.

## Unresolved Questions

1. Font weight for nav brand: `font-semibold` vs `font-bold`?
2. Canvas inner padding: `p-4` vs `p-2`?
3. Safari backdrop-blur support acceptable?
