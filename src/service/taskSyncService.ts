import { getDefaultStore } from "jotai";
import { App } from "obsidian";
import { InternalApiService } from "../api/internalApiService";
import { changeTasksAtom } from "../data/taskAtoms";
import { storeOperation } from "../data/types/operations";
import { Task } from "../data/types/tasks";
import { validateTasks } from "../data/utils/validateTask";
import { logger } from "../utils/logger";

export interface TaskUpdate {
	operation: storeOperation;
	tasks: Task[];
}

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

	private updateState(update: TaskUpdate) {
		if (!this.isActive) return;

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

	private remoteUpdateHandler(remoteTasks: Task[]) {
		if (!this.isActive) return;

		try {
			// Validate remote tasks before creating update
			validateTasks(remoteTasks);

			logger.info(
				`TaskSyncService: Received remote update with ${remoteTasks.length} tasks`,
			);

			const update: TaskUpdate = {
				operation: storeOperation.REPLACE,
				tasks: remoteTasks,
			};
			this.updateState(update);
			logger.info(
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

	public localUpdateHandler(localUpdates: Task[]) {
		try {
			// Validate local updates
			validateTasks(localUpdates);
			logger.info("TaskSyncService: Local update acknowledged");
		} catch (error) {
			logger.error(
				`TaskSyncService: Invalid local task data received: ${error.message}`,
			);
			throw new Error(
				`Cannot process local update with invalid task data: ${error.message}`,
			);
		}
	}

	public cleanup() {
		this.isActive = false;
		logger.info("TaskSyncService: Cleaned up and deactivated");
	}
}
