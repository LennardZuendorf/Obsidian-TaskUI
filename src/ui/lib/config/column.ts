import {
	CalendarCheck,
	CalendarClock,
	CheckCircleIcon,
	FlagIcon,
	TagIcon,
	Text,
} from "lucide-react";
import { ColumnDisplayInfo } from "./types";

/**
 * Configuration map for column display properties.
 * Maps column IDs to their display information including labels, icons, and data types.
 * Used for consistent column presentation across the application.
 *
 * @type {Record<string, ColumnDisplayInfo>}
 * @property {ColumnDisplayInfo} description - Configuration for the description column (string type)
 * @property {ColumnDisplayInfo} tags - Configuration for the tags column (string array type)
 * @property {ColumnDisplayInfo} status - Configuration for the status column (TaskStatus enum type)
 * @property {ColumnDisplayInfo} priority - Configuration for the priority column (TaskPriority enum type)
 * @property {ColumnDisplayInfo} scheduledDate - Configuration for the scheduled date column (Date type)
 * @property {ColumnDisplayInfo} dueDate - Configuration for the due date column (Date type)
 * @property {ColumnDisplayInfo} scheduledDateCategory - Configuration for the scheduled date category column (DateCategory enum type)
 * @property {ColumnDisplayInfo} dueDateCategory - Configuration for the due date category column (DateCategory enum type)
 */

const columnDisplayConfig = {
	description: {
		type: "string",
		label: "Description",
		icon: Text,
	},
	tags: {
		type: "string[]",
		label: "Tags",
		icon: TagIcon,
	},
	status: {
		type: "TaskStatus",
		label: "Status",
		icon: CheckCircleIcon,
	},
	priority: {
		type: "TaskPriority",
		label: "Priority",
		icon: FlagIcon,
	},
	scheduledDate: {
		type: "Date",
		label: "Scheduled Date",
		icon: CalendarCheck,
	},
	dueDate: {
		type: "Date",
		label: "Due Date",
		icon: CalendarClock,
	},
	scheduledDateCategory: {
		type: "DateCategory",
		label: "Scheduled",
		icon: CalendarCheck,
	},
	dueDateCategory: {
		type: "DateCategory",
		label: "Due",
		icon: CalendarClock,
	},
} as const;

export type ColumnId = keyof typeof columnDisplayConfig;

export const getColumnDisplayConfig = (
	columnId: ColumnId,
): ColumnDisplayInfo => {
	return columnDisplayConfig[columnId];
};

export const getColumnDisplay = (
	columnId: string,
): ColumnDisplayInfo | undefined => {
	return columnDisplayConfig[columnId as ColumnId];
};




