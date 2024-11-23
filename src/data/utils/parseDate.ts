/**
 * Parse a date string into a Date object. If the date string is null, null is returned.
 * @param dateString
 */
export function parseDate(dateString: string | null): Date | null {
	return dateString ? new Date(dateString) : null;
}
