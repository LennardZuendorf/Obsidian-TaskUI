# Project Tasks & Issues

This document tracks all open tasks, current issues/bugs, and planned refactorings for the project.

## 🚀 Alpha (V1) Goals

### 1. View Implementations (List & Kanban)

-   [ ] **List View UI:** Implement a working and good-looking UI for List View in `DTableViewList.tsx` within the established data flow.
-   [ ] **Kanban View UI:** Implement a working and good-looking UI for Kanban View in `DTableViewBoard.tsx` within the established data flow.
-   [ ] **Core View Architecture:**
    -   [ ] Verify `DTable.tsx` was correctly renamed/refactored into `useTaskTable.ts` and core table logic is centralized.
    -   [ ] Verify `TaskViewManager.tsx` correctly handles tabs, shared controls, and rendering for List/Kanban views.
    -   [ ] Ensure `DTableViewList.tsx` structure is finalized and ready for detailed UI work.
    -   [ ] Ensure `DTableViewBoard.tsx` structure is finalized and ready for detailed UI work.
    -   [ ] Resolve the status of the old `DTable.tsx` file (delete if refactor is complete and verified).

### 2. Task Creation & Editing Form (`FullTaskForm.tsx`)

-   [ ] **Cleanup & Finalize:** Refine and complete the `FullTaskForm.tsx` component.
    -   [ ] Improve overall design, layout, and user experience.
    -   [ ] Ensure robust and intuitive date editing functionality.
-   [ ] **BUG:** Fix: "Cannot find module './TaskFormSchema' or its corresponding type declarations." in `src/ui/components/shared/FullTaskForm.tsx`.

### 3. Settings

