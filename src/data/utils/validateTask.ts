import { Task, TaskSchema } from "../types/tasks";

/**
 * Validates a single task object against the schema
 * @returns Result object with validation status and error message if any
 */
export function validateTask(task: unknown): {
	isValid: boolean;
	message: string;
} {
	const result = TaskSchema.safeParse(task);

	if (!result.success) {
		return {
			isValid: false,
			message: result.error.errors
				.map((err) => `${err.path.join(".")}: ${err.message}`)
				.join(", "),
		};
	}

	return { isValid: true, message: "" };
}

/**
 * Validates an array of tasks
 * @throws Error if any task in the array is invalid
 */
export function validateTasks(tasks: unknown[]): asserts tasks is Task[] {
	if (!Array.isArray(tasks)) {
		throw new Error("Expected an array of tasks");
	}

	const arraySchema = TaskSchema.array();
	const result = arraySchema.safeParse(tasks);

	if (!result.success) {
		throw new Error(
			`Invalid tasks: ${result.error.errors
				.map((err) => `${err.path.join(".")}: ${err.message}`)
				.join(", ")}`,
		);
	}
}
