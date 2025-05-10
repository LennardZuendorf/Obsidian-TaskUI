/**
 * Enum representing date-based categories for task organization.
 * Used for grouping and filtering tasks based on their temporal properties.
 */
export enum DateCategory {
	OVERDUE = "Overdue",
	TODAY = "Today",
	TOMORROW = "Tomorrow",
	THIS_WEEK = "This week",
	NEXT_7_DAYS = "Next 7 days",
	THIS_MONTH = "This month",
	NEXT_30_DAYS = "Next 30 days",
	FUTURE = "Future",
	NO_DATE = "No date",
}
