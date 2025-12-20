import { z } from "zod";
import { logger } from "../../utils/logger";
import { Task, TaskSchema, TaskWithMetadata } from "../types/tasks";

// Metadata validation schema
const TaskMetadataSchema = z.object({
	lastUpdated: z.number().optional(),
	lastSynced: z.number().optional(),
	needsSync: z.boolean().optional(),
});

// Combined schema for TaskWithMetadata
export const TaskWithMetadataSchema = z.object({
	task: TaskSchema,
	metadata: TaskMetadataSchema,
});

/**
 * Validates a single task against the TaskSchema
 * @param task Task to validate
 * @returns Object containing validation result
 */
export function validateTask(task: Task): {
	isValid: boolean;
	message: string;
} {
	try {
		TaskSchema.parse(task);
		return { isValid: true, message: "Task is valid" };
	} catch (error) {
		const message = `Task validation failed: ${error.message}`;
		logger.error(message);
		return { isValid: false, message };
	}
}

/**
 * Validates an array of tasks against the TaskSchema
 * @param tasks Array of tasks to validate
 * @returns Object containing validation result
 */
export function validateTasks(tasks: Task[]): {
	isValid: boolean;
	message: string;
} {
	if (!Array.isArray(tasks)) {
		return { isValid: false, message: "Expected an array of tasks" };
	}

	for (const task of tasks) {
		const result = validateTask(task);
		if (!result.isValid) {
			return result;
		}
	}

	return { isValid: true, message: "All tasks are valid" };
}

/**
 * Validates a TaskWithMetadata against the TaskWithMetadataSchema
 * @param taskWithMeta TaskWithMetadata to validate
 * @returns Object containing validation result
 */
export function validateTaskWithMetadata(taskWithMeta: TaskWithMetadata): {
	isValid: boolean;
	message: string;
} {
	try {
		TaskWithMetadataSchema.parse(taskWithMeta);
		return { isValid: true, message: "TaskWithMetadata is valid" };
	} catch (error) {
		const message = `TaskWithMetadata validation failed: ${error.message}`;
		logger.error(message);
		return { isValid: false, message };
	}
}

/**
 * Validates an array of TaskWithMetadata against the TaskWithMetadataSchema
 * @param tasksWithMeta Array of TaskWithMetadata to validate
 * @returns Object containing validation result
 */
export function validateTasksWithMetadata(tasksWithMeta: TaskWithMetadata[]): {
	isValid: boolean;
	message: string;
} {
	if (!Array.isArray(tasksWithMeta)) {
		return {
			isValid: false,
			message: "Expected an array of TaskWithMetadata",
		};
	}

	for (const taskWithMeta of tasksWithMeta) {
		const result = validateTaskWithMetadata(taskWithMeta);
		if (!result.isValid) {
			return result;
		}
	}

	return { isValid: true, message: "All TaskWithMetadata are valid" };
}
