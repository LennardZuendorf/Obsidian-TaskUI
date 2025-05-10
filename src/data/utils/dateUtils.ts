import {
	format,
	isAfter,
	isBefore,
	isValid,
	parse,
	startOfDay,
} from "date-fns";

/**
 * Parse a date string into a Date object. If the date string is null, null is returned.
 * @param dateString - The date string to parse
 * @returns The parsed Date object or null if the input is null
 */
export function parseDate(dateString: string | null): Date | null {
	return dateString ? new Date(dateString) : null;
}

/**
 * Format a date into a localized string representation.
 * @param date - The date to format
 * @returns A formatted date string or empty string if date is null/undefined
 */
export function formatDate(date: Date | null | undefined): string {
	if (date == null) {
		return "";
	}
	return format(date, "dd/MMM/yyyy");
}

/**
 * Split a Date object into its year, month, and day components.
 * @param date - The date to split
 * @returns An object containing year, month, and day as numbers
 */
export function splitDateIntoString(date: Date): string {
	return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

/**
 * Combine year, month, and day numbers into a Date object.
 * @param year - The year component
 * @param month - The month component (0-11)
 * @param day - The day component
 * @returns A new Date object constructed from the provided parts
 */
export function combineDateParts(
	year: number,
	month: number,
	day: number,
): Date {
	return new Date(year, month, day);
}

/**
 * Validate if the given year, month, and day components form a valid date.
 * @param year - The year component to validate
 * @param month - The month component to validate
 * @param day - The day component to validate
 * @returns True if the components form a valid date, false otherwise
 */
export function validateDateString(
	year: number,
	month: number,
	day: number,
): boolean {
	if (year == null || month == null || day == null) {
		return false;
	}

	return !isNaN(new Date(year, month, day).getTime());
}

/**
 * Converts a Date object to a string in DDMMYYYY format.
 * @param date - The Date object to convert
 * @returns A string in DDMMYYYY format or an empty string if date is null
 */
export function dateToNumberString(date: Date | null): string {
	if (!date) return "";
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = String(date.getFullYear());
	return `${day}${month}${year}`;
}

/**
 * Validates if a string in DDMMYYYY format is a valid date, with optional temporal validation.
 * @param dateStr - The string to validate
 * @param temporal - 'any' (default), 'future', or 'past'. If 'future', only accept dates after today. If 'past', only accept dates before today.
 * @returns True if valid, false otherwise
 */
export function isValidDateNumberString(
	dateStr: string,
	temporal: "any" | "future" | "past" = "any",
): boolean {
	if (!/^\d{8}$/.test(dateStr)) return false;
	const date = parse(dateStr, "ddMMyyyy", new Date());
	if (!isValid(date)) return false;
	// Ensure the parsed date matches the input (e.g., 32012025 should not become 01/02/2025)
	const checkStr = format(date, "ddMMyyyy");
	if (checkStr !== dateStr) return false;
	if (temporal === "future") {
		return isAfter(startOfDay(date), startOfDay(new Date()));
	}
	if (temporal === "past") {
		return isBefore(startOfDay(date), startOfDay(new Date()));
	}
	return true;
}

/**
 * Converts a DDMMYYYY string to a Date object, or null if invalid.
 * @param dateStr - The string to convert
 * @returns Date object or null
 */
export function numberStringToDate(dateStr: string): Date | null {
	if (!isValidDateNumberString(dateStr)) return null;
	const date = parse(dateStr, "ddMMyyyy", new Date());
	return isValid(date) ? date : null;
}
