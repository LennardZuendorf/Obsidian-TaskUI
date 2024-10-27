// src/data/mdTaskProvider.ts
import type { taskType } from "../types/taskType";
import { logger } from "../utils/logger";
import { DataviewApi } from "obsidian-dataview";
import { getDvApi } from "../api/pluginApiProvider";

import {
	mapTaskTypeToDvTask,
	mapDvTaskToTaskType,
	mapStatus,
} from "./mdTaskMapper";

export class mdTaskService {
	private readonly dv: DataviewApi;

	constructor() {
		this.dv = getDvApi();
		if (!this.dv) {
			throw new Error("Dataview API not available");
		}
	}

	private mapTaskTypeToDvTask = mapTaskTypeToDvTask;
	private mapDvTaskToTaskType = mapDvTaskToTaskType;
	private mapStatus = mapStatus;

	public getTasks(): taskType[] {
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
						const taskObject = this.mapDvTaskToTaskType(task);
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
		}
		logger.info("Shards: Task loaded via dataview: " + tasks.length);
		return tasks;
	}

	public createTask(task: taskType) {
		// Implementation for creating a task
	}

	public updateTask() {
		// Implementation for updating a task
	}

	public deleteTask() {
		// Implementation for deleting a task
	}
}
