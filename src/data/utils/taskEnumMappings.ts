import { CheckCircle, Circle, PlayCircle, XCircle } from "lucide-react";
import React from "react";
import {
	PiCaretDoubleDownBold,
	PiCaretDoubleUpBold,
	PiCaretDownBold,
	PiCaretUpBold,
	PiMinusBold,
} from "react-icons/pi";
import { TaskPriority, TaskStatus } from "../types/tasks";

// Interface for common display properties
interface EnumDisplayConfig<T extends React.ElementType = React.ElementType> {
	label: string; // Display text (e.g., "Highest", "To Do")
	icon: T; // React component for the icon
	className?: string; // Tailwind classes for styling text/icon container
	iconClassName?: string; // Specific classes just for the icon element if needed
}

// Configuration for TaskPriority
// Using PiMinusBold as a representative icon type for the generic; adjust if needed
export const taskPriorityConfig: Record<
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
			"text-blue-500 group-hover:text-blue-900 dark:group-hover:text-blue-300", // Applied fix from previous step
	},
};

// Configuration for TaskStatus
// Using Circle as a representative icon type for the generic; adjust if needed
export const taskStatusConfig: Record<
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

// --- Mappings for Forms/Parsing ---

// String Label to Enum Value
export const statusStringToEnum: Record<string, TaskStatus> =
	Object.fromEntries(
		Object.entries(taskStatusConfig).map(([key, { label }]) => [
			label,
			key as TaskStatus,
		]),
	) as Record<string, TaskStatus>;

export const priorityStringToEnum: Record<string, TaskPriority> =
	Object.fromEntries(
		Object.entries(taskPriorityConfig).map(([key, { label }]) => [
			label,
			key as TaskPriority,
		]),
	) as Record<string, TaskPriority>;

// Enum Value to String Label (can be derived or kept for clarity)
export const statusEnumToString: Record<TaskStatus, string> =
	Object.fromEntries(
		Object.entries(taskStatusConfig).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskStatus, string>;

export const priorityEnumToString: Record<TaskPriority, string> =
	Object.fromEntries(
		Object.entries(taskPriorityConfig).map(([key, { label }]) => [
			key,
			label,
		]),
	) as Record<TaskPriority, string>;

// --- Ordered Lists for UI Elements ---

// Get ordered lists of labels if needed for dropdowns etc.
// Note: This relies on the insertion order of enum keys, which is generally stable but not strictly guaranteed by spec.
// If strict ordering is needed, define the order explicitly.
export const priorityLabels = Object.values(taskPriorityConfig).map(
	(config) => config.label,
);
export const statusLabels = Object.values(taskStatusConfig).map(
	(config) => config.label,
);
