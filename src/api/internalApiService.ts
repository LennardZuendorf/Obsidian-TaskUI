import { App } from "obsidian";
import { ObsidianApiProvider } from "./internalApi/obsidianApi";
import EventEmitter from "events";
import { TaskMapper } from "../data/utils/mapper";
import { logger as logger } from "../utils/logger";
import { DataviewApiProvider } from "./internalApi/dataviewApi";
import { tasksObject, taskObject } from "../data/types/transferObjects";
import { task } from "../data/types/tasks";
import { InternalApiEvents } from "./types/events";
import { ApiService } from "./types/apiService";
import { defaultHeading, defaultPath } from "../config/settings";

export class InternalApiService implements ApiService {
	private readonly mdApi: ObsidianApiProvider;
	private readonly dvApi: DataviewApiProvider;
	private readonly taskMapper: TaskMapper;
	private readonly eventEmitter: EventEmitter;

	constructor(app: App) {
		this.mdApi = new ObsidianApiProvider(app);
		this.dvApi = new DataviewApiProvider();
		this.taskMapper = new TaskMapper();
		this.eventEmitter = new EventEmitter();
		this.initiatePeriodicTaskFetch().then((r) =>
			logger.info(
				"TaskUI: Periodic task fetch initiated for internal source.",
			),
		);
	}

	public async getTasks(filePath?: string): Promise<tasksObject> {
		try {
			if (!this.dvApi.isDataviewApiAvailable()) {
				logger.error("Dataview API is not available");
				return { status: false };
			}

			let tasks: task[] = [];
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

	public async editTask(newTask: task, oldTask: task): Promise<taskObject> {
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

	public async deleteTask(task: task): Promise<taskObject> {
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
		task: task,
		filePath: string = defaultPath,
		heading: string = defaultHeading,
	): Promise<taskObject> {
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

	private async initiatePeriodicTaskFetch() {
		setInterval(async () => {
			const tasks = await this.dvApi.getAllTasks();
			this.eventEmitter.emit("tasksFetched", tasks);
		}, 5000);
	}

	public on<K extends keyof InternalApiEvents>(
		event: K,
		callback: (data: InternalApiEvents[K]) => void,
	): void {
		this.eventEmitter.on(event, callback);
	}

	public emit<K extends keyof InternalApiEvents>(
		event: K,
		data: InternalApiEvents[K],
	): void {
		this.eventEmitter.emit(event, data);
	}
}
