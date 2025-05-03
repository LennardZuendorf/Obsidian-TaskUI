# Current State

## Overall Status (Consolidated)

-   All known critical bugs are resolved. The application loads tasks and manages state without runtime errors.
-   The main focus is now on implementing and refining the Table/List view for tasks.

## App Structure Overview

The application is structured as a modular React/Obsidian plugin with Jotai for state management. The main modules and their relationships are as follows:

-   **MainView.tsx**: Entry point for the React UI, manages initialization, error handling, and renders the main UI manager.
-   **TaskUIManager.tsx**: Main UI controller, handles tab navigation, task creation, and passes state update functions to child components.
-   **TaskService/TaskSyncService**: Business logic for CRUD operations and synchronization with the Obsidian vault.
-   **Jotai Atoms (taskAtoms.ts)**: Centralized state management for tasks and view settings.
-   **UI Components**: Modular components for displaying and editing tasks (ListView, TaskModal, etc.).
-   **Config/Settings**: Context providers for app-wide settings.

### App Structure (Mermaid Diagram)

```mermaid
graph TD
    A[MainView.tsx] --> B[TaskUIManager.tsx]
    B --> C[ListView.tsx / TableView.tsx]
    B --> D[TaskModal]
    B --> E[Tabs/Controls]
    A --> F[TaskService / TaskSyncService]
    F --> G[Jotai Atoms (taskAtoms.ts)]
    B --> G
    C --> G
    D --> G
    G --> H[Task Data]
    A --> I[SettingsContext]
    B --> I
```

## Recent Bug Fixes

-   **Bug:** Error fetching tasks: changeTasksState is not a function (MainView.tsx)
    -   **Root Cause:** Used the value of the Jotai atom instead of the setter function from useAtom(changeTasksAtom).
    -   **Fix:** Updated AppController to use the setter (const [, changeTasksState] = useAtom(changeTasksAtom)).
    -   **Status:** Fixed and verified by user.

## Active Goals

-   Implement a functional and customizable Table view for tasks in ListView.tsx.

## Open Tasks

-   [ ] Implement Table view structure and features as outlined in the roadmap.

## Blockers

-   None at this time.

## Active Goals (Feature Focus)

1.  Implement a functional and customizable Table view for tasks.
2.  Finalize Task Modal for robust task creation and editing.
3.  Develop foundational components for future expansion (projects, tags, etc.).
4.  (Deferred) Implement Calendar view.
5.  (Deferred) Implement Board view (if desired later).

## Open Tasks (Feature Implementation)

1.  **Table View Implementation (`ListView.tsx`):**
    -   Replace current JSON display with a proper table structure (e.g., using `@tanstack/react-table`).
    -   Define table columns based on `Task` properties (Description, Priority, Status, Due Date, Tags, etc.).
    -   Connect table controls (Filter, Columns dropdown in `MainView.tsx`) to filter/show/hide table columns.
    -   Implement sorting based on `viewSettings.sortBy` and `viewSettings.sortOrder`.
    -   Implement row selection.
    -   Implement inline editing or link rows to `TaskModal` for editing.
    -   Consider adding drag-and-drop for reordering rows (if required).
2.  **Task Modal Finalization:**
    -   Ensure modal correctly handles both task creation and editing modes (re-enable commented-out handlers in `MainView.tsx` when needed).
    -   Validate input fields thoroughly.
    -   Refine UI/UX for clarity and ease of use.
    -   Integrate fully with `TaskService` and state updates.
3.  **Infrastructure & Settings (Supporting Features):**
    -   (As needed for Table/Modal)
4.  **Technical Debt (Ongoing Consideration):**
    -   (As before)
5.  **Documentation:**
    -   Update documentation for the new Table view component.

## Current Focus

-   **Implement the core Table view structure in `ListView.tsx`.**

## Blockers

-   None currently identified.

## Open Questions/Decisions Needed

1.  Confirm choice of table library (e.g., `@tanstack/react-table`).
2.  Final list of columns for the initial Table view.
3.  How should editing be handled (inline vs. modal)?
4.  Is drag-and-drop row reordering required for the Table view?

## Implementation Priorities (Feature-Driven)

1.  Implement core Table View (`ListView.tsx`).
2.  Finalize TaskModal (linking edit/delete actions from Table).
3.  Refine Table view features (sorting, filtering, column visibility).
4.  Address supporting infrastructure/settings as needed.
5.  Consider technical debt items.
6.  (Deferred) Calendar / Board Views.

## Future Goals / Roadmap

-   (As before)

