import { getDefaultStore } from "jotai";
import { App } from "obsidian";
import { InternalApiService } from "../api/internalApiService";
import {
	baseTasksAtom,
	changeTasksAtom,
	unsyncedTasksAtom,
	updateTaskMetadataAtom,
} from "../data/taskAtoms";
import { storeOperation } from "../data/types/operations";
import { Task, TaskWithMetadata } from "../data/types/tasks";
import { validateTasks } from "../data/utils/validateTask";
import { logger } from "../utils/logger";

export interface TaskUpdate {
	operation: storeOperation;
	tasks: Task[];
	source?: "local" | "remote"; // Source of the update
	timestamp?: number; // When the update occurred
}

/**
 * Service responsible for synchronizing tasks between the UI state and the vault.
 * Uses Jotai effect system for automatic sync handling.
 */
export class TaskSyncService {
	private internalApiService;
	private store = getDefaultStore();
	private boundRemoteHandler: (tasks: Task[]) => void;
	private isActive = true;

	constructor(app: App | undefined) {
		if (!app) {
			throw new Error("App is required for TaskSyncService");
		}
		this.internalApiService = new InternalApiService(app);
		this.boundRemoteHandler = this.remoteUpdateHandler.bind(this);
		this.setupListeners();
		logger.info("TaskSyncService: Initialized");
	}

	private setupListeners() {
		this.internalApiService.on("tasksFetched", this.boundRemoteHandler);
		logger.info("TaskSyncService: Set up listeners");
	}

	/**
	 * Updates the Jotai store with task changes.
	 * Validates tasks before updating state to ensure data integrity.
	 *
	 * @param update - The task update to process
	 * @throws Error if task data is invalid
	 */
	private updateState(update: TaskUpdate) {
		if (!this.isActive) return;

		// This method is now only used for REMOTE_UPDATE
		if (update.operation !== storeOperation.REMOTE_UPDATE) {
			logger.warn(
				`[TaskSyncService] updateState called with unexpected operation: ${update.operation}`,
			);
			return;
		}

		try {
			// Validate tasks before updating state
			validateTasks(update.tasks);

			logger.info("TaskSyncService: Updating state", update);
			this.store.set(changeTasksAtom, update);
			logger.info("TaskSyncService: State updated successfully");
		} catch (error) {
			logger.error(
				`TaskSyncService: Invalid task data detected: ${error.message}`,
			);
			// Optionally, you could emit an event or handle the error in some way
			throw new Error(
				`Cannot update state with invalid task data: ${error.message}`,
			);
		}
	}

	/**
	 * Handles updates received from the vault.
	 * Processes remote tasks and updates local state while preserving local changes.
	 *
	 * @param remoteTasks - Tasks received from the vault
	 * @throws Error if remote task data is invalid
	 */
	private remoteUpdateHandler(remoteTasks: Task[]) {
		if (!this.isActive) return;

		try {
			// Validate remote tasks before creating update
			validateTasks(remoteTasks);

			logger.debug(
				`TaskSyncService: Received remote update with ${remoteTasks.length} tasks`,
			);

			// Use REMOTE_UPDATE operation which won't overwrite local changes
			const update: TaskUpdate = {
				operation: storeOperation.REMOTE_UPDATE,
				tasks: remoteTasks,
				source: "remote",
				timestamp: Date.now(),
			};
			this.updateState(update);
			logger.debug(
				"TaskSyncService: Remote update processed and state updated",
			);
		} catch (error) {
			logger.error(
				`TaskSyncService: Invalid remote task data received: ${error.message}`,
			);
			// Optionally, you could emit an event or handle the error in some way
			throw new Error(
				`Cannot process remote update with invalid task data: ${error.message}`,
			);
		}
	}

