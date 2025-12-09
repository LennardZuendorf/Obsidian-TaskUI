# Project State

## High-Level Goal

Develop a Task Management UI view within Obsidian, leveraging React and Tanstack Table, integrated with Obsidian's Tasks plugin data, featuring multiple view types (List, Board, Calendar).

## Current Focus

-   Refactor the core table architecture for better separation of concerns and reusability.

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

## Open Refactoring Tasks

-   Evaluate and potentially refactor the display config logic in `statusDisplayConfig.ts`, `priorityDisplayConfig.ts`, and `dateDisplayConfig.ts` into a shared abstraction (class or factory function). The goal is to reduce code duplication and improve maintainability. No implementation has been started yet; this is a planning/consideration task.

## Active Goal: Reusable PrioritySelect Component

-   Refactor the existing PrioritySelect to be a reusable, dynamic selector for task priorities.
-   Use display config from priorityDisplayConfig.ts for icons, labels, and colors.
-   Preserve the current popover/button styling and structure.
-   Remove all table/sorting logic; decouple from table state.
-   Accepts props: value (TaskPriority or null), onChange (callback), disabled, className.
-   Parent manages value and handles changes.
-   Ensure accessibility and keyboard navigation.
-   Update technical details and documentation after implementation.

-   PrioritySelect is now integrated into TaskCard, replacing the old Select dropdown for priority. The component is currently rendered with disabled={true}.

Refactor StatusSelect to match the controlled, popover-based, display-config-driven pattern of PrioritySelect. It will use status display config and match the same styling and API.

StatusSelect is now integrated into TaskCard, replacing the old status dropdown. The component is currently rendered with disabled={true}.

DescInput is now integrated into TaskCard, displaying the task description as a disabled input for now.

Implement a reusable, controlled DescInput component for task description editing. It will use the provided Input, support value/onChange, error, disabled, className, and accessibility props, and preserve the current design.

# Current State

-   **Active Goal:** Split the unified Input component back into `Input.tsx` (base) and `DateInput.tsx` (specialized, using base for styling).
-   **Open Tasks:** None (Components split, documentation updated).
-   **Blockers:** None
-   **Execution Status:** Execution complete. Returning to planning mode.

## Current Goal

Implement List View UI in `ListView.tsx`.

## Blockers/Notes

-   The in-group "Add Task" button in `ListView.tsx` will be a visual placeholder for now, its functionality will be addressed later.
-   Confirm `formatGroupValue` logic during implementation (initial simple version to be used).

## Current State

**Active Goal:** Refactor `PrioritySelect.tsx` to visually align its dropdown style (trigger button, popover items) with the `DTableSortBy.tsx` component (as seen in the 'Sort by' dropdown in `TaskView.tsx`).

**Blockers:** None currently.

**Next Steps:**

1. Confirm the proposed changes for `PrioritySelect.tsx` with the user.
2. Implement the approved changes in `PrioritySelect.tsx`.
