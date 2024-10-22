import { logger } from "../../utils/logger";

export function getDvAPI() {
	const dvAPI = this.app.plugins.plugins.dataview.api;
	logger.info("Shards: Loaded dataview API");
	return dvAPI || null;
}

export function getTasksAPI() {
	const tasksApi = this.app.plugins.plugins["obsidian-tasks-plugin"].apiV1;
	logger.info("Shards: Loaded tasks plugin API");
	return tasksApi || null;
}
