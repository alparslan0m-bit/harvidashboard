# Harvi Admin Dashboard — Senior Bug Hunt & Code Audit

Full-codebase audit applying the **Bug Hunting** and **Senior Engineer** skill methodologies. Findings are ranked by severity.

---

## 🔴 Critical Bugs (Will Cause Incorrect Behavior)

### BUG-1: User Filter Mismatch — "Inactive 30d" filter is completely broken

The UI sends `"inactive_30_days"` but `constants.ts` defines `"inactive_30d"`. There are **three different values** used across the codebase for the same concept:

| Location | Value Used |
|---|---|
| [constants.ts:L38](file:///c:/Users/METRO/dashbourd/src/lib/constants.ts#L38) | `"inactive_30d"` |
| [UserFilters.tsx:L22](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserFilters.tsx#L22) | `"inactive_30_days"` |
| [useUsersList.ts:L24](file:///c:/Users/METRO/dashbourd/src/hooks/users/useUsersList.ts#L24) | `"inactive_30_days"` |

> [!CAUTION]
> The `USER_FILTER_OPTIONS` constant in `constants.ts` defines `"inactive_30d"`, but the `UserFilters` component hardcodes its own presets with `"inactive_30_days"`. The `useUsersList` hook checks for `"inactive_30_days"`. **If the constants are ever actually used (they aren't — see BUG-2), the filter will silently fail.** The constant and component are out of sync — a ticking time bomb.

**Root cause**: `UserFilters.tsx` duplicates the filter options instead of importing `USER_FILTER_OPTIONS` from constants.

---

### BUG-2: `USER_FILTER_OPTIONS` constant is defined but never consumed

[constants.ts:L34-L39](file:///c:/Users/METRO/dashbourd/src/lib/constants.ts#L34-L39) defines `USER_FILTER_OPTIONS` and the [lib/index.ts](file:///c:/Users/METRO/dashbourd/src/lib/index.ts) barrel exports it, but **no component imports or uses it**. `UserFilters.tsx` hardcodes its own copy. This is dead code that masks the mismatch in BUG-1.

---

### BUG-3: `fetchAverageScore()` fetches ALL quiz results into memory — unbounded

[dashboardService.ts:L65](file:///c:/Users/METRO/dashbourd/src/services/dashboardService.ts#L65):
```ts
const { data: scoreData, error } = await supabaseAdmin.from("quiz_results").select("score");
```

> [!WARNING]
> This query has **no `.limit()`, no date filter, and no pagination**. It fetches every single quiz result row (the `score` column) from the entire database. With 100k+ quiz results, this will download megabytes of data on every dashboard load, severely degrading performance and potentially timing out.

**Fix**: Use a Supabase SQL RPC or an aggregate view to compute the average server-side. At minimum, `.limit()` or scope to a recent time window.

---

### BUG-4: `importQuestions()` has a race condition with shared caches

[importQuestionsService.ts:L21-L24](file:///c:/Users/METRO/dashbourd/src/services/importQuestionsService.ts#L21-L24):
```ts
const yearsCache: Record<string, string> = {};
const modulesCache: Record<string, string> = {};
// ...
```

The import processes rows in batches of 10 **concurrently** (`Promise.all` on line 161), but the caches are plain objects shared across all concurrent promises. If two rows in the same batch reference the same year/module/subject/lecture name, both will see a cache miss, both will attempt to insert, and one will likely fail with a unique constraint violation — **or worse, create duplicates if there's no unique constraint**.

**Fix**: Either process rows sequentially within a batch, or use a per-key locking mechanism (e.g. a `Promise` cache instead of an `id` cache).

---

### BUG-5: `generate6DigitCode()` has an off-by-one modular bias

[useAccessCodes.ts:L80-L81](file:///c:/Users/METRO/dashbourd/src/hooks/useAccessCodes.ts#L80-L81):
```ts
const arr = new Uint32Array(1);
crypto.getRandomValues(arr);
return (arr[0] % 1000000).toString().padStart(6, '0');
```

`Uint32Array` max is `2^32 - 1 = 4,294,967,295`. `4,294,967,296 % 1,000,000 = 967,296`. This means codes `000000`–`967,295` are **very slightly** more likely than `967,296`–`999,999`. In practice this is negligible for access codes but worth noting.

More critically: when generating large batches (e.g. 500+ codes), the `while` loop on line 97 has no upper bound and no collision detection against existing DB codes. If the code space (1M possibilities) gets saturated, this becomes an infinite loop.

---

## 🟠 High Severity (Performance / Architecture)

### PERF-1: `listAllAuthUsers()` called redundantly on every page

`listAllAuthUsers` is called inside **every query function** — Dashboard, Users, Purchases, Feedback, AccessCodes, Analytics. Each call paginates through the entire auth.users table (10,000 per page). 

**Call sites** (6 total, each triggers on page mount):
- [dashboardService.ts:L105](file:///c:/Users/METRO/dashbourd/src/services/dashboardService.ts#L105)
- [useUsersList.ts:L46](file:///c:/Users/METRO/dashbourd/src/hooks/users/useUsersList.ts#L46)
- [usePurchasesQueries.ts:L23](file:///c:/Users/METRO/dashbourd/src/hooks/purchases/usePurchasesQueries.ts#L23)
- [useFeedback.ts:L19](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedback.ts#L19)
- [useAccessCodes.ts:L15](file:///c:/Users/METRO/dashbourd/src/hooks/useAccessCodes.ts#L15)
- [useAnalytics.ts:L129](file:///c:/Users/METRO/dashbourd/src/hooks/useAnalytics.ts#L129)

> [!IMPORTANT]
> This is the single biggest performance bottleneck in the app. With 10k users, each navigation triggers a full auth user table scan. This should be cached via React Query as its own query, or a dedicated `useAuthUsers()` hook, and shared across consumers.

---

### PERF-2: O(N×M) lookup patterns — `.find()` inside loops

Several data-joining operations use `Array.find()` inside `.forEach()` / `.map()`, creating O(N×M) complexity where a `Map` would give O(N+M):

| File | Line | Pattern |
|---|---|---|
| [dashboardService.ts:L96](file:///c:/Users/METRO/dashbourd/src/services/dashboardService.ts#L96) | `allUsers.find(u => u.id === log.admin_id)` inside `.map()` |
| [useFeedback.ts:L57](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedback.ts#L57) | `profiles.find(p => p.id === f.user_id)` inside `.forEach()` |
| [usePurchasesQueries.ts:L54](file:///c:/Users/METRO/dashbourd/src/hooks/purchases/usePurchasesQueries.ts#L54) | `profiles.find(pr => pr.id === p.user_id)` inside `.forEach()` |
| [dashboardRecentService.ts:L40](file:///c:/Users/METRO/dashbourd/src/services/dashboardRecentService.ts#L40) | `days.find(day => day.date === dateStr)` inside `.forEach()` |
| [dashboardRecentService.ts:L93](file:///c:/Users/METRO/dashbourd/src/services/dashboardRecentService.ts#L93) | `months.find(m => m.key === key)` inside `.forEach()` |

---

### PERF-3: `fetchUserGrowth()` is O(Users × Months) — `.filter()` inside `.forEach()`

[dashboardRecentService.ts:L134-L136](file:///c:/Users/METRO/dashbourd/src/services/dashboardRecentService.ts#L134-L136) and [L159-L161](file:///c:/Users/METRO/dashbourd/src/services/dashboardRecentService.ts#L159-L161):
```ts
days.forEach((m) => {
  m.users = allUsers.filter((u) => new Date(u.created_at).getTime() <= m.dateObj.getTime()).length;
});
```

For 10k users and 90 days, this is 900,000 iterations with `new Date()` construction on each. Should sort users once and use binary search or a running count.

---

## 🟡 Medium Severity (Code Quality / Type Safety)

### TYPE-1: Widespread `any` usage (22 instances)

The `noImplicitAny` flag is enabled in [tsconfig.json](file:///c:/Users/METRO/dashbourd/tsconfig.json), but explicit `any` annotations bypass it. Key offenders:

| File | Count | Examples |
|---|---|---|
| [useQuestions.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useQuestions.ts) | 4 | `row: any`, `o: any`, `err: any` |
| [useFeedback.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedback.ts) | 3 | `old: any`, `item: any`, `err: any` |
| [AdminAuthContext.tsx](file:///c:/Users/METRO/dashbourd/src/context/AdminAuthContext.tsx) | 1 | `(user as any).raw_app_meta_data?.role` |
| [useAccessCodes.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useAccessCodes.ts) | 1 | `toInsert: any[]` |
| [dashboard.ts](file:///c:/Users/METRO/dashbourd/src/types/dashboard.ts) | 1 | `details: any` |
| [usePurchasesPage.ts](file:///c:/Users/METRO/dashbourd/src/hooks/usePurchasesPage.ts) | 2 | `p: any` |
| [ChartCard.tsx](file:///c:/Users/METRO/dashbourd/src/components/shared/ChartCard.tsx) | 2 | `data?: any[]`, `err: any` |

---

### TYPE-2: Unsafe `(user as any).raw_app_meta_data` cast

[AdminAuthContext.tsx:L35](file:///c:/Users/METRO/dashbourd/src/context/AdminAuthContext.tsx#L35):
```ts
const role = user.app_metadata?.role || (user as any).raw_app_meta_data?.role;
```

The Supabase `User` type already has `app_metadata`. The `raw_app_meta_data` fallback uses `as any` to circumvent type safety. If this field was ever needed, it should be properly typed with an interface extension.

---

### ARCH-1: `useDashboard` query key doesn't match `QUERY_KEYS`

[useDashboard.ts:L9](file:///c:/Users/METRO/dashbourd/src/hooks/useDashboard.ts#L9):
```ts
queryKey: ["dashboard", "all-data"],
```

But `QUERY_KEYS.dashboardStats` is `["dashboard", "stats"]` and `QUERY_KEYS.dashboardRecentActivity` is `["dashboard", "recent-activity"]`. The hook uses a completely different key that isn't defined in the centralized `QUERY_KEYS` registry. This means invalidating via `QUERY_KEYS.dashboardStats` won't actually invalidate the dashboard query. The invalidations in mutations that use `queryKey: ["dashboard"]` only work by coincidence (prefix matching).

---

### ARCH-2: `useFeedbackPage` is not exported from hooks barrel

[hooks/index.ts](file:///c:/Users/METRO/dashbourd/src/hooks/index.ts) exports many hooks but is missing:
- `useFeedbackPage`
- `usePurchasesPage` 
- `useUsersPage`
- `useImportWizard`
- `useAccessCodes`

Pages import these directly, but the barrel export is inconsistent — some hooks are exported, others aren't.

---

### ARCH-3: `useAnalytics` query key is misleading

[useAnalytics.ts:L27](file:///c:/Users/METRO/dashbourd/src/hooks/useAnalytics.ts#L27):
```ts
queryKey: [...QUERY_KEYS.analytics(30), fromDate, toDate],
```

The `30` is hardcoded but the hook actually uses `fromDate`/`toDate` for scoping. The `QUERY_KEYS.analytics` factory takes a `days` parameter that's always `30` regardless of actual date range. The real cache discrimination comes from the appended `fromDate, toDate`. This is confusing and error-prone.

---

### ARCH-4: `buildAuthUserEmailMap` is exported but never used

[authService.ts:L31](file:///c:/Users/METRO/dashbourd/src/services/authService.ts#L31) exports `buildAuthUserEmailMap`, and [services/index.ts](file:///c:/Users/METRO/dashbourd/src/services/index.ts) re-exports it. No file imports or uses it. Dead code.

---

## 🔵 Low Severity (Hardening / Edge Cases)

### EDGE-1: `reorderItems()` doesn't check for errors

[reorderItems.ts:L6-L11](file:///c:/Users/METRO/dashbourd/src/hooks/curriculum/reorderItems.ts#L6-L11):
```ts
export async function reorderItems(table: TableName, items: ReorderPayload[]): Promise<void> {
  await Promise.all(
    items.map((item) =>
      supabaseAdmin.from(table).update({ order_index: item.order_index }).eq("id", item.id),
    ),
  );
}
```

The Supabase `.update()` calls return `{ error }` but this is never checked. If any individual update fails, the reorder silently partially applies, leaving the list in an inconsistent state.

---

### EDGE-2: `useFeedbackPage.handleDelete` is not wrapped in try/catch

[useFeedbackPage.ts:L28-L36](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedbackPage.ts#L28-L36):
```ts
const handleDelete = async () => {
  if (deleteId) {
    await deleteFeedback(deleteId);
    setDeleteId(null);
    // ...
  }
};
```

If `deleteFeedback` throws, the `setDeleteId(null)` never runs and the confirm dialog stays stuck in a weird state. The mutation's `onError` shows a toast, but the dialog state isn't cleaned up.

---

### EDGE-3: `handleImport` lacks try/catch around `importQuestions`

[useImportWizard.ts:L90-L103](file:///c:/Users/METRO/dashbourd/src/hooks/useImportWizard.ts#L90-L103):
```ts
const handleImport = async () => {
  setIsImporting(true);
  setStep(3);
  const summary = await importQuestions(validRows, { ... });
  setImportSummary(summary);
  setIsImporting(false);
  toast.success("Import process completed!");
};
```

If `importQuestions` throws an unhandled error, `isImporting` stays `true` forever, locking the UI.

---

### EDGE-4: `export` directory is empty

[src/utils/export/](file:///c:/Users/METRO/dashbourd/src/utils/export) is an empty directory. Dead artifact.

---

### EDGE-5: `question_order` defaults to `0` when falsy

[useLectureQuestions.ts:L29](file:///c:/Users/METRO/dashbourd/src/hooks/curriculum/useLectureQuestions.ts#L29) and [useQuestions.ts:L131](file:///c:/Users/METRO/dashbourd/src/hooks/useQuestions.ts#L131):
```ts
question_order: row.question_order || 0,
```

`|| 0` is correct for `null`/`undefined`, but if a question genuinely has `question_order: 0`, this still evaluates to `0` so it works. However, using `?? 0` would be semantically clearer and safer.

---

## 📋 Summary Table

| ID | Severity | Category | Issue |
|---|---|---|---|
| BUG-1 | 🔴 Critical | Bug | `inactive_30d` vs `inactive_30_days` filter mismatch |
| BUG-2 | 🔴 Critical | Dead Code | `USER_FILTER_OPTIONS` defined but never used |
| BUG-3 | 🔴 Critical | Performance/Bug | `fetchAverageScore()` fetches entire quiz_results table |
| BUG-4 | 🔴 Critical | Race Condition | Concurrent cache writes in `importQuestions` |
| BUG-5 | 🟠 High | Logic | Access code generation — unbounded loop, modular bias |
| PERF-1 | 🟠 High | Performance | `listAllAuthUsers()` called 6× independently |
| PERF-2 | 🟠 High | Performance | O(N×M) `.find()` inside loops (5 instances) |
| PERF-3 | 🟠 High | Performance | O(Users×Months) in `fetchUserGrowth()` |
| TYPE-1 | 🟡 Medium | Type Safety | 22 explicit `any` usages |
| TYPE-2 | 🟡 Medium | Type Safety | Unsafe `as any` cast for `raw_app_meta_data` |
| ARCH-1 | 🟡 Medium | Architecture | `useDashboard` query key not in `QUERY_KEYS` registry |
| ARCH-2 | 🟡 Medium | Consistency | Barrel exports inconsistent for page-level hooks |
| ARCH-3 | 🟡 Medium | Clarity | Misleading hardcoded `30` in analytics query key |
| ARCH-4 | 🟡 Medium | Dead Code | `buildAuthUserEmailMap` never used |
| EDGE-1 | 🔵 Low | Error Handling | `reorderItems()` ignores Supabase errors |
| EDGE-2 | 🔵 Low | Error Handling | `handleDelete` doesn't reset dialog on error |
| EDGE-3 | 🔵 Low | Error Handling | `handleImport` can leave `isImporting=true` forever |
| EDGE-4 | 🔵 Low | Dead Code | Empty `src/utils/export/` directory |
| EDGE-5 | 🔵 Low | Correctness | `|| 0` vs `?? 0` for `question_order` |

---

## Open Questions

> [!IMPORTANT]
> 1. **Which findings should I fix now?** I can fix all of them, or you can pick specific severity levels (e.g., "fix all 🔴 Critical and 🟠 High only").
> 2. **BUG-3 (fetchAverageScore)**: Should I create a Supabase RPC/view for server-side aggregation, or just add a `.limit()` with a recent time window as a quick fix?
> 3. **PERF-1 (listAllAuthUsers)**: Should I refactor this into a shared React Query hook (`useAuthUsers`), or is there a backend solution you'd prefer (e.g., a view that joins profiles with auth.users)?

## Proposed Changes

### Component: User Filters (BUG-1, BUG-2)

#### [MODIFY] [UserFilters.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserFilters.tsx)
- Import and use `USER_FILTER_OPTIONS` from constants instead of hardcoding presets

#### [MODIFY] [constants.ts](file:///c:/Users/METRO/dashbourd/src/lib/constants.ts)
- Change `"inactive_30d"` → `"inactive_30_days"` to match `useUsersList.ts` (or vice versa — needs your preference)

---

### Component: Dashboard Service (BUG-3, PERF-2)

#### [MODIFY] [dashboardService.ts](file:///c:/Users/METRO/dashbourd/src/services/dashboardService.ts)
- `fetchAverageScore()`: Add time scope or use server-side aggregation
- `fetchAdminAuditLogs()`: Convert `allUsers.find()` to `Map` lookup

---

### Component: Import Service (BUG-4)

#### [MODIFY] [importQuestionsService.ts](file:///c:/Users/METRO/dashbourd/src/services/importQuestionsService.ts)
- Replace concurrent `Promise.all` with sequential batch processing, or implement per-key promise caching to prevent duplicate inserts

---

### Component: Access Codes (BUG-5)

#### [MODIFY] [useAccessCodes.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useAccessCodes.ts)
- Add safety limit to the code generation while loop
- Add collision check against existing DB codes

---

### Component: Error Handling (EDGE-1, EDGE-2, EDGE-3)

#### [MODIFY] [reorderItems.ts](file:///c:/Users/METRO/dashbourd/src/hooks/curriculum/reorderItems.ts)
- Check and throw on Supabase errors

#### [MODIFY] [useFeedbackPage.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useFeedbackPage.ts)
- Wrap `handleDelete` in try/catch, reset dialog state in finally block

#### [MODIFY] [useImportWizard.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useImportWizard.ts)
- Wrap `handleImport` in try/catch, reset `isImporting` in finally block

---

### Component: Dead Code Cleanup

#### [DELETE] [src/utils/export/](file:///c:/Users/METRO/dashbourd/src/utils/export) (empty directory)
#### [MODIFY] [authService.ts](file:///c:/Users/METRO/dashbourd/src/services/authService.ts) — remove or mark `buildAuthUserEmailMap` for deprecation

---

## Verification Plan

### Automated Tests
```bash
pnpm run typecheck
pnpm run build
```

### Manual Verification
- Test the "Inactive 30d" user filter and verify it actually filters correctly
- Navigate to dashboard and verify no excessive data transfer in Network tab
- Test CSV import with duplicate year/module names in the same batch
- Generate access codes and verify uniqueness
