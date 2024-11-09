// src/data/mdTaskProvider.ts
import type {
	tasksTransferObject,
	taskTransferObject,
	taskType,
} from "../data/types/taskType";
import { loggerUtil } from "../utils/loggerUtil";
import { DataviewApi } from "obsidian-dataview";
import { DataviewApiProvider } from "../api/dataviewApi";
import { useApp } from "../utils/contextUtil";
import type { App } from "obsidian";
import { TFile } from "obsidian";
import { defaultHeading, defaultPath } from "../config/settings";
import { TaskMapper } from "../data/utils/taskTypeMapper";
import { TasksApiProvider } from "../api/tasksApi";

/**
 * Service class for managing tasks using the Dataview API and Obsidian App directly.
 */

//TODO: Split This class into multiple providers for editing and querying tasks.
export class mdTaskProvider {
	private readonly app: App;
	private readonly dvApi: DataviewApi;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private readonly tasksApiProvider: TasksApiProvider;
	private readonly defaultPath = defaultPath;
	private readonly defaultHeading = defaultHeading;
	private readonly taskMapper: TaskMapper;

	/**
	 * Constructs an instance of the mdTaskService.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor() {
		this.app = <App>useApp();
		this.dvApi = new DataviewApiProvider().getDvApi();
		this.tasksApiProvider = new TasksApiProvider(this.app);
		this.taskMapper = new TaskMapper();

		if (!this.dvApi || !this.app) {
			throw new Error("Dataview API or Obsidian App not available");
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API.
	 * @returns An array of taskType objects.
	 */

	//TODO: Split this method into multiple methods for fetching raw data from the API and mapping it to taskType objects. One is API layer, the other is service layer.
	public async getTasks(): Promise<tasksTransferObject> {
		const tasks: taskType[] = [];

		try {
			const allTasks = this.dvApi.pages("").file.tasks;
			for (const task of allTasks) {
				if (task) {
					const hasMatchingSubtask = tasks.some((existingTask) =>
						existingTask.subtasks?.some(
							(subtask) => subtask.rawDescription === task.text,
						),
					);
					if (!hasMatchingSubtask) {
						const taskObject =
							this.taskMapper.mapDvTaskToTaskType(task);
						tasks.push(taskObject);
						loggerUtil.info({ taskObject }, "Task loaded");
					} else {
						loggerUtil.info(
							"Shards: Task already loaded as a subtask. Skipping...",
						);
					}
				}
			}
		} catch (error) {
			loggerUtil.error("Shards: Error fetching tasks: " + error.message);
			return { status: false };
		}
		loggerUtil.info("Shards: Task loaded via dataview: " + tasks.length);
		return { status: true, tasks: tasks };
	}

	/**
	 * Creates a new task in the specified file.
	 * @param path - The path to the file.
	 * @param task - The task object to be created.
	 * @param heading - The heading to insert the task under.
	 */

	//TODO: Split this method into multiple methods for creating a task and writing it to the file. One is API layer, the other is service layer.
	public async createTask(
		task: taskType,
		heading: string = this.defaultHeading,
		path: string = this.defaultPath,
	): Promise<taskTransferObject> {
		const taskLine = this.taskMapper.mapTaskTypeToDvTask(task);
		let file: TFile | null = null;

		try {
			try {
				file = this.app.vault.getAbstractFileByPath(path) as TFile;
			} catch (error) {
				loggerUtil.info(
					"Shards: Error fetching file: " + error.message,
				);
			}

			if (file === null) {
				console.error(
					"Shards: File not found or invalid path. Creating new file...",
				);
				try {
					file = await this.app.vault.create(path, "");
				} catch (error) {
					console.error(
						"Shards: Error fetching file: " +
							(error instanceof Error
								? error.message
								: "Unknown error."),
					);
					return { status: false };
				}
			}

			// Read file content
			let content = await this.app.vault.read(file);

			// Find or create heading
			if (!content.includes(`${heading}`)) {
				content += `\n${heading}\n`;
			}

			// Write the task under the heading
			const updatedContent = content.replace(
				`${heading}`,
				`${heading}\n${taskLine}`,
			);

			await this.app.vault.modify(file, updatedContent);
			console.log("Shards: Task created successfully.");
			return { status: false };
		} catch (error) {
			console.error("Shards: Error creating task: " + error.message);
			return { status: true, task: task, lineString: taskLine };
		}
	}

