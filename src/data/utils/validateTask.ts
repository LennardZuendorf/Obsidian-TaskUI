import { Task, TaskPriority, TaskStatus, TaskSource } from "../types/tasks";
import { validateValue } from "./validateValue";

/**
 * Validates a partial task object to ensure it contains all required fields
 * and that these fields have valid values.
 *
 * @param partialTask - A partial representation of a Task object. This object
 * may not contain all fields of a Task, but the function will check for the
 * presence and validity of required fields.
 *
 * @returns An object containing a boolean indicating whether the partial task is valid
 * and a message indicating which field is invalid if any. Returns `true` and an empty
 * message if all required fields are present and valid.
 */
export function validateTask(partialTask: Partial<Task>): {
	isValid: boolean;
	message: string;
} {
	const requiredFields: (keyof Task)[] = [
		"id",
		"description",
		"priority",
		"status",
		"path",
		"source",
	];

	try {
		for (const field of requiredFields) {
			if (
				partialTask[field] === undefined ||
				partialTask[field] === null
			) {
				return {
					isValid: false,
					message: `Field ${field} is missing or null`,
				};
			}
		}

		validateValue(partialTask.priority, Object.values(TaskPriority));
		validateValue(partialTask.status, Object.values(TaskStatus));
		validateValue(partialTask.source, Object.values(TaskSource));

		return { isValid: true, message: "" };
	} catch (error) {
		return { isValid: false, message: (error as Error).message };
	}
}
