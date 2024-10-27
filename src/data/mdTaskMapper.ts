// src/utils/taskHelpers.ts
import type { taskType, taskPriority, taskStatus } from "../types/taskType";
import { dvTaskType } from "../types/dvTaskType";
import short from "short-uuid";
import { validateValue, parseDate } from "../utils/dataUtils";

export const mapTaskTypeToDvTask = (task: taskType) => {
	// Implementation for mapping taskType to dvTaskType
};

export const mapDvTaskToTaskType = (dvTask: dvTaskType): taskType => {
	const idMatch = dvTask.id
		? dvTask.id
		: dvTask.text.match(/\[id:: ([^\]]+)\]/);
	const dependsOnMatch = dvTask.text.match(/\[dependsOn:: ([^\]]+)\]/);
	const priorityMatch = dvTask.text.match(/\[priority:: ([^\]]+)\]/);
	const recursMatch = dvTask.text.match(/\[repeat:: ([^\]]+)\]/);
	const createdMatch = dvTask.text.match(/\[created:: ([^\]]+)\]/);
	const startMatch = dvTask.text.match(/\[start:: ([^\]]+)\]/);
	const scheduledMatch = dvTask.scheduled
		? dvTask.scheduled
		: dvTask.text.match(/\[scheduled:: ([^\]]+)\]/);
	const dueMatch = dvTask.text.match(/\[due:: ([^\]]+)\]/);
	const completionMatch = dvTask.text.match(/\[completion:: ([^\]]+)\]/);

	const getCleanDescription = (desc: string): string => {
		return desc.replace(/\[.*?\]/g, "").trim();
	};

	const allowedPriorities: readonly taskPriority[] = [
		"lowest",
		"low",
		"normal",
		"medium",
		"high",
		"highest",
	];

	const task: taskType = {
		id: idMatch ? idMatch[1] : short.uuid(),
		description: getCleanDescription(dvTask.text),
		priority: priorityMatch
			? validateValue(priorityMatch[1], allowedPriorities)
			: "normal",
		recurs: recursMatch ? recursMatch[1] : null,
		dueDate: parseDate(dueMatch ? dueMatch[1] : null),
		scheduledDate: parseDate(scheduledMatch ? scheduledMatch[1] : null),
		startDate: parseDate(startMatch ? startMatch[1] : null),
		blocks: dependsOnMatch ? dependsOnMatch.toString().split(/(\s+)/) : [],
		status: mapStatus(dvTask.status),
		createdDate: parseDate(createdMatch ? createdMatch[1] : null),
		doneDate: parseDate(completionMatch ? completionMatch[1] : null),
		path: dvTask.path,
		symbol: "",
		source: "obsidian",
		line: dvTask.line ? dvTask.line : 0,
		subtasks:
			dvTask.subtasks != []
				? dvTask.subtasks.forEach((subtask) =>
						mapDvTaskToTaskType(subtask),
					)
				: [],
	};

	return task;
};

export const mapStatus = (symbol: string): taskStatus => {
	switch (symbol) {
		case "/":
			return "in-progress";
		case "-":
			return "cancelled";
		case "x":
			return "done";
		default:
			return "todo";
	}
};
