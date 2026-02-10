import { z } from "zod";

/**
 * Enum for task source, which can be either "obsidian" or "taskui".
 */
export enum TaskSource {
	OBSIDIAN = "obsidian",
	TASKUI = "taskui",
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

// Base schema without recursion
const BaseTaskSchema = z.object({
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
	path: z.string().optional(),
	symbol: z.string().optional(),
	source: z.nativeEnum(TaskSource),
	tags: z.array(z.string()).optional(),
	rawTaskLine: z.string(),
});

// Define the recursive Task type using an interface
export interface Task extends z.infer<typeof BaseTaskSchema> {
	subtasks?: Task[];
}

/**
 * Zod schema for Task validation, including recursion
 * Explicit type annotation is needed for recursion
 */
export const TaskSchema: z.ZodType<Task> = BaseTaskSchema.extend({
	subtasks: z.lazy(() => z.array(TaskSchema)).optional(),
});

/**
 * Task metadata for sync state tracking
 */
export interface TaskMetadata {
	lastUpdated?: number;
	lastSynced?: number;
	needsSync?: boolean;
	toBeSyncedAction?: TaskSyncAction;
	previousVersion?: Task; // Use Task interface
	isEditing?: boolean; // Flag to indicate if the task is being edited in the UI
	retryCount?: number;
	syncFailed?: boolean;
	errorMessage?: string;
}

/**
 * Task with its metadata for internal state management
 */
export interface TaskWithMetadata {
	task: Task; // Use Task interface
	metadata: TaskMetadata;
}

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
	subtasks: [], // Example doesn't need recursion here
	rawTaskLine: "- [ ] Take out the trash",
} as const;

export type TaskSyncAction = "add" | "edit" | "delete" | null;
