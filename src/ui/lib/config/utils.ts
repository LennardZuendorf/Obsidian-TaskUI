import { format } from "date-fns";
import { DateCategory } from "./dateCategory";
import { TaskPriority, TaskStatus } from "@/data/types/tasks";
import {
	dateToDateCategory,
	getDateCategoryDisplay,
} from "./date";
import {
	DateDisplayConfig,
	PriorityDisplayConfig,
	StatusDisplayConfig,
} from "./types";
import { getPriorityDisplay } from "./priority";
import { getStatusDisplay } from "./status";

type DisplayConfigType =
	| StatusDisplayConfig
	| PriorityDisplayConfig
	| DateDisplayConfig;
type EnumType = TaskStatus | TaskPriority | DateCategory;

/**
 * Gets the display configuration for a given label, enum value, or Date.
 * This function can handle status, priority, date category configurations, or Date objects.
 *
 * @param input - Either a string label, enum value, Date object, or null/undefined
 * @returns The corresponding display configuration object
 * @throws Error if no matching configuration is found
 *
 * @example
 * // Using a label
 * const config = getMatchingDisplay("To Do");
 *
 * // Using an enum
 * const config = getMatchingDisplay(TaskStatus.TODO);
 *
 * // Using a Date
 * const config = getMatchingDisplay(new Date());
 */
export function getMatchingDisplay(
	input: string | EnumType | Date | null | undefined,
): DisplayConfigType {
	if (input === null || input === undefined) {
		return {
			label: "None",
			icon: () => null,
			className: "text-muted-foreground",
			enum: DateCategory.NO_DATE,
		} as DateDisplayConfig;
	}

	if (input instanceof Date) {
		const baseConfig = getDateCategoryDisplay(
			dateToDateCategory(input),
		) as DisplayConfigType;
		return {
			...baseConfig,
			label: format(input, "EEE, do 'of' MMMM yyyy"),
		};
	}

	if (typeof input === "string") {
		// Check if the string is a valid enum value before trying to get display config
		// This prevents priority values from being incorrectly matched as status values
		// Priority is checked first to ensure correct matching when grouping by priority
		if (Object.values(TaskPriority).includes(input as TaskPriority)) {
			return getPriorityDisplay(input as TaskPriority) as DisplayConfigType;
		}
		if (Object.values(TaskStatus).includes(input as TaskStatus)) {
			return getStatusDisplay(input as TaskStatus) as DisplayConfigType;
		}
		if (Object.values(DateCategory).includes(input as DateCategory)) {
			return getDateCategoryDisplay(input as DateCategory) as DisplayConfigType;
		}

		// If not a valid enum value, throw an error
		// Note: This function expects enum values, not labels
		throw new Error(`No display configuration found for enum value: ${input}`);
	}

	// Handle enum input
	if (Object.values(TaskStatus).includes(input as TaskStatus)) {
		return getStatusDisplay(input as TaskStatus) as DisplayConfigType;
	}
	if (Object.values(TaskPriority).includes(input as TaskPriority)) {
		return getPriorityDisplay(input as TaskPriority) as DisplayConfigType;
	}
	if (Object.values(DateCategory).includes(input as DateCategory)) {
		return getDateCategoryDisplay(input as DateCategory) as DisplayConfigType;
	}

	throw new Error(`No display configuration found for enum: ${input}`);
}




