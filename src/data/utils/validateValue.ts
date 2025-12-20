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
		// Sanitize error message to avoid exposing sensitive data
		const isDevelopment = import.meta.env.MODE === "development";
		const errorMessage = isDevelopment
			? `Invalid value: ${value}. Allowed values are: ${allowedValues.join(", ")}`
			: "Invalid value provided";
		throw new Error(errorMessage);
	}
}
