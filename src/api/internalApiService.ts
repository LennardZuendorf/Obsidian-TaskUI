import EventEmitter from "events";
import { App } from "obsidian";
import { TaskMapper } from "../data/taskMapper";
import { Task } from "../data/types/tasks";
import { taskObject, tasksObject } from "../data/types/transferObjects";
import { validateTasks } from "../data/utils/validateTask";
import { logger } from "../utils/logger";
import { DataviewApiProvider, dvTaskType } from "./internalApi/dataviewApi";
import { ObsidianApiProvider } from "./internalApi/obsidianApi";
import { ApiService } from "./types/apiService";
import { InternalApiEvents } from "./types/events";

// Export the class!
export class InternalApiService implements ApiService {
	private readonly mdApi: ObsidianApiProvider;
	private readonly dvApi: DataviewApiProvider;
	private readonly taskMapper: TaskMapper;
	private readonly eventEmitter: EventEmitter;
	private intervalId: NodeJS.Timeout | null = null;

	constructor(app: App) {
		this.mdApi = new ObsidianApiProvider(app);
		this.dvApi = new DataviewApiProvider();
		this.taskMapper = new TaskMapper();
		this.eventEmitter = new EventEmitter();
		this.initiatePeriodicTaskFetch().then((r) =>
			logger.trace(
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
			let dvTasks: dvTaskType[] | null = null;

			if (filePath) {
				dvTasks = await this.dvApi.getTasksFromFile(filePath);
			} else {
				dvTasks = await this.dvApi.getAllTasks();
			}

			if (dvTasks) {
				tasks = dvTasks.map((dvTask) =>
					this.taskMapper.mapDvToTaskType(dvTask),
				);
			}

			const validationResult = validateTasks(tasks);
			if (!validationResult.isValid) {
				logger.error(
					`Invalid tasks after mapping: ${validationResult.message}`,
				);
				return { status: false };
			}
			return { status: true, tasks };
		} catch (error) {
			logger.error(error.message);
			return { status: false };
		}
	}

	public async editTask(newTask: Task, oldTask: Task): Promise<taskObject> {
		logger.trace("[InternalApiService.editTask] Start", {
			taskId: newTask.id,
			oldTaskId: oldTask.id,
		});
		try {
			const lineToLookup = oldTask.rawTaskLine;
			const finalLineToWrite = this.taskMapper.mergeTaskOntoRawLine(
				newTask,
				oldTask.rawTaskLine,
			);
			logger.trace("[InternalApiService.editTask] Lines prepared", {
				lineToLookup,
				finalLineToWrite,
			});

			if (!oldTask.path) {
				logger.error(
					`Old task (ID: ${oldTask.id}) is missing path information.`,
				);
				return { status: false };
			}

			logger.trace("[InternalApiService.editTask] Calling mdApi.editTask", {
				path: oldTask.path,
			});
			const updatedLine = await this.mdApi.editTask(
				finalLineToWrite,
				lineToLookup,
				oldTask.path,
			);
			logger.trace("[InternalApiService.editTask] mdApi.editTask returned", {
				updatedLine,
			});

			if (updatedLine !== finalLineToWrite) {
				logger.error(
					`Updating task with path ${oldTask.path} failed in mdApi. Expected line: "${finalLineToWrite}", Got: "${updatedLine}"`,
				);
				return { status: false };
			}

			logger.trace("[InternalApiService.editTask] Success");
			const returnedTask = {
				...newTask,
				lineDescription: finalLineToWrite,
				rawTaskLine: finalLineToWrite,
			};

			const validationResult = validateTasks([returnedTask]);
			if (!validationResult.isValid) {
				logger.error(
					`Invalid task after merge/update: ${validationResult.message}`,
				);
				return { status: false };
			}
			return { status: true, task: returnedTask };
		} catch (error) {
			logger.error(`Error in InternalApiService.editTask: ${error.message}`);
			return { status: false };
		}
	}

	public async deleteTask(task: Task): Promise<taskObject> {
		logger.trace("[InternalApiService.deleteTask] Start", {
			taskId: task.id,
			path: task.path,
		});
		try {
			const lineToLookup = task.rawTaskLine;
			if (!task.path) {
				logger.error(
					`Task (ID: ${task.id}) is missing path information for deletion.`,
				);
				return { status: false };
			}

			logger.trace("[InternalApiService.deleteTask] Calling mdApi.deleteTask", {
				lineToLookup,
				path: task.path,
			});
			const deleted = await this.mdApi.deleteTask(lineToLookup, task.path);
			logger.trace(
				"[InternalApiService.deleteTask] mdApi.deleteTask returned",
				{ deleted },
			);

			if (deleted) {
				logger.trace("[InternalApiService.deleteTask] Success");
				return { status: true, task };
			} else {
				logger.error(`Deleting task with path ${task.path} failed in mdApi.`);
				return { status: false };
			}
		} catch (error) {
			logger.error(
				`Error in InternalApiService.deleteTask for path ${task.path}: ${error.message}`,
			);
			return { status: false };
		}
	}

	public async createTask(task: Task, heading: string): Promise<taskObject> {
		logger.trace("[InternalApiService.createTask] Start", {
			taskId: task.id,
			path: task.path,
			heading,
		});
		try {
			const lineToWrite = task.rawTaskLine;
			const validationResult = validateTasks([task]);
			if (!validationResult.isValid) {
				logger.error(
					`Invalid task provided to createTask: ${validationResult.message}`,
				);
				return { status: false };
			}

			if (!task.path) {
				logger.error(
					`Task (ID: ${task.id}) is missing path information for creation.`,
				);
				return { status: false };
			}

			logger.trace("[InternalApiService.createTask] Calling mdApi.createTask", {
				lineToWrite,
				path: task.path,
				heading,
			});
			const responseLine = await this.mdApi.createTask(
				lineToWrite,
				task.path,
				heading,
			);
			logger.trace(
				"[InternalApiService.createTask] mdApi.createTask returned",
				{ responseLine },
			);

			if (responseLine === lineToWrite) {
				logger.trace("[InternalApiService.createTask] Success", {
					task,
				});
				return { status: true, task: task };
			} else {
				logger.error(
					`Creating task via mdApi failed or returned unexpected line for path ${task.path}.`,
				);
				return { status: false };
			}
		} catch (error) {
			logger.error(
				`Error in InternalApiService.createTask for path ${task.path}: ${error.message}`,
			);
			return { status: false };
		}
	}

	private async initiatePeriodicTaskFetch() {
		this.intervalId = setInterval(async () => {
			logger.trace("[InternalApiService] Initiating periodic task fetch");
			const allDvTasks = await this.dvApi.getAllTasks();
			if (allDvTasks) {
				logger.trace("[InternalApiService] Fetched raw tasks from dvApi", {
					count: allDvTasks.length,
				});
				try {
					const mappedTasks = allDvTasks.map((dvTask) =>
						this.taskMapper.mapDvToTaskType(dvTask),
					);
					logger.trace("[InternalApiService] Mapped tasks", {
						count: mappedTasks.length,
					});
					const validationResult = validateTasks(mappedTasks);
					if (!validationResult.isValid) {
						logger.error(
							`Invalid tasks in periodic fetch: ${validationResult.message}`,
						);
						return;
					}
					logger.trace("[InternalApiService] Emitting tasksFetched event", {
						count: mappedTasks.length,
					});
					this.eventEmitter.emit("tasksFetched", mappedTasks);
				} catch (error) {
					logger.error(`Error in periodic fetch: ${error.message}`);
				}
			} else {
				logger.trace(
					"[InternalApiService] No tasks returned from dvApi fetch.",
				);
			}
		}, 5000);
	}

	public on<K extends keyof InternalApiEvents>(
		event: K,
		callback: (data: InternalApiEvents[K]) => void,
	): void {
		this.eventEmitter.on(event, callback);
	}

	public off<K extends keyof InternalApiEvents>(
		event: K,
		callback: (data: InternalApiEvents[K]) => void,
	): void {
		this.eventEmitter.off(event, callback);
	}

	public emit<K extends keyof InternalApiEvents>(
		event: K,
		data: InternalApiEvents[K],
	): void {
		if (event === "tasksFetched") {
			const validationResult = validateTasks(data);
			if (!validationResult.isValid) {
				logger.error(`Cannot emit invalid tasks: ${validationResult.message}`);
				return;
			}
		}
		this.eventEmitter.emit(event, data);
	}

	public cleanup(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			logger.trace("[InternalApiService] Periodic task fetch interval cleared");
		}
	}
}
