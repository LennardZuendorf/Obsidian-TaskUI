import { DataviewApiProvider } from "./internal/dataviewApi";
import { ObsidianApiProvider } from "./internal/obsidianApi";
import { App } from "obsidian";
import type { taskType } from "../data/types/taskTypes";
import { defaultPath, defaultHeading } from "../config/settings";
import { loggerUtil as logger } from "../utils/loggerUtil";
import { TaskMapper } from "../data/utils/mapper";
import {
	tasksTransferObject,
	taskTransferObject,
} from "../data/types/transferObjectTypes";
import { ApiService } from "./apiServiceInterface";

export class InternalApiService implements ApiService {
	private readonly mdApi: ObsidianApiProvider;
	private readonly dvApi: DataviewApiProvider;
	private readonly taskMapper: TaskMapper;

	constructor(app: App, mapper: TaskMapper) {
		this.mdApi = new ObsidianApiProvider(app);
		this.dvApi = new DataviewApiProvider();
		this.taskMapper = mapper;
	}

	public async getTasks(filePath?: string): Promise<tasksTransferObject> {
		try {
			if (!this.dvApi.isDataviewApiAvailable()) {
				logger.error("Dataview API is not available");
				return { status: false };
			}

			let tasks: taskType[] = [];
			if (filePath) {
				const dvTasks = await this.dvApi.getTasksFromFile(filePath);
				if (dvTasks) {
					tasks = dvTasks.map((dvTask) =>
						this.taskMapper.mapDvToTaskType(dvTask),
					);
				}
			} else {
				const allDvTasks = await this.dvApi.getAllTasks();
				if (allDvTasks) {
					tasks = allDvTasks.map((dvTask) =>
						this.taskMapper.mapDvToTaskType(dvTask),
					);
				}
			}

			return { status: true, tasks };
		} catch (error) {
			logger.error(error.message);
			return { status: false };
		}
	}

	public async editTask(
		newTask: taskType,
		oldTask: taskType,
	): Promise<taskTransferObject> {
		try {
			if (!this.dvApi.isDataviewApiAvailable()) {
				logger.error("Dataview API is not available");
				return { status: false };
			}

			const updatedDvTask = await this.mdApi.editTask(
				this.taskMapper.mapTaskToLineString(newTask),
				this.taskMapper.mapTaskToLineString(oldTask),
				oldTask.path,
			);

			if (!updatedDvTask) {
				logger.error(`Updating task with path ${oldTask.path} failed`);
				return { status: false };
			}

			const mappedTask = this.taskMapper.mapDvToTaskType(updatedDvTask);
			return { status: true, task: mappedTask };
		} catch (error) {
			logger.error(error.message);
			return { status: false };
		}
	}

	public async deleteTask(task: taskType): Promise<taskTransferObject> {
		try {
			const deleted = await this.mdApi.deleteTask(
				this.taskMapper.mapTaskToLineString(task),
				task.path,
			);

			if (deleted) {
				return { status: true, task };
			} else {
				logger.error(`Deleting task with path ${task.path} failed.`);
				return { status: false };
			}
		} catch (error) {
			logger.error(
				"Error deleting task with path " +
					task.path +
					": " +
					error.message,
			);
			return { status: false };
		}
	}

	public async createTask(
		task: taskType,
		filePath: string = defaultPath,
		heading: string = defaultHeading,
	): Promise<taskTransferObject> {
		try {
			const lineString = this.taskMapper.mapTaskToLineString(task);
			const response = await this.mdApi.createTask(
				lineString,
				filePath,
				heading,
			);

			if (response) {
				return {
					status: true,
					task: task,
					lineString: response,
				};
			} else {
				logger.error("Creating task via Obsidian API failed.");
				return { status: false };
			}
		} catch (error) {
			logger.error(
				"Error creating task via Obsidian API: " + error.message,
			);
			return { status: false };
		}
	}

	private async updateTask() {
		return { status: false };
	}
}
