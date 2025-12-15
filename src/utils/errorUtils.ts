/**
 * Extracts a human-readable error message from an unknown error type.
 * Handles both Error instances and other types (strings, objects, etc.).
 *
 * @param error - The error to extract a message from
 * @returns A string representation of the error message
 */
export function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
