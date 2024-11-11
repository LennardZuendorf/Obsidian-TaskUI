import type { taskType, taskSource } from "../data/types/taskType";
import { loggerUtil } from "../utils/loggerUtil";
import { DataviewApiProvider } from "../api/internal/dataviewApi";
import type { App } from "obsidian";

/**
 * Service class for querying tasks from the obsidian Dataview API.
 * These methods reference the Dataview API directly.
 * TODO: Abstract the API calls into a separate class that resolves to the different APIs based on the request.
 */
export class TaskQueryService {
	private readonly app: App;
	private readonly dvApi: DataviewApiProvider;

	/**
	 * Constructs an instance of the mdTaskService.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor(obsidianApp: App) {
		this.app = obsidianApp;
		this.dvApi = new DataviewApiProvider();

		if (!this.dvApi || !this.app) {
			throw new Error("Dataview API or Obsidian App not available");
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API and maps them to taskType objects.
	 * @param path The path to the file to get tasks from, this can also be an empty string to get tasks from all files.
	 * @returns An array of taskTypes objects or null if an error occurs.
	 */
	public async getTasks(path = ""): Promise<taskType[] | null> {
		const tasks: taskType[] = [];

		try {
			const response = await this.dvApi.getTasks(path);
			if (response.status && response.tasks) {
				response.tasks.forEach((task) => {
					tasks.push(task);
				});
			} else {
				loggerUtil.error(
					"Error returned while fetching tasks via Dataview API",
				);
				return null;
			}
		} catch (error) {
			loggerUtil.error(
				"Unexpected Error while fetching tasks via Dataview API: " +
					error.message,
			);
			return null;
		}
		return tasks;
	}

	/**
	 * getTask Retrieves a specific task from the Dataview API and returns it as a taskType object.
	 * @param path The path to the file containing the task.
	 * @param task
	 */

	public async getTask(
		path: string,
		task: taskType,
	): Promise<taskType | null> {
		try {
			const response = await this.dvApi.getTask(path, task);
			if (response.status && response.task) {
				return response.task;
			} else {
				loggerUtil.error(
					"Error returned while fetching task via Dataview API",
				);
				return null;
			}
		} catch (error) {
			loggerUtil.error(
				"Unexpected Error while fetching task via Dataview API: " +
					error.message,
			);
			return null;
		}
	}

	/**
	 * Listens for task events via the dataview API. This method should be called once on component mount.
	 * Upon receiving a task event, the method will trigger the appropriate task operation that will be handled in the main component.
	 */

	//TODO: Implement taskListener method and hook it up to the main component.
	public taskListener(path?: string, source?: taskSource): void {}
}
