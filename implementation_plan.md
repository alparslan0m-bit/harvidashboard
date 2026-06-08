# Harvi Admin Dashboard — UI/UX Polish Plan

Desktop-first polish pass to make the dashboard feel production-grade and comparable to premium SaaS products. All existing functionality, business logic, routing, and state management are preserved.

---

## UI/UX Audit Summary

### What's Already Good
- Clean component architecture (shared primitives, page-level composition)
- Tailwind v4 + Radix UI foundation is solid
- Theme tokens (light/dark) are well-structured
- Design system concepts exist: `MetricCard`, `SectionCard`, `ChartCard`, `PageHeader`, `DataTable`, `StatusBadge`
- Custom scrollbar, command palette, notification system, slide-over panels

### Findings by Category

#### 1. Typography & Visual Hierarchy — ⚠️ Weak
| Issue | Where | Impact |
|-------|-------|--------|
| Page titles use `text-sm` (14px) — far too small for a page heading | [PageHeader.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/PageHeader.tsx#L25) | Weak page-level hierarchy |
| Section titles use `text-xs uppercase` — reads as a label, not a heading | [SectionCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/SectionCard.tsx#L30) | Sections don't stand out |
| Metric titles use `text-[11px]` — extremely small, hard to scan | [MetricCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/MetricCard.tsx#L44) | KPI cards feel cramped |
| Topbar title uses `text-sm` — same weight as nav items | [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx#L43) | No clear page context |
| Import page uses inline `text-sm font-medium text-muted-foreground` instead of `PageHeader` | [Import.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Import.tsx#L14-L17) | Inconsistent header |
| Sidebar brand text is `text-sm` — same as nav items | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx#L94) | Brand doesn't stand out |

#### 2. Spacing & Density — ⚠️ Inconsistent
| Issue | Where |
|-------|-------|
| Main content padding varies: `p-4 sm:p-5 lg:p-6` — too tight on desktop | [AppShell.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/AppShell.tsx#L45) |
| `space-y-6` on some pages, `space-y-5` on others (Users) | [Users.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Users.tsx#L43) vs [Dashboard.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Dashboard.tsx#L108) |
| KPI grid gap is `gap-5`, charts grid also `gap-5` — uniform gap doesn't create section separation | Dashboard page |
| Sidebar width `220px` is narrow — nav labels feel cramped | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx#L86) |
| Sidebar nav items have `py-1.5` — tight vertical hit area | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx#L124) |
| Topbar and sidebar both `h-14` but don't share a consistent baseline | Layout |

#### 3. Cards & Containers — ⚠️ Minor Issues
| Issue | Where |
|-------|-------|
| MetricCard icon container at `h-8 w-8` with `rounded-lg` feels small | [MetricCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/MetricCard.tsx#L48) |
| ChartCard forces `h-72` — clips taller chart content | [ChartCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ChartCard.tsx#L78) |
| Quick Actions bar uses different card pattern than other cards (no `shadow-sm`, uses `shadow-xs`) | [Dashboard.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Dashboard.tsx#L117) |
| RecentStudentsTable wraps DataTable inside SectionCard with `p-0` then adds `px-5 pt-3` — messy nesting | [RecentStudentsTable.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/dashboard/RecentStudentsTable.tsx#L80-L82) |
| `KPIGrid` doesn't pass `color` prop through — all KPI cards on Dashboard/Purchases pages default to "zinc" unless caller sets it | [KPIGrid.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/KPIGrid.tsx) |

#### 4. Navigation — ⚠️ Minor Issues
| Issue | Where |
|-------|-------|
| Nav item active state uses `border-l-2` + `bg-sidebar-accent` — the left-border is subtle on light mode | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx#L124-L128) |
| Group labels at `text-[10px]` are almost invisible | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx#L109) |
| Topbar search bar `text-[11px]` — too small for a desktop primary action | [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx#L53) |
| Theme toggle moon icon uses `absolute` without a parent `relative` — position may be off | [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx#L70) |

#### 5. Data Presentation (Tables) — ✅ Mostly Good
| Issue | Where |
|-------|-------|
| DataTable uses `text-xs` globally — fine for dense data, but header should be slightly bolder | [DataTable.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/DataTable.tsx#L72) |
| No horizontal separator between DataTable toolbar and table body | DataTable layout |

#### 6. Forms — ⚠️ Minor Issues
| Issue | Where |
|-------|-------|
| Login form uses hardcoded `zinc-*` colors instead of theme tokens — won't respect light/dark theme properly | [Login.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Login.tsx#L45-L108) |
| ConfirmDialog confirm button uses template literal for classNames instead of `cn()` | [ConfirmDialog.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ConfirmDialog.tsx#L94-L98) |

#### 7. Responsiveness — ✅ Good Foundation
| Issue | Where |
|-------|-------|
| Analytics loading skeleton uses `grid-cols-4` without responsive prefix — breaks on mobile | [Analytics.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Analytics.tsx#L43) |
| SlideOver panel at `w-[480px]` will overflow on small screens | [SlideOver.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/SlideOver.tsx#L34) |

#### 8. Accessibility — ⚠️ Needs Work
| Issue | Where |
|-------|-------|
| `select-none` applied broadly including on text content — prevents user text selection | Multiple components |
| Sidebar nav links lack `aria-current` — `NavLink` handles `isActive` styling but semantics are weak | [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx) |
| PageHeader uses `<h2>` for page title — should be `<h1>` for proper heading hierarchy | [PageHeader.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/PageHeader.tsx#L25) |
| SectionCard uses `<h3>` for section titles — correct only if PageHeader is `<h2>` | Heading hierarchy |
| Theme toggle lacks visible focus ring | [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx#L64-L71) |

#### 9. Visual Polish — ⚠️ Needs Refinement
| Issue | Where |
|-------|-------|
| No page-level entrance animations — content appears abruptly | All pages |
| Sidebar lacks a subtle gradient or visual distinction from main content | Sidebar background |
| The entire dashboard feels visually "flat" — needs subtle depth cues | Global |
| Quick Actions bar could benefit from icon color accents | [Dashboard.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Dashboard.tsx#L117-L142) |

---

## User Review Required

> [!IMPORTANT]
> **Desktop-first focus**: Per your request, I will prioritize desktop polish. Mobile responsiveness fixes will be included only where there are clear breakages (like the SlideOver overflow and Analytics skeleton grid). The mobile sidebar drawer will remain as-is.

> [!IMPORTANT]
> **No new dependencies**: All changes use the existing Tailwind v4 + Radix stack. No new npm packages will be added.

> [!IMPORTANT]
> **Login page theming**: The Login page currently uses hardcoded dark colors (`zinc-950`, `zinc-900`, `indigo-600`). I plan to keep its dark aesthetic but wrap colors with theme variables for consistency. If you prefer Login to follow the system light/dark theme instead, let me know.

---

## Open Questions

> [!IMPORTANT]
> **Sidebar width**: Currently `220px`. I'd like to widen to `240px` for breathing room. OK?

> [!IMPORTANT]
> **Color palette**: The dashboard currently uses a neutral gray palette with `emerald`, `indigo`, `amber` accents on metric icons. Should I keep this palette or introduce a branded accent color (e.g., an indigo/blue primary)?

---

## Proposed Changes

### Phase 1: Global Design System Refinements

#### [MODIFY] [index.css](file:///c:/Users/METRO/dashbourd/src/index.css)
- Add a subtle page-entrance animation keyframe (`@keyframes fadeInUp`)
- Add a `.page-enter` utility class for page content fade-in
- Refine border opacity default from `/60` to a more consistent value
- Add focus-visible utility for consistent keyboard focus rings
- Add `body` heading font family rule (Outfit for headings, Inter for body)

---

### Phase 2: Layout & Navigation Polish

#### [MODIFY] [AppShell.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/AppShell.tsx)
- Increase desktop content padding from `lg:p-6` to `lg:p-8`
- Add `page-enter` animation class to `<main>` wrapper
- Add `max-w-[1600px] mx-auto` to main content for large screen readability

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx)
- Widen sidebar from `220px` to `240px`
- Increase nav item padding from `py-1.5` to `py-2` for better hit area
- Enlarge group labels from `text-[10px]` to `text-[11px]`
- Improve active state with stronger left-border color and background
- Add subtle sidebar background gradient for depth
- Increase brand font size and add Outfit font

#### [MODIFY] [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx)
- Upgrade page title from `text-sm` to `text-base font-semibold` with Outfit font
- Fix theme toggle icon `absolute` positioning with `relative` wrapper
- Increase search bar text from `text-[11px]` to `text-xs`
- Add focus-visible rings to all action buttons

---

### Phase 3: Shared Component Polish

#### [MODIFY] [PageHeader.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/PageHeader.tsx)
- Change `<h2>` to `<h1>` for proper heading hierarchy
- Upgrade title from `text-sm` to `text-lg font-bold` with Outfit font
- Upgrade description from `text-xs` to `text-sm`
- Remove unnecessary bottom border — rely on spacing for separation

#### [MODIFY] [SectionCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/SectionCard.tsx)
- Upgrade section title from `text-xs uppercase` to `text-sm font-semibold` (normal case)
- Add subtle hover shadow for interactive feel

#### [MODIFY] [MetricCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/MetricCard.tsx)
- Upgrade title from `text-[11px]` to `text-xs`
- Upgrade value from `text-2xl` to `text-3xl` for stronger visual weight
- Increase icon container from `h-8 w-8` to `h-9 w-9`
- Add subtle gradient background accent strip at top of card

#### [MODIFY] [ChartCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ChartCard.tsx)
- Increase fixed height from `h-72` to `h-80` for better chart visibility
- Pass through height flexibility

#### [MODIFY] [KPIGrid.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/KPIGrid.tsx)
- Forward `color` prop from config to MetricCard

#### [MODIFY] [EmptyState.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/EmptyState.tsx)
- Remove `select-none` from text content (keep on icon)
- Increase icon container size for better proportion

#### [MODIFY] [SlideOver.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/SlideOver.tsx)
- Add responsive width: `w-full sm:w-[480px]` to prevent mobile overflow

#### [MODIFY] [ConfirmDialog.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ConfirmDialog.tsx)
- Replace template literal classNames with `cn()` for consistency

---

### Phase 4: Page-Level Polish

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Dashboard.tsx)
- Standardize page spacing to `space-y-8` for better section breathing
- Polish Quick Actions bar: add icon colors, consistent shadow/border

#### [MODIFY] [Analytics.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Analytics.tsx)
- Fix skeleton grid to use responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

#### [MODIFY] [Import.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Import.tsx)
- Replace inline header with `PageHeader` component for consistency

#### [MODIFY] [Users.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Users.tsx)
- Standardize spacing from `space-y-5` to `space-y-6`

#### [MODIFY] [Curriculum.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Curriculum.tsx)
- Widen breadcrumb to use consistent `text-xs` with proper `gap-1.5`

---

### Phase 5: Accessibility Hardening

#### [MODIFY] Multiple files
- Add `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to interactive elements missing focus rings
- Remove `select-none` from text content that users may want to copy (descriptions, emails, error messages)
- Add `aria-current="page"` to active NavLink in Sidebar
- Ensure heading hierarchy: `<h1>` in PageHeader, `<h2>` in SectionCard titles

---

## Verification Plan

### Automated Tests
```bash
npx tsc --noEmit          # Zero TypeScript errors
npm run build             # Clean production build
```

### Manual Verification
- Verify all 8 pages render correctly with updated styling
- Check light mode and dark mode consistency
- Verify desktop layout at 1440px and 1920px widths
- Confirm sidebar active state is clearly visible
- Confirm page heading hierarchy (h1 → h2 → h3) is correct
- Verify command palette (Ctrl+K) still works
- Verify slide-over panels open/close properly
- Verify notification bell popover works
- Check DataTable pagination and sorting still work
