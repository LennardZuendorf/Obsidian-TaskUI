import { type taskSource, taskType } from "../data/types/taskTypes";
import { loggerUtil as logger } from "../utils/loggerUtil";
import { App } from "obsidian";
import { ApiService } from "../api/apiService";

/**
 * TaskEditService class provides methods for creating, updating, and deleting tasks. It also provides methods to handle specific edits.
 * These directly reference the apiService to create, edit and delete tasks.
 */

export class TaskEditService {
	private readonly obsidianApp: App;
	private readonly service: ApiService;

	constructor(app: App) {
		this.obsidianApp = app;
		this.service = new ApiService(this.obsidianApp);
	}

	/**
	 * createTask implements the creation of a task in the obsidian vault, using the Obsidian API.
	 * @param task the task to be created
	 */
	public async createTask(task: taskType): Promise<taskType | null> {
		try {
			const response = await this.service.createTask(task);
			if (response.status && response.task) {
				return response.task;
			} else {
				logger.error(`Creating task ${task.id} was not successful.`);
				return null;
			}
		} catch (error) {
			logger.error(`Error creating task ${task.id}: ${error.message}.`);
			return null;
		}
	}

	/**
	 * Deletes a task from the specified file.
	 * @param task - The task to be deleted.
	 * @returns A promise that resolves to a boolean indicating whether the task was deleted successfully.
	 */
	public async deleteTask(task: taskType): Promise<boolean> {
		try {
			const response = await this.service.deleteTask(task);
			if (response) {
				return true;
			} else {
				logger.error(`Deleting task ${task.id} was not successful.`);
				return false;
			}
		} catch (error) {
			logger.error(`Error deleting ${task.id}: ${error.message}.`);
			return false;
		}
	}

	/**
	 * Edits an existing task in the specified file.
	 * @returns A promise that resolves to a tuple containing a boolean indicating success and the new task line.
	 * @returns Promise <taskTypes | null>, the updated task or null if the update fails
	 * @param update the partial of a task
	 * @param task
	 */
	private async updateTask(
		update: Partial<taskType>,
		task: taskType,
	): Promise<taskType | null> {
		try {
			const response = await this.service.updateTask(update, task);
			if (response.status && response.task) {
				return response.task;
			} else {
				logger.error(
					`Trying to update the task ${task.id} was not successful.`,
				);
				return null;
			}
		} catch (error) {
			logger.error(`Error updating task ${task.id}: ${error.message}.`);
			return null;
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API and maps them to taskTypes objects.
	 *
	 * @returns An array of taskTypes objects if successful, or null if an error occurs.
	 */
	public async getAllTasks(): Promise<taskType[] | null> {
		try {
			const response = await this.service.getTasks();
			if (response.status && response.tasks) {
				return response.tasks;
			} else {
				logger.error(`Getting all tasks from all sources failed.`);
				return null;
			}
		} catch (error) {
			logger.error(
				`Getting all tasks from all sources threw an error: ${error.message}`,
			);
			return null;
		}
	}

	/**
	 * Retrieves tasks from a specified source and optional path using the Dataview API.
	 *
	 * @param source - The source from which to retrieve tasks. This defines the context or category of tasks to be fetched.
	 * @param path - An optional parameter specifying the path to the file to get tasks from.
	 *               If not provided or an empty string, tasks from all files will be retrieved.
	 *
	 * @returns A promise that resolves to an array of taskType objects if successful, or null if an error occurs.
	 */
	public async getTasksFromSource(
		source: taskSource,
		path?: string,
	): Promise<taskType[] | null> {
		try {
			const response = await this.service.getTasks(
				source,
				path ? path : "",
			);
			if (response.status && response.tasks) {
				return response.tasks;
			} else {
				logger.error(
					`Getting tasks from source from source ${source} ${path ? "with path:" + path : ""}failed.`,
				);
				return null;
			}
		} catch (error) {
			logger.error(
				`Getting tasks from source from source ${source} ${path ? "with path:" + path : ""}threw an error: ${error.message}`,
			);
			return null;
		}
	}

	/**
	 * Retrieves a specific task from the Dataview API and returns it as a taskType object.
	 *
	 * @param task - The taskType object representing the task to be retrieved.
	 *               It contains the necessary identifiers to fetch the specific task.
	 *
	 * @returns A promise that resolves to a taskType object if the task is successfully retrieved,
	 *          or null if an error occurs or the task cannot be found.
	 */
	public async getTask(task: taskType): Promise<taskType | null> {
		try {
			const response = await this.service.getTask(task);
			if (response.status && response.task) {
				return response.task;
			} else {
				logger.error(`Getting task ${task.id} failed.`);
				return null;
			}
		} catch (error) {
			logger.error(
				`Getting task ${task.id} threw an error: ${error.message}`,
			);
			return null;
		}
	}
}
