import { App } from "obsidian";
import { taskSource, task } from "../data/types/tasks";
import { tasksObject, taskObject } from "../data/types/transferObjects";
import { taskOperation } from "./types/operations";
import { logger as logger } from "../utils/logger";
import { InternalApiService } from "../api/internalApiService";
import { defaultHeading, defaultPath } from "../config/settings";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksObject>;
	createTask(
		task: task,
		filePath: string,
		heading: string,
	): Promise<taskObject>;
	editTask(newTask: task, oldTask: task): Promise<taskObject>;
	deleteTask(task: task): Promise<taskObject>;
}

export class TaskService {
	private readonly app: App;

	constructor(app: App) {
		this.app = app;
	}

	private getApiService(source: taskSource): ApiService {
		switch (source) {
			case taskSource.OBSIDIAN:
				return new InternalApiService(this.app);
			case taskSource.TODOIST:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
			default:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
		}
	}

	public async loadTasks(): Promise<tasksObject> {
		const taskList: task[] = [];

		try {
			const mdResponse = await this.getAllTasks(taskSource.OBSIDIAN);

			if (mdResponse.status && mdResponse.tasks) {
				taskList.push(...mdResponse.tasks);
			} else {
				logger.error("Couldn't fetch tasks from obsidian sources");
				return { status: false };
			}
			return { status: true, tasks: taskList };
		} catch (error) {
			logger.error(`Error fetching tasks: ${error.message}`);
			return { status: false };
		}
	}

	public async getAllTasks(
		source: taskSource,
		filePath?: string,
	): Promise<tasksObject> {
		const apiService = this.getApiService(source);
		if (!filePath) return apiService.getTasks();
		return apiService.getTasks(filePath);
	}

	public async createTask(
		source: taskSource,
		task: task,
		filePath?: string,
		heading?: string,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(
				`Operation ${taskOperation.CREATE} requires a task.`,
			);
		return apiService.createTask(
			task,
			filePath ? filePath : defaultPath,
			heading ? heading : defaultHeading,
		);
	}

	public async updateTask(
		source: taskSource,
		newTask: task,
		oldTask: task,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!newTask || !oldTask)
			throw new Error(
				`Operation ${taskOperation.UPDATE} requires both newTask and oldTask.`,
			);
		return apiService.editTask(newTask, oldTask);
	}

	public async deleteTask(
		source: taskSource,
		task: task,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(
				`Operation ${taskOperation.DELETE} requires a task.`,
			);
		return apiService.deleteTask(task);
	}
}
