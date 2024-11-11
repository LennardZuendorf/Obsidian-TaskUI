import { TaskMapper } from "../../data/utils/mapper";
import { taskType } from "../../data/types/taskTypes";
import { taskTransferObject } from "../../data/types/transferObjectTypes";
import { App } from "obsidian";
import { loggerUtil, loggerUtil as logger } from "../../utils/loggerUtil";

/**
 * ObsidianApiProvider class provides methods for creating, updating, and deleting tasks via the Obsidian API.
 */
export class ObsidianApiProvider {
	private readonly taskMapper: TaskMapper;
	private readonly obsidianApp: App;

	/**
	 * Constructs an instance of the Dataview API Provider.
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor(app: App) {
		this.taskMapper = new TaskMapper();
		try {
			this.obsidianApp = app;
		} catch (error) {
			loggerUtil.error("Error fetching obsidian API: " + error.message);
			throw new Error("Obsidian API not available: " + error.message);
		}
	}

	/**
	 * Edits an existing task in a markdown file at the specified path.
	 *
	 *
	 * @returns A promise that resolves to a taskTransferObject. The status is true if the task was successfully edited,
	 * and false if the task could not be found or an error occurred.
	 * @param newTask
	 * @param oldTask
	 */

	public async editTask(
		newTask: taskType,
		oldTask: taskType,
	): Promise<taskTransferObject> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(oldTask.path);

			if (!file) {
				return { status: false };
			}

			const content = await this.obsidianApp.vault.read(file);
			const lines = content.split("\n");
			const taskLineIndex = oldTask.line
				? oldTask.line
				: lines.findIndex((line) =>
						line.includes(oldTask.lineDescription),
					);

			if (taskLineIndex === -1) {
				return { status: false };
			}

			lines[taskLineIndex] = this.taskMapper.mapTaskToLineString(newTask);
			await this.obsidianApp.vault
				.modify(file, lines.join("\n"))
				.then(() => {});
			const check = await this.dvApi.getTask(newTask.path, newTask);

			return { status: check.status };
		} catch (error) {
			logger.error("Error editing task via Obsidian API:", error.message);
			return { status: false };
		}
	}

	/**
	 * Adds a task line string to a markdown file under the given path. The task will be placed under the given heading.
	 *
	 * @param task - The task object containing details to be added to the markdown file.
	 * @param path - The file path where the task should be added.
	 * @param heading - The heading under which the task should be placed. If the heading does not exist, it will be created.
	 *
	 * @returns A promise that resolves to a taskTransferObject. The status is true if the task was successfully added,
	 * and false if the file could not be found or an error occurred.
	 */
	public async createTask(
		task: taskType,
		path: string,
		heading: string,
	): Promise<taskTransferObject> {
		let newLine = this.taskMapper.mapTaskToLineString(task);

		try {
			const file = this.obsidianApp.vault.getFileByPath(path);

			if (!file) {
				logger.error(`Could not find file at path: ${path}`);
				return { status: false };
			}

			const content = await this.obsidianApp.vault.read(file);
			const lines = content.split("\n");
			let headingIndex = lines.findIndex(
				(line) => line.trim() === `${heading}`,
			);

			//If heading can't be found (which may be expected, add the heading and the line string at the bottom of the file
			if (headingIndex === -1) {
				newLine = `${heading}\n${newLine}`;
				headingIndex = lines.length;
			}

			lines.splice(headingIndex + 1, 0, newLine);
			await this.obsidianApp.vault.modify(file, lines.join("\n"));
			return { status: true, task };
		} catch (error) {
			logger.error(
				`Error while trying to add a new task: ${error.message}`,
			);
			return { status: false };
		}
	}

	/**
	 * Deletes a task line string from a markdown file under the given path.
	 *
	 * @param task - The task object containing details such as line or lineDescription to identify the task to be deleted.
	 * @param path - The file path from which the task should be deleted.
	 *
	 * @returns A promise that resolves to a taskTransferObject. The status is true if the task was successfully deleted,
	 * and false if the task could not be found or an error occurred.
	 */
	public async deleteTask(
		task: taskType,
		path: string,
	): Promise<taskTransferObject> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(path);

			if (!file) {
				logger.error(`Could not find file at path: ${path}`);
				return { status: false };
			}

			const content = await this.obsidianApp.vault.read(file);
			const lines = content.split("\n");
			const taskLineIndex = task.line
				? task.line
				: lines.findIndex((line) =>
						line.includes(task.lineDescription),
					);

			if (taskLineIndex === -1) {
				logger.error(`Could not find task line in file: ${path}`);
				return { status: false };
			}

			lines.splice(taskLineIndex, 1);
			await this.obsidianApp.vault.modify(file, lines.join("\n"));
			return { status: true, task };
		} catch (error) {
			logger.error(
				`Error while trying to delete a task: ${error.message}`,
			);
			return { status: false };
		}
	}
}
