import { format } from "date-fns";
import { DateCategory } from "@/ui/lib/dateCategoryEnum";
import { TaskPriority, TaskStatus } from "../../../data/types/tasks";
import {
	dateToDateCategory,
	getDateCategoryDisplay,
} from "./dateDisplayConfig";
import {
	dateDisplayConfig,
	PriorityDisplayConfig,
	StatusDisplayConfig,
} from "./displayConfigTypes";
import { getPriorityDisplay } from "./priorityDisplayConfig";
import { getStatusDisplay } from "./statusDisplayConfig";

type DisplayConfigType =
	| StatusDisplayConfig
	| PriorityDisplayConfig
	| dateDisplayConfig;
type EnumType = TaskStatus | TaskPriority | DateCategory;

/**
 * Gets the display configuration for a given label or enum value.
 * This function can handle status, priority, or date category configurations.
 *
 * @param input - Either a string label or an enum value
 * @returns The corresponding display configuration object
 * @throws Error if no matching configuration is found
 *
 * @example
 * // Using a label
 * const config = getDisplayConfig("To Do");
 *
 * // Using an enum
 * const config = getDisplayConfig(TaskStatus.TODO);
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
		} as dateDisplayConfig;
	}

	if (input instanceof Date) {
		const displayConfig = getDateCategoryDisplay(
			dateToDateCategory(input),
		) as DisplayConfigType;
		displayConfig.label = format(input, "EEE, do 'of' MMMM yyyy");
		return displayConfig;
	}

	if (typeof input === "string") {
		// Try each config type
		const statusConfig = getStatusDisplay(input as TaskStatus);
		if (statusConfig) return statusConfig as DisplayConfigType;

		const priorityConfig = getPriorityDisplay(input as TaskPriority);
		if (priorityConfig) return priorityConfig as DisplayConfigType;

		const dateConfig = getDateCategoryDisplay(input as DateCategory);
		if (dateConfig) return dateConfig as DisplayConfigType;

		throw new Error(`No display configuration found for label: ${input}`);
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
