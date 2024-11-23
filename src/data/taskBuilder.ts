import { Task, TaskPriority, TaskStatus, TaskSource } from "./types/tasks";

export class TaskBuilder {
	private readonly task: Task;

	constructor(existingTask?: Task) {
		this.task = existingTask || {
			id: this.generateId(),
			description: "",
			priority: TaskPriority.MEDIUM,
			recurs: null,
			dueDate: null,
			scheduledDate: null,
			startDate: null,
			blocks: [],
			status: TaskStatus.TODO,
			createdDate: new Date(),
			doneDate: null,
			path: "",
			symbol: "",
			source: TaskSource.OBSIDIAN,
			line: 0,
			subtasks: [],
			lineDescription: "",
			tags: [],
		};
	}

	private generateId(): string {
		return Math.random().toString(36).substr(2, 9);
	}

	setDescription(description: string): TaskBuilder {
		this.task.description = description;
		return this;
	}

	setPriority(priority: TaskPriority): TaskBuilder {
		this.task.priority = priority;
		return this;
	}

	setStatus(status: TaskStatus): TaskBuilder {
		this.task.status = status;
		return this;
	}

	setDueDate(dueDate: Date): TaskBuilder {
		this.task.dueDate = dueDate;
		return this;
	}

	// Add more setter methods as needed

	build(): Task {
		return this.task;
	}
}