	/**
	 * Processes local task changes and syncs them with the vault.
	 * Handles different sync actions (add, edit, delete) and updates task metadata accordingly.
	 *
	 * @param taskWithMeta - Task with metadata containing the sync action
	 * @throws Error if sync operation fails
	 */
	public async handleLocalChange(
		taskWithMeta: TaskWithMetadata,
	): Promise<void> {
		if (!this.isActive) return;

		const { task, metadata } = taskWithMeta;

		try {
			switch (metadata.toBeSyncedAction) {
				case "add": {
					logger.debug(
						`TaskSyncService: Creating new task ${task.id}`,
					);
					const result = await this.internalApiService.createTask(
						task,
						"# Tasks",
					);
					if (result.status && result.task) {
						// Update metadata using the new atom
						this.store.set(updateTaskMetadataAtom, {
							taskId: result.task.id,
							metadataUpdates: {
								lastSynced: Date.now(),
								needsSync: false,
								toBeSyncedAction: null,
							},
							// We might also want to update the task data itself if the API returned modified data
							// If the API guarantees returning the exact same task data, this isn't needed
							// taskData: result.task // Optional: Update task data too
						});

						logger.debug(
							`TaskSyncService: Task ${result.task.id} created and sync status updated in state`,
						);
					} else {
						logger.error(
							`Failed to create task ${task.id} via API.`,
						);
						// Handle failure? Maybe reset needsSync via updateTaskMetadataAtom?
					}
					break;
				}

				case "edit": {
					logger.debug(`TaskSyncService: Updating task ${task.id}`);
					const previousVersion = metadata.previousVersion;

					if (!previousVersion) {
						logger.error(
							`TaskSyncService: Cannot edit task ${task.id}. Previous version is missing from metadata.`,
						);
						break;
					}

					const result = await this.internalApiService.editTask(
						task,
						previousVersion,
					);
					if (result.status && result.task) {
						// Update metadata using the new atom
						this.store.set(updateTaskMetadataAtom, {
							taskId: result.task.id,
							metadataUpdates: {
								lastSynced: Date.now(),
								needsSync: false,
								toBeSyncedAction: null,
							},
							// Potentially update task data if API returned modified data
							// taskData: result.task
						});

						logger.debug(
							`TaskSyncService: Task ${result.task.id} updated and sync status updated in state`,
						);
					} else {
						logger.error(
							`Failed to update task ${task.id} via API.`,
						);
						// Handle failure?
					}
					break;
				}

				case "delete": {
					logger.debug(`TaskSyncService: Deleting task ${task.id}`);
					const result =
						await this.internalApiService.deleteTask(task);
					if (result.status) {
						// Remove from baseTasksAtom completely (this is not just metadata)
						const tasksWithMeta = this.store.get(baseTasksAtom);
						const updatedTasks = tasksWithMeta.filter(
							(t) => t.task.id !== task.id,
						);
						this.store.set(baseTasksAtom, updatedTasks);
						logger.debug(
							`TaskSyncService: Task ${task.id} deleted from store`,
						);
					}
					break;
				}

				default:
					logger.warn(
						`TaskSyncService: Unknown sync action for task ${task.id}`,
					);
					break;
			}
		} catch (error) {
			logger.error(
				`TaskSyncService: Failed to sync task ${task.id}: ${error.message}`,
			);
			// We might want to implement retry logic here in the future
			throw error;
		}
	}

	/**
	 * Checks if there are any tasks pending synchronization.
	 *
	 * @returns boolean indicating if there are unsynced tasks
	 */
	public hasPendingChanges(): boolean {
		const unsyncedTasks = this.store.get(unsyncedTasksAtom);
		return unsyncedTasks.length > 0;
	}

	/**
	 * Returns all tasks that need synchronization.
	 *
	 * @returns Array of tasks that need to be synced
	 */
	public getUnsyncedTasks(): Task[] {
		return this.store.get(unsyncedTasksAtom);
	}

	/**
	 * Cleans up the service by removing listeners and preventing further updates.
	 */
	public cleanup() {
		this.isActive = false;
		this.internalApiService.off("tasksFetched", this.boundRemoteHandler);
		logger.info("TaskSyncService: Cleaned up and deactivated");
	}
}
