import { StatusDisplayConfig } from "@//lib/displayConfig/displayConfigTypes";
import { CheckCircle, Circle, PlayCircle, XCircle } from "lucide-react";
import { TaskStatus } from "../../../data/types/tasks";

/**
 * Configuration map for task status display properties.
 * Maps TaskStatus enum values to their display information including labels, icons, and styling.
 * Used for consistent status presentation across the application.
 *
 * @type {Record<TaskStatus, StatusDisplayConfig<typeof Circle>>}
 * @property {TaskStatus.TODO} - Configuration for tasks that are not yet started
 * @property {TaskStatus.IN_PROGRESS} - Configuration for tasks currently being worked on
 * @property {TaskStatus.DONE} - Configuration for completed tasks
 * @property {TaskStatus.CANCELLED} - Configuration for cancelled tasks
 */
const statusDisplayConfig: Record<
	TaskStatus,
	StatusDisplayConfig<typeof Circle>
> = {
	[TaskStatus.TODO]: {
		enum: TaskStatus.TODO,
		label: "To Do",
		icon: Circle,
		order: 1,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
	},
	[TaskStatus.IN_PROGRESS]: {
		enum: TaskStatus.IN_PROGRESS,
		label: "In Progress",
		icon: PlayCircle,
		order: 2,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
	},
	[TaskStatus.DONE]: {
		enum: TaskStatus.DONE,
		label: "Completed",
		icon: CheckCircle,
		className: "text-muted-foreground",
		iconClassName: "text-muted-foreground",
		order: 3,
	},
	[TaskStatus.CANCELLED]: {
		enum: TaskStatus.CANCELLED,
		label: "Cancelled",
		icon: XCircle,
		className: "text-destructive-foreground",
		iconClassName: "text-destructive-foreground",
	},
};

/**
 * Maps status string labels to their corresponding TaskStatus enum values.
 *
 * @type {Record<string, TaskStatus>}
 * @example
 * const status = statusStringToEnum["In Progress"];
 * // Returns: TaskStatus.IN_PROGRESS
 */
export const statusStringToEnum: Record<string, TaskStatus> =
	Object.fromEntries(
		Object.entries(statusDisplayConfig).map(([key, { label }]) => [
			label,
			key as TaskStatus,
		]),
	) as Record<string, TaskStatus>;

/**
 * Maps TaskStatus enum values to their string labels.
 *
 * @type {Record<TaskStatus, string>}
 * @example
 * const label = statusEnumToString[TaskStatus.DONE];
 * // Returns: "Completed"
 */
export const statusEnumToString: Record<TaskStatus, string> =
	Object.fromEntries(
		Object.entries(statusDisplayConfig).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskStatus, string>;

/**
 * Retrieves all status display configurations as an array.
 *
 * @returns {StatusDisplayConfig<typeof Circle>[]} Array of status display configurations, ordered by their display order
 * @example
 * const configs = getStatusDisplayConfig();
 * // Returns: [
 * //   { enum: TaskStatus.TODO, label: "To Do", ... },
 * //   { enum: TaskStatus.IN_PROGRESS, label: "In Progress", ... },
 * //   ...
 * // ]
 */
export const getStatusDisplayConfig = (): StatusDisplayConfig<
	typeof Circle
>[] => {
	return Object.values(statusDisplayConfig);
};

/**
 * Gets the display configuration for a specific task status.
 *
 * @param {TaskStatus | null | undefined} status - The task status to look up. If null or undefined, defaults to TaskStatus.TODO
 * @returns {StatusDisplayConfig<typeof Circle>} Display configuration for the specified status, or default configuration if status is invalid
 * @example
 * const config = getStatusDisplay(TaskStatus.DONE);
 * // Returns: { enum: TaskStatus.DONE, label: "Completed", ... }
 */
export const getStatusDisplay = (
	status: TaskStatus | null | undefined,
): StatusDisplayConfig<typeof Circle> => {
	return (
		statusDisplayConfig[status ?? TaskStatus.TODO] ||
		statusDisplayConfig[TaskStatus.TODO]
	);
};

/**
 * Gets an array of all status labels.
 *
 * @type {string[]}
 * @example
 * const labels = getStatusLabel;
 * // Returns: ["To Do", "In Progress", "Completed", "Cancelled"]
 */
export const getStatusLabels: string[] = Object.values(TaskStatus).map(
	(s) => getStatusDisplay(s).label,
);

export const getOrderedTaskStatuses = (): TaskStatus[] => {
	return Object.entries(statusDisplayConfig)
		.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
		.map(([key]) => key as TaskStatus);
};
