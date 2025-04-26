"use client";

import {
	addDays,
	eachDayOfInterval,
	format,
	isWeekend,
	startOfDay,
} from "date-fns";
import * as React from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn"; // Import your cn utility
// Remove SCSS import
// import s from "./Datepicker.module.scss";
// Remove clsx import
// import clsx from "clsx";
// Remove curry import if not strictly needed or replace with simple function
// import { curry2 } from "ts-curry";

// Simplified type for single date selection
export type InlineCalendarEvent = Date | undefined;

// Props adapted for fixed 8-day view
export type InlineCalendarProps = {
	onChange: (d: Date | null) => void; // Keep Date | null to match form
	value: Date | null; // Current selected date
	disabledDates?: Date[];
	className?: string;
};

// Helper functions (keep as they are for now)
const getTime = (d: Date) => startOfDay(d).getTime();
const convertToDate = (d: number | string) => new Date(d);
const capitalizeFirstLetter = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1);
// Replace curry with simpler function if needed, or keep if curry is available/desired
// const isEqualDate = curry2((d1: Date, d2: Date) => getTime(d1) === getTime(d2));
const isEqualDate = (d1: Date, d2: Date) => getTime(d1) === getTime(d2);

const eachDay = (start: Date, end: Date) => eachDayOfInterval({ start, end });
const eachMonth = (start: Date, end: Date) => eachDayOfInterval({ start, end });

// Removed range filtering logic as it's not needed for single selection

export const InlineCalendar = forwardRef<HTMLDivElement, InlineCalendarProps>(
	({ onChange, value, disabledDates, className }, ref) => {
		// Calculate the 8 dates to display
		const today = startOfDay(new Date());
		const sevenDaysLater = addDays(today, 7);
		const daysToShow = eachDayOfInterval({
			start: today,
			end: sevenDaysLater,
		});

		// Simplified date click handler for single selection
		const onDateClick = (selectedDate: Date) => {
			if (value && isEqualDate(value, selectedDate)) {
				onChange(null); // Pass null for deselection
			} else {
				onChange(selectedDate);
			}
		};

		return (
			<div ref={ref} className={cn("flex space-x-1", className)}>
				{daysToShow.map((d, dayIdx) => {
					const dayLabel = format(d, "EEEEE"); // Narrow day label (e.g., M)
					const dateLabel = format(d, "d"); // Just the day number
					const isDisabled = disabledDates?.some((disabled) =>
						isEqualDate(d, disabled),
					);
					const isDaySelected = value && isEqualDate(value, d);

					return (
						// Day Item Container
						<div
							data-testid="DAY_ITEM"
							key={d.toISOString()} // Use ISO string for key
							{...(isDisabled ? { "aria-disabled": "true" } : {})}
							className={cn(
								// Base item styles
								"flex flex-col items-center p-1.5 rounded-md cursor-pointer min-w-[32px]",
								// Weekend styles
								isWeekend(d) && "text-muted-foreground",
								// Selected styles - Use ACCENT colors
								isDaySelected &&
									"bg-accent text-accent-foreground",
								// Non-selected hover styles
								!isDaySelected &&
									!isDisabled &&
									"hover:bg-accent hover:text-accent-foreground",
								// Disabled styles
								isDisabled && "opacity-50 cursor-not-allowed",
							)}
							onClick={() => !isDisabled && onDateClick(d)} // No event needed
							// Remove onMouseDown
						>
							{/* Day Label (e.g., M) */}
							<div
								data-testid="DAY_LABEL"
								className={cn(
									"text-xs",
									!isDaySelected && isWeekend(d)
										? "text-muted-foreground/80"
										: "text-muted-foreground",
								)}
							>
								{dayLabel}
							</div>
							{/* Date Label (e.g., 25) */}
							<div
								data-testid="DATE_LABEL"
								className={cn("text-sm font-medium mt-0.5")}
							>
								{dateLabel}
							</div>
						</div>
					);
				})}
			</div>
		);
	},
);

InlineCalendar.displayName = "InlineCalendar";
