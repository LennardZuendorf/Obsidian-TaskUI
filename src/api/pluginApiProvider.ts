// src/api/pluginApiProvider.ts
import { getAPI } from "obsidian-dataview";
import { logger } from "../utils/logger";

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
	 * @returns The task modal or null if it is not available.
	 */
	public taskPluginCreateTaskModal() {
		try {
			return this.app.plugins.plugins["obsidian-tasks-plugin"]
				.createTaskLineModal;
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return null;
		}
	}

	/**
	 * Toggles the done status of a task via the Tasks API.
	 * @param line The markdown string of the task line being toggled
	 * @param path The path to the file containing line
	 */
	public taskPluginToggleTaskDone(line: string, path: string) {
		try {
			return this.app.plugins.plugins[
				"obsidian-tasks-plugin"
			].executeToggleTaskDoneCommand(line, path);
		} catch (error) {
			console.error("Error fetching tasks API: " + error.message);
			return null;
		}
	}
}
