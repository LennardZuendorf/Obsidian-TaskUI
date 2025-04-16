import { TaskPriority, TaskSource, TaskStatus, Task } from "./types/tasks";
import { dvTaskType } from "../api/internalApi/dataviewApi";
import { parseDate } from "./utils/parseDate";
import { defaultSettings } from "../config/settings";
import { TaskBuilder } from "./taskBuilder";
import { format } from "date-fns";

export class TaskMapper {
	/**
	 * Maps a taskTypes object to a string representation for Obsidian.
	 * @param task - The taskTypes object to map.
	 * @returns The string representation of the task for Dataview.
	 */
	public mapTaskToLineString(task: Task): string {
		const id = task.id ? `[id:: ${task.id}]` : "";
		const dependsOn =
			task.blocks && task.blocks.length > 0
				? `[dependsOn:: ${task.blocks.join(" ")}]`
				: "";
		const priority = task.priority ? `[priority:: ${task.priority}]` : "";
		const recurs = task.recurs ? `[repeat:: ${task.recurs}]` : "";
		const created = task.createdDate
			? `[created:: ${this.formatDate(task.createdDate)}]`
			: "";
		const start = task.startDate ? `[start:: ${task.startDate}]` : "";
		const scheduled = task.scheduledDate
			? `[scheduled:: ${this.formatDate(task.scheduledDate)}]`
			: "";
		const due = task.dueDate
			? `[due:: ${this.formatDate(task.dueDate)}]`
			: "";
		const completion = task.doneDate
			? `[completion:: ${this.formatDate(task.doneDate)}]`
			: "";

		const subtaskStrings = task.subtasks
			? task.subtasks?.map(this.mapTaskToLineString).join("\n	")
			: "";

		const status = this.mapStatusEnum(task.status);

		return `- [${this.reverseMapStatus(status)}] ${task.description} ${id} ${dependsOn} ${priority} ${recurs} ${created} ${start} ${scheduled} ${due} ${completion} ${subtaskStrings ? `\n	${subtaskStrings}` : ""}`;
	}

	public mapMdToTaskType(lineString: string): Task {
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

		let taskBase: Partial<Task> | undefined = undefined;

		if (idMatch) {
			const id = idMatch[1];
			taskBase = {
				id: id,
				path: "Tasks.md",
				source: TaskSource.OBSIDIAN,
				status: TaskStatus.TODO,
			};
		}

		return TaskBuilder.create(taskBase)
			.setDescription(cleanDescriptionMatch)
			.setPriority(
				priorityMatch
					? this.mapPriorityEnum(priorityMatch[1])
					: TaskPriority.MEDIUM,
			)
			.setStatus(
				statusMatch
					? this.mapStatusEnum(statusMatch)
					: TaskStatus.IN_PROGRESS,
			)
			.setPath(defaultSettings.defaultPath)
			.setSource(TaskSource.OBSIDIAN)
			.setRecurs(recursMatch ? recursMatch[1] : null)
			.setCreatedDate(parseDate(createdMatch ? createdMatch[1] : null))
			.setDueDate(parseDate(dueMatch ? dueMatch[1] : null))
			.setScheduledDate(
				parseDate(scheduledMatch ? scheduledMatch[1] : null),
			)
			.setStartDate(parseDate(startMatch ? startMatch[1] : null))
			.setBlocks(
				dependsOnMatch ? dependsOnMatch.toString().split(/(\s+)/) : [],
			)
			.setDoneDate(parseDate(completionMatch ? completionMatch[1] : null))
			.build();
	}

	/**
	 * Maps a dvTaskType object to a taskTypes object.
	 * @param dvTask - The dvTaskType object to map.
	 * @returns The taskTypes object.
	 */
	public mapDvToTaskType(dvTask: dvTaskType): Task {
		const subtasks: Task[] = [];

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
	private mapStatusEnum(statusString: string): TaskStatus {
		switch (statusString) {
			case "/":
				return TaskStatus.IN_PROGRESS;
			case "-":
				return TaskStatus.CANCELLED;
			case "x":
				return TaskStatus.DONE;
			default:
				return TaskStatus.TODO;
		}
	}

	/**
	 * Maps a string to a taskPriority enum.
	 * @param priorityString - The priority string to map.
	 * @returns The taskPriority enum.
	 */
	private mapPriorityEnum(priorityString: string): TaskPriority {
		switch (priorityString) {
			case "high":
				return TaskPriority.HIGH;
			case "highest":
				return TaskPriority.HIGHEST;
			case "low":
				return TaskPriority.LOW;
			case "lowest":
				return TaskPriority.LOWEST;
			case "medium":
				return TaskPriority.MEDIUM;
			default:
				return TaskPriority.MEDIUM;
		}
	}

	private reverseMapStatus(taskStatus: TaskStatus): string {
		switch (taskStatus) {
			case TaskStatus.IN_PROGRESS:
				return "/";
			case TaskStatus.CANCELLED:
				return "-";
			case TaskStatus.DONE:
				return "x";
			default:
				return " ";
		}
	}

	private formatDate(date: Date): string {
		return format(date, "yyyy-mm-dd");
	}
}
