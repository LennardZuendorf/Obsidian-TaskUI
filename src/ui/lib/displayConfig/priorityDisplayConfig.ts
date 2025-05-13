import {
	PiCaretDoubleDownBold,
	PiCaretDoubleUpBold,
	PiCaretDownBold,
	PiCaretUpBold,
	PiMinusBold,
} from "react-icons/pi";
import { EnumDisplayConfig } from "../../../ui/lib/displayConfig/displayConfigTypes";
import { TaskPriority } from "../../../data/types/tasks";

/**
 * Configuration map for task priority display properties.
 * Maps priority levels to their display information including labels, icons, and styling.
 * Used for consistent priority presentation across the application.
 *
 * @constant {Record<TaskPriority, EnumDisplayConfig<typeof PiMinusBold>>} taskPriorityConfig
 */
const taskPriorityConfig: Record<
	TaskPriority,
	EnumDisplayConfig<typeof PiMinusBold>
> = {
	[TaskPriority.HIGHEST]: {
		label: "Highest",
		icon: PiCaretDoubleUpBold,
		className: "text-destructive-foreground",
		iconClassName: "text-destructive-foreground",
		order: 1,
	},
	[TaskPriority.HIGH]: {
		label: "High",
		icon: PiCaretUpBold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 2,
	},
	[TaskPriority.MEDIUM]: {
		label: "Medium",
		icon: PiMinusBold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 3,
	},
	[TaskPriority.LOW]: {
		label: "Low",
		icon: PiCaretDownBold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 4,
	},
	[TaskPriority.LOWEST]: {
		label: "Lowest",
		icon: PiCaretDoubleDownBold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 5,
	},
};

/**
 * Maps priority string labels to their corresponding enum values.
 * Used for form parsing and data conversion.
 *
 * @constant {Record<string, TaskPriority>} priorityStringToEnum
 */
export const priorityStringToEnum: Record<string, TaskPriority> =
	Object.fromEntries(
		Object.entries(taskPriorityConfig).map(([key, { label }]) => [
			label,
			key as TaskPriority,
		]),
	) as Record<string, TaskPriority>;

/**
 * Maps priority enum values to their string labels.
 * Used for display and data conversion.
 *
 * @constant {Record<TaskPriority, string>} priorityEnumToString
 */
export const priorityEnumToString: Record<TaskPriority, string> =
	Object.fromEntries(
		Object.entries(taskPriorityConfig).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskPriority, string>;

/**
 * Retrieves display configuration for a given task priority.
 * Returns a default configuration (MEDIUM) if no specific configuration exists.
 *
 * @param priority - The priority level to get display info for
 * @returns EnumDisplayConfig object containing label, icon, and styling
 */
export const getPriorityDisplay = (
	priority: TaskPriority | null | undefined,
): EnumDisplayConfig<typeof PiMinusBold> => {
	return (
		taskPriorityConfig[priority ?? TaskPriority.MEDIUM] ||
		taskPriorityConfig[TaskPriority.MEDIUM]
	);
};

/**
 * Retrieves all priority display configurations as an array.
 *
 * @returns {EnumDisplayConfig<typeof PiMinusBold>[]} Array of priority display configurations, ordered by their display order
 */
export const getPriorityDisplayConfig = (): EnumDisplayConfig<
	typeof PiMinusBold
>[] => {
	return Object.values(taskPriorityConfig);
};

/**
 * Retrieves an array of all priority labels.
 *
 * @returns {string[]} Array of priority labels, ordered by their display order
 */
export const getPriorityLabels: string[] = Object.values(TaskPriority).map(
	(p) => getPriorityDisplay(p).label,
);

/**
 * Retrieves an array of all task priorities, ordered by their display order.
 *
 * @returns {TaskPriority[]} Array of task priorities, ordered by their display order
 */
export const getOrderedTaskPriorities = (): TaskPriority[] => {
	return Object.entries(taskPriorityConfig)
		.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
		.map(([key]) => key as TaskPriority);
};
