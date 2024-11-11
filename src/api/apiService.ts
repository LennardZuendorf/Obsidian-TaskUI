//TODO: Move all business logic here and access all api providers from this instead the other two services

import { DataviewApiProvider } from "./internal/dataviewApi";
import { TasksApiProvider } from "./internal/tasksApi";
import { ObsidianApiProvider } from "./internal/obsidianApi";
import { TodoistApiProvider } from "./external/todoistApi";
import { App } from "obsidian";
import type { taskType } from "../data/types/taskTypes";
import { defaultPath } from "../config/settings";
import { loggerUtil as logger } from "../utils/loggerUtil";
import { taskSource, taskStatus } from "../data/types/taskTypes";
import { checkSinglePlugin } from "../utils/pluginCheckUtil";
import {
	tasksTransferObject,
	taskTransferObject,
} from "../data/types/transferObjectTypes";

export class ApiService {
	private readonly mdApi: ObsidianApiProvider;
	private readonly tasksApi: TasksApiProvider;
	private readonly dvApi: DataviewApiProvider;
	private readonly todoistApi: TodoistApiProvider;

	constructor(app: App) {
		this.mdApi = new ObsidianApiProvider(app);
		this.tasksApi = new TasksApiProvider(app);
		this.dvApi = new DataviewApiProvider();
		this.todoistApi = new TodoistApiProvider();
	}

	public async createTask(
		task: taskType,
		filePath: string = defaultPath,
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
	public async updateTask(
		update: Partial<taskType>,
		task: taskType,
	): Promise<taskTransferObject> {
		const newTask: taskType = { ...task, ...update };
		return { status: false, task:newTask};
	}

	public async getTask(task: taskType): Promise<taskTransferObject> {
		return { status: false };
	}

	public async getTasks(
		source?: taskSource,
		filePath?: string,
	): Promise<tasksTransferObject> {
		return { status: false };
	}

	public async deleteTask(task: taskType): Promise<boolean> {
		return false;
	}

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
}
