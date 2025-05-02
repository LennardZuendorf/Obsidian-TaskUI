import { atom } from "jotai";
import { logger } from "../utils/logger";
import { storeOperation, UpdateMetadataPayload } from "./types/operations";
import {
	Task,
	TaskMetadata,
	TaskStatus,
	TaskWithMetadata,
} from "./types/tasks";
import { ViewSettings } from "./types/viewTypes";

// Define the structure for tags used in the UI selector
export type TaskTag = {
	value: string; // e.g., "#work"
	label: string; // e.g., "Work"
};

// Helper function to create TaskTag from string (used in derived atom)
const createTagFromString = (tagValue: string): TaskTag => {
	const label = tagValue.startsWith("#") ? tagValue.substring(1) : tagValue;
	// Capitalize first letter for label, ensure value has #
	const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
	const formattedValue = tagValue.startsWith("#") ? tagValue : `#${tagValue}`;
	// Ensure value is lowercase and replaces spaces for consistency
	const finalValue = formattedValue.toLowerCase().replace(/\s+/g, "-");
	return { value: finalValue, label: formattedLabel };
};

/**
 * The main atom to store all tasks with their metadata. This is the internal store
 * that tracks both tasks and their sync status.
 */
export const baseTasksAtom = atom<TaskWithMetadata[]>([]);

/**
 * Reset atom to trigger state resets
 */
export const resetStateAtom = atom(null, (get, set) => {
	set(baseTasksAtom, []);
});

/**
 * This atom manages the state of all tasks in the application.
 * The getter returns just the tasks (without metadata) for backward compatibility.
 * The setter handles different operations and updates tasks with appropriate metadata
 * including sync actions (add, edit, delete).
 *
 * Operations:
 * - LOCAL_ADD: Adds new tasks with needsSync=true and toBeSyncedAction='add'
 * - LOCAL_UPDATE: Updates existing tasks with needsSync=true and toBeSyncedAction='edit'
 * - LOCAL_DELETE: Marks tasks for deletion with needsSync=true and toBeSyncedAction='delete'
 * - REMOTE_UPDATE: Updates tasks from remote source, preserving local changes
 * - RESET: Clears all tasks
 */
export const changeTasksAtom = atom(
	// Getter - returns only the tasks without metadata
	(get) => get(baseTasksAtom).map((t) => t.task),
	(
		get,
		set,
		change: {
			operation: storeOperation;
			tasks: Task[];
			source?: "local" | "remote";
			timestamp?: number;
		},
	) => {
		const tasksWithMeta = get(baseTasksAtom);
		const now = change.timestamp || Date.now();

		switch (change.operation) {
			case storeOperation.LOCAL_ADD: {
				const newTasksWithMeta = change.tasks.map((task) => ({
					task,
					metadata: {
						lastUpdated: now,
						needsSync: true,
						toBeSyncedAction: "add" as const,
					},
				}));
				set(baseTasksAtom, [...tasksWithMeta, ...newTasksWithMeta]);
				break;
			}

			case storeOperation.LOCAL_UPDATE: {
				const updatedTasks = tasksWithMeta.map((taskWithMeta) => {
					const matchingTask = change.tasks.find(
						(t) => t.id === taskWithMeta.task.id,
					);
					if (!matchingTask) return taskWithMeta;

					// Capture the entire previous task state (including its rawTaskLine)
					const previousVersion = taskWithMeta.task;

					// Preserve the rawTaskLine from the previous version if the incoming update doesn't have one
					// (UI updates likely won't regenerate the raw line)
					const taskWithPreservedRawLine = {
						...matchingTask, // Start with the updated fields from the UI/local change
						rawTaskLine:
							matchingTask.rawTaskLine ??
							previousVersion.rawTaskLine, // Keep old raw line if new one isn't provided
					};

					return {
						task: taskWithPreservedRawLine,
						metadata: {
							...taskWithMeta.metadata,
							lastUpdated: now,
							needsSync: true,
							toBeSyncedAction: "edit" as const,
							previousVersion: previousVersion, // Store the whole previous task
						},
					};
				});
				set(baseTasksAtom, updatedTasks);
				break;
			}

			case storeOperation.LOCAL_DELETE: {
				const updatedTasks = tasksWithMeta.map((taskWithMeta) => {
					const isDeleted = change.tasks.some(
						(t) => t.id === taskWithMeta.task.id,
					);
					if (!isDeleted) return taskWithMeta;

					return {
						task: taskWithMeta.task,
						metadata: {
							...taskWithMeta.metadata,
							lastUpdated: now,
							needsSync: true,
							toBeSyncedAction: "delete" as const,
						},
					};
				});
				set(baseTasksAtom, updatedTasks);
				break;
			}

			case storeOperation.REMOTE_UPDATE: {
				const updatedTasks = [...tasksWithMeta]; // Start with current local tasks
				const remoteTaskIds = new Set(change.tasks.map((t) => t.id)); // IDs from remote

				// Process updates/adds from remote
				change.tasks.forEach((remoteTask) => {
					// remoteTask now includes rawTaskLine from mapper
					// Try to find by ID first
					let localIndex = updatedTasks.findIndex(
						({ task }) => task.id === remoteTask.id,
					);

					// If no ID match, try to find by description and status (secondary matching)
					if (localIndex === -1) {
						localIndex = updatedTasks.findIndex(
							({ task }) =>
								task.description === remoteTask.description &&
								task.status === remoteTask.status,
						);
						// If found via secondary matching, update its ID to match remote
						// and ensure it's treated as an update below.
						if (localIndex !== -1) {
							updatedTasks[localIndex].task.id = remoteTask.id;
							remoteTaskIds.add(remoteTask.id); // Ensure this ID is considered 'remote'
						}
					}

					if (localIndex !== -1) {
						// Existing task found locally
						const localTaskWithMeta = updatedTasks[localIndex];
						// Only update if there are no pending local changes
						if (!localTaskWithMeta.metadata.needsSync) {
							const previousVersion = localTaskWithMeta.task;
							updatedTasks[localIndex] = {
								task: remoteTask, // Use the remoteTask data
								metadata: {
									lastUpdated: now,
									lastSynced: now,
									needsSync: false,
									toBeSyncedAction: null,
									previousVersion: previousVersion,
								},
							};
						}
						// If needsSync is true, we keep the local version and its pending changes.
					} else {
						// New task from remote
						updatedTasks.push({
							task: remoteTask,
							metadata: {
								lastUpdated: now,
								lastSynced: now,
								needsSync: false,
								toBeSyncedAction: null,
							},
						});
					}
				});

				// Process deletions: Filter out local tasks not in remote *and* not needing sync
				const finalTasks = updatedTasks.filter((taskWithMeta) => {
					const isInRemote = remoteTaskIds.has(taskWithMeta.task.id);
					const needsSync = taskWithMeta.metadata.needsSync;

					// Keep the task if it's in remote OR if it needs syncing (has local changes)
					return isInRemote || needsSync;
				});

				set(baseTasksAtom, finalTasks);
				break;
			}

			case storeOperation.RESET: {
				set(baseTasksAtom, []);
				break;
			}
		}
	},
);

