import { TaskStatus } from "./tasks"; // Import TaskStatus

// Minimal type for view control state
export type GroupByOption = "status" | "priority" | "dueDate" | "tags" | "none";
export type SortByOption =
	| "priority"
	| "dueDate"
	| "description"
	| "status"
	| "createdAt"; // Added more options potentially
export type SortOrder = "asc" | "desc";

export interface ViewSettings {
	groupBy: GroupByOption;
	globalFilter: string;
	sortBy: SortByOption;
	sortOrder: SortOrder;
	// Define visibleStatuses as an optional array of TaskStatus
	visibleStatuses?: TaskStatus[];
	// Add other view-specific settings as needed
	// e.g., calendarViewMode: 'month' | 'week';
	// e.g., listViewDensity: 'compact' | 'comfortable';
}
