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

		return `- [${this.reverseMapStatus(task.status)}] ${task.description} ${id} ${dependsOn} ${priority} ${recurs} ${created} ${start} ${scheduled} ${due} ${completion} ${subtaskStrings ? `\n	${subtaskStrings}` : ""}`;
	}

	public mapMdToTaskType(lineString: string): Task {
		// --- Extract Status ---
		const statusMarkerRegex = /^\s*-\s*\[(.)\]/;
		const statusMarkerMatch = lineString.match(statusMarkerRegex);
		const statusChar = statusMarkerMatch ? statusMarkerMatch[1] : " "; // Default to space if no match

		// --- Extract Description ---
		// Remove status marker and then remove attribute blocks
		const lineWithoutStatus = statusMarkerMatch
			? lineString.substring(statusMarkerMatch[0].length)
			: lineString; // Use original if no status marker found
		const description = lineWithoutStatus
			.replace(new RegExp("\\[([a-zA-Z0-9_-]+)::\\s*[^\\]]+\\]", "g"), "") // Use RegExp constructor
			.trim();

		// --- Extract Attributes ---
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
		// Note: We no longer need the old `statusMatch` regex here

		let taskBase: Partial<Task> | undefined = undefined;

		if (idMatch) {
			const id = idMatch[1];
			taskBase = {
				id: id,
				path: "Tasks.md", // Consider making this dynamic or removing if always set later
				source: TaskSource.OBSIDIAN,
				// status: TaskStatus.TODO, // Status is now set below based on parsed char
			};
		}

		return TaskBuilder.create(taskBase)
			.setDescription(description) // Use the newly extracted description
			.setPriority(
				priorityMatch
					? this.mapPriorityEnum(priorityMatch[1])
					: TaskPriority.MEDIUM,
			)
			.setStatus(this.mapStatusEnum(statusChar)) // Use the character from the specific regex
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
				dependsOnMatch ? dependsOnMatch[1].split("\\s+") : [], // Corrected dependsOn split regex
			)
			.setDoneDate(parseDate(completionMatch ? completionMatch[1] : null))
			.setRawTaskLine(lineString)
			.build();
	}

	/**
	 * Maps a dvTaskType object to a taskTypes object.
	 * @param dvTask - The dvTaskType object to map.
	 * @returns The taskTypes object.
	 */
	public mapDvToTaskType(dvTask: dvTaskType): Task {
		const subtasks: Task[] = [];

		// Map the task line string (description + attributes) to a task object.
		// Note: This call won't correctly parse the status as dvTask.text lacks the prefix.
		const mappedTask = this.mapMdToTaskType(dvTask.text);

		// --- Set reliable data from dvTask ---
		// Set status based on dvTask.status (reliable source)
		mappedTask.status = this.mapStatusEnum(dvTask.status);
		logger.info(
			`DV Status: ${dvTask.status} -> Mapped Status: ${mappedTask.status}`,
		);

		mappedTask.line = dvTask.line ? dvTask.line : 0;
		mappedTask.path = dvTask.path;
		mappedTask.subtasks =
			dvTask.subtasks && dvTask.subtasks.length > 0
				? dvTask.subtasks.map((subtask: dvTaskType) =>
						this.mapDvToTaskType(subtask),
					)
				: subtasks;

		// --- Reconstruct and store the correct raw line ---
		const statusChar = this.reverseMapStatus(mappedTask.status);
		const reconstructedLine = `- [${statusChar}] ${dvTask.text}`;
		mappedTask.rawTaskLine = reconstructedLine;
		logger.info(`Reconstructed rawTaskLine: ${mappedTask.rawTaskLine}`);

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
		return format(date, "yyyy-MM-dd");
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
		// Generate the ideal string based on the newTask data
		const idealNewLineString = this.mapTaskToLineString(newTask);

		// --- Start Merge Logic (based on previous discussion) ---
		const attributeRegex = /\[([a-zA-Z0-9_-]+)::\s*([^\]]+?)\s*\]/g;
		const currentAttributes = new Map<string, string>();
		const updatedKnownAttributes = new Map<string, string>();
		let match;

		// Extract current attributes from originalRawLine
		while ((match = attributeRegex.exec(originalRawLine)) !== null) {
			currentAttributes.set(match[1], match[2]);
		}

		// Extract updated known attributes from idealNewLineString
		attributeRegex.lastIndex = 0; // Reset regex state
		while ((match = attributeRegex.exec(idealNewLineString)) !== null) {
			updatedKnownAttributes.set(match[1], match[2]);
		}

		// Merge - Start with current, overwrite with updated known values
		const finalAttributes = new Map<string, string>(currentAttributes);
		for (const [key, updatedValue] of updatedKnownAttributes.entries()) {
			// Special handling for ID: ensure it's always present from newTask if possible
			if (key === "id" && newTask.id) {
				finalAttributes.set(key, newTask.id);
			} else {
				finalAttributes.set(key, updatedValue);
			}
		}
		// Ensure ID attribute exists if task has an ID, even if it wasn't in ideal string (shouldn't happen often)
		if (newTask.id && !finalAttributes.has("id")) {
			finalAttributes.set("id", newTask.id);
		}

		// Extract base string (checkbox + description) from idealNewLineString
		let baseString = idealNewLineString;
		const firstAttrMatch = idealNewLineString.match(/\[([a-zA-Z0-9_-]+)::/);
		if (firstAttrMatch && firstAttrMatch.index !== undefined) {
			baseString = idealNewLineString
				.substring(0, firstAttrMatch.index)
				.trimEnd();
		} else {
			baseString = idealNewLineString.trimEnd();
		}
		// Handle edge case: Line might just be checkbox if description is empty
		if (!baseString.includes("- [")) {
			const checkboxMatch = originalRawLine.match(
				/^(\s*-\s*\\[.?\\]\\s*)/,
			);
			baseString = checkboxMatch ? checkboxMatch[1].trimEnd() : "- [ ]"; // Default fallback
		}

		// Reconstruct the final line
		let reconstructedLine = baseString;
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
		]; // Define preferred order
		const writtenKeys = new Set<string>();

		for (const key of attributeOrder) {
			if (finalAttributes.has(key)) {
				reconstructedLine += ` [${key}:: ${finalAttributes.get(key)}]`;
				writtenKeys.add(key);
			}
		}

		for (const [key, value] of finalAttributes.entries()) {
			if (!writtenKeys.has(key)) {
				reconstructedLine += ` [${key}:: ${value}]`; // Append unknown/other attributes
			}
		}
		// --- End Merge Logic ---

		return reconstructedLine.trim(); // Trim final result just in case
	}
}