## Active Goals

-   Implement core Table View in `ListView.tsx`.

## Open Tasks

-   See "Open Tasks (Feature Implementation)" section above, starting with Table View.

## Blockers

-   None.

## Execution Status

-   **Completed:** Removed Kanban Board UI (`boardView` directory and related code).
-   **Completed:** Updated `MainView.tsx` with new styled tabs (List active, others disabled).
-   **Completed:** Updated `ListView.tsx` to display raw task JSON data.
-   **Completed:** Performed full codebase lint and fixed remaining warnings (e.g., `any` type in `TagInput.tsx`).

## Next Steps

-   Start implementing the Table view structure in `ListView.tsx`.

## Active Goal

-   Ensure correct type mapping for date fields in `fullTaskForm.tsx` using `@internationalized/date` for conversion between native `Date` and `DateValue` at the interface with `DateField`.

## Actions Taken

-   Imported `fromDate` and `toDate` from `@internationalized/date`.
-   When rendering `DateField`, convert `selectedDueDate` and `selectedScheduledDate` from native `Date` to `CalendarDate` using `fromDate`.
-   In the `onChange` handler for `DateField`, convert the `DateValue` back to a native `Date` using `toDate` before storing in form state.
-   Removed unused date state variables and functions as indicated by the linter.
-   Updated types for `value` and `onChange` props to match what `DateField` expects.

## Outcome

-   The runtime error and linter/type errors related to date handling are resolved.
-   The rest of the form and application continues to use native `Date` objects.
-   All conversion logic is encapsulated within `fullTaskForm.tsx`.

## Next Steps

-   Test the form to ensure date selection and clearing works as expected.
-   Monitor for any further issues related to date handling or type mismatches.

## UI Fixes (Recent)

-   **Completed:** Removed double border/ring/outline from tag select input in `fullTaskForm.tsx` by updating the tag input's className to suppress all border, ring, and outline styles. Change is scoped to the tag input and preserves accessibility.
-   **Completed:** Fixed JSX parsing error in `TaskCard.tsx` by correcting the conditional rendering of `<CardFooter>`. The footer is now always rendered, and its content is conditionally shown if `task.dueDate` exists. This resolves the linter error and ensures correct UI rendering.
-   **Completed:** Refactored Kanban UI (`MainView`, `TaskBoardView`, `TaskColumn`, `TaskCard`) to match minimalist inspiration image.

## Current State

**Active Goals:**

-   Test and refine the new Kanban board UI.

**Open Tasks:**

1.  **Kanban UI Testing:**
    -   Verify visual alignment with the inspiration image across different screen sizes/themes.
    -   Test drag-and-drop functionality between columns.
    -   Test Filter control.
    -   Test Columns dropdown (visibility control).
    -   Test Add Task button flow.
    -   Test Edit/Delete task actions via `TaskCard` menu.
2.  **Minor Style Adjustments:** Address any visual glitches or inconsistencies found during testing.

**Blockers:**

-   None currently identified.

**Execution Status:**

-   Kanban UI refactoring implemented.

**Next Steps:**

-   Proceed with testing the refactored Kanban UI.

---

_Previous detailed logs and status updates have been consolidated into the sections above. Older granular entries are removed for clarity._

**Active Goal:** Refactor Task Board UI towards Inspiration Image

**Status:** Planning Complete, Ready for Implementation

**Blockers:** None

**Execution Plan:**

1.  **Define Types & Atoms:**

    -   Create/update `src/data/types/viewTypes.ts`: Define `ViewSettings` interface (including `globalFilter`, `groupBy`, `sortBy`, `sortOrder`, `visibleStatuses`) and related types (`GroupByOption`, `SortByOption`).
    -   Create/update `src/data/taskAtoms.ts`:
        -   Define `initialViewSettings: ViewSettings`.
        -   Define `viewSettingsAtom = atom<ViewSettings>(initialViewSettings)`.
        -   Define derived atoms:
            -   `filteredTasksAtom`: Filters `baseTasksAtom` based on `viewSettingsAtom.globalFilter`.
            -   `sortedTasksAtom`: Sorts `filteredTasksAtom` based on `viewSettingsAtom.sortBy` and `viewSettingsAtom.sortOrder`.
            -   `groupedBoardTasksAtom`: Groups `sortedTasksAtom` based on `viewSettingsAtom.groupBy`. Filters result by `viewSettingsAtom.visibleStatuses` if `groupBy === 'status'`. Outputs `Record<string, TaskWithMetadata[]>`.

