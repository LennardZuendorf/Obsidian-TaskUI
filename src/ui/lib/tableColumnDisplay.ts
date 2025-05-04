import {
	CalendarCheck,
	CalendarClock,
	CheckCircleIcon,
	FlagIcon,
	TagIcon,
	Text,
} from "lucide-react";
import React from "react";

// Interface for column display properties
export interface ColumnDisplayInfo {
	label: string;
	icon?: React.ElementType;
}

// Configuration map for column display properties
// Uses column 'id' or 'accessorKey' as the key
export const columnDisplayConfig: Record<string, ColumnDisplayInfo> = {
	description: {
		label: "Description",
		icon: Text,
	},
	tags: {
		label: "Tags",
		icon: TagIcon,
	},
	status: {
		label: "Status",
		icon: CheckCircleIcon, // Use helper for default icon
	},
	priority: {
		label: "Priority",
		icon: FlagIcon, // Use helper for default icon
	},
	scheduledDate: {
		label: "Scheduled Date",
		icon: CalendarCheck,
	},
	dueDate: {
		label: "Due Date",
		icon: CalendarClock,
	},
	scheduledDateCategory: {
		label: "Scheduled",
		icon: CalendarCheck,
	},
	dueDateCategory: {
		label: "Due",
		icon: CalendarClock,
	},
	actions: {
		label: "Actions",
	},
};

// Helper function to get display info safely
export const getColumnDisplayInfo = (columnId: string): ColumnDisplayInfo => {
	return (
		columnDisplayConfig[columnId] ?? {
			label: columnId,
		}
	);
};
