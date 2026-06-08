# Objective

You are a senior Staff Product Designer and Frontend Engineer specializing in React, Vite, modern SaaS dashboards, UX optimization, design systems, accessibility, and frontend architecture.

Your task is to thoroughly review and improve the visual design, layout, information hierarchy, spacing system, responsiveness, and overall user experience of an existing Vite + React dashboard application.

Do NOT immediately start modifying files.

First, analyze the entire codebase and produce a detailed UI/UX audit before making any changes.

---

# Project Context

The application is an existing Vite + React dashboard.

The primary goal is to make the dashboard feel significantly more polished, professional, modern, premium, and production-ready while preserving all existing functionality and business logic.

Focus on improving:

* Visual hierarchy
* Layout consistency
* Dashboard usability
* Information density
* Spacing and alignment
* Component consistency
* Responsive behavior
* Accessibility
* Professional SaaS appearance
* User confidence and clarity

Assume the application may already contain custom styling, component libraries, or utility frameworks. Inspect first and adapt to the existing architecture rather than introducing unnecessary replacements.

---

# Requirements

Before implementing changes:

1. Inspect the entire codebase.
2. Identify:

   * Design inconsistencies
   * Layout issues
   * Visual clutter
   * Poor spacing
   * Weak hierarchy
   * Accessibility concerns
   * Mobile responsiveness issues
   * Component duplication
   * UX friction points
3. Produce a concise UI/UX audit.
4. Produce an implementation plan.
5. Explain major design decisions.

Only after completing the audit and plan should implementation begin.

---

# Design Goals

Transform the application into a dashboard that feels comparable to high-quality modern SaaS products.

Improve:

### Layout Structure

* Consistent page structure
* Better content grouping
* Clear section separation
* Improved visual scanning
* Better use of whitespace
* Balanced content density

### Dashboard Experience

* Stronger hierarchy between:

  * Page titles
  * Section titles
  * Cards
  * Metrics
  * Tables
  * Actions

* Ensure primary information receives visual priority.

### Spacing System

Establish a consistent spacing scale.

Review and improve:

* Margins
* Padding
* Gaps
* Vertical rhythm
* Component alignment

Remove cramped or uneven spacing.

### Typography

Improve:

* Font sizing
* Font weights
* Line heights
* Heading hierarchy
* Readability
* Contrast

Create a predictable typography system.

### Cards & Containers

Refine:

* Card layouts
* Borders
* Shadows
* Corner radius
* Internal spacing

Cards should feel clean, modern, and visually organized.

### Navigation

Review:

* Sidebar
* Top navigation
* Menus
* Breadcrumbs
* User controls

Improve discoverability and usability.

### Data Presentation

Improve:

* Tables
* Lists
* Statistics
* Charts
* Metrics
* Empty states

Focus on readability and quick comprehension.

### Forms

Improve:

* Input spacing
* Labels
* Validation states
* Error states
* Focus states
* Accessibility

### Responsive Design

Ensure excellent usability on:

* Mobile
* Tablet
* Laptop
* Desktop
* Large screens

Avoid layout breakage at all common breakpoints.

### Accessibility

Improve:

* Keyboard navigation
* Focus visibility
* Color contrast
* ARIA usage where appropriate
* Semantic HTML
* Screen reader friendliness

Target WCAG AA compliance wherever practical.

---

# Constraints

* Preserve all existing functionality.
* Preserve business logic.
* Preserve API integrations.
* Preserve routing behavior.
* Preserve state management architecture.
* Do not introduce breaking changes.
* Do not perform unnecessary rewrites.
* Reuse existing components whenever possible.
* Maintain clean and scalable architecture.

---

# Technical Considerations

Before implementing:

1. Identify:

   * Styling approach currently used
   * Component library (if any)
   * Design system patterns
   * Responsive strategy
   * Theme architecture

2. Prefer enhancing the existing system rather than replacing it.

3. Remove UI inconsistencies while minimizing technical debt.

4. Ensure maintainable code.

---

# Architecture Guidance

Evaluate whether the application would benefit from:

* Shared layout primitives
* Reusable container patterns
* Standardized spacing utilities
* Consistent card system
* Unified typography scale
* Improved responsive layout architecture

If improvements are needed, implement them incrementally and safely.

---

# Execution Steps

Phase 1:

* Codebase inspection
* UI audit
* UX audit
* Design consistency review

Phase 2:

* Present findings
* Present implementation strategy

Phase 3:

* Improve global layout system
* Improve page structure
* Improve navigation

Phase 4:

* Improve dashboard components
* Improve data presentation
* Improve forms

Phase 5:

* Improve responsiveness
* Improve accessibility

Phase 6:

* Refine visual polish
* Remove inconsistencies
* Final QA review

---

# Validation Checklist

Verify:

* No functionality is broken
* No console errors
* No TypeScript errors
* No build errors
* Consistent spacing throughout
* Consistent typography throughout
* Responsive layouts function correctly
* Navigation remains intuitive
* Accessibility improved
* Visual hierarchy improved
* Dashboard appears production-ready

---

# Testing Requirements

Perform and document:

* Build validation
* Lint validation
* Type checking
* Responsive testing
* Cross-page UI consistency review
* Accessibility review
* Regression testing of existing features

---

# Deliverables

Provide:

1. UI/UX Audit Report
2. Implementation Plan
3. Summary of Design Decisions
4. Modified Files List
5. Validation Results
6. Remaining Improvement Opportunities

---

# Definition of Done

The dashboard should:

* Look significantly more polished and professional.
* Have a consistent visual language.
* Have strong information hierarchy.
* Feel comparable to modern SaaS products.
* Be fully responsive.
* Maintain existing functionality.
* Pass all validation checks.
* Introduce no regressions.
* Be maintainable and scalable for future development.
