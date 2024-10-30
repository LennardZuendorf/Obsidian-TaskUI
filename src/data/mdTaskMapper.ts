// src/utils/taskHelpers.ts
import {
	taskPriority,
	taskSource,
	taskStatus,
	taskType,
} from "../types/taskType";
import { dvTaskType } from "../types/dvTaskType";
import short from "short-uuid";
import { parseDate } from "../utils/dataUtils";

export class TaskMapper {
	/**
	 * Maps a taskType object to a string representation for Dataview.
	 * @param task - The taskType object to map.
	 * @returns The string representation of the task for Dataview.
	 */
	public mapTaskTypeToDvTask(task: taskType): string {
		const id = task.id ? `[id:: ${task.id}]` : "";
		const dependsOn =
			task.blocks && task.blocks.length > 0
				? `[dependsOn:: ${task.blocks.join(" ")}]`
				: "";
		const priority = task.priority ? `[priority:: ${task.priority}]` : "";
		const recurs = task.recurs ? `[repeat:: ${task.recurs}]` : "";
		const created = task.createdDate
			? `[created:: ${task.createdDate}]`
			: "";
		const start = task.startDate ? `[start:: ${task.startDate}]` : "";
		const scheduled = task.scheduledDate
			? `[scheduled:: ${task.scheduledDate}]`
			: "";
		const due = task.dueDate ? `[due:: ${task.dueDate}]` : "";
		const completion = task.doneDate
			? `[completion:: ${task.doneDate}]`
			: "";

		const subtaskStrings = task.subtasks
			?.map(this.mapTaskTypeToDvTask)
			.join("\n");

		return `${task.description} ${id} ${dependsOn} ${priority} ${recurs} ${created} ${start} ${scheduled} ${due} ${completion}\n${subtaskStrings}`.trim();
	}

	/**
	 * Maps a dvTaskType object to a taskType object.
	 * @param dvTask - The dvTaskType object to map.
	 * @returns The taskType object.
	 */
	public mapDvTaskToTaskType(dvTask: dvTaskType): taskType {
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

		const subtasks: taskType[] = [];

		return {
			id: idMatch ? idMatch[1] : short.uuid(),
			description: getCleanDescription(dvTask.text),
			priority: priorityMatch
				? this.mapPriorityEnum(priorityMatch[1])
				: taskPriority.NORMAL,
			recurs: recursMatch ? recursMatch[1] : null,
			dueDate: parseDate(dueMatch ? dueMatch[1] : null),
			scheduledDate: parseDate(scheduledMatch ? scheduledMatch[1] : null),
			startDate: parseDate(startMatch ? startMatch[1] : null),
			blocks: dependsOnMatch
				? dependsOnMatch.toString().split(/(\s+)/)
				: [],
			status: this.mapStatusEnum(dvTask.status),
			createdDate: parseDate(createdMatch ? createdMatch[1] : null),
			doneDate: parseDate(completionMatch ? completionMatch[1] : null),
			path: dvTask.path,
			symbol: "",
			source: taskSource.OBSIDIAN,
			line: dvTask.line ? dvTask.line : 0,
			rawDescription: dvTask.text,
			subtasks:
				dvTask.subtasks && dvTask.subtasks.length > 0
					? dvTask.subtasks.map((subtask) =>
							this.mapDvTaskToTaskType(subtask),
						)
					: subtasks,
		};
	}

	/**
	 * Maps a string to a taskStatus enum.
	 * @param statusString - The status string to map.
	 * @returns The taskStatus enum.
	 */
	private mapStatusEnum(statusString: string): taskStatus {
		switch (statusString) {
			case "/":
				return taskStatus.IN_PROGRESS;
			case "-":
				return taskStatus.CANCELLED;
			case "x":
				return taskStatus.DONE;
			default:
				return taskStatus.TODO;
		}
	}

	/**
	 * Maps a string to a taskPriority enum.
	 * @param priorityString - The priority string to map.
	 * @returns The taskPriority enum.
	 */
	private mapPriorityEnum(priorityString: string): taskPriority {
		switch (priorityString) {
			case "high":
				return taskPriority.HIGH;
			case "highest":
				return taskPriority.HIGHEST;
			case "low":
				return taskPriority.LOW;
			case "lowest":
				return taskPriority.LOWEST;
			case "medium":
				return taskPriority.MEDIUM;
			default:
				return taskPriority.NORMAL;
		}
	}
}
