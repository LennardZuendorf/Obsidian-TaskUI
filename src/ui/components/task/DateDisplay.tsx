import { format } from "date-fns";
import React from "react";
import { DateCategory } from "@/ui/lib/config/dateCategory";
import {
	dateToDateCategory,
	getDateCategoryDisplay,
} from "@/ui/lib/config/date";
import { cn } from "@/ui/utils";

export interface DateDisplayProps {
	date: Date | null | undefined;
	label?: string;
	showIcon?: boolean;
	className?: string;
}

/**
 * DateDisplay component that shows dates with friendly labels like "Today", "Tomorrow", "Overdue"
 * for near-term dates, and formatted dates for dates further out.
 *
 * @example
 * <DateDisplay date={task.dueDate} label="Due" />
 * // Output: "Due: Today" or "Due: Tomorrow" or "Due: Wed, Dec 10"
 */
export function DateDisplay({
	date,
	label,
	showIcon = true,
	className,
}: DateDisplayProps) {
	if (!date) {
		return null;
	}

	const category = dateToDateCategory(date);
	const config = getDateCategoryDisplay(category);
	const Icon = config.icon;

	const displayText = [
		DateCategory.TODAY,
		DateCategory.TOMORROW,
		DateCategory.THIS_WEEK,
		DateCategory.NEXT_7_DAYS,
	].includes(category)
		? config.label
		: format(date, "EEE, MMM d");

	return (
		<span className={cn("flex items-center gap-1.5", config.className, className)}>
			{showIcon && <Icon className={cn("h-3.5 w-3.5", config.iconClassName)} />}
			{label && <span className="font-medium">{label}:</span>}
			<span>{displayText}</span>
		</span>
	);
}

