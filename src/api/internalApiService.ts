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
	private readonly app: App;

	constructor(app: App) {
		this.app = app;
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
		logger.debug("[InternalApiService.editTask] Called", {
			newTask: JSON.stringify(newTask, null, 2),
			oldTask: JSON.stringify(oldTask, null, 2),
		});
		try {
			// Use the non-nullable rawTaskLine from the previous version for lookup
			const lineToLookup = oldTask.rawTaskLine;

			// Generate the final desired line string using the merge logic
			const finalLineToWrite = this.taskMapper.mergeTaskOntoRawLine(
				newTask,
				oldTask.rawTaskLine,
			);

			logger.debug("[InternalApiService.editTask] Merge result", {
				lineToLookup,
				finalLineToWrite,
			});

			if (!oldTask.path) {
				logger.error(
					`Old task (ID: ${oldTask.id}) is missing path information.`,
				);
				return { status: false };
			}

			logger.debug(
				`[InternalApiService.editTask] Calling mdApi.editTask with path: ${oldTask.path}`,
			);
			// Call the simplified mdApi.editTask
			const updatedLine = await this.mdApi.editTask(
				finalLineToWrite, // The merged line to write
				lineToLookup, // The raw line from the old task to find
				oldTask.path,
			);

			if (updatedLine !== finalLineToWrite) {
				// Check if write was successful
				logger.error(
					`Updating task with path ${oldTask.path} failed in mdApi. Expected line: "${finalLineToWrite}", Got: "${updatedLine}"`,
				);
				return { status: false };
			}

			logger.debug(
				`[InternalApiService.editTask] mdApi.editTask successful. Returning task ID: ${newTask.id}`,
			);
			const returnedTask = {
				...newTask,
				lineDescription: finalLineToWrite, // Reflects the actual content written
				rawTaskLine: finalLineToWrite, // Update raw line to match what was written
			};

			// Validate the updated task object
			try {
				validateTasks([returnedTask]);
				return { status: true, task: returnedTask };
			} catch (error) {
				logger.error(
					`Invalid task after merge/update: ${error.message}`,
				);
				return { status: false };
			}
		} catch (error) {
			logger.error(
				`Error in InternalApiService.editTask: ${error.message}`,
			);
			return { status: false };
		}
	}

	public async deleteTask(task: Task): Promise<taskObject> {
		try {
			// Use the non-nullable rawTaskLine for lookup
			const lineToLookup = task.rawTaskLine;

			if (!task.path) {
				logger.error(
					`Task (ID: ${task.id}) is missing path information for deletion.`,
				);
				return { status: false };
			}

			const deleted = await this.mdApi.deleteTask(
				lineToLookup, // The raw line to find and delete
				task.path,
			);

			if (deleted) {
				return { status: true, task }; // Return original task data on success
			} else {
				logger.error(
					`Deleting task with path ${task.path} failed in mdApi.`,
				);
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
		try {
			// Task object from TaskBuilder now includes rawTaskLine
			const lineToWrite = task.rawTaskLine; // Use the pre-generated raw line

			// Validate task before proceeding
			try {
				validateTasks([task]); // Task already includes generated lines
			} catch (error) {
				logger.error(
					`Invalid task provided to createTask: ${error.message}`,
				);
				return { status: false };
			}

			if (!task.path) {
				logger.error(
					`Task (ID: ${task.id}) is missing path information for creation.`,
				);
				return { status: false };
			}

			// Call the simplified mdApi.createTask
			const responseLine = await this.mdApi.createTask(
				lineToWrite, // Use the raw line from the builder
				task.path,
				heading,
			);

			if (responseLine === lineToWrite) {
				// Check if write was successful
				// Return the already complete task object from the builder
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

	// --- Event Handling & Periodic Fetch --- (Keep existing logic) ...
	private async initiatePeriodicTaskFetch() {
		setInterval(async () => {
			const allDvTasks = await this.dvApi.getAllTasks();
			if (allDvTasks) {
				try {
					const mappedTasks = allDvTasks.map((dvTask) =>
						this.taskMapper.mapDvToTaskType(dvTask),
					);

					validateTasks(mappedTasks);
					this.eventEmitter.emit("tasksFetched", mappedTasks);
					logger.info("Periodic task fetch completed successfully");
				} catch (error) {
					logger.error(
						`Invalid tasks in periodic fetch: ${error.message}`,
					);
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
