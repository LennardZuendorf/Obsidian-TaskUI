import { App } from "obsidian";
import { taskSource, taskType } from "../data/types/taskTypes";
import {
	tasksTransferObject,
	taskTransferObject,
} from "../data/types/transferObjectTypes";
import { TaskMapper } from "../data/utils/mapper";
import { taskOperation } from "../data/utils/operationTypes";
import { loggerUtil as logger } from "../utils/loggerUtil";
import { InternalApiService } from "../api/internalApiService";
import { defaultHeading, defaultPath } from "../config/settings";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksTransferObject>;
	createTask(
		task: taskType,
		filePath: string,
		heading: string,
	): Promise<taskTransferObject>;
	editTask(newTask: taskType, oldTask: taskType): Promise<taskTransferObject>;
	deleteTask(task: taskType): Promise<taskTransferObject>;
}

export class TaskService {
	private readonly taskMapper: TaskMapper;
	private readonly app: App;

	constructor(app: App) {
		this.taskMapper = new TaskMapper();
		this.app = app;
	}

	private getApiService(source: taskSource): ApiService {
		switch (source) {
			case taskSource.OBSIDIAN:
				return new InternalApiService(this.app, this.taskMapper);
			case taskSource.TODOIST:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
			default:
				logger.error(`Unsupported task source: ${source}`);
				throw new Error(`Unsupported task source: ${source}`);
		}
	}

	public async loadTasks(): Promise<tasksTransferObject> {
		const taskList: taskType[] = [];

		try {
			const mdResponse = await this.getAllTasks(taskSource.OBSIDIAN);
			const todoistResponse = await this.getAllTasks(taskSource.TODOIST);
			if (mdResponse.status && todoistResponse.status) {
				if (mdResponse.tasks) taskList.push(...mdResponse.tasks);
				if (todoistResponse.tasks)
					taskList.push(...todoistResponse.tasks);
			} else if (mdResponse.status && mdResponse.tasks) {
				logger.warn(
					"Failed to fetch tasks from Obsidian, using tasks only from Todoist",
				);
				taskList.push(...mdResponse.tasks);
			} else if (todoistResponse.status && todoistResponse.tasks) {
				logger.warn(
					"Failed to fetch tasks from Todoist, using tasks only from Obsidian",
				);
				taskList.push(...todoistResponse.tasks);
			} else {
				logger.error("Couldn't fetch tasks from both sources");
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
	): Promise<tasksTransferObject> {
		const apiService = this.getApiService(source);
		if (!filePath) return apiService.getTasks();
		return apiService.getTasks(filePath);
	}

	public async createTask(
		source: taskSource,
		task: taskType,
		filePath?: string,
		heading?: string,
	): Promise<taskTransferObject> {
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
		newTask: taskType,
		oldTask: taskType,
	): Promise<taskTransferObject> {
		const apiService = this.getApiService(source);
		if (!newTask || !oldTask)
			throw new Error(
				`Operation ${taskOperation.UPDATE} requires both newTask and oldTask.`,
			);
		return apiService.editTask(newTask, oldTask);
	}

	public async deleteTask(
		source: taskSource,
		task: taskType,
	): Promise<taskTransferObject> {
		const apiService = this.getApiService(source);
		if (!task)
			throw new Error(
				`Operation ${taskOperation.DELETE} requires a task.`,
			);
		return apiService.deleteTask(task);
	}
}
