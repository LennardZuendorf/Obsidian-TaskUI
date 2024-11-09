// src/data/mdTaskProvider.ts
import type { tasksTransferObject, taskType } from "../data/types/taskType";
import { loggerUtil } from "../utils/loggerUtil";
import { DataviewApi } from "obsidian-dataview";
import { PluginApiProvider } from "../api/pluginApiProvider";
import { useApp } from "../utils/contextUtil";
import type { App } from "obsidian";
import { defaultHeading, defaultPath } from "../config";
import { TaskMapper } from "../data/utils/taskTypeMapper";

/**
 * Service class for querying tasks using the Dataview API and Obsidian App directly.
 */

export class TaskQueryService {
	private readonly app: App;
	private readonly pluginApiProvider;
	private readonly dv: DataviewApi;
	private readonly defaultPath = defaultPath;
	private readonly defaultHeading = defaultHeading;
	private readonly taskMapper: TaskMapper;

	/**
	 * Constructs an instance of the mdTaskService.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor() {
		this.app = <App>useApp();
		this.pluginApiProvider = new PluginApiProvider(this.app);
		this.dv = this.pluginApiProvider.getDvApi();
		this.taskMapper = new TaskMapper();

		if (!this.dv || !this.app) {
			throw new Error("Dataview API or Obsidian App not available");
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API.
	 * @returns An array of taskType objects.
	 */
	public async getTasks(): Promise<tasksTransferObject> {
		const tasks: taskType[] = [];

		try {
			const allTasks = this.dv.pages("").file.tasks;
			for (const task of allTasks) {
				if (task) {
					const hasMatchingSubtask = tasks.some((existingTask) =>
						existingTask.subtasks?.some(
							(subtask) => subtask.rawDescription === task.text,
						),
					);
					if (!hasMatchingSubtask) {
						const taskObject =
							this.taskMapper.mapDvTaskToTaskType(task);
						tasks.push(taskObject);
						loggerUtil.info({ taskObject }, "Task loaded");
					} else {
						loggerUtil.info(
							"Shards: Task already loaded as a subtask. Skipping...",
						);
					}
				}
			}
		} catch (error) {
			loggerUtil.error("Shards: Error fetching tasks: " + error.message);
			return { status: false };
		}
		loggerUtil.info("Shards: Task loaded via dataview: " + tasks.length);
		return { status: true, tasks: tasks };
	}

	/**
	 * Listens for task events via the dataview API. This method should be called once on component mount.
	 * Upon receiving a task event, the method will trigger the appropriate task operation that will be handled in the main component.
	 */

	//TODO: Implement taskListener method and hook it up to the main component.
	public taskListener(): void {}
}
