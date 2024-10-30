// src/data/mdTaskProvider.ts
import type {
	tasksTransferObject,
	taskTransferObject,
	taskType,
} from "../types/taskType";
import { logger } from "../utils/logger";
import { DataviewApi } from "obsidian-dataview";
import { PluginApiProvider } from "../api/pluginApiProvider";
import { useApp } from "../appContext";
import type { App } from "obsidian";
import { TFile } from "obsidian";
import { defaultHeading, defaultPath } from "../settings";
import { TaskMapper } from "./mdTaskMapper";

/**
 * Service class for managing tasks using the Dataview API and Obsidian App directly.
 */
export class mdTaskProvider {
	private readonly app: App;
	private readonly pluginApiProvider;
	private readonly dv: DataviewApi;
	private readonly defaultPath = defaultPath;
	private readonly defaultHeading = defaultHeading;
	private readonly taskMapper: TaskMapper;
	private readonly taskPluginToggleTaskDone: (
		line: string,
		path: string,
	) => void;

	/**
	 * Constructs an instance of the mdTaskService.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor() {
		this.app = <App>useApp();
		this.pluginApiProvider = new PluginApiProvider(this.app);
		this.dv = this.pluginApiProvider.getDvApi();
		this.taskMapper = new TaskMapper();

		if (!this.dv || !this.app) {
			throw new Error("Dataview API or Obsidian App not available");
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API.
	 * @returns An array of taskType objects.
	 */
	public async getTasks(): Promise<tasksTransferObject> {
		const tasks: taskType[] = [];

		try {
			const allTasks = this.dv.pages("").file.tasks;
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
						logger.info({ taskObject }, "Task loaded");
					} else {
						logger.info(
							"Shards: Task already loaded as a subtask. Skipping...",
						);
					}
				}
			}
		} catch (error) {
			logger.error("Shards: Error fetching tasks: " + error.message);
			return { status: false };
		}
		logger.info("Shards: Task loaded via dataview: " + tasks.length);
		return { status: true, tasks: tasks };
	}

	/**
	 * Creates a new task in the specified file.
	 * @param path - The path to the file.
	 * @param task - The task object to be created.
	 * @param heading - The heading to insert the task under.
	 */
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
				logger.info("Shards: Error fetching file: " + error.message);
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
			logger.error("Shards: Error creating task via tasks API modal");
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
}
