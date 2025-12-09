import {
	LuCalendar1,
	LuCalendarCheck,
	LuCalendarClock,
	LuCalendarDays,
	LuCalendarFold,
	LuCalendarOff,
} from "react-icons/lu";
import { dateDisplayConfig } from "@/ui/lib/displayConfig/displayConfigTypes";
import { DateCategory } from "../dateCategoryEnum";

/**
 * Configuration for date-based categories used in task organization and filtering.
 * Defines display properties, icons, and ordering for different temporal categories.
 */
const dateCategoryConfig: Record<
	DateCategory,
	dateDisplayConfig<typeof LuCalendarFold>
> = {
	[DateCategory.OVERDUE]: {
		label: "Overdue",
		enum: DateCategory.OVERDUE,
		icon: LuCalendarClock,
		className: "text-destructive",
		iconClassName: "text-destructive",
		order: 1,
	},
	[DateCategory.TODAY]: {
		label: "Today",
		enum: DateCategory.TODAY,
		icon: LuCalendar1,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 2,
	},
	[DateCategory.TOMORROW]: {
		label: "Tomorrow",
		enum: DateCategory.TOMORROW,
		icon: LuCalendarCheck,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 3,
	},
	[DateCategory.THIS_WEEK]: {
		label: "This week",
		enum: DateCategory.THIS_WEEK,
		icon: LuCalendarDays,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 4,
	},
	[DateCategory.NEXT_7_DAYS]: {
		label: "Next 7 days",
		enum: DateCategory.NEXT_7_DAYS,
		icon: LuCalendarDays,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 5,
	},
	[DateCategory.THIS_MONTH]: {
		label: "This month",
		enum: DateCategory.THIS_MONTH,
		icon: LuCalendarFold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 6,
	},
	[DateCategory.NEXT_30_DAYS]: {
		label: "Next 30 days",
		enum: DateCategory.NEXT_30_DAYS,
		icon: LuCalendarFold,
		className: "text-primary-foreground",
		iconClassName: "text-primary-foreground",
		order: 7,
	},
	[DateCategory.FUTURE]: {
		label: "Future",
		enum: DateCategory.FUTURE,
		icon: LuCalendarFold,
		className: "text-muted-foreground",
		iconClassName: "text-muted-foreground",
		order: 8,
	},
	[DateCategory.NO_DATE]: {
		label: "No date",
		enum: DateCategory.NO_DATE,
		icon: LuCalendarOff,
		className: "text-muted-foreground",
		iconClassName: "text-muted-foreground",
		order: 9,
	},
};

/**
 * Returns an array of date categories in their display order.
 *
 * @returns {DateCategory[]} Array of date categories ordered by display priority
 * @remarks The order must match the logic in {@link getDateCategory} for consistency
 */
export const getOrderedDateCategories = (): DateCategory[] => {
	return Object.entries(dateCategoryConfig)
		.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
		.map(([key]) => key as DateCategory);
};

/**
 * Categorizes a date into a user-friendly temporal group for filtering and grouping.
 *
 * @param date - The date to categorize, can be null or undefined
 * @returns {DateCategory} The appropriate date category for the given date
 * @throws {Error} If date parsing fails
 */
export const dateToDateCategory = (
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

	const targetDate = startOfDay(new Date(date));

	if (targetDate < today) {
		return DateCategory.OVERDUE;
	}
	if (targetDate.getTime() === today.getTime()) {
		return DateCategory.TODAY;
	}
	if (targetDate.getTime() === tomorrow.getTime()) {
		return DateCategory.TOMORROW;
	}
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

	console.warn("Date category calculation fell through for date:", date);
	return DateCategory.FUTURE;
};

/**
 * Retrieves all date category display configurations as an array.
 *
 * @returns {dateDisplayConfig<typeof LuCalendarFold>[]} Array of date category display configurations, ordered by their display order
 */
export const getDateCategoryDisplayConfig = (): dateDisplayConfig<
	typeof LuCalendarFold
>[] => {
	return Object.values(dateCategoryConfig);
};

/**
 * Retrieves an array of all date category labels.
 *
 * @returns {string[]} Array of date category labels, ordered by their display order
 */
export const getDateCategoryLabels: string[] = Object.values(
	dateCategoryConfig,
).map((c) => c.label);

/**
 * Retrieves the display configuration for a specific date category.
 *
 * @param {DateCategory} dateCategory - The date category to get the display configuration for
 * @returns {dateDisplayConfig<typeof LuCalendarFold>} The display configuration for the specified date category
 */
export const getDateCategoryDisplay = (
	dateCategory: DateCategory,
): dateDisplayConfig<typeof LuCalendarFold> => {
	return dateCategoryConfig[dateCategory];
};

/**
 * Retrieves the date category for a specific label.
 *
 * @param {string} label - The label to get the date category for
 * @returns {DateCategory} The date category for the specified label
 */
export const labelToDateCategory = (label: string): DateCategory => {
	return Object.entries(dateCategoryConfig).find(
		([_, value]) => value.label === label,
	)?.[0] as DateCategory;
};

/**
 * Retrieves the date category for a specific label.
 *
 * @param {string} label - The label to get the date category for
 * @returns {DateCategory} The date category for the specified label
 */
export const dateCategoryToLabel = (dateCategory: DateCategory): string => {
	return dateCategoryConfig[dateCategory].label;
};
