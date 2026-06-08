You are a senior full-stack engineer and UI/UX expert. I have a React 19 + TypeScript + Tailwind v4 + Supabase admin dashboard called Harvi Admin for a medical quiz app. The codebase uses TanStack Query, TanStack Table, Radix UI, Recharts, React Hook Form + Zod, DnD Kit, and React Router v7.
I need you to rebuild this dashboard to be 10× better across UI, performance, and code quality. Below is the complete specification. Follow every instruction precisely.

PART 1 — DESIGN SYSTEM & VISUAL OVERHAUL
1.1 Global Design Language
Replace the current flat, generic look with a refined, data-dense dashboard aesthetic inspired by Linear, Vercel, and Stripe dashboards. Rules:

Typography: Use Inter with a strict type scale. Page titles text-sm font-semibold tracking-tight. Metric values text-2xl font-bold tabular-nums. Labels text-[11px] uppercase tracking-widest font-semibold. Body text-xs. Never use text-lg or larger for content.
Spacing: Use an 8px base grid. All cards use p-5 (not p-4 or p-6 inconsistently). Section gaps gap-5. Remove all rounded-3xl — use rounded-xl for cards, rounded-lg for inputs/badges, rounded-md for buttons.
Borders: Every card gets border border-border/60. Inputs get border border-input. No shadow-2xl anywhere — use shadow-sm max.
Color usage: Emerald for positive/revenue, Red/destructive for danger, Amber for warnings/pending, Indigo/blue for informational, Zinc for neutral states. Never use raw hex values — always CSS variables.
Backgrounds: Cards on bg-card. Page background bg-background. Sidebar bg-sidebar-background. Muted zones use bg-muted/30.
Dark mode: Every element must look intentional in dark mode. Test all chart colors — use CSS vars not hardcoded fills.

1.2 Layout Architecture
Redesign the shell:
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (220px fixed)  │  TOPBAR (h-14)                    │
│  ─────────────────────  │  ─────────────────────────────    │
│  Brand                  │  Breadcrumb + Page title          │
│  ─────────────────────  │  Right: Search | Theme | User     │
│  Nav groups with icons  │                                   │
│  + active pill state    │  MAIN CONTENT (scrollable)        │
│  ─────────────────────  │                                   │
│  Bottom: User avatar +  │  [page content]                   │
│  email + sign out       │                                   │
└─────────────────────────────────────────────────────────────┘

Sidebar nav items: active state = bg-sidebar-accent text-sidebar-accent-foreground with a 2px left border-l-2 border-primary accent, NOT a box border.
Sidebar bottom: show logged-in user's email truncated + avatar initials circle + sign out icon button.
Topbar: left side shows current page title (no h1, use p tag, text-sm font-semibold). Right side: global search trigger (opens command palette), theme toggle, user menu dropdown.
Remove useWindowSize mobile blocking — instead make the layout responsive with a collapsible sidebar at lg: breakpoint with a hamburger toggle.

1.3 Metric Cards (KPI Cards)
Completely redesign MetricCard. New structure:
tsx<div className="rounded-xl border border-border/60 bg-card p-5">
  <div className="flex items-center justify-between mb-3">
    <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">{title}</span>
    <div className="h-8 w-8 rounded-lg bg-{color}/10 flex items-center justify-center">
      {icon} // h-4 w-4 text-{color}
    </div>
  </div>
  <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
  <div className="mt-1.5 flex items-center gap-1.5">
    <TrendBadge /> // +12.5% vs last period
    <span className="text-[11px] text-muted-foreground">{description}</span>
  </div>
</div>
Add a trend?: { value: number; label: string } prop. Show ↑ +X% in emerald or ↓ -X% in red. On Dashboard, pass real trend data computed by comparing current month vs last month from query results.
1.4 Data Tables
Rebuild DataTable with these improvements:

