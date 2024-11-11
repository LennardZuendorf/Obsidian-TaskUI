import {
	taskPriority,
	taskSource,
	taskStatus,
	taskType,
} from "../types/taskType";
import { dvTaskType } from "../../api/internal/dataviewApi";
import short from "short-uuid";
import { parseDate } from "../../utils/dataUtils";
import { defaultPath } from "../../config/settings";

export class TaskMapper {
	/**
	 * Maps a taskTypes object to a string representation for Dataview.
	 * @param task - The taskTypes object to map.
	 * @returns The string representation of the task for Dataview.
	 */
	public mapTaskToLineString(task: taskType): string {
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
			?.map(this.mapTaskToLineString)
			.join("\n");

		return `${task.description} ${id} ${dependsOn} ${priority} ${recurs} ${created} ${start} ${scheduled} ${due} ${completion}\n${subtaskStrings}`.trim();
	}

	public mapMdToTaskType(lineString: string): taskType {
		const idMatch = lineString.match(/\[id:: ([^\]]+)\]/);
		const dependsOnMatch = lineString.match(/\[dependsOn:: ([^\]]+)\]/);
		const priorityMatch = lineString.match(/\[priority:: ([^\]]+)\]/);
		const recursMatch = lineString.match(/\[repeat:: ([^\]]+)\]/);
		const createdMatch = lineString.match(/\[created:: ([^\]]+)\]/);
		const startMatch = lineString.match(/\[start:: ([^\]]+)\]/);
		const scheduledMatch = lineString.match(/\[scheduled:: ([^\]]+)\]/);
		const dueMatch = lineString.match(/\[due:: ([^\]]+)\]/);
		const completionMatch = lineString.match(/\[completion:: ([^\]]+)\]/);
		const statusMatch = lineString.match(/\[(.*?)\]/)?.toString();
		const cleanDescriptionMatch = lineString
			.split(/\[.*?\]/)
			.join(" ")
			.trim();

		return {
			id: idMatch ? idMatch[1] : short.uuid(),
			description: cleanDescriptionMatch,
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
			status: statusMatch
				? this.mapStatusEnum(statusMatch)
				: taskStatus.IN_PROGRESS,
			createdDate: parseDate(createdMatch ? createdMatch[1] : null),
			doneDate: parseDate(completionMatch ? completionMatch[1] : null),
			path: defaultPath,
			symbol: "",
			source: taskSource.OBSIDIAN,
			lineDescription: lineString,
		};
	}

	/**
	 * Maps a dvTaskType object to a taskTypes object.
	 * @param dvTask - The dvTaskType object to map.
	 * @returns The taskTypes object.
	 */
	public mapDvToTaskType(dvTask: dvTaskType): taskType {
		const subtasks: taskType[] = [];

		// Map the task line string to a taskTypes object.
		const mappedTask = this.mapMdToTaskType(dvTask.text);

		// Enriching the taskTypes object with additional properties from the dvTaskType object.
		mappedTask.status = this.mapStatusEnum(dvTask.status);
		mappedTask.line = dvTask.line ? dvTask.line : 0;
		mappedTask.path = dvTask.path;
		mappedTask.subtasks =
			dvTask.subtasks && dvTask.subtasks.length > 0
				? dvTask.subtasks.map((subtask: dvTaskType) =>
						this.mapDvToTaskType(subtask),
					)
				: subtasks;

		return mappedTask;
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
