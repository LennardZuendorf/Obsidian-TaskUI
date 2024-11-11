/**
 * Enum for task source, which can be either "obsidian" or "shards-app".
 */
export enum taskSource {
	OBSIDIAN = "obsidian",
	SHARDS_APP = "shards-app",
}

/**
 * Enum for task priority levels. The priority levels are as follows:
 */
export enum taskPriority {
	LOWEST = "lowest",
	LOW = "low",
	NORMAL = "normal",
	MEDIUM = "medium",
	HIGH = "high",
	HIGHEST = "highest",
}

/**
 * Enum for task status. The status can be one of the following:
 */
export enum taskStatus {
	TODO = "todo",
	IN_PROGRESS = "in-progress",
	DONE = "done",
	CANCELLED = "cancelled",
}

/**
 * main taskTypes interface for tasks, used to define the structure of a task object.
 */
export type taskType = {
	id: string; // Unique identifier for the task
	description: string; // Text input for task description
	priority: taskPriority; // Priority levels
	recurs?: string | null; // Recurrence rule, if any (e.g., "every day when done", null if no recurrence)
	dueDate?: Date | null; // Date object for the due date (null if no due date)
	scheduledDate?: Date | null; // Date object for the scheduled date (null if no scheduled date)
	startDate?: Date | null; // Date object for the start date (null if no start date)
	blocks?: string[]; // Array of task IDs or task references that this task is dependent on
	status: taskStatus; // Status of the task
	createdDate: Date | null; // Date object for when the task was created
	doneDate?: Date | null; // Date object for when the task was completed
	path: string; // Path of the task in your notes or system
	symbol?: string; // Symbol associated with the task (for visual identification)
	source: taskSource; // Enum for the task's source
	line?: number; // Line number in the source file
	subtasks?: taskType[]; // Array of subtasks
	lineDescription: string; // Raw description from the source
	tags?: string[]; // Array of tags associated with the task
};

/**
 * Example task object for reference.
 */
export const exampleTask: taskType = {
	id: "1",
	description: "Take out the trash",
	priority: taskPriority.NORMAL,
	recurs: null,
	dueDate: new Date("2024-10-25"),
	scheduledDate: null,
	startDate: null,
	blocks: [],
	status: taskStatus.TODO,
	createdDate: new Date("2024-10-21"),
	doneDate: null,
	path: "/tasks/home/chores",
	symbol: "🗑️",
	source: taskSource.OBSIDIAN, // Using enum for source
	line: 12,
	subtasks: [],
	lineDescription: "Take out the trash",
};