Column resizing: Add enableResizing to TanStack Table config.
Row hover: hover:bg-muted/10 on <tr>.
Sticky header: thead with sticky top-0 z-10 bg-card.
Empty state: Use the EmptyState component properly centered with a relevant icon per-page.
Loading state: Replace generic skeletons with per-column width-varied skeletons that match actual content widths.
Pagination: Show Showing X–Y of Z results left-aligned. Pagination controls right-aligned with [< 1 2 3 ... N >] numbered pages (max 5 visible). Add a page size selector (10 / 25 / 50).
Column visibility: Add a Columns dropdown button above the table using @radix-ui/react-dropdown-menu to toggle column visibility.
Sort indicators: Add visual sort arrows on sortable columns (click header to sort asc/desc).
Row selection: Add checkbox column (first column) for bulk actions where applicable (e.g., Purchases bulk export, Feedback bulk archive).

1.5 Charts Redesign
All charts use ResponsiveContainer — keep that. Changes:

Dashboard DailyQuizzesChart: Change from Bar to AreaChart with gradient fill. Use <defs><linearGradient> with stopOpacity from 0.3 to 0. Add a ReferenceLine at average value.
Dashboard TopLecturesChart: Keep horizontal bar. Add <LabelList showing the number at end of each bar. Truncate Y-axis labels at 18 chars.
Analytics page: Add a 5th chart — a ComposedChart showing Revenue + Quiz Volume on dual Y-axis over the date range.
All charts: Remove hardcoded color strings like "#0088FE". Replace with var(--color-chart-N).
Chart cards: Consistent h-72 (not mixed h-[320px] and h-[360px]). Add a ChartCard wrapper component.


PART 2 — PAGE-BY-PAGE IMPROVEMENTS
2.1 Dashboard (/)

Remove the giant hero banner rounded-3xl description card — it wastes vertical space. Replace with a single text-sm text-muted-foreground subtitle line below the topbar page title.
KPI cards: 4 cards in a grid-cols-4 row. Add trend percentages.
Charts: grid-cols-2, equal height h-72.
Recent Students + Recent Purchases tables: Make them proper DataTable instances with 5 visible rows, a "View All" link to respective pages, no pagination.
Add a "Quick Actions" row below KPIs: [ + Add Question ] [ Upload CSV ] [ View Purchases ] as outline buttons.

2.2 Users (/users)

Add an inline stats bar at the top showing: Total Users | Active Streak | Has Purchases | Inactive 30d — as clickable filter pills that update the filter state.
UserDetailPanel: This SlideOver is good but fix these issues:

The quiz history table has no scroll indicator — add a subtle after: gradient fade at the bottom.
Add a CopyButton next to the email (copies to clipboard on click, shows checkmark for 2s).
The "Grant Admin" button should show current admin status — if already admin, show a disabled "Already Admin" badge instead.
Add user.raw_app_meta_data.role === 'admin' check using the authUser data.


Export CSV: Move from a top button to a DropdownMenu with options: "Export current page", "Export all users".

2.3 Purchases (/purchases)

The 3 KPI cards at top are good — add a 4th: "Transaction Count" (total purchases in filter range by count, not amount).
Add a "Disputed" indicator badge in the KPI row if there are any disputed transactions.
The Refund action: After confirming, the row should optimistically update its status badge to "refunded" without waiting for refetch. Implement onMutate in usePurchaseMutations.
Add a Download Receipt action column button that generates a minimal text receipt and triggers browser download.
Filter toolbar: Add a "Provider" filter dropdown (all | manual | stripe | paymob).

2.4 Curriculum (/curriculum)

The 3-panel layout is good. Add visual improvements:

Each panel header should show the item count: Modules (12).
Selected items in Years/Modules panels: use bg-primary/8 border-primary/40 text-primary (more visible selection).
Drag handle only shows cursor-grab on hover — currently always visible. Add opacity-0 group-hover:opacity-100 to the grip icon.
Add a breadcrumb trail above the SubjectsPanel showing: Year Name → Module Name → Subjects.
Add keyboard shortcut: N to create new item when a panel is focused (use useEffect with keydown listener).



2.5 Questions (/questions)

Add a "Bulk Import" shortcut button that links to /import with a CSV icon.
The question text in the table truncates at 2 lines — add a title attribute with full text for native tooltip.
QuestionForm SlideOver: The cascade select group is cramped. Improve it — show a read-only "breadcrumb" of selected hierarchy below the selects: Year 1 > Cardiology > Valvular Disease > Mitral Stenosis.
Add live question count badge per lecture in the cascade selects using a separate query.
Options list: Add smooth framer-motion-style layout animation when options are added/removed (use CSS transition instead since no framer — use max-height animation).