2.  **Refactor `MainView.tsx` (Header & Controls):**

    -   Update `Tabs`, `TabsList`, `TabsTrigger` styling to match inspiration (flatter look, integrated feel).
    -   Add global controls to the header row next to tabs:
        -   Filter: `Input` component.
        -   Group By: `Select` component.
        -   Columns: `DropdownMenu` component (to control `visibleStatuses`).
    -   Connect controls to `viewSettingsAtom`: Use `useAtom` hook. On change, update the corresponding field in the `viewSettingsAtom` object.

3.  **Refactor `TaskBoardView.tsx` (Layout & Data Consumption):**

    -   Remove local state management (`groupBy`, `visibleColumnIds`, etc.).
    -   Remove the old header row (containing "Group by:", "Columns" button).
    -   Use `useAtomValue(groupedBoardTasksAtom)` to get processed task data.
    -   Render a new external header row _above_ the main grid: Iterate through the keys of the `groupedBoardTasksAtom` result (e.g., 'open', 'in-progress', 'done') to display column titles (map ID to title), task counts, and action icons (`+`, `...`).
    -   Update the grid layout (`DndContext` area): Map over the `groupedBoardTasksAtom` result. For each group/column, pass its tasks array (`TaskWithMetadata[]`) to a `TaskColumn` component.

4.  **Refactor `TaskColumn.tsx` (Simplification & Styling):**

    -   Simplify props: Primarily accept `tasks: TaskWithMetadata[]`. Remove handlers like `onEditTask`, `onDeleteTask`.
    -   Remove internal state (`searchTerm`, `sortBy`, `sortOrder`).
    -   Remove all header elements within the column card (Title, count, dropdown, search, sort).
    -   Simplify structure: The component might just become a `div` wrapper around the `SortableContext` and task mapping.
    -   Update styling: Remove `bg-secondary`, `shadow-md`, `rounded-lg`, `p-4` from the main container. It should blend into the board background.
    -   Render `TaskCard` components based on the `tasks` prop, applying `space-y-4` to the container.
    -   Keep `useDroppable` if column-level dropping is still needed for status changes (might need adjustment).

5.  **Refactor `TaskCard.tsx` (Styling & Content):**

    -   Update card styling:
        -   Set background (e.g., `bg-background` or a slightly lighter variant if the main board is `bg-background`).
        -   Remove `border border-input`.
        -   Increase rounding (e.g., `rounded-lg`).
        -   Verify padding (`p-3`) and margins (`mb-4`).
    -   Refactor tag display: Use the `Badge` component for tags (`#tagname`).
    -   Refactor priority display: Use the `Badge` component for priority (e.g., styled P1, P2, P3 badges based on `task.priority`).

6.  **Testing & Refinement:**
    -   Verify state updates correctly propagate via atoms.
    -   Test filtering, sorting, grouping.
    -   Test drag-and-drop functionality.
    -   Adjust styling nuances.

**Next Step:** Begin Implementation Phase - Step 1: Define Types & Atoms.

## Active Tasks & Status

-   **Refine Tab Styling in `MainView.tsx`:**
    -   **Status:** Completed/Verified.
    -   **Details:** Investigated adding a bottom border indicator for the active tab, similar to a provided code snippet using a `Separator`. Verified that the current implementation using Tailwind's `data-[state=active]` selector with a `::after` pseudo-element (`!data-[state=active]:after:bg-hover`) in `tabTriggerClasses` already achieves the desired visual effect. No code changes were necessary. Previous iterations involved troubleshooting hover and transparency issues, which are now resolved.
-   **Implement Table View:**
    -   **Status:** Pending.
    -   **Details:** Next step after finalizing the main view structure and tab navigation. Will involve creating a `TableView.tsx` component to display tasks.
-   **Restore Board/Calendar Views:**
    -   **Status:** On Hold.
    -   **Details:** Tabs exist but are disabled. Functionality to be added after List/Table views are stable.

## Active Goals

-   Ensure task loading and state management works without runtime errors in MainView and TaskUIManager.

## Recent Bug Fixes

-   **Bug:** Error fetching tasks: changeTasksState is not a function (MainView.tsx)
    -   **Root Cause:** Used the value of the Jotai atom instead of the setter function from useAtom(changeTasksAtom).
    -   **Fix:** Updated AppController to use the setter (const [, changeTasksState] = useAtom(changeTasksAtom)).
    -   **Status:** Fixed and verified by user.

## Open Tasks

-   [ ] User to verify that the error is resolved and tasks load correctly.

## Blockers

-   None at this time.
