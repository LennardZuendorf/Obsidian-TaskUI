// src/api/pluginApiProvider.ts
import {
	taskStatus,
	taskTransferObject,
	taskType,
} from "../data/types/taskType";

export class TasksApiProvider {
	private readonly app;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(app: any) {
		//This is handed over through the context which itself comes straight from the Obsidian App. But there's no type for the App object...
		this.app = app;
	}

	/**
	 * Fetches the Tasks API via the Obsidian App.
	 * @returns The Tasks API or null if it is not available.
	 */
	private getTasksApiV1() {
		try {
			return this.app.plugins.plugins["obsidian-tasks-config"].apiV1;
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return null;
		}
	}

	/**
	 * Triggers the creation of a task modal via the Tasks API.
	 * @returns The task line
	 * This toggles the task modal for creating a new task in the Obsidian UI.
	 */
	public async getCreateTaskModal(): Promise<taskTransferObject> {
		try {
			const lineString: string =
				await this.app.plugins.plugins["obsidian-tasks-config"]
					.createTaskLineModal;

			return { status: true, lineString: lineString };
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return { status: false };
		}
	}

	/**
	 * Toggles the done status of a task via the Tasks API.
	 * @param line The markdown string of the task line being toggled
	 * @param path The path to the file containing line
	 * @param task The task object being toggled
	 */
	public async toggleTaskDone(
		line: string,
		path: string,
		task: taskType,
	): Promise<taskTransferObject> {
		try {
			const lineString: string = await this.app.plugins.plugins[
				"obsidian-tasks-config"
			].executeToggleTaskDoneCommand(line, path);

			task.status = taskStatus.DONE;
			return { status: true, lineString: lineString, task: task };
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return { status: false };
		}
	}
}
