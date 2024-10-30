// src/api/pluginApiProvider.ts
import { getAPI } from "obsidian-dataview";
import { logger } from "../utils/logger";
import { taskStatus, taskTransferObject, taskType } from "../types/taskType";

export class PluginApiProvider {
	private readonly app;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(app: any) {
		//This is handed over through the context which itself comes straight from the Obsidian App. But there's no type for the App object...
		this.app = app;
	}

	/**
	 * Fetches the Dataview API via the Obsidian App.
	 * @returns The Dataview API.
	 */
	public getDvApi() {
		try {
			return getAPI();
		} catch (error) {
			logger.error("Error fetching dataview API: " + error.message);
			return null;
		}
	}

	/**
	 * Fetches the Tasks API via the Obsidian App.
	 * @returns The Tasks API or null if it is not available.
	 */
	public getTasksApiV1() {
		try {
			return this.app.plugins.plugins["obsidian-tasks-plugin"].apiV1;
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
	public async taskPluginCreateTaskModal(): Promise<taskTransferObject> {
		try {
			const lineString: string =
				await this.app.plugins.plugins["obsidian-tasks-plugin"]
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
	public async taskPluginToggleTaskDone(
		line: string,
		path: string,
		task: taskType,
	): Promise<taskTransferObject> {
		try {
			const lineString: string = await this.app.plugins.plugins[
				"obsidian-tasks-plugin"
			].executeToggleTaskDoneCommand(line, path);

			task.status = taskStatus.DONE;
			return { status: true, lineString: lineString, task: task };
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return { status: false };
		}
	}
}