-   [ ] **Implement Settings:** Establish working settings functionality and a `SettingsView` within Obsidian.
    -   [ ] Utilize `@ophidian-lib/core` for settings management as planned (see https://github.com/ophidian-lib/core and https://ophidian-lib.github.io/core/_ophidian/core/settings.html).
    -   [ ] Design and implement the UI for `SettingsView`.

### 4. Initial Testing

-   [ ] **Setup Jest:** Configure Jest with `jest-environment-obsidian` (see https://github.com/obsidian-community/jest-environment-obsidian).
-   [ ] **Write Initial Tests:** Develop "rough" unit/integration tests for:
    -   [ ] `DTableViewList.tsx`
    -   [ ] `DTableViewBoard.tsx`
    -   [ ] `FullTaskForm.tsx`
    -   [ ] Core data/state management if feasible.

### 5. Project Finals & Documentation

-   [ ] **Application Logo:** Design and finalize the application logo.
-   [ ] **README.md:** Update/Create a comprehensive `README.md` for the project.
-   [ ] **CONTRIBUTING.md:** Create `CONTRIBUTING.md` with guidelines for contributors.
-   [ ] **GitHub Setup:** Review and finalize GitHub repository setup (e.g., issue templates, labels, project boards if used).

---

## 🚀 V2 Goals

-   [ ] **Overview/Daily View:** Implement a dedicated view for daily tasks or an overview dashboard.
-   [ ] **Calendar View:** Implement full UI and functionality for `DTableViewCalendar.tsx`.
-   [ ] **Enhanced Settings:** Improve and expand upon the Alpha V1 settings.
-   [ ] **Inline Editing (Views):** Implement inline editing capabilities directly within the List and Kanban views.
-   [ ] **Obsidian Sidebar Integration:** Display current/daily tasks in the Obsidian sidebar.
-   [ ] **Event-Based Fetch Logic:** Refactor data fetching to be event-based using the DataView API for more reactive updates.

---

## 🌌 Future Vision / Long-Term Goals

-   [ ] **Projects & UI Revamp:** Introduce a concept of "Projects" and undertake a significant UI overhaul, potentially inspired by apps like Todoist.
-   [ ] **Todoist API Sync:** Implement synchronization with the Todoist API.
-   [ ] **Cloud Sync (TaskUI Webapp):** Develop and integrate cloud synchronization with a dedicated TaskUI web application.
-   [ ] **External Calendar Integration:** Allow integration with external calendar services (e.g., Google Calendar, Outlook Calendar).
-   [ ] **Advanced Query Language/Filtering:** Implement a powerful query language or advanced filtering logic, similar to the Obsidian Tasks plugin.

## 🐛 Active Bugs & Issues (Beyond Alpha V1 Specifics)

_(To be addressed if critical or time permits, otherwise backlog)_

-   [ ] Address any critical unused variable lint errors (e.g., in `src/data/types/dateCategories.ts`).
-   [ ] Address any critical `any` type assertion warnings (e.g., in `src/ui/components/TaskView.tsx`).

## 📜 Backlog / Other Potential Enhancements

_(Items moved from previous task lists or identified as lower priority for now)_

-   [ ] **Tag Badges:** Implement display of tag badges in views (if not covered by V1/V2 view implementations).
-   [ ] **Comprehensive Testing:** Significantly expand test coverage across all features (beyond initial V1 tests).
-   [ ] **Refactor Display Config:** Evaluate and potentially refactor display config logic (`statusDisplayConfig.ts`, `priorityDisplayConfig.ts`, `dateDisplayConfig.ts`) into a shared abstraction.
-   [ ] **UI Component Refactoring (TaskCard Elements):** Review if `FullTaskForm.tsx` finalization sufficiently covers the needs for `PrioritySelect`, `StatusSelect`, `DescInput` as reusable/controlled components, or if separate refactoring is still beneficial.

## ✅ Recently Completed / Verified

_(Based on user statements - to be formally verified through testing where applicable)_

-   [x] **Core Table/View Logic:** Sorting, Filtering, Grouping functionality.
-   [x] **Task Actions:** Editing and Deleting tasks from views.
-   [x] **Various Bug Fixes:** Including `changeTasksState` error, date categorization, sort dropdown, `TaskModal` pre-filling, delete errors, table grouping/sorting/filtering issues.

---

## Feature Development & Refactoring by Phase

### Phase 1: Core Architecture Refactoring

-   [ ] Rename `DTable.tsx` to `useTaskTable.ts` and move hook logic there.
-   [ ] Create `TaskViewManager.tsx` to handle tabs, controls, and view rendering.
-   [ ] Create `DTableViewList.tsx` and move list rendering logic there.
-   [ ] Create placeholder components for Board and Calendar views (`DTableViewBoard.tsx`, `DTableViewCalendar.tsx`).
-   [ ] Update `TaskViewManager.tsx` to render the List view and placeholders within respective tabs.

### Phase 2: View Implementation

-   [ ] Implement `DTableViewBoard.tsx` (Kanban).
-   [ ] Implement `DTableViewCalendar.tsx`.
-   [ ] Implementing tag badges display.
-   [ ] Implementing inline editing for specific columns.

### Phase 3: Form & Settings

-   [ ] Refine/Rename Task Form (`TaskModal.tsx`).
-   [ ] Implement Obsidian Settings integration.
-   [ ] Rework settings area and functionality using @ophidian/core/settings (see https://ophidian-lib.github.io/core/_ophidian/core/settings.html). Currently non-functional.

### Phase 4: Refactoring & Tests

-   [ ] Perform necessary refactoring based on new structure.
-   [ ] Add unit/integration tests.

## UI Component Refactoring (TaskCard Elements)

-   [ ] Refactor the existing PrioritySelect to be a reusable, dynamic selector for task priorities (ensure it's fully functional and not just integrated as disabled).
-   [ ] Refactor StatusSelect to match the controlled, popover-based, display-config-driven pattern of PrioritySelect.
-   [ ] Implement a reusable, controlled DescInput component for task description editing.

## Current Issues / Bug Fixes

-   [ ] **Fix Edit Action:** `TaskModal` opens in create mode instead of pre-filling with selected task data when triggered from `ListView`.
-   [ ] **Fix Delete Action:** TypeError (`Cannot read properties of undefined (reading 'description')`) occurs when delete button is clicked in `ListView`, likely due to `task` being undefined in the handler.
-   [ ] **Fix Table Grouping:**
    -   [ ] Disable grouping for `description` and `tags` columns.
    -   [ ] Investigate/fix errors when grouping by computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
-   [ ] **Fix Table Sorting:** Disable sorting for computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
-   [ ] **Fix Table Filtering:** Disable filtering for `description` and `tags` columns.
-   [ ] Fix sort dropdown reordering issue.
-   [ ] Resolving the failed deletion of the old `DTable.tsx` (if it still exists).
-   [ ] Addressing the unused variables lint error in `src/data/types/dateCategories.ts`.
-   [ ] Addressing the `any` type assertion warnings in `src/ui/components/TaskView.tsx` for the `table` prop passed to view components.

## Verification Tasks

-   [ ] User to verify that the error (changeTasksState) is resolved and tasks load correctly.
-   [ ] Verify the date categorization works correctly in the UI (Grouping/Filtering).

## Planned Code Refactorings

-   [ ] Evaluate and potentially refactor the display config logic in `statusDisplayConfig.ts`, `priorityDisplayConfig.ts`, and `dateDisplayConfig.ts` into a shared abstraction (class or factory function). The goal is to reduce code duplication and improve maintainability.
