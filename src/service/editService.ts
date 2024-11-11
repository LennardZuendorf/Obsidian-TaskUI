import { ObsidianApiProvider } from "../api/internal/obsidianApi";
import { TasksApiProvider } from "../api/internal/tasksApi";
import { taskStatus, taskType } from "../data/types/taskType";
import { defaultHeading, defaultPath } from "../config/settings";
import { loggerUtil as logger } from "../utils/loggerUtil";
import { checkSinglePlugin } from "../utils/pluginCheckUtil";
import { App } from "obsidian";

/**
 * TaskEditService class provides methods for creating, updating, and deleting tasks. It also provides methods to handle specific edits.
 * These directly reference the APIs for creating, updating, and deleting tasks.
 * TODO: Abstract the API calls into a separate class that resolves to the different APIs based on the request.
 */

export class TaskEditService {
	private readonly obsidianApp: App;
	private readonly mdApi: ObsidianApiProvider;
	private readonly tasksApi: TasksApiProvider;

	constructor(app: App) {
		this.obsidianApp = app;
		this.mdApi = new ObsidianApiProvider(this.obsidianApp);
		this.tasksApi = new TasksApiProvider(this.obsidianApp);
	}

	/**
	 * createTask implements the creation of a task in the obsidian vault, using the Obsidian API.
	 * @param task the task to be created
	 * @param mdHeading the heading the task will be added to/the new heading to add to the file
	 * @param filePath the path to the file to add the task to
	 */
	public async createTask(
		task: taskType,
		mdHeading: string = defaultPath,
		filePath: string = defaultHeading,
	): Promise<taskType | null> {
		try {
			const response = await this.mdApi.createTask(
				task,
				mdHeading,
				filePath,
			);
			if (response.status && response.task) {
				return response.task;
			} else {
				logger.error("Creating task via Obsidian API failed.");
				return null;
			}
		} catch (error) {
			logger.error(
				"Error creating task via Obsidian API: " + error.message,
			);
			return null;
		}
	}

	/**
	 * updateTaskStatus updates the status of a task in the specified file. It uses the Obsidian API to update the task in the file if possible.
	 * @param newStatus the new status of the task.
	 * @param task the task to be updated.
	 * @returns A promise that resolves to the updated task or null if the update fails.
	 */
	public async updateTaskStatus(
		newStatus: taskStatus,
		task: taskType,
	): Promise<taskType | null> {
		if (task.status === newStatus) {
			return Promise.resolve(task);
		} else if (
			newStatus === taskStatus.DONE &&
			checkSinglePlugin("obsidan-tasks-plugin")
		) {
			try {
				const response = await this.tasksApi.toggleTaskDone(
					task.lineDescription,
					task.path,
					task,
				);

				if (response.status && response.task) {
					return response.task;
				} else {
					logger.error("Error while toggling task via tasks API");
					return null;
				}
			} catch (error) {
				logger.error(
					"Error while toggling task via tasks API: " + error.message,
				);
				return null;
			}
		} else {
			try {
				const newTask = task;
				newTask.status = newStatus;
				const updatedTask = await this.updateTask(task, newTask);

				if (updatedTask) {
					return updatedTask;
				} else {
					logger.error(
						"Updating task via Obsidian API returned an error.",
					);
					return null;
				}
			} catch (error) {
				logger.error(
					"Error updating task via Obsidian API: " + error.message,
				);
				return null;
			}
		}
	}

	/**
	 * Deletes a task from the specified file.
	 * @param path - The path to the file.
	 * @param task - The task to be deleted.
	 * @returns A promise that resolves to a boolean indicating whether the task was deleted successfully.
	 */
	public async deleteTask(path: string, task: taskType): Promise<boolean> {
		try {
			const response = await this.mdApi.deleteTask(task, path);
			if (!response.status) {
				logger.error(
					"Deleting task via Obsidian API returned an error.",
				);
				return false;
			} else {
				return true;
			}
		} catch (error) {
			logger.error(
				"Error deleting task via Obsidian API: " + error.message,
			);
			return false;
		}
	}

	/**
	 * Edits an existing task in the specified file.
	 * @returns A promise that resolves to a tuple containing a boolean indicating success and the new task line.
	 * @param oldTask The task to be updated.
	 * @param newTask The updated task.
	 * @returns Promise <taskType | null>, the updated task or null if the update fails
	 */
	private async updateTask(
		oldTask: taskType,
		newTask: taskType,
	): Promise<taskType | null> {
		try {
			const response = await this.mdApi.editTask(newTask, oldTask);
			if (response.status && response.task) {
				return response.task;
			} else {
				logger.error(
					"Updating task via Obsidian API returned an error.",
				);
				return null;
			}
		} catch (error) {
			logger.error(
				"Error updating task via Obsidian API: " + error.message,
			);
			return null;
		}
	}
}
