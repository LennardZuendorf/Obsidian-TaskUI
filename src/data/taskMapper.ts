import { format } from "date-fns";
import { logger } from "src/utils/logger";
import { dvTaskType } from "../api/internalApi/dataviewApi";
import { defaultSettings } from "../config/settings";
import { TaskBuilder } from "./taskBuilder";
import { Task, TaskPriority, TaskSource, TaskStatus } from "./types/tasks";
import { parseDate } from "./utils/parseDate";

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
		const start = task.startDate
			? `[start:: ${this.formatDate(task.startDate)}]`
			: "";
		const scheduled = task.scheduledDate
			? `[scheduled:: ${this.formatDate(task.scheduledDate)}]`
			: "";
		const due = task.dueDate
			? `[due:: ${this.formatDate(task.dueDate)}]`
			: "";
		const completion = task.doneDate
			? `[completion:: ${this.formatDate(task.doneDate)}]`
			: "";
		const tagsString =
			task.tags && task.tags.length > 0 ? task.tags.join(" ") : "";
		const subtaskStrings = task.subtasks
			? task.subtasks
					?.map((sub) => this.mapTaskToLineString(sub))
					.join("\n\t")
			: "";

		return `- [${this.reverseMapStatus(task.status)}] ${task.description}${tagsString ? " " + tagsString : ""} ${id} ${dependsOn} ${priority} ${recurs} ${created} ${start} ${scheduled} ${due} ${completion}${subtaskStrings ? `\n\t${subtaskStrings}` : ""}`
			.replace(/\s+/g, " ")
			.trim();
	}

	public mapMdToTaskType(lineString: string): Task {
		// --- Extract Status ---
		const statusMarkerRegex = /^\s*-\s*\[(.)\]/;
		const statusMarkerMatch = lineString.match(statusMarkerRegex);
		const statusChar = statusMarkerMatch ? statusMarkerMatch[1] : " ";

		// --- Extract Description, Tags, and Attributes ---
		const lineWithoutStatus = statusMarkerMatch
			? lineString.substring(statusMarkerMatch[0].length).trim()
			: lineString.trim();

		// Regex to find tags (# followed by non-whitespace)
		const tagRegex = /(?:^|\s)(#\S+)/g;
		const tags: string[] = [];
		let lineWithoutTags = lineWithoutStatus;
		let tagMatch;
		while ((tagMatch = tagRegex.exec(lineWithoutStatus)) !== null) {
			// Store the full tag including '#' e.g., "#test"
			tags.push(tagMatch[1]);
			// Replace the matched tag (including potential leading space) with a single space
			lineWithoutTags = lineWithoutTags.replace(tagMatch[0], " ");
		}
		lineWithoutTags = lineWithoutTags.trim(); // Clean up spaces

		// Extract description from the remaining string (after tags and attributes removed)
		const attributeBlockRegex = new RegExp(
			"\\[([a-zA-Z0-9_-]+)::\\s*[^\\]]+\\]", // Corrected regex escaping
			"g",
		);
		const description = lineWithoutTags
			.replace(attributeBlockRegex, "")
			.trim();

		// --- Extract Attributes (from original lineString, includes tags if they were there) ---
		const idMatch = lineString.match("\\[id:: ([^\\]]+)\\]");
		const dependsOnMatch = lineString.match("\\[dependsOn:: ([^\\]]+)\\]");
		const priorityMatch = lineString.match("\\[priority:: ([^\\]]+)\\]");
		const recursMatch = lineString.match("\\[repeat:: ([^\\]]+)\\]");
		const createdMatch = lineString.match("\\[created:: ([^\\]]+)\\]");
		const startMatch = lineString.match("\\[start:: ([^\\]]+)\\]");
		const scheduledMatch = lineString.match("\\[scheduled:: ([^\\]]+)\\]");
		const dueMatch = lineString.match("\\[due:: ([^\\]]+)\\]");
		const completionMatch = lineString.match(
			"\\[completion:: ([^\\]]+)\\]",
		);

		let taskBase: Partial<Task> | undefined = undefined;

		if (idMatch) {
			const id = idMatch[1];
			taskBase = {
				id: id,
				path: "Tasks.md",
				source: TaskSource.OBSIDIAN,
			};
		}

		return TaskBuilder.create(taskBase)
			.setDescription(description) // Use cleaned description
			.setPriority(
				priorityMatch
					? this.mapPriorityEnum(priorityMatch[1])
					: TaskPriority.MEDIUM,
			)
			.setStatus(this.mapStatusEnum(statusChar))
			.setPath(defaultSettings.defaultPath)
			.setSource(TaskSource.OBSIDIAN)
			.setRecurs(recursMatch ? recursMatch[1] : null)
			.setCreatedDate(parseDate(createdMatch ? createdMatch[1] : null))
			.setDueDate(parseDate(dueMatch ? dueMatch[1] : null))
			.setScheduledDate(
				parseDate(scheduledMatch ? scheduledMatch[1] : null),
			)
			.setStartDate(parseDate(startMatch ? startMatch[1] : null))
			.setBlocks(dependsOnMatch ? dependsOnMatch[1].split(" ") : []) // Simplified split
			.setDoneDate(parseDate(completionMatch ? completionMatch[1] : null))
			.setTags(tags) // Set extracted tags (now including '#')
			.build();
	}

	/**
	 * Maps a dvTaskType object to a taskTypes object.
	 * @param dvTask - The dvTaskType object to map.
	 * @returns The taskTypes object.
	 */
	public mapDvToTaskType(dvTask: dvTaskType): Task {
		// Map the Dataview task text (description + inline fields/tags) to a Task object
		const mappedTask = this.mapMdToTaskType(dvTask.text);

		// --- Override/Set reliable data from dvTask properties ---
		mappedTask.status = this.mapStatusEnum(dvTask.status);
		mappedTask.path = dvTask.path;

		// Combine tags: ensure all tags start with '#'
		const dvTags =
			dvTask.tags?.map((t: string) =>
				t.startsWith("#") ? t : `#${t}`,
			) || [];
		const textTags = mappedTask.tags || []; // Already have '#' from mapMdToTaskType
		const combinedTags = Array.from(new Set([...textTags, ...dvTags]));
		mappedTask.tags = combinedTags;

		// Map subtasks recursively
		mappedTask.subtasks =
			dvTask.subtasks && dvTask.subtasks.length > 0
				? dvTask.subtasks.map((subtask: dvTaskType) =>
						this.mapDvToTaskType(subtask),
					)
				: [];

		// --- Reconstruct and store the correct raw line ---
		const statusChar = this.reverseMapStatus(mappedTask.status);
		// Use the text from dvTask as it contains inline fields correctly parsed by dataview
		const reconstructedLine = `- [${statusChar}] ${dvTask.text}`;
		mappedTask.rawTaskLine = reconstructedLine;
		logger.debug(`DV Mapped Task (final): ${JSON.stringify(mappedTask)}`);

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

	private formatDate(date: Date | null): string | null {
		return date ? format(date, "yyyy-MM-dd") : null;
	}

	/**
	 * Merges the data from a Task object onto an existing raw line string,
	 * preserving unknown attributes from the raw line.
	 * @param newTask The task object with the desired updated data.
	 * @param originalRawLine The original, unmodified line string from the file (MUST exist).
	 * @returns The reconstructed line string with updates merged.
	 */
	public mergeTaskOntoRawLine(
		newTask: Task,
		originalRawLine: string,
	): string {
		// --- Extract components from originalRawLine ---
		const statusMarkerRegex = /^\s*-\s*\[(.)\]\s*/;
		const statusMarkerMatch = originalRawLine.match(statusMarkerRegex);
		const lineWithoutStatus = statusMarkerMatch
			? originalRawLine.substring(statusMarkerMatch[0].length)
			: originalRawLine;

		const attributeRegex = /\s*\[([a-zA-Z0-9_-]+)::\s*([^\\]]+?)\s*\]/g;
		const originalAttributes = new Map<string, string>();
		let lineWithoutAttrsOrStatus = lineWithoutStatus;
		let attrMatch;
		while (
			(attrMatch = attributeRegex.exec(lineWithoutAttrsOrStatus)) !== null
		) {
			originalAttributes.set(attrMatch[1], attrMatch[2]);
			lineWithoutAttrsOrStatus = lineWithoutAttrsOrStatus.replace(
				attrMatch[0],
				"",
			);
		}
		lineWithoutAttrsOrStatus = lineWithoutAttrsOrStatus.trim();

		// --- Get desired components from newTask ---
		const newStatusChar = this.reverseMapStatus(newTask.status);
		const newDescription = newTask.description;
		const newTagsString =
			newTask.tags && newTask.tags.length > 0
				? " " + newTask.tags.join(" ")
				: "";

		// --- Directly build the map of attributes from newTask ---
		const newAttributes = new Map<string, string>();
		if (newTask.id) newAttributes.set("id", newTask.id);
		if (newTask.priority) newAttributes.set("priority", newTask.priority);
		if (newTask.dueDate) {
			const formatted = this.formatDate(newTask.dueDate);
			if (formatted) newAttributes.set("due", formatted);
		}
		if (newTask.scheduledDate) {
			const formatted = this.formatDate(newTask.scheduledDate);
			if (formatted) newAttributes.set("scheduled", formatted);
		}
		if (newTask.startDate) {
			const formatted = this.formatDate(newTask.startDate);
			if (formatted) newAttributes.set("start", formatted);
		}
		if (newTask.createdDate) {
			const formatted = this.formatDate(newTask.createdDate);
			if (formatted) newAttributes.set("created", formatted);
		}
		if (newTask.doneDate) {
			const formatted = this.formatDate(newTask.doneDate);
			if (formatted) newAttributes.set("completion", formatted); // Use 'completion' key
		}
		if (newTask.recurs) newAttributes.set("repeat", newTask.recurs);
		if (newTask.blocks && newTask.blocks.length > 0) {
			newAttributes.set("dependsOn", newTask.blocks.join(" "));
		}
		// Note: We intentionally don't add attributes if their value in newTask is null/undefined

		// --- Merge attributes: newAttributes override originalAttributes ---
		const finalAttributes = new Map<string, string>(originalAttributes);
		for (const [key, updatedValue] of newAttributes.entries()) {
			finalAttributes.set(key, updatedValue);
		}
		// Remove attributes if the corresponding newTask property is explicitly null/undefined
		if (newTask.dueDate === null && finalAttributes.has("due"))
			finalAttributes.delete("due");
		if (newTask.scheduledDate === null && finalAttributes.has("scheduled"))
			finalAttributes.delete("scheduled");
		if (newTask.startDate === null && finalAttributes.has("start"))
			finalAttributes.delete("start");
		// createdDate usually shouldn't be nullified
		if (newTask.doneDate === null && finalAttributes.has("completion"))
			finalAttributes.delete("completion");
		if (newTask.recurs === null && finalAttributes.has("repeat"))
			finalAttributes.delete("repeat");
		if (newTask.blocks === null && finalAttributes.has("dependsOn"))
			finalAttributes.delete("dependsOn");

		// --- Reconstruct the final line --- (Description + Tags + Attributes)
		let reconstructedLine = `- [${newStatusChar}] ${newDescription}${newTagsString}`;

		const attributeOrder = [
			"id",
			"priority",
			"due",
			"scheduled",
			"start",
			"created",
			"done",
			"repeat",
			"dependsOn",
		];
		const writtenKeys = new Set<string>();
		for (const key of attributeOrder) {
			if (finalAttributes.has(key)) {
				reconstructedLine += ` [${key}:: ${finalAttributes.get(key)}]`;
				writtenKeys.add(key);
			}
		}
		for (const [key, value] of finalAttributes.entries()) {
			if (!writtenKeys.has(key)) {
				reconstructedLine += ` [${key}:: ${value}]`;
			}
		}

		return reconstructedLine.trim();
	}
}
