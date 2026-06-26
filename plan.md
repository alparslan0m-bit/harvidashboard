# Full-Page User Detail Migration

This plan details the process for transitioning the User Account Details view from a side-panel (`SlideOver`) to a dedicated, full-page route with an upgraded, "charming" aesthetic.

## User Review Required

> [!IMPORTANT]
> - **Routing Change:** This will introduce a new URL route (`/users/:userId`). Direct links to a user's profile will now be possible.
> - **UI Overhaul:** The aesthetic will be heavily upgraded to feel more premium, utilizing larger cards, a hero section with gradients, and a spacious layout. Please confirm if you have specific color preferences for the hero gradients or if I should stick to the app's current dark mode palette with subtle accents.

## Open Questions

> [!WARNING]
> - Should we add **Tabs** to the new page to separate "Quiz History", "Purchases", and "Settings" (Danger Zone) to keep the page clean, or do you prefer a single continuous scrolling page with clearly defined sections?
> - Do you want to keep the existing `UserDetailPanel` for any quick-view purposes, or completely replace it with the new full-page navigation? (The plan currently assumes complete replacement).

## Proposed Changes

---

### Routing & Navigation

Updates to the core routing and the users list page to support the new full-page view.

#### [MODIFY] [router/index.tsx](file:///c:/Users/METRO/dashbourd/src/router/index.tsx)
- Add a new protected route: `<Route path="/users/:userId" element={<UserDetail />} />`

#### [MODIFY] [hooks/useUsersPage.ts](file:///c:/Users/METRO/dashbourd/src/hooks/useUsersPage.ts)
- Replace `setIsPanelOpen(true)` in `handleViewUser` with React Router's `navigate("/users/" + id)`.
- Remove state variables related to the side panel (`isPanelOpen`, `selectedUserId`).

#### [MODIFY] [pages/Users.tsx](file:///c:/Users/METRO/dashbourd/src/pages/Users.tsx)
- Remove the `<UserDetailPanel>` component rendering.

---

### New Full-Page Component

Creation of the new page and its dedicated components.

#### [NEW] [pages/UserDetail.tsx](file:///c:/Users/METRO/dashbourd/src/pages/UserDetail.tsx)
- Create a new page component that reads `userId` from `useParams()`.
- Add a "← Back to Users" navigation header.
- Implement a **Hero Section** displaying the user's avatar (larger), name, email, and "Member since" date, backed by a subtle, charming gradient.
- Implement a **Stats Grid** with larger, premium-feeling cards featuring Lucide icons, subtle hover micro-animations, and glassmorphic background layers.
- Render the Quiz History, Purchases, and Danger Zone in a spacious layout (either stacked or tabbed based on feedback).

#### [MODIFY] [components/pages/users/UserDetailProfile.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserDetailProfile.tsx)
- Refactor `UserDetailProfile` to act as the new Hero component.
- Refactor `UserDetailStatsGrid` to use larger cards with richer typography and icons.

#### [MODIFY] [components/pages/users/UserDetailTables.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserDetailTables.tsx)
- Update styling to span full page width.
- Enhance table aesthetics (hover states, better empty states, subtle borders).

#### [MODIFY] [components/pages/users/UserDetailDangerZone.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserDetailDangerZone.tsx)
- Expand the layout to fit a full-page width, placing it in a dedicated "Settings" or "Danger Zone" card with a distinct red-tinted border to prevent accidental clicks.

#### [DELETE] [components/pages/users/UserDetailPanel.tsx](file:///c:/Users/METRO/dashbourd/src/components/pages/users/UserDetailPanel.tsx)
- Remove the SlideOver wrapper component entirely as it will no longer be used.

## Verification Plan

### Automated Tests
- No automated UI tests to run currently, but will rely on TypeScript compiler checks to ensure types and props are correctly passed.

### Manual Verification
1. Navigate to `/users` and click on a user row. Verify it navigates to `/users/:userId`.
2. Verify the new page displays the user's information, stats, history, and purchases correctly.
3. Check the aesthetic quality: ensure the layout is spacious, responsive, and includes the charming micro-animations and gradients.
4. Test the "Danger Zone" actions (Admin upgrade, Delete user) to ensure the confirmation dialogs still function perfectly on the new page.
5. Click the "Back" button to ensure it returns to the users list seamlessly.