/**
 * Generic atom to update metadata for a specific task.
 */
export const updateTaskMetadataAtom = atom(
	null, // write-only atom
	(get, set, payload: UpdateMetadataPayload) => {
		const currentTasksWithMeta = get(baseTasksAtom);
		const taskIndex = currentTasksWithMeta.findIndex(
			(t) => t.task.id === payload.taskId,
		);

		if (taskIndex === -1) {
			logger.warn(
				`[updateTaskMetadataAtom] Task ID ${payload.taskId} not found.`,
			);
			return;
		}

		const updatedTasks = [...currentTasksWithMeta];
		const taskToUpdate = updatedTasks[taskIndex];

		// Merge existing metadata with the updates
		const mergedMetadata: TaskMetadata = {
			...(taskToUpdate.metadata || {}), // Handle case where metadata might be initially undefined
			...payload.metadataUpdates,
		};

		updatedTasks[taskIndex] = {
			...taskToUpdate,
			metadata: mergedMetadata,
		};

		logger.debug(
			`[updateTaskMetadataAtom] Updating metadata for task ${payload.taskId}:`,
			payload.metadataUpdates,
		);
		set(baseTasksAtom, updatedTasks);
	},
);

/**
 * Derived atom that returns tasks requiring synchronization.
 * Used by the effect observer to trigger sync operations.
 * A task needs sync when:
 * - metadata.needsSync is true
 * - metadata.toBeSyncedAction is not null
 */
export const unsyncedTasksAtom = atom((get) => {
	const tasksWithMeta = get(baseTasksAtom);
	return tasksWithMeta
		.filter(({ metadata }) => metadata.needsSync)
		.map(({ task }) => task);
});

/**
 * Derived atom to filter tasks by status (to do)
 */
export const todoTasksAtom = atom((get) =>
	get(changeTasksAtom).filter((todo) => todo.status === TaskStatus.TODO),
);

/**
 * Derived atom to filter tasks by status (in progress)
 */
export const inProgressTasksAtom = atom((get) =>
	get(changeTasksAtom).filter(
		(todo) => todo.status === TaskStatus.IN_PROGRESS,
	),
);

/**
 * Derived atom to filter tasks by status (done/cancelled)
 */
export const doneTasksAtom = atom((get) =>
	get(changeTasksAtom).filter(
		(todo) =>
			todo.status === TaskStatus.DONE ||
			todo.status === TaskStatus.CANCELLED,
	),
);

/**
 * Derived atom that aggregates all unique tags from all tasks.
 */
export const availableTagsAtom = atom<TaskTag[]>((get) => {
	const allTasks = get(baseTasksAtom); // Read from baseTasksAtom
	const allTagStrings = allTasks.flatMap(
		(taskWithMeta) => taskWithMeta.task.tags || [],
	);
	const uniqueTagStrings = new Set(allTagStrings);

	// Convert unique tag strings to TaskTag objects
	const tags = Array.from(uniqueTagStrings).map(createTagFromString);

	// Sort alphabetically by label for consistent display
	tags.sort((a, b) => a.label.localeCompare(b.label));

	logger.trace(`Available Tags Recalculated: ${JSON.stringify(tags)}`);
	return tags;
});

/**
 * Debug atom to expose internal state
 */
export const debugStateAtom = atom((get) => ({
	internalState: get(baseTasksAtom),
	allTasks: get(changeTasksAtom),
	unsyncedTasks: get(unsyncedTasksAtom),
}));

/**
 * Basic debug labels for atoms in development mode.
 */
if (process.env.NODE_ENV !== "production") {
	baseTasksAtom.debugLabel = "baseTasksAtom";
	todoTasksAtom.debugLabel = "todoTasksAtom";
	inProgressTasksAtom.debugLabel = "inProgressTasksAtom";
	doneTasksAtom.debugLabel = "doneTasksAtom";
	debugStateAtom.debugLabel = "debugStateAtom";
	unsyncedTasksAtom.debugLabel = "unsyncedTasksAtom";
	availableTagsAtom.debugLabel = "availableTagsAtom"; // Add label for the new atom
}

export const viewSettingsAtom = atom<ViewSettings>({
	groupBy: "none",
	globalFilter: "",
	sortBy: "priority",
	sortOrder: "desc",
});