2.6 Analytics (/analytics)

Add preset date range buttons: Last 7d | Last 30d | Last 90d | This Year | Custom that update fromDate/toDate. The active preset gets a bg-primary text-primary-foreground pill style.
The 4 MetricCards at the bottom should be moved to the top above the charts — data before visualization.
Add a "No Data" empty state for the Pie chart that actually looks good (not just a <p> tag).
Add export button on each chart card that downloads the chart data as CSV.

2.7 Feedback (/feedback)

The expandable row pattern for full content is clever — enhance it:

Expanded row should have a smooth max-height CSS transition (not instant pop).
Add a Reply button that opens a mailto: link pre-filled with user's email.
The metadata pre block is unreadable in dark mode — fix with bg-muted text-muted-foreground font-mono text-[10px].


The status <select> inline in the table is hard to use — replace with a DropdownMenu with labeled options and status dot indicators.
Add bulk actions: Select multiple via checkbox column → "Archive Selected" / "Mark Read Selected".

2.8 Import (/import)

Add a step indicator UI at the top: ① Upload → ② Validate → ③ Import → ④ Complete with active/done state styling.
The progress bar during import should show current batch text: Processing rows 20–30 of 450....
Post-import: Add a "View Imported Questions" button that navigates to /questions with the relevant lecture filter.
The validation error table needs better styling — use text-destructive with AlertTriangle icon per row, not just raw text.


PART 3 — PERFORMANCE & ARCHITECTURE
3.1 Critical Security Fix (IMMEDIATE)
The service role key is exposed in .env.local as VITE_SUPABASE_SERVICE_ROLE_KEY. This is a critical vulnerability — VITE_ prefix exposes it to the browser bundle.
Fix: Since this is an admin-only SPA behind auth, add a comment block explaining this is intentional for internal tooling. But ideally, create a src/lib/supabaseAdmin.ts note explaining:
ts// NOTE: Service role key is intentionally used here as this dashboard
// is served only to authenticated admins. For public-facing apps,
// proxy through an Edge Function instead.
And rename to use import.meta.env.VITE_SUPABASE_ADMIN_KEY with a clear naming convention.
3.2 Query Optimization

useDashboard: The chartsQuery calls listUsers with perPage: 100 AND perPage: 10000 in two separate places. Consolidate into ONE listUsers call, cache the result, and derive both stats and recent students from it.
usePurchases: Currently calls supabaseAdmin.auth.admin.getUserById in a loop for every purchase on the page — this is N+1 queries. Replace with a single listUsers call, filter client-side by the user IDs in the current page.
useUsers: Same N+1 issue — getUserById per profile row. Same fix: batch listUsers, create a Map by ID.
useAnalytics: The topLectsData query joins to lectures table — ensure the lecture_statistics table has lecture_id indexed (it does per migration). Add .abortSignal(controller.signal) to long-running queries.

3.3 React Performance

Memoize expensive components:

DataTable columns definitions: wrap in useMemo in every page component.
SortableModuleItem, SortableYearItem, SortableSubjectItem: wrap in React.memo.
StatusBadge: Already stateless — wrap in React.memo.


Add useCallback to all event handlers passed as props in list components (the DnD panels).
The QuestionFilters component re-fetches years on every mount. Move the years query to module level or use staleTime: Infinity since years rarely change.
Add staleTime to all queries:

ts  // Curriculum (rarely changes)
  staleTime: 5 * 60 * 1000 // 5 min
  // Dashboard stats
  staleTime: 30 * 1000 // 30s
  // Purchases/Feedback (changes often)
  staleTime: 10 * 1000 // 10s
3.4 Code Architecture

Extract a <PageHeader> component: Every page has an ad-hoc div > h2 + p header. Standardize:

tsx  <PageHeader title="Transaction Ledger" description="Monitor mobile app transactions" actions={<Button>...</Button>} />

