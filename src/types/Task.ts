// Enum for task sources
export enum TaskSource {
	TasksPlugin = "tasks-plugin",
	ShardsApp = "shards-app",
	Markdown = "markdown",
}

// Task type definition
export type Task = {
	id: string; // Unique identifier for the task
	description: string; // Text input for task description
	priority: "lowest" | "low" | "normal" | "high" | "highest"; // Priority levels
	recurs: string | null; // Recurrence rule, if any (e.g., "every day when done", null if no recurrence)
	dueDate: Date | null; // Date object for the due date (null if no due date)
	scheduledDate: Date | null; // Date object for the scheduled date (null if no scheduled date)
	startDate: Date | null; // Date object for the start date (null if no start date)
	onlyFutureDates: boolean; // Boolean for "Only future dates"
	beforeTasks: string[]; // Array of task IDs or task references that this task is dependent on
	afterTasks: string[]; // Array of task IDs or task references that depend on this task
	status: "todo" | "in-progress" | "done" | "cancelled"; // Status of the task
	createdDate: Date | null; // Date object for when the task was created
	doneDate: Date | null; // Date object for when the task was completed
	cancelledDate: Date | null; // Date object for when the task was cancelled
	path: string; // Path of the task in your notes or system
	symbol: string; // Symbol associated with the task (for visual identification)
	source: TaskSource; // Enum for the task's source
};

// Example task with enum for source
export const exampleTask: Task = {
	id: "1",
	description: "Take out the trash",
	priority: "normal",
	recurs: null,
	dueDate: new Date("2024-10-25"),
	scheduledDate: null,
	startDate: null,
	onlyFutureDates: true,
	beforeTasks: [],
	afterTasks: [],
	status: "todo",
	createdDate: new Date("2024-10-21"),
	doneDate: null,
	cancelledDate: null,
	path: "/tasks/home/chores",
	symbol: "🗑️",
	source: TaskSource.TasksPlugin, // Using enum for source
};
