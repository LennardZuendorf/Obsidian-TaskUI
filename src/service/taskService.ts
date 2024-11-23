import { App } from "obsidian";
import { TaskSource, Task } from "../data/types/tasks";
import { tasksObject, taskObject } from "../data/types/transferObjects";
import { taskOperation } from "./types/operations";
import { logger as logger } from "../utils/logger";
import { InternalApiService } from "../api/internalApiService";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksObject>;
	createTask(
		task: Task,
		filePath: string,
		heading: string,
	): Promise<taskObject>;
	editTask(newTask: Task, oldTask: Task): Promise<taskObject>;
	deleteTask(task: Task): Promise<taskObject>;
}

export class TaskService {
	private readonly app: App;

	constructor(app: App) {
		this.app = app;
	}

	private getApiService(source: TaskSource): ApiService {
		switch (source) {
			case TaskSource.OBSIDIAN:
				return new InternalApiService(this.app);
			case TaskSource.TODOIST:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
			default:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
		}
	}

	public async loadTasks(): Promise<tasksObject> {
		const taskList: Task[] = [];

		try {
			const mdResponse = await this.getAllTasks(TaskSource.OBSIDIAN);

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
		source: TaskSource,
		filePath?: string,
	): Promise<tasksObject> {
		const apiService = this.getApiService(source);
		if (!filePath) return apiService.getTasks();
		return apiService.getTasks(filePath);
	}

	public async createTask(
		source: TaskSource,
		task: Task,
		filePath: string,
		heading: string,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(
				`Operation ${taskOperation.CREATE} requires a task.`,
			);
		return apiService.createTask(task, filePath, heading);
	}

	public async updateTask(
		source: TaskSource,
		newTask: Task,
		oldTask: Task,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!newTask || !oldTask)
			throw new Error(
				`Operation ${taskOperation.UPDATE} requires both newTask and oldTask.`,
			);
		return apiService.editTask(newTask, oldTask);
	}

	public async deleteTask(
		source: TaskSource,
		task: Task,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(
				`Operation ${taskOperation.DELETE} requires a task.`,
			);
		return apiService.deleteTask(task);
	}
}
