import { getDefaultStore } from "jotai";
import { App } from "obsidian";
import { InternalApiService } from "@/api/internalApiService";
import { settingsAtom } from "@/data/settingsAtom";
import {
	baseTasksAtom,
	unsyncedTasksAtom,
	updateTaskAtom,
	updateTaskMetadataAtom,
} from "@/data/taskAtoms";
import { storeOperation } from "@/data/types/operations";
import { Task, TaskWithMetadata } from "@/data/types/tasks";
import { createRemoteUpdate } from "@/data/utils/taskUpdateHelpers";
import { validateTasks } from "@/data/utils/validateTask";
import { getErrorMessage } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";

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
		logger.trace("TaskSyncService: Initialized");
	}

	private setupListeners() {
		this.internalApiService.on("tasksFetched", this.boundRemoteHandler);
		logger.trace("TaskSyncService: Set up listeners");
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

		// Validate tasks before updating state
		const validationResult = validateTasks(update.tasks);
		if (!validationResult.isValid) {
			logger.error(
				`TaskSyncService: Invalid task data detected: ${validationResult.message}`,
			);
			throw new Error(
				`Cannot update state with invalid task data: ${validationResult.message}`,
			);
		}

		logger.trace("TaskSyncService: Updating state", update);
		this.store.set(updateTaskAtom, update);
		logger.trace("TaskSyncService: State updated successfully");
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
		logger.trace(
			"[TaskSyncService.remoteUpdateHandler] Received remote tasks",
			{ count: remoteTasks.length },
		);

		const validationResult = validateTasks(remoteTasks);
		if (!validationResult.isValid) {
			logger.error(
				`[TaskSyncService.remoteUpdateHandler] Invalid remote tasks: ${validationResult.message}`,
			);
			return; // Skip processing invalid tasks
		}

		logger.debug(
			"[TaskSyncService.remoteUpdateHandler] Validated remote tasks successfully.",
		);

		try {
			const update = createRemoteUpdate(remoteTasks);
			logger.trace(
				"[TaskSyncService.remoteUpdateHandler] Prepared REMOTE_UPDATE payload",
				{ update },
			);
			this.updateState(update); // This now calls the atom setter
			logger.debug(
				"[TaskSyncService.remoteUpdateHandler] Remote update processed via updateState.",
			);
		} catch (error) {
			logger.error(
				`[TaskSyncService.remoteUpdateHandler] Error processing remote update: ${error.message}`,
			);
			// throw error; // Re-throwing might be too disruptive? Decide on error handling.
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
		logger.trace(
			"[TaskSyncService.handleLocalChange] Processing local change",
			{ taskId: task.id, action: metadata.toBeSyncedAction },
		);

		try {
			switch (metadata.toBeSyncedAction) {
				case "add": {
					logger.trace(
						"[TaskSyncService.handleLocalChange] Calling internalApiService.createTask",
						{ task },
					);
					// Get current settings to use defaultHeading
					const settings = this.store.get(settingsAtom);
					const result = await this.internalApiService.createTask(
						task,
						settings.defaultHeading,
					);
					if (result.status && result.task) {
						const metadataUpdates = {
							lastSynced: Date.now(),
							needsSync: false,
							toBeSyncedAction: null,
							retryCount: 0,
							syncFailed: false,
							errorMessage: undefined,
						};
						logger.trace(
							"[TaskSyncService.handleLocalChange] Create success. Updating metadata",
							{ taskId: result.task.id, metadataUpdates },
						);
						this.store.set(updateTaskMetadataAtom, {
							taskId: result.task.id,
							metadataUpdates,
						});

						logger.debug(
							`TaskSyncService: Task ${result.task.id} created and sync status updated in state`,
						);
					} else {
						throw new Error(`Failed to create task ${task.id} via API.`);
					}
					break;
				}

				case "edit": {
					logger.trace(
						"[TaskSyncService.handleLocalChange] Calling internalApiService.editTask",
						{
							taskId: task.id,
							task,
							previousVersion: metadata.previousVersion,
						},
					);
					const previousVersion = metadata.previousVersion;

					if (!previousVersion) {
						logger.error(
							`TaskSyncService: Cannot edit task ${task.id}. Previous version is missing from metadata.`,
						);
						// Can't retry this fatal error
						break;
					}

					const result = await this.internalApiService.editTask(
						task,
						previousVersion,
					);
					if (result.status && result.task) {
						const metadataUpdates = {
							lastSynced: Date.now(),
							needsSync: false,
							toBeSyncedAction: null,
							retryCount: 0,
							syncFailed: false,
							errorMessage: undefined,
						};
						logger.trace(
							"[TaskSyncService.handleLocalChange] Edit success. Updating metadata",
							{ taskId: result.task.id, metadataUpdates },
						);
						this.store.set(updateTaskMetadataAtom, {
							taskId: result.task.id,
							metadataUpdates,
						});

						logger.debug(
							`TaskSyncService: Task ${result.task.id} updated and sync status updated in state`,
						);
					} else {
						throw new Error(`Failed to update task ${task.id} via API.`);
					}
					break;
				}

				case "delete": {
					logger.trace(
						"[TaskSyncService.handleLocalChange] Calling internalApiService.deleteTask",
						{ taskId: task.id },
					);
					const result = await this.internalApiService.deleteTask(task);
					if (result.status) {
						logger.trace(
							"[TaskSyncService.handleLocalChange] Delete success. Removing task from baseTasksAtom",
							{ taskId: task.id },
						);
						const tasksWithMeta = this.store.get(baseTasksAtom);
						const updatedTasks = tasksWithMeta.filter(
							(t) => t.task.id !== task.id,
						);
						this.store.set(baseTasksAtom, updatedTasks);
						logger.debug(`TaskSyncService: Task ${task.id} deleted from store`);
					} else {
						throw new Error(
							`[TaskSyncService.handleLocalChange] Failed to delete task ${task.id} via API.`,
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
			const errorMessage = getErrorMessage(error);
			logger.error(
				`TaskSyncService: Failed to sync task ${task.id}: ${errorMessage}`,
			);

			// Update retry metadata
			const currentRetryCount = metadata.retryCount || 0;
			const newRetryCount = currentRetryCount + 1;
			const syncFailed = newRetryCount >= 3;

			this.store.set(updateTaskMetadataAtom, {
				taskId: task.id,
				metadataUpdates: {
					retryCount: newRetryCount,
					syncFailed: syncFailed,
					errorMessage: errorMessage,
				},
			});

			throw error; // Re-throw to be caught by the caller (MainView observer)
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
		this.internalApiService.cleanup();
		logger.trace("TaskSyncService: Cleaned up and deactivated");
	}
}
