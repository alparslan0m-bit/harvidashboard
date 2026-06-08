# Implementation Plan - Harvi Admin Dashboard Rebuild

Rebuilding the admin dashboard for the medical quiz app (Harvi Admin) to be high-performance, visually premium, and secure.

## User Review Required

> [!IMPORTANT]
> The security fix (exposing Supabase Service Role key) requires transitioning `.env.local` variable `VITE_SUPABASE_SERVICE_ROLE_KEY` to a comment block and renaming/creating `VITE_SUPABASE_ADMIN_KEY` for internal use since it's an admin-only SPA behind authentication.
> We must consolidately fetch auth users to solve the N+1 queries. Since `supabaseAdmin.auth.admin.listUsers` has a maximum pagination/limit of 10000, we'll implement a centralized query caching strategy or use a singular `listUsers` lookup that caches in-memory for the duration of the query lifecycle.

## Open Questions

> [!NOTE]
> None at the moment. We will proceed with the detailed spec as written.

## Proposed Changes

---

### Phase 1: Global Design System & Shell Architecture

#### [MODIFY] [index.css](file:///c:/Users/METRO/dashbourd/src/index.css)
Update CSS variables for the global color palette, premium typography (Inter), rounded corners configuration (no `rounded-3xl` usage, standard `rounded-xl`/`rounded-lg`/`rounded-md`), and explicit dark mode compatibility rules.

#### [MODIFY] [AppShell.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/AppShell.tsx)
Remove `useWindowSize` desktop blocking logic. Make the layout fully responsive. Add a collapsible sidebar mechanism at the `lg:` tailwind breakpoint with a Hamburger trigger.

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Sidebar.tsx)
Redesign sidebar nav links to have a left indicator border (`border-l-2 border-primary`) instead of a box border when active. Add logged-in user profile, initials badge, and sign-out button at the bottom of the sidebar.

#### [MODIFY] [Topbar.tsx](file:///c:/Users/METRO/dashbourd/src/components/layout/Topbar.tsx)
Add command palette search trigger, theme toggle, and notification bell with popover. Display the page title using a `<p>` tag with `text-sm font-semibold`.

---

### Phase 2: Performance & Supabase Query Optimization

#### [MODIFY] [supabaseAdmin.ts](file:///c:/Users/METRO/dashbourd/src/lib/supabaseAdmin.ts)
Rename/rework to load the service role key under `VITE_SUPABASE_ADMIN_KEY` name and include the warning comment explaining it is intentional for this authenticated internal dashboard.

#### [NEW] [supabaseAdmin.ts (Note / Refactoring docs)](file:///c:/Users/METRO/dashbourd/src/lib/supabaseAdmin.ts)
Implement explicit annotations.

#### [MODIFY] [useDashboard.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useDashboard.ts)
Consolidate separate `listUsers` calls into a single call with cached/derived computations. Apply a `staleTime` of 30 seconds for dashboard stats. Rework daily quizzes chart query data and Top lectures mapping.

#### [MODIFY] [useUsers.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useUsers.ts)
Optimize pagination and resolve user emails client-side by batch-fetching all users in the page via `listUsers` instead of query looping (`getUserById` N+1 problem). Add a `staleTime` of 10 seconds.

#### [MODIFY] [usePurchases.ts](file:///c:/Users/METRO/dashbourd/src/hooks/usePurchases.ts)
Fix N+1 query issue for user emails. Consolidation `listUsers` call and filter client-side. Apply a `staleTime` of 10 seconds.

#### [MODIFY] [useFeedback.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedback.ts)
Consolidate email lookups to avoid N+1 queries. Apply a `staleTime` of 10 seconds.

---

### Phase 3: Shared UI Components (New & Overhauled)

We will create the new shared components in `src/components/shared/` as requested:

#### [NEW] [CopyButton.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/CopyButton.tsx)
A component to copy text to the clipboard and show a checkmark icon for 2 seconds.

#### [NEW] [TrendBadge.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/TrendBadge.tsx)
Renders a trend percentage (e.g. +12.5% or -3.2%) with dynamic color (emerald for positive, red for negative).

