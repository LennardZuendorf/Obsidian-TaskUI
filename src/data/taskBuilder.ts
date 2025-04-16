import { Task, TaskPriority, TaskStatus, TaskSource } from "./types/tasks";
import { validateTask } from "./utils/validateTask";
import { generateRandomString as newId } from "ts-randomstring/lib";
import { TaskMapper } from "./taskMapper";

export class TaskBuilder {
	private readonly mapper: TaskMapper;
	private partialTask: Partial<Task> = {
		id: newId({ length: 8 }),
		path: "Tasks.md",
		source: TaskSource.OBSIDIAN,
		status: TaskStatus.TODO,
	};

	private constructor(task?: Partial<Task>) {
		if (task) this.partialTask = task;
		this.mapper = new TaskMapper();
	}

	static create(task?: Partial<Task>): TaskBuilder {
		return new TaskBuilder(task);
	}

	/**
	 * Sets the description for the task being built.
	 *
	 * @param description - A string representing the task's description.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setDescription(description: string): TaskBuilder {
		this.partialTask.description = description;
		return this;
	}

	/**
	 * Sets the priority for the task being built.
	 *
	 * @param priority - The priority level of the task, represented by a TaskPriority enum.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setPriority(priority: TaskPriority): TaskBuilder {
		this.partialTask.priority = priority;
		return this;
	}

	/**
	 * Sets the recurrence pattern for the task being built.
	 *
	 * @param recurs - A string representing the recurrence pattern, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setRecurs(recurs: string | null): TaskBuilder {
		this.partialTask.recurs = recurs;
		return this;
	}

	/**
	 * Sets the due date for the task being built.
	 *
	 * @param dueDate - A Date object representing the due date, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setDueDate(dueDate: Date | null): TaskBuilder {
		this.partialTask.dueDate = dueDate;
		return this;
	}

	/**
	 * Sets the creation date for the task being built.
	 *
	 * @param createdDate - A Date object representing when the task was created, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setCreatedDate(createdDate: Date | null): TaskBuilder {
		this.partialTask.createdDate = createdDate;
		return this;
	}

	/**
	 * Sets the scheduled date for the task being built.
	 *
	 * @param scheduledDate - A Date object representing the scheduled date, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setScheduledDate(scheduledDate: Date | null): TaskBuilder {
		this.partialTask.scheduledDate = scheduledDate;
		return this;
	}

	/**
	 * Sets the start date for the task being built.
	 *
	 * @param startDate - A Date object representing the start date, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setStartDate(startDate: Date | null): TaskBuilder {
		this.partialTask.startDate = startDate;
		return this;
	}

	/**
	 * Sets the blocks for the task being built.
	 *
	 * @param blocks - An array of strings representing the blocks associated with the task.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setBlocks(blocks: string[]): TaskBuilder {
		this.partialTask.blocks = blocks;
		return this;
	}

	/**
	 * Sets the status for the task being built.
	 *
	 * @param status - The status of the task, represented by a TaskStatus enum.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setStatus(status: TaskStatus): TaskBuilder {
		this.partialTask.status = status;
		return this;
	}

	/**
	 * Sets the done date for the task being built.
	 *
	 * @param doneDate - A Date object representing the date the task was completed, or null if not applicable.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setDoneDate(doneDate: Date | null): TaskBuilder {
		this.partialTask.doneDate = doneDate;
		return this;
	}

	/**
	 * Sets the path for the task being built.
	 *
	 * @param path - A string representing the file path where the task is stored.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setPath(path: string): TaskBuilder {
		this.partialTask.path = path;
		return this;
	}

	/**
	 * Sets the symbol for the task being built.
	 *
	 * @param symbol - A string representing the symbol associated with the task.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setSymbol(symbol: string): TaskBuilder {
		this.partialTask.symbol = symbol;
		return this;
	}

	/**
	 * Sets the source for the task being built.
	 *
	 * @param source - The source of the task, represented by a TaskSource enum.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setSource(source: TaskSource): TaskBuilder {
		this.partialTask.source = source;
		return this;
	}

	/**
	 * Sets the subtasks for the task being built.
	 *
	 * @param subtasks - An array of Task objects representing the subtasks.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setSubtasks(subtasks: Task[]): TaskBuilder {
		this.partialTask.subtasks = subtasks;
		return this;
	}

	/**
	 * Sets the tags for the task being built.
	 *
	 * @param tags - An array of strings representing the tags associated with the task.
	 * @returns The current instance of TaskBuilder for method chaining.
	 */
	setTags(tags: string[]): TaskBuilder {
		this.partialTask.tags = tags;
		return this;
	}

	/**
	 * Finalizes the task building process by validating the partial task and mapping it to a line description.
	 *
	 * @param partialTask - A partial representation of a task that needs to be validated and finalized.
	 * @returns An object containing:
	 * - `isValid`: A boolean indicating whether the task is valid.
	 * - `message`: A string message providing details about the validation result.
	 * - `task`: An optional Task object if the task is valid.
	 */
	finalize(partialTask: Partial<Task>): {
		isValid: boolean;
		message: string;
		task?: Task;
	} {
		this.partialTask.lineDescription = "";
		const { isValid, message } = validateTask(partialTask);
		if (!isValid) {
			return { isValid, message };
		} else {
			this.partialTask.lineDescription = this.mapper.mapTaskToLineString(
				this.partialTask as Task,
			);
			return { isValid, message, task: this.partialTask as Task };
		}
	}

	/**
	 * Builds and finalizes the task creation process.
	 *
	 * @returns The fully constructed and validated Task object.
	 * @throws An error if the task validation fails, with a message detailing the validation issue.
	 */
	build(): Task {
		const response = this.finalize(this.partialTask);

		if (!response.isValid) {
			throw new Error(`Validation failed: ${response.message}`);
		} else {
			return this.partialTask as Task;
		}
	}
}
