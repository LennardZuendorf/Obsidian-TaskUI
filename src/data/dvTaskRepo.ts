// src/data/dataviewRepository.ts
import { getDvAPI } from "./api/pluginAPIs";
import { Task } from "../types/Task";
import { logger } from "../utils/logger";

export function getAllTasks(): Promise<Task[]> {
	const dv = getDvAPI();

	if (!dv) {
		throw new Error("Dataview API not available");
	}

	const tasks: Task[] = [];

	try {
		dv.pages().forEach((page) => {
			if (page.file?.tasks) {
				page.file.tasks.forEach((task: any) => {
					const taskObject: Task = {
						text: task.text,
						line: task.line,
						path: task.path,
						completed: task.completed,
						fullyQualifiedName: task.fullyQualifiedName,
						subtasks: task.subtasks,
						tags: task.tags,
						priority: task.priority,
						start: task.start,
						scheduled: task.scheduled,
						due: task.due,
						done: task.done,
					};
					tasks.push(taskObject);
					logger.info("Shards: Task loaded via dataview.");
				});
			}
		});
	} catch (error) {
		logger.error("Error fetching tasks: " + error.message);
	}
	return tasks;
}
