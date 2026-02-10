# Project Tasks & Issues

This document tracks all open tasks, current issues/bugs, and planned refactorings for the project.

---

## 🚀 v0.3 Goals (Alpha)

### 1. View Implementations (List & Kanban)

- [ ] **List View UI:** Implement a working and good-looking UI for List View in `DTableViewList.tsx` within the established data flow.
- [ ] **Kanban View UI:** Implement a working and good-looking UI for Kanban View in `DTableViewBoard.tsx` within the established data flow.
- [ ] **Core View Architecture:**
  - [ ] **TO DO:** Refactor `DTable.tsx` into `useTaskTable.ts` hook and centralize core table logic.
  - [ ] Verify `TaskViewManager.tsx` correctly handles tabs, shared controls, and rendering for List/Kanban views.
  - [ ] Ensure `DTableViewList.tsx` structure is finalized and ready for detailed UI work.
  - [ ] Ensure `DTableViewBoard.tsx` structure is finalized and ready for detailed UI work.
  - [ ] Delete old `DTable.tsx` file once refactor to `useTaskTable.ts` is complete and verified.

### 2. Task Creation & Editing Form (`FullTaskForm.tsx`)

- [ ] **Cleanup & Finalize:** Refine and complete the `FullTaskForm.tsx` component.
  - [ ] Improve overall design, layout, and user experience.
  - [ ] Ensure robust and intuitive date editing functionality.
- [ ] **BUG:** Fix: "Cannot find module './TaskFormSchema' or its corresponding type declarations." in `src/ui/components/shared/FullTaskForm.tsx`.

### 3. Settings

- [ ] **Implement Settings:** Establish working settings functionality and a `SettingsView` within Obsidian.
  - [ ] Utilize `@ophidian-lib/core` for settings management as planned (see https://github.com/ophidian-lib/core and https://ophidian-lib.github.io/core/_ophidian/core/settings.html).
  - [ ] Design and implement the UI for `SettingsView`.

### 4. Initial Testing

- [ ] **Setup Jest:** Configure Jest with `jest-environment-obsidian` (see https://github.com/obsidian-community/jest-environment-obsidian).
- [ ] **Write Initial Tests:** Develop "rough" unit/integration tests for:
  - [ ] `DTableViewList.tsx`
  - [ ] `DTableViewBoard.tsx`
  - [ ] `FullTaskForm.tsx`
  - [ ] Core data/state management if feasible.

### 5. Project Finals & Documentation

- [ ] **Application Logo:** Design and finalize the application logo.
- [ ] **README.md:** Update/Create a comprehensive `README.md` for the project.
- [ ] **CONTRIBUTING.md:** Create `CONTRIBUTING.md` with guidelines for contributors.
- [ ] **GitHub Setup:** Review and finalize GitHub repository setup (e.g., issue templates, labels, project boards if used).

---

## 🚀 v0.4 Goals (Post-Alpha)

- [ ] **Overview/Daily View:** Implement a dedicated view for daily tasks or an overview dashboard.
- [ ] **Calendar View:** Implement full UI and functionality for `DTableViewCalendar.tsx`.
- [ ] **Enhanced Settings:** Improve and expand upon the v0.3 settings.
- [ ] **Inline Editing (Views):** Implement inline editing capabilities directly within the List and Kanban views.
- [ ] **Obsidian Sidebar Integration:** Display current/daily tasks in the Obsidian sidebar.
- [ ] **Event-Based Fetch Logic:** Refactor data fetching to be event-based using the DataView API for more reactive updates.
- [ ] **Tag Badges:** Implement display of tag badges in views.

---

## 🌌 v1.0+ Goals (Future Vision / Long-Term)

- [ ] **Projects & UI Revamp:** Introduce a concept of "Projects" and undertake a significant UI overhaul, potentially inspired by apps like Todoist.
- [ ] **Todoist API Sync:** Implement synchronization with the Todoist API.
- [ ] **Cloud Sync (TaskUI Webapp):** Develop and integrate cloud synchronization with a dedicated TaskUI web application.
- [ ] **External Calendar Integration:** Allow integration with external calendar services (e.g., Google Calendar, Outlook Calendar).
- [ ] **Advanced Query Language/Filtering:** Implement a powerful query language or advanced filtering logic, similar to the Obsidian Tasks plugin.

---

## 🐛 Known Bugs & Issues

### Critical (Block Release)

- [ ] **Fix:** "Cannot find module './TaskFormSchema' or its corresponding type declarations." in `src/ui/components/shared/FullTaskForm.tsx`.
- [ ] **Fix Edit Action:** `TaskModal` opens in create mode instead of pre-filling with selected task data when triggered from `ListView`.
- [ ] **Fix Delete Action:** TypeError (`Cannot read properties of undefined (reading 'description')`) occurs when delete button is clicked in `ListView`, likely due to `task` being undefined in the handler.

### High Priority

- [ ] **Fix Table Grouping:**
  - [ ] Disable grouping for `description` and `tags` columns.
  - [ ] Investigate/fix errors when grouping by computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
- [ ] **Fix Table Sorting:** Disable sorting for computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
- [ ] **Fix Table Filtering:** Disable filtering for `description` and `tags` columns.
- [ ] Fix sort dropdown reordering issue.

### Low Priority (Code Quality)

- [ ] Address critical unused variable lint errors (e.g., in `src/data/types/dateCategories.ts`).
- [ ] Address `any` type assertion warnings (e.g., in `src/ui/components/TaskView.tsx` for the `table` prop passed to view components).

---

## 📜 Backlog / Future Enhancements

### Refactoring & Code Quality

- [ ] **Refactor Display Config:** Evaluate and potentially refactor display config logic (`statusDisplayConfig.ts`, `priorityDisplayConfig.ts`, `dateDisplayConfig.ts`) into a shared abstraction (class or factory function) to reduce code duplication.
- [ ] **UI Component Refactoring (TaskCard Elements):**
  - [ ] Refactor the existing PrioritySelect to be a reusable, dynamic selector for task priorities.
  - [ ] Refactor StatusSelect to match the controlled, popover-based, display-config-driven pattern of PrioritySelect.
  - [ ] Implement a reusable, controlled DescInput component for task description editing.
  - [ ] Review if `FullTaskForm.tsx` finalization sufficiently covers the needs for these components, or if separate refactoring is still beneficial.

### Testing

- [ ] **Comprehensive Testing:** Significantly expand test coverage across all features (beyond initial v0.3 tests).

---

## ✅ Recently Completed / Verified

_(Based on user statements - to be formally verified through testing where applicable)_

- [x] **Core Table/View Logic:** Sorting, Filtering, Grouping functionality.
- [x] **Task Actions:** Editing and Deleting tasks from views.
- [x] **Various Bug Fixes:** Including `changeTasksState` error, date categorization, sort dropdown, `TaskModal` pre-filling, delete errors, table grouping/sorting/filtering issues.

---

## 🔍 Verification Tasks

- [ ] User to verify that the error (changeTasksState) is resolved and tasks load correctly.
- [ ] Verify the date categorization works correctly in the UI (Grouping/Filtering).
- [ ] Verify DTable.tsx refactor to useTaskTable.ts is complete before marking as done.
