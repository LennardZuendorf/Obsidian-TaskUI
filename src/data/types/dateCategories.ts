/**
 * Date category types and helper functions for task grouping and filtering
 */

/**
 * Enum for date categories used for grouping and filtering tasks
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

/**
 * Format a date for display in the UI
 */
export const formatDate = (date: Date | null | undefined): string => {
	if (date == null) {
		return "";
	}

	return new Date(date).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

/**
 * Categorize a date into a user-friendly group for filtering and grouping
 */
export const getDateCategory = (
	date: Date | null | undefined,
): DateCategory => {
	if (date == null) {
		return DateCategory.NO_DATE;
	}

	const now = new Date();
	const startOfDay = (d: Date) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const addDays = (d: Date, days: number) =>
		new Date(d.getTime() + days * 86400000);

	const today = startOfDay(now);
	const tomorrow = addDays(today, 1);
	const sevenDaysLater = addDays(today, 7);
	const thirtyDaysLater = addDays(today, 30);

	const targetDate = startOfDay(new Date(date)); // Normalize the input date

	// Order matters: Check from most specific/urgent to least
	if (targetDate < today) {
		return DateCategory.OVERDUE;
	}
	if (targetDate.getTime() === today.getTime()) {
		// Use getTime() for accurate date comparison
		return DateCategory.TODAY;
	}
	if (targetDate.getTime() === tomorrow.getTime()) {
		return DateCategory.TOMORROW;
	}
	// Check ranges using getTime() for consistency
	if (
		targetDate.getTime() > tomorrow.getTime() &&
		targetDate.getTime() < sevenDaysLater.getTime()
	) {
		return DateCategory.NEXT_7_DAYS;
	}
	if (
		targetDate.getTime() >= sevenDaysLater.getTime() &&
		targetDate.getTime() < thirtyDaysLater.getTime()
	) {
		return DateCategory.NEXT_30_DAYS;
	}
	if (targetDate.getTime() >= thirtyDaysLater.getTime()) {
		return DateCategory.FUTURE;
	}

	// Fallback case, though ideally all dates should be covered
	console.warn("Date category calculation fell through for date:", date);
	return DateCategory.FUTURE;
};

/**
 * Get the categories in order of appearance (for display order in UI)
 * Note: Ensure this order matches the logic in getDateCategory if adjustments are made.
 */
export const getOrderedDateCategories = (): DateCategory[] => [
	DateCategory.OVERDUE,
	DateCategory.TODAY,
	DateCategory.TOMORROW,
	DateCategory.NEXT_7_DAYS,
	DateCategory.NEXT_30_DAYS,
	DateCategory.FUTURE,
	DateCategory.NO_DATE,
];
