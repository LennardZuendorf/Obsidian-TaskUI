import { getOrderedTaskPriorities } from "@/ui/lib/displayConfig/priorityDisplayConfig";
import { getOrderedTaskStatuses } from "@/ui/lib/displayConfig/statusDisplayConfig";
import { Row } from "@tanstack/react-table";
import { Task, TaskPriority, TaskStatus } from "../../data/types/tasks";

// Define the new SortingFn type
export type SortingFn<TData> = (
	rowA: Row<TData>,
	rowB: Row<TData>,
	columnId: string,
) => number;

// Custom sorting function for priority
export const sortTasksByPriority: SortingFn<Task> = (
	rowA: Row<Task>,
	rowB: Row<Task>,
	columnId: string,
): number => {
	// Handle undefined original data
	if (!rowA.original && !rowB.original) return 0;
	if (!rowA.original) return 1; // rowA.original is undefined, sort it after rowB
	if (!rowB.original) return -1; // rowB.original is undefined, sort it after rowA

	const a = rowA.original.priority;
	const b = rowB.original.priority;

	const isADefined = a != null;
	const isBDefined = b != null;

	if (isADefined && !isBDefined) return -1; // a is defined, b is not; a comes first
	if (!isADefined && isBDefined) return 1; // b is defined, a is not; b comes first
	if (!isADefined && !isBDefined) return 0; // both are null/undefined, treat as equal

	// Ensure a and b are not null/undefined before using them as TaskPriority
	// This check is technically redundant due to the above but kept for clarity
	if (!a || !b) return 0;

	// Get the ordered list of priorities
	const orderedPriorities = getOrderedTaskPriorities();
	const indexA = orderedPriorities.indexOf(a as TaskPriority);
	const indexB = orderedPriorities.indexOf(b as TaskPriority);

	// Handle cases where priority might not be in the ordered list
	if (indexA === -1 && indexB === -1) return 0; // both unknown, treat as equal
	if (indexA === -1) return 1; // a is unknown, sort it after b
	if (indexB === -1) return -1; // b is unknown, sort it after a

	return indexA - indexB;
};

// Custom sorting function for status
export const sortTasksByStatus: SortingFn<Task> = (
	rowA: Row<Task>,
	rowB: Row<Task>,
	columnId: string,
): number => {
	// Handle undefined original data
	if (!rowA.original && !rowB.original) return 0;
	if (!rowA.original) return 1; // rowA.original is undefined, sort it after rowB
	if (!rowB.original) return -1; // rowB.original is undefined, sort it after rowA

	const a = rowA.original.status;
	const b = rowB.original.status;

	const isADefined = a != null;
	const isBDefined = b != null;

	if (isADefined && !isBDefined) return -1; // a is defined, b is not; a comes first
	if (!isADefined && isBDefined) return 1; // b is defined, a is not; b comes first
	if (!isADefined && !isBDefined) return 0; // both are null/undefined, treat as equal

	// Ensure a and b are not null/undefined before using them as TaskStatus
	// This check is technically redundant due to the above but kept for clarity
	if (!a || !b) return 0;

	// Get the ordered list of statuses
	const orderedStatuses = getOrderedTaskStatuses();
	const indexA = orderedStatuses.indexOf(a as TaskStatus);
	const indexB = orderedStatuses.indexOf(b as TaskStatus);

	// Handle cases where status might not be in the ordered list
	if (indexA === -1 && indexB === -1) return 0; // both unknown, treat as equal
	if (indexA === -1) return 1; // a is unknown, sort it after b
	if (indexB === -1) return -1; // b is unknown, sort it after a

	return indexA - indexB;
};

/**
 * Custom sorting function for date fields in the task table.
 * Compares two dates and returns a number indicating their relative order.
 *
 * @param rowA - The first row to compare
 * @param rowB - The second row to compare
 * @param columnId - The ID of the column being sorted
 * @returns
 *   - Negative number if dateA is before dateB
 *   - Positive number if dateA is after dateB
 *   - 0 if dates are equal or either date is null/undefined
 */
export const sortTasksByDueDate: SortingFn<Task> = (
	rowA: Row<Task>,
	rowB: Row<Task>,
	columnId: string,
): number => {
	// Handle undefined original data
	if (!rowA.original && !rowB.original) return 0;
	if (!rowA.original) return 1;
	if (!rowB.original) return -1;

	const valA = rowA.original.dueDate;
	const valB = rowB.original.dueDate;

	// Handle null or undefined values:
	// If one is null/undefined and the other isn't, sort nulls/undefined to the end or beginning.
	// Here, we sort them as "lesser" or "equal" if both are null.
	if (valA == null && valB == null) return 0;
	if (valA == null) return 1; // valA is null, valB is not, so B comes first (-1 if valA first)
	if (valB == null) return -1; // valB is null, valA is not, so A comes first (1 if valB first)

	const dateA = new Date(valA as string | number | Date);
	const dateB = new Date(valB as string | number | Date);

	// Check for invalid dates after conversion
	if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
	if (isNaN(dateA.getTime())) return 1; // Invalid dates go last
	if (isNaN(dateB.getTime())) return -1; // Invalid dates go last

	return dateA.getTime() - dateB.getTime();
};

/**
 * Custom sorting function for date fields in the task table.
 * Compares two dates and returns a number indicating their relative order.
 *
 * @param rowA - The first row to compare
 * @param rowB - The second row to compare
 * @param columnId - The ID of the column being sorted
 * @returns
 *   - Negative number if dateA is before dateB
 *   - Positive number if dateA is after dateB
 *   - 0 if dates are equal or either date is null/undefined
 */
export const sortTasksByScheduledDate: SortingFn<Task> = (
	rowA: Row<Task>,
	rowB: Row<Task>,
	columnId: string,
): number => {
	// Handle undefined original data
	if (!rowA.original && !rowB.original) return 0;
	if (!rowA.original) return 1;
	if (!rowB.original) return -1;

	const valA = rowA.original.scheduledDate;
	const valB = rowB.original.scheduledDate;

	// Handle null or undefined values:
	// If one is null/undefined and the other isn't, sort nulls/undefined to the end or beginning.
	// Here, we sort them as "lesser" or "equal" if both are null.
	if (valA == null && valB == null) return 0;
	if (valA == null) return 1; // valA is null, valB is not, so B comes first (-1 if valA first)
	if (valB == null) return -1; // valB is null, valA is not, so A comes first (1 if valB first)

	const dateA = new Date(valA as string | number | Date);
	const dateB = new Date(valB as string | number | Date);

	// Check for invalid dates after conversion
	if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
	if (isNaN(dateA.getTime())) return 1; // Invalid dates go last
	if (isNaN(dateB.getTime())) return -1; // Invalid dates go last

	return dateA.getTime() - dateB.getTime();
};

export const getMatchingTasksSortingFn = (
	columnId: string,
): SortingFn<Task> | undefined => {
	if (columnId === "scheduledDate") {
		return sortTasksByScheduledDate;
	} else if (columnId === "dueDate") {
		return sortTasksByDueDate;
	} else if (columnId === "priority") {
		return sortTasksByPriority;
	} else if (columnId === "status") {
		return sortTasksByStatus;
	}
	return undefined;
};
