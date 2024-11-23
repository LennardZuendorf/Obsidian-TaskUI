import { atom } from "jotai";
import { exampleTask, TaskStatus, Task } from "./types/tasks";

/**
 * The main atom to store all tasks, initialized with an example task. This atom is used to manage the state of all tasks in the application.
 */
export const allTasksAtom = atom<Task[]>([exampleTask]);

/**
 * Derived atom to filter tasks by source. This atom is used to filter tasks by source and basis for a listener to update the source.
 */
export const mdTaskAtom = atom((get) => {
	const allTasks: Task[] = get(allTasksAtom);
	return allTasks.filter((item) => item.source === "obsidian");
});
// This is the spot for future atoms bound to external sources like Shards App or other task sources.

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (to do)  and basis for UI updates.
 */
export const todoTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status == TaskStatus.TODO),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (in progress) and basis for UI updates.
 */
export const inProgressTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status == TaskStatus.IN_PROGRESS),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (done/cancelled) and basis for UI updates.
 */
export const doneTasksAtom = atom((get) =>
	get(allTasksAtom).filter(
		(todo) =>
			todo.status == TaskStatus.DONE ||
			todo.status == TaskStatus.CANCELLED,
	),
);

/**
 * Basic debug labels for atoms in development mode.
 */
if (process.env.NODE_ENV !== "production") {
	allTasksAtom.debugLabel = "tasks";
	mdTaskAtom.debugLabel = "mdTasks";
	todoTasksAtom.debugLabel = "todoTasks";
	inProgressTasksAtom.debugLabel = "inProgressTasks";
	doneTasksAtom.debugLabel = "doneAndCancelledTasks";
}