	/**
	 * Edits an existing task in the specified file.
	 * @param task - The task object to be edited.
	 * @returns A promise that resolves to a tuple containing a boolean indicating success and the new task line.
	 */
	//TODO: Split this method into multiple methods for editing a task and writing it to the file. One is API layer, the other is service layer. Also rewrite the method to use obsidian properly.
	public async editTask(task: taskType): Promise<taskTransferObject> {
		const newTaskLine = this.taskMapper.mapTaskTypeToDvTask(task);
		const oldTaskLine = task.rawDescription;

		try {
			const file = this.app.vault.getAbstractFileByPath(task.path);

			if (!(file instanceof TFile)) {
				console.error("Shards: File not found or invalid path.");
				return { status: false };
			}

			// Read file content
			const content = await this.app.vault.read(file);

			// Replace old task text with new task text
			const updatedContent = content.replace(oldTaskLine, newTaskLine);

			// Write updated content back to the file
			await this.app.vault.modify(file, updatedContent);
			console.log("Shards: Task updated successfully.");
		} catch (error) {
			console.error("Shards: Error updating task: " + error.message);
			return { status: false };
		}

		return { status: true, task: task, lineString: newTaskLine };
	}

	/**
	 * Deletes a task from the specified file.
	 * @param path - The path to the file.
	 * @param taskLine - The task line to be deleted.
	 * @returns A promise that resolves to a tuple containing a boolean indicating success and a message.
	 */
	//TODO: Split this method into multiple methods for deleting a task and writing it to the file. One is API layer, the other is service layer.
	public async deleteTask(
		path: string,
		taskLine: string,
	): Promise<taskTransferObject> {
		if (!this.app) {
			console.error("Shards: App not available.");
			return { status: false };
		}

		try {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) {
				console.error("Shards: File not found or invalid path.");
				return { status: false };
			}

			// Read file content
			const content = await this.app.vault.read(file);

			// Remove the task line from the content
			const updatedContent = content.replace(taskLine, "");

			// Write updated content back to the file
			await this.app.vault.modify(file, updatedContent);
			console.log("Shards: Task updated successfully.");
		} catch (error) {
			console.error("Shards: Error updating task: " + error.message);
			return { status: false };
		}
		return { status: true };
	}

	/**
	 * Creates a new task via the Tasks API modal.
	 * @returns A promise that resolves to a taskTransferObject.
	 */
	public async createTaskViaModal(): Promise<taskTransferObject> {
		const taskDTO: taskTransferObject =
			await this.pluginApiProvider.taskPluginCreateTaskModal();

		if (!taskDTO.lineString || !taskDTO.status) {
			loggerUtil.error("Shards: Error creating task via tasks API modal");
			return { status: false };
		}

		const task = this.taskMapper.mapTaskLineStringToTaskType(
			taskDTO.lineString,
		);
		return this.createTask(task);
	}

	/**
	 * Toggles the done status of a task via the Tasks API.
	 * @param line The markdown string of the task line being toggled
	 * @param path The path to the file containing line
	 * @param task The task object being toggled
	 */
	private toggleTaskDoneViaPlugin(
		line: string,
		path: string,
		task: taskType,
	): Promise<taskTransferObject> {
		return this.pluginApiProvider.taskPluginToggleTaskDone(
			line,
			path,
			task,
		);
	}

	/**
	 * Listens for task events via the dataview API. This method should be called once on component mount.
	 * Upon receiving a task event, the method will trigger the appropriate task operation that will be handled in the main component.
	 */

	//TODO: Implement taskListener method and hook it up to the main component.
	public taskListener(): void {}
}
