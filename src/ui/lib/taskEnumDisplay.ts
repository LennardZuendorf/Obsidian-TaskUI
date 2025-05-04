import { CheckCircle, Circle, PlayCircle, XCircle } from "lucide-react";
import React from "react";
import {
	PiCaretDoubleDownBold,
	PiCaretDoubleUpBold,
	PiCaretDownBold,
	PiCaretUpBold,
	PiMinusBold,
} from "react-icons/pi";
import { TaskPriority, TaskStatus } from "../../data/types/tasks";

// Interface for common display properties
export interface EnumDisplayConfig<
	T extends React.ElementType = React.ElementType,
> {
	label: string; // Display text (e.g., "Highest", "To Do")
	icon: T; // React component for the icon
	className?: string; // Tailwind classes for styling text/icon container
	iconClassName?: string; // Specific classes just for the icon element if needed
}

// ---
// Task Priority Configuration & Helper
// ---

const taskPriorityConfigMap: Record<
	TaskPriority,
	EnumDisplayConfig<typeof PiMinusBold>
> = {
	[TaskPriority.HIGHEST]: {
		label: "Highest",
		icon: PiCaretDoubleUpBold,
		className: "text-destructive",
		iconClassName: "text-destructive",
	},
	[TaskPriority.HIGH]: {
		label: "High",
		icon: PiCaretUpBold,
		className: "text-orange-500",
		iconClassName: "text-orange-500",
	},
	[TaskPriority.MEDIUM]: {
		label: "Medium",
		icon: PiMinusBold,
		className:
			"text-green-500 group-hover:text-green-900 dark:group-hover:text-green-300",
		iconClassName:
			"text-green-500 group-hover:text-green-900 dark:group-hover:text-green-300",
	},
	[TaskPriority.LOW]: {
		label: "Low",
		icon: PiCaretDownBold,
		className:
			"text-sky-500 group-hover:text-sky-900 dark:group-hover:text-sky-300",
		iconClassName:
			"text-sky-500 group-hover:text-sky-900 dark:group-hover:text-sky-300",
	},
	[TaskPriority.LOWEST]: {
		label: "Lowest",
		icon: PiCaretDoubleDownBold,
		className:
			"text-blue-500 group-hover:text-blue-900 dark:group-hover:text-blue-300",
		iconClassName:
			"text-blue-500 group-hover:text-blue-900 dark:group-hover:text-blue-300",
	},
};

export const getPriorityDisplay = (
	priority: TaskPriority | null | undefined,
): EnumDisplayConfig<typeof PiMinusBold> => {
	return (
		taskPriorityConfigMap[priority ?? TaskPriority.MEDIUM] ||
		taskPriorityConfigMap[TaskPriority.MEDIUM]
	);
};

// ---
// Task Status Configuration & Helper
// ---

const taskStatusConfigMap: Record<
	TaskStatus,
	EnumDisplayConfig<typeof Circle>
> = {
	[TaskStatus.TODO]: {
		label: "To Do",
		icon: Circle,
	},
	[TaskStatus.IN_PROGRESS]: {
		label: "In Progress",
		icon: PlayCircle,
	},
	[TaskStatus.DONE]: {
		label: "Completed",
		icon: CheckCircle,
		className: "text-muted-foreground",
		iconClassName: "text-muted-foreground",
	},
	[TaskStatus.CANCELLED]: {
		label: "Cancelled",
		icon: XCircle,
		className: "text-destructive",
		iconClassName: "text-destructive",
	},
};

export const getStatusDisplay = (
	status: TaskStatus | null | undefined,
): EnumDisplayConfig<typeof Circle> => {
	return (
		taskStatusConfigMap[status ?? TaskStatus.TODO] ||
		taskStatusConfigMap[TaskStatus.TODO]
	);
};

// --- Mappings for Forms/Parsing --- //

// String Label to Enum Value
export const statusStringToEnum: Record<string, TaskStatus> =
	Object.fromEntries(
		Object.entries(taskStatusConfigMap).map(([key, { label }]) => [
			label,
			key as TaskStatus,
		]),
	) as Record<string, TaskStatus>;

export const priorityStringToEnum: Record<string, TaskPriority> =
	Object.fromEntries(
		Object.entries(taskPriorityConfigMap).map(([key, { label }]) => [
			label,
			key as TaskPriority,
		]),
	) as Record<string, TaskPriority>;

// Enum Value to String Label (can be derived or kept for clarity)
export const statusEnumToString: Record<TaskStatus, string> =
	Object.fromEntries(
		Object.entries(taskStatusConfigMap).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskStatus, string>;

export const priorityEnumToString: Record<TaskPriority, string> =
	Object.fromEntries(
		Object.entries(taskPriorityConfigMap).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskPriority, string>;

// --- Ordered Lists for UI Elements --- //

// Use the new helper functions to get labels in order
export const priorityLabels: string[] = Object.values(TaskPriority).map(
	(p) => getPriorityDisplay(p).label,
);

export const statusLabels: string[] = Object.values(TaskStatus).map(
	(s) => getStatusDisplay(s).label,
);

// Export the raw configs too, if needed elsewhere (though helpers preferred)
export const taskPriorityConfig = taskPriorityConfigMap;
export const taskStatusConfig = taskStatusConfigMap;
