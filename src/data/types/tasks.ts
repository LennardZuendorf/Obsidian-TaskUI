import { z } from "zod";

/**
 * Enum for task source, which can be either "obsidian" or "shards-app".
 */
export enum TaskSource {
	OBSIDIAN = "obsidian",
	TODOIST = "todoist",
}

/**
 * Enum for task priority levels. The priority levels are as follows:
 */
export enum TaskPriority {
	LOWEST = "lowest",
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	HIGHEST = "highest",
}

/**
 * Enum for task status. The status can be one of the following:
 */
export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in-progress",
	DONE = "done",
	CANCELLED = "cancelled",
}

/**
 * Zod schema for Task validation
 */
export const TaskSchema: z.ZodType<any> = z.object({
	id: z.string(),
	description: z.string(),
	priority: z.nativeEnum(TaskPriority),
	recurs: z.string().nullable().optional(),
	dueDate: z.date().nullable().optional(),
	scheduledDate: z.date().nullable().optional(),
	startDate: z.date().nullable().optional(),
	blocks: z.array(z.string()).optional(),
	status: z.nativeEnum(TaskStatus),
	createdDate: z.date().nullable().optional(),
	doneDate: z.date().nullable().optional(),
	path: z.string(),
	symbol: z.string().optional(),
	source: z.nativeEnum(TaskSource),
	line: z.number().optional(),
	subtasks: z.lazy((): z.ZodType<any> => z.array(TaskSchema)).optional(),
	lineDescription: z.string(),
	tags: z.array(z.string()).optional(),
});

/**
 * Task type inferred from the Zod schema
 */
export type Task = z.infer<typeof TaskSchema>;

/**
 * Example task object for reference.
 */
export const exampleTask = {
	id: "1",
	description: "Take out the trash",
	priority: TaskPriority.MEDIUM,
	recurs: null,
	dueDate: new Date("2024-10-25"),
	scheduledDate: null,
	startDate: null,
	blocks: [],
	status: TaskStatus.TODO,
	createdDate: new Date("2024-10-21"),
	doneDate: null,
	path: "/tasks/home/chores",
	symbol: "🗑️",
	source: TaskSource.OBSIDIAN,
	line: 12,
	subtasks: [],
	lineDescription: "Take out the trash",
} as const;
