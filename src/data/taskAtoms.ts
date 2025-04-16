import { atom } from "jotai";
import { TaskStatus, Task } from "./types/tasks";
import { storeOperation } from "./types/operations";

/**
 * The main atom to store all tasks, initialized with an example task. This atom is used to manage the state of all tasks in the application.
 */
const baseTasksAtom = atom<Task[]>([]);

/**
 * Reset atom to trigger state resets
 */
export const resetStateAtom = atom(null, (get, set) => {
	set(baseTasksAtom, []);
});

/**
 * Derived atom to store all tasks, including the ones from other sources. This atom is used to manage the state of all tasks in the application, including tasks from other sources.
 */
export const changeTasksAtom = atom(
	(get) => get(baseTasksAtom),
	(get, set, change: { operation: storeOperation; tasks: Task[] }) => {
		const tasks = get(baseTasksAtom);
		switch (change.operation) {
			case storeOperation.ADD:
				set(baseTasksAtom, [...tasks, ...change.tasks]);
				break;

			case storeOperation.UPDATE:
				set(
					baseTasksAtom,
					tasks.map((item) => {
						const updatedTask = change.tasks.find(
							(task) => task.id === item.id,
						);
						return updatedTask ? updatedTask : item;
					}),
				);
				break;

			case storeOperation.DELETE:
				set(
					baseTasksAtom,
					tasks.filter(
						(item) =>
							!change.tasks.some((task) => task.id === item.id),
					),
				);
				break;

			case storeOperation.RESET:
				set(baseTasksAtom, []);
				break;

			case storeOperation.REPLACE:
				if (Array.isArray(change.tasks)) {
					set(baseTasksAtom, [...change.tasks]);
				} else {
					set(baseTasksAtom, [change.tasks as Task]);
				}
				break;
		}
	},
);

/**
 * Derived atom to filter tasks by source. This atom is used to filter tasks by source and basis for a listener to update the source.
 */
export const mdTaskAtom = atom((get) => {
	const allTasks: Task[] = get(baseTasksAtom);
	return allTasks.filter((item) => item.source === "obsidian");
});
// This is the spot for future atoms bound to external sources like Shards App or other task sources.

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (to do)  and basis for UI updates.
 */
export const todoTasksAtom = atom((get) =>
	get(baseTasksAtom).filter((todo) => todo.status === TaskStatus.TODO),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (in progress) and basis for UI updates.
 */
export const inProgressTasksAtom = atom((get) =>
	get(baseTasksAtom).filter((todo) => todo.status === TaskStatus.IN_PROGRESS),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (done/cancelled) and basis for UI updates.
 */
export const doneTasksAtom = atom((get) =>
	get(baseTasksAtom).filter(
		(todo) =>
			todo.status === TaskStatus.DONE ||
			todo.status === TaskStatus.CANCELLED,
	),
);

/**
 * Debug atom to expose internal state
 */
export const debugStateAtom = atom((get) => ({
	allTasks: get(baseTasksAtom),
	mdTasks: get(mdTaskAtom),
	todoTasks: get(todoTasksAtom),
	inProgressTasks: get(inProgressTasksAtom),
	doneTasks: get(doneTasksAtom),
}));

/**
 * Basic debug labels for atoms in development mode.
 */
if (process.env.NODE_ENV !== "production") {
	baseTasksAtom.debugLabel = "baseTasksAtom";
	mdTaskAtom.debugLabel = "mdTaskAtom";
	todoTasksAtom.debugLabel = "todoTasksAtom";
	inProgressTasksAtom.debugLabel = "inProgressTasksAtom";
	doneTasksAtom.debugLabel = "doneTasksAtom";
	debugStateAtom.debugLabel = "debugStateAtom";
}
