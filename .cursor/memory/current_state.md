# Project State

## High-Level Goal

Develop a Task Management UI view within Obsidian, leveraging React and Tanstack Table, integrated with Obsidian's Tasks plugin data, featuring multiple view types (List, Board, Calendar).

## Current Focus

-   Refactor the core table architecture for better separation of concerns and reusability.

## Active Goals (Architecture Refactoring)

1.  **Centralize Table Logic:** Extract TanStack Table configuration and state management into a reusable hook (`useTaskTable`).
2.  **Orchestrate Views:** Create a `TaskViewManager` component to manage tabs, shared controls, and render the active view.
3.  **Separate Views:** Implement distinct components for each view type (List, Board, Calendar) that receive the table instance and handle rendering.

## Open Tasks (Refactoring Phase 1)

1.  [ ] Rename `DTable.tsx` to `useTaskTable.ts` and move hook logic there.
2.  [ ] Create `TaskViewManager.tsx` to handle tabs, controls, and view rendering.
3.  [ ] Create `DTableViewList.tsx` and move list rendering logic there.
4.  [ ] Create placeholder components for Board and Calendar views (`DTableViewBoard.tsx`, `DTableViewCalendar.tsx`).
5.  [ ] Update `TaskViewManager.tsx` to render the List view and placeholders within respective tabs.

## Open Tasks (Phase 2: View Implementation)

-   [ ] Implement `DTableViewBoard.tsx` (Kanban).
-   [ ] Implement `DTableViewCalendar.tsx`.

## Open Tasks (Phase 3: Form & Settings)

-   [ ] Refine/Rename Task Form (`TaskModal.tsx`).
-   [ ] Implement Obsidian Settings integration.

## Open Tasks (Phase 4: Refactoring & Tests)

-   [ ] Perform necessary refactoring based on new structure.
-   [ ] Add unit/integration tests.

## Blockers

-   None currently identified.

## Execution Status

-   Refactoring plan defined.
-   Previous work on controls (`DTableGroupBy`, `DTableSortBy`, `DTableFilterBy`, `DataTablePagination`) completed and will be integrated into the new structure.
-   Previous work on persistent state (Jotai atoms) completed and will be used by `useTaskTable`.
-   Refactoring of `dateCategories.ts` and `DTable.tsx` complete.
-   Awaiting verification.

## Next Steps

-   Review and refine table cell rendering.
-   Address any remaining UI/UX feedback for the table view.
-   Continue finalizing the Task Modal.
-   Test the date grouping and filtering functionality in the application to ensure the categories (`Overdue`, `Today`, `Tomorrow`, `Next 7 days`, `Next 30 days`, `Future`, `No date`) are assigned and handled correctly.

## Open Questions/Decisions Needed

-   Final list of columns for the initial Table view?
-   Specific requirements for cell rendering (e.g., colors, inline icons)?
-   Need for column resizing/ordering?

## Active Goals

-   Implement a functional and customizable Table view for tasks.

## Recent Bug Fixes

-   **Bug:** Error fetching tasks: changeTasksState is not a function (MainView.tsx)
    -   **Root Cause:** Used the value of the Jotai atom instead of the setter function from useAtom(changeTasksAtom).
    -   **Fix:** Updated AppController to use the setter (const [, changeTasksState] = useAtom(changeTasksAtom)).
    -   **Status:** Fixed and verified by user.

## Open Tasks

-   [ ] User to verify that the error is resolved and tasks load correctly.
-   [x] Revise `getDateCategory` logic in `src/data/types/dateCategories.ts`.
-   [x] Remove unused variables in `src/data/types/dateCategories.ts`.
-   [x] Update `initialColumnVisibility` in `src/ui/components/custom/dtable/DTable.tsx` to hide category columns by default.
-   [ ] Verify the date categorization works correctly in the UI (Grouping/Filtering).
-   [ ] Fix sort dropdown reordering issue.

## Blockers

-   None at this time.

## Pending Tasks / Blockers

-   Implementing tag badges display.
-   Implementing inline editing for specific columns.
-   Implementing the `BoardView` and `CalendarView` components.
-   Refining the Task Form (`TaskModal.tsx`).
-   **Fix Edit Action:** `TaskModal` opens in create mode instead of pre-filling with selected task data when triggered from `ListView`.
-   **Fix Delete Action:** TypeError (`Cannot read properties of undefined (reading 'description')`) occurs when delete button is clicked in `ListView`, likely due to `task` being undefined in the handler.
-   **Fix Table Grouping:**
    -   Disable grouping for `description` and `tags` columns.
    -   Investigate/fix errors when grouping by computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
-   **Fix Table Sorting:** Disable sorting for computed date category columns (`scheduledDateCategory`, `dueDateCategory`).
-   **Fix Table Filtering:** Disable filtering for `description` and `tags` columns.
-   Implementing Obsidian settings.
-   Adding tests.
-   Resolving the failed deletion of the old `DTable.tsx` (if it still exists).
-   Addressing the unused variables lint error in `src/data/types/dateCategories.ts`.
-   Addressing the `any` type assertion warnings in `src/ui/components/TaskView.tsx` for the `table` prop passed to view components.
-   **Fix Sort Dropdown Order:** Options in the "Sort By" dropdown reordered upon selection.
    -   **Fix:** Explicitly sorted the list of columns alphabetically by label in `DTableSortBy.tsx`.
    -   **Status:** Fixed, awaiting verification.

## Task Action Buttons Refactor (May 2024)

-   **Action buttons (Edit/Delete) are now rendered directly in `ListView.tsx`.**
-   The TanStack Table column for 'actions' has been removed from `DTable.tsx`.
-   Edit/Delete logic remains in `TaskView.tsx` and is passed as props to `ListView`.
-   This resolves issues with incorrect task object flow and button malfunction.
-   No linter errors remain after the refactor.
-   Next: Monitor for any UI/UX or logic issues in the new setup.
