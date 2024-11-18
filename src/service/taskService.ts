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

	public async performOperation(
		operation: taskOperation,
		source: taskSource,
		task?: taskType,
		newTask?: taskType,
		oldTask?: taskType,
		filePath?: string,
		heading?: string,
	): Promise<any> {
		const apiService = this.getApiService(source);

		switch (operation) {
			case taskOperation.GET:
				throw new Error("Get operation not supported.");
			case taskOperation.GET_ALL:
				return apiService.getTasks(filePath);
			case taskOperation.CREATE:
				return apiService.createTask(task!, filePath!, heading!);
			case taskOperation.UPDATE:
				return apiService.editTask(newTask!, oldTask!);
			case taskOperation.DELETE:
				return apiService.deleteTask(task!);
			default:
				throw new Error(`Unsupported operation: ${operation}`);
		}
	}
}