#### [NEW] [PageHeader.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/PageHeader.tsx)
Unified page header with titles, subtitles, and optional action buttons slot.

#### [NEW] [SectionCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/SectionCard.tsx)
Wrapper layout for content blocks and panels with title, description, and actions headers.

#### [NEW] [ErrorView.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ErrorView.tsx)
Standardized error component with AlertTriangle, description, and Retry button.

#### [NEW] [FilterBar.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/FilterBar.tsx)
Wrapper component to render consistent padding/border/background for data page filters.

#### [NEW] [KPIGrid.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/KPIGrid.tsx)
Renders grids of metric cards dynamically.

#### [NEW] [CommandPalette.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/CommandPalette.tsx)
Radix-based ⌘K palette supporting page routing and quick actions.

#### [NEW] [NotificationBell.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/NotificationBell.tsx)
Topbar bell listing unread feedback and disputed transaction counts.

#### [NEW] [LiveIndicator.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/LiveIndicator.tsx)
Animated green dot representing the real-time Supabase subscription status.

#### [NEW] [ChartCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ChartCard.tsx)
Chart visual container featuring CSV export options.

#### [NEW] [EmptyChart.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/EmptyChart.tsx)
Polished fallback when charts contain empty/null datasets.

#### [MODIFY] [MetricCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/MetricCard.tsx)
Rework visual styling to use the 8px grid, new colors, typography rules, and `TrendBadge`.

#### [MODIFY] [DataTable.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/DataTable.tsx)
Add column resizing, sticky header, row hover effects, Radix-based columns visibility selector, checkbox rows selection, sort indicators, pagination item count status, and customized row skeletons.

---

### Phase 4: Page Rebuilds & Interactive Enhancements

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Dashboard.tsx)
Incorporate the real-time Supabase updates listener (live indicator), consolidated stats queries, quick actions row, area daily quizzes chart with gradient fill and average ReferenceLine, horizontal top lectures chart, and recent student/purchase data tables.

#### [MODIFY] [Users.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Users.tsx)
Add clickable filters pill bar (Total Users, Active Streak, Has Purchases, Inactive 30d). Replace simple CSV button with dropdown option exports (Current Page vs All).

#### [MODIFY] [UserDetailPanel.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserDetailPanel.tsx)
Add copy button to emails, scroll fade gradient on tables, admin status check, and disabled already-admin badge.

#### [MODIFY] [Purchases.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Purchases.tsx)
Add 4th metric card ("Transaction Count"). Add disputed alerts in KPI row. Rework refund trigger with optimistic state update. Add dynamic provider drop filters.

#### [MODIFY] [Curriculum.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Curriculum.tsx)
Rework drag handles behavior (only visible on hover via group classes). Add counts to header modules. Add breadcrumbs to subject lists. Add 'N' key shortcut to create new items.

#### [MODIFY] [Questions.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Questions.tsx)
Add bulk import link trigger. Add native text tooltips on question lists. Add readable breadcrumb hierarchy in the select slide-over details panel.

#### [MODIFY] [Analytics.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Analytics.tsx)
Move MetricCards row to the top. Add date preset buttons. Rework charts toComposed revenue/quiz dual Y-axis representation. Empty chart styling.

#### [MODIFY] [Feedback.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Feedback.tsx)
Rework row expansion with smooth height transitions. Rework inline select to Radix dropdown menu. Add mailto reply pre-fills. Add code tags styling to dark mode metadata blocks. Add bulk archive/read actions.

#### [MODIFY] [Import.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Import.tsx)
Add step indicator flow tracking. Add current import batch description strings. Add link redirection to imported questions page.

---

### Phase 5: Routing & Global Configuration

#### [MODIFY] [index.tsx (Router)](file:///c:/Users/METRO/dashbourd/src/router/index.tsx)
Wrap routing layers in a global router error boundary to catch chunk loader failures.

---

## Verification Plan

### Automated Tests
- Build verification: `npm run build`
- Type checking verification: `npm run typecheck`

### Manual Verification
- Verify that light/dark mode applies uniformly to all elements.
- Verify ⌘K Command Palette operation.
- Verify realtime Supabase subscription trigger on new quiz result inserts.
- Verify responsiveness and collapsible drawer navigation.