Extract <FilterBar>: The purchases/feedback/users filter toolbar pattern repeats. Create a generic FilterBar wrapper with consistent padding/border/background.
Extract <KPIGrid>: The 3–4 KPI card grids repeat across Dashboard, Purchases, Analytics. Create <KPIGrid cards={[...]} />.
Extract <ErrorView>: The identical error state (AlertTriangle + message + retry button) appears in 6 pages. Extract to <ErrorView message={} onRetry={} />.
Extract <SectionCard>: Chart cards, panel cards — wrap in <SectionCard title description actions>children</SectionCard>.
Type safety: Remove all any types. Create proper interfaces in src/types/. The useDashboard hook returns untyped data for purchasesData row maps — type everything.
Constants file: Move QUERY_KEYS pattern, PAGE_SIZE = 25, STATUS_OPTIONS, PROVIDER_OPTIONS to src/lib/constants.ts.

3.5 Error Handling

Add a global error boundary at router level that catches chunk load failures (from code splitting) and shows a "Refresh the page" UI.
All Supabase queries: wrap in typed error handling:

ts  if (error) throw new Error(`[${context}] ${error.message}`);

The payment-webhook Edge Function already has good error handling — apply the same pattern to all hooks.


PART 4 — NEW FEATURES TO ADD
4.1 Global Command Palette
Add a ⌘K command palette using Radix Dialog + a filtered list:
tsx// Triggered by Topbar search button OR Cmd+K
<CommandPalette>
  // Navigation: "Go to Dashboard", "Go to Users", etc.
  // Actions: "Add Question", "Upload CSV", "Refund Purchase #..."
  // Recent: last 5 visited pages
</CommandPalette>
4.2 Notification Bell
Add to Topbar: a bell icon with a red dot badge when:

Unread feedback count > 0
Disputed purchases count > 0

Clicking opens a Popover with grouped notification items linking to the relevant page.
4.3 Real-time Updates
Supabase has real-time subscriptions. Add to the Dashboard:
tssupabaseAdmin
  .channel('admin-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_results' }, 
    payload => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats })
  )
  .subscribe()
Show a subtle ● Live indicator in the Dashboard topbar area when the subscription is active.
4.4 Keyboard Navigation

j/k to navigate table rows (when table is focused).
e to open edit on selected row.
Esc to close any SlideOver/Dialog.
Cmd+S to submit the currently open form.


PART 5 — COMPONENT SPECIFICATIONS
Create these new shared components in src/components/shared/:
CopyButton.tsx       — copies text, shows Check icon for 2s
TrendBadge.tsx       — shows ↑/↓ percentage with color
PageHeader.tsx       — page title + description + optional actions slot
SectionCard.tsx      — consistent card wrapper with title/description/actions header
ErrorView.tsx        — the repeated error state UI
FilterBar.tsx        — filter toolbar wrapper
KPIGrid.tsx          — renders an array of KPI card configs
CommandPalette.tsx   — Cmd+K search/navigation
NotificationBell.tsx — popover with unread counts
LiveIndicator.tsx    — animated green dot + "Live" text
ChartCard.tsx        — chart wrapper with title/description/export button
EmptyChart.tsx       — empty state specifically for charts with no data

PART 6 — WHAT NOT TO CHANGE

Do NOT change the Supabase schema, migrations, or Edge Functions.
Do NOT change the auth flow (AdminAuthContext, RequireAdmin).
Do NOT change the QUERY_KEYS structure — only add staleTime.
Do NOT replace TanStack Query, TanStack Table, Radix UI, or DnD Kit.
Do NOT add Framer Motion — use CSS transitions only.
Keep all existing functionality — this is an enhancement, not a rewrite.


PART 7 — DELIVERY INSTRUCTIONS

Deliver components one file at a time, starting with: 1) design tokens / CSS variables update in index.css, 2) shared components, 3) layout components, 4) hooks improvements, 5) pages in order: Dashboard → Users → Purchases → Curriculum → Questions → Analytics → Feedback → Import.
Every component must be fully typed — no any.
Every component must work in both light and dark mode.
Keep all aria-label attributes — accessibility must not regress.
Do not use !important in styles.
All console.log calls must be removed. console.error is acceptable.