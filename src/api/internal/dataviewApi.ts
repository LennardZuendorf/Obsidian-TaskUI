// src/api/pluginApiProvider.ts
import { getAPI } from "obsidian-dataview";
import { loggerUtil } from "../../utils/loggerUtil";

import type { STask as dvTaskType, DataviewApi } from "obsidian-dataview";
import type { taskType } from "../../data/types/taskType";
import type {
	tasksTransferObject,
	taskTransferObject,
} from "../../data/types/transferObjects";
import { TaskMapper } from "../../data/utils/mapper";
import lodash from "lodash";

export type { dvTaskType };

/**
 * DataviewApiProvider class provides methods for interacting with the Dataview API, this includes the ability to get multiple tasks from a path, single task, and listen for changes.
 * It always transfers results via a transfer object and returns already mapped, typed tasks.
 * For request it always uses the taskType.
 * TODO: All the business logic/mapping in here should probably be moved to another class...
 */
export class DataviewApiProvider {
	private readonly taskMapper: TaskMapper;
	private readonly dvApi: DataviewApi;

	/**
	 * Constructs an instance of the Dataview API Provider.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor() {
		this.taskMapper = new TaskMapper();
		try {
			this.dvApi = this.getDvApi();
		} catch (error) {
			loggerUtil.error("Error fetching dataview API: " + error.message);
			throw new Error("Dataview API not available");
		}
	}

	/**
	 * Internally used method to fetch the Dataview API.
	 * @private
	 */
	private getDvApi(): DataviewApi {
		try {
			return getAPI();
		} catch (error) {
			loggerUtil.error("Error fetching dataview API: " + error.message);
			return null;
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API and uses the mapper to map them to the taskType.
	 * @returns tasksTransferObject An array of taskTypes objects wrpapped in a transfer object.
	 * @param path The path to the file to get tasks from, this can also be an empty string to get tasks from all files
	 */
	public async getTasks(path: string): Promise<tasksTransferObject> {
		let dvTasks: dvTaskType[] = [];

		try {
			dvTasks = await this.dvApi.pages(path).file.tasks;
		} catch (error) {
			loggerUtil.error("Error fetching tasks: " + error.message);
			return { status: false };
		}

		const tasks: taskType[] = [];

		dvTasks.forEach((task) => {
			const taskObject = this.taskMapper.mapDvToTaskType(task);
			tasks.push(taskObject);
		});

		return { status: true, tasks: tasks };
	}

	/**
	 * Method to get a single task from obsidian vault via dataview api
	 *
	 * @param path The path to the file to get the task from, this can also be an empty string to get tasks from all files
	 * @param task the task to get from the vault
	 * @returns taskTransferObject A taskType object wrapped in a transfer object.
	 */
	public async getTask(
		path: string,
		task: taskType,
	): Promise<taskTransferObject> {
		const tasksResult = await this.getTasks(path);

		if (!tasksResult.status || tasksResult.tasks === undefined) {
			loggerUtil.error("Error fetching tasks for path: " + path);
			return { status: false };
		}

		const comparison = tasksResult.tasks.find((t) =>
			lodash.isEqual(t, task),
		);

		if (comparison) {
			return { status: true, task: task };
		} else {
			loggerUtil.error("Task not found for the given path/task type");
			return { status: false };
		}
	}

	/**
	 * Method to enable listening for tasks and task changes.
	 * @param path
	 */
	public listenForTaskChanges(path?: string): void {}
}
