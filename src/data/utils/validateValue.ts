/**
 * Validate a value against a list of allowed values. If the value is not in the list, an error is thrown.
 * @param value
 * @param allowedValues
 */
// this is literally meant to be able to validate any value against a list of allowed values. So the type of the value is any.
// biome-ignore lint/suspicious/noExplicitAny: This function is designed to validate any value type
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
