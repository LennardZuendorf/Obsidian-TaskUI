import EventEmitter from "events";
import { App } from "obsidian";
import { TaskMapper } from "../data/taskMapper";
import { Task } from "../data/types/tasks";
import { taskObject, tasksObject } from "../data/types/transferObjects";
import { validateTasks } from "../data/utils/validateTask";
import { logger } from "../utils/logger";
import { DataviewApiProvider } from "./internalApi/dataviewApi";
import { ObsidianApiProvider } from "./internalApi/obsidianApi";
import { ApiService } from "./types/apiService";
import { InternalApiEvents } from "./types/events";

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

			let tasks: Task[] = [];
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

			// Validate tasks before returning
			try {
				validateTasks(tasks);
				return { status: true, tasks };
			} catch (error) {
				logger.error(`Invalid tasks after mapping: ${error.message}`);
				return { status: false };
			}
		} catch (error) {
			logger.error(error.message);
			return { status: false };
		}
	}

	public async editTask(newTask: Task, oldTask: Task): Promise<taskObject> {
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

			// Validate mapped task before returning
			try {
				validateTasks([mappedTask]);
				return { status: true, task: mappedTask };
			} catch (error) {
				logger.error(
					`Invalid task after mapping in editTask: ${error.message}`,
				);
				return { status: false };
			}
		} catch (error) {
			logger.error(error.message);
			return { status: false };
		}
	}

	public async deleteTask(task: Task): Promise<taskObject> {
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

	public async createTask(task: Task, heading: string): Promise<taskObject> {
		try {
			// Validate task before proceeding
			try {
				validateTasks([task]);
			} catch (error) {
				logger.error(`Invalid task in createTask: ${error.message}`);
				return { status: false };
			}

			task.lineDescription = this.taskMapper.mapTaskToLineString(task);
			const response = await this.mdApi.createTask(
				task.lineDescription,
				task.path,
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
			const allDvTasks = await this.dvApi.getAllTasks();
			if (allDvTasks) {
				try {
					const mappedTasks = allDvTasks.map((dvTask) =>
						this.taskMapper.mapDvToTaskType(dvTask),
					);

					// Validate tasks before emitting
					validateTasks(mappedTasks);
					this.eventEmitter.emit("tasksFetched", mappedTasks);
					logger.info("Periodic task fetch completed successfully");
				} catch (error) {
					logger.error(
						`Invalid tasks in periodic fetch: ${error.message}`,
					);
					// Don't emit invalid tasks
				}
			}
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
		// Validate tasks before emitting if this is a tasksFetched event
		if (event === "tasksFetched") {
			try {
				validateTasks(data);
			} catch (error) {
				logger.error(`Cannot emit invalid tasks: ${error.message}`);
				return;
			}
		}
		this.eventEmitter.emit(event, data);
	}
}
