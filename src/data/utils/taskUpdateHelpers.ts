import { storeOperation } from "@/data/types/operations";
import { Task } from "@/data/types/tasks";
import type { TaskUpdate } from "@/service/taskSyncService";

/**
 * Creates a TaskUpdate object for local operations (add, update, delete).
 * @param operation - The local operation type
 * @param tasks - Array of tasks to update
 * @returns TaskUpdate object with local source and current timestamp
 */
export function createLocalUpdate(
	operation:
		| storeOperation.LOCAL_ADD
		| storeOperation.LOCAL_UPDATE
		| storeOperation.LOCAL_DELETE,
	tasks: Task[],
): TaskUpdate {
	return {
		operation,
		tasks,
		source: "local",
		timestamp: Date.now(),
	};
}

/**
 * Creates a TaskUpdate object for remote operations.
 * @param tasks - Array of tasks received from remote source
 * @returns TaskUpdate object with remote source and current timestamp
 */
export function createRemoteUpdate(tasks: Task[]): TaskUpdate {
	return {
		operation: storeOperation.REMOTE_UPDATE,
		tasks,
		source: "remote",
		timestamp: Date.now(),
	};
}
