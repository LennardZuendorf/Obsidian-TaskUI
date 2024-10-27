export function validateValue<T>(value: any, allowedValues: readonly T[]): T {
	// Check if the value is included in the allowed values
	if (allowedValues.includes(value)) {
		return value as T; // Return the value if it's valid
	} else {
		throw new Error(
			`Invalid value: ${value}. Allowed values are: ${allowedValues.join(", ")}`,
		);
	}
}

export function parseDate(dateString: string | null): Date | null {
	return dateString ? new Date(dateString) : null;
}
