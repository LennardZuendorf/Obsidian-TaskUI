import { atom } from "jotai";
import { exampleTask, taskStatus, taskType } from "./types/taskTypes";

/**
 * The main atom to store all tasks, initialized with an example task. This atom is used to manage the state of all tasks in the application.
 */
export const allTasksAtom = atom<taskType[]>([exampleTask]);

/**
 * Derived atom to filter tasks by source. This atom is used to filter tasks by source and basis for a listener to update the source.
 */
export const mdTaskAtom = atom((get) => {
	const allTasks: taskType[] = get(allTasksAtom);
	return allTasks.filter((item) => item.source === "obsidian");
});
// This is the spot for future atoms bound to external sources like Shards App or other task sources.

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (to do)  and basis for UI updates.
 */
export const todoTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status == taskStatus.TODO),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (in progress) and basis for UI updates.
 */
export const inProgressTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status == taskStatus.IN_PROGRESS),
);

/**
 * Derived atom to filter tasks by priority. This atom is used to filter tasks by status (done/cancelled) and basis for UI updates.
 */
export const doneTasksAtom = atom((get) =>
	get(allTasksAtom).filter(
		(todo) =>
			todo.status == taskStatus.DONE ||
			todo.status == taskStatus.CANCELLED,
	),
);

/**
 * This atom is used as a test atom to store anime data. It is used to demonstrate the use of atoms in the application.
 */
export const animeAtom = atom([
	{
		title: "Ghost in the Shell",
		year: 1995,
		watched: true,
	},
	{
		title: "Serial Experiments Lain",
		year: 1998,
		watched: false,
	},
]);

/**
 * Basic debug labels for atoms in development mode.
 */
if (process.env.NODE_ENV !== "production") {
	animeAtom.debugLabel = "anime";
	allTasksAtom.debugLabel = "tasks";
	mdTaskAtom.debugLabel = "mdTasks";
	todoTasksAtom.debugLabel = "todoTasks";
	inProgressTasksAtom.debugLabel = "inProgressTasks";
	doneTasksAtom.debugLabel = "doneAndCancelledTasks";
}
