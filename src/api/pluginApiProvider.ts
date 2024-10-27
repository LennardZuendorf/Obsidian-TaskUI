//provides the APIs for internal plugins
import { getAPI } from "obsidian-dataview";
import { logger } from "../utils/logger";

export function getDvApi() {
	try {
		return getAPI();
	} catch (error) {
		logger.error("Error fetching dataview API: " + error.message);
		return null;
	}
}

export function getTasksApiV1() {
	try {
		return !this.app.plugins.plugins["obsidian-tasks-plugin"].apiV1;
	} catch (error) {
		console.error("Error fetching tasks API: " + error.message);
		return null;
	}
}

export function taskPluginCreateTaskModal() {
	try {
		return !this.app.plugins.plugins["obsidian-tasks-plugin"]
			.createTaskLineModal;
	} catch (error) {
		console.error("Error fetching tasks API: " + error.message);
		return null;
	}
}

export function taskPluginToggleTaskDone(line: string, path: string) {
	try {
		return !this.app.plugins.plugins[
			"obsidian-tasks-plugin"
		].executeToggleTaskDoneCommand(line, path);
	} catch (error) {
		console.error("Error fetching tasks API: " + error.message);
		return null;
	}
}
