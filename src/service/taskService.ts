import { App } from "obsidian";
import { InternalApiService } from "../api/internalApiService";
import { Task, TaskSource } from "../data/types/tasks";
import { taskObject, tasksObject } from "../data/types/transferObjects";
import { logger as logger } from "../utils/logger";
import { serviceOperation } from "./types/operations";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksObject>;
	createTask(task: Task, heading: string): Promise<taskObject>;
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
			case TaskSource.TASKUI:
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

	public async createTask(task: Task, heading: string): Promise<taskObject> {
		const apiService = this.getApiService(task.source);
		return apiService.createTask(task, heading);
	}

	public async updateTask(
		source: TaskSource,
		newTask: Task,
		oldTask: Task,
	): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!newTask || !oldTask)
			throw new Error(
				`Operation ${serviceOperation.UPDATE} requires both newTask and oldTask.`,
			);
		return apiService.editTask(newTask, oldTask);
	}

	public async deleteTask(source: TaskSource, task: Task): Promise<taskObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(`Operation ${serviceOperation.DELETE} requires a task.`);
		return apiService.deleteTask(task);
	}
}
