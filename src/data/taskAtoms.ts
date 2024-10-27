// src/data/taskAtoms.ts
import { atom } from "jotai";
import type { taskType } from "../types/taskType";
import { exampleTask } from "../types/taskType";

// atom to store a single task
export const taskAtom = atom<taskType>(exampleTask);

// atom to store all tasks
export const allTasksAtom = atom<taskType[]>([exampleTask]);

// atoms to store tasks based on source
export const mdTaskAtom = atom((get) => {
	const allTasks: taskType[] = get(allTasksAtom);
	return allTasks.filter((item) => item.source === "obsidian");
});

export const shardsTaskAtom = atom((get) => {
	const allTasks: taskType[] = get(allTasksAtom);
	return allTasks.filter((item) => item.source === "shards-app");
});

// Predefined atoms filtered by status
export const todoTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status === "todo"),
);

export const inProgressTasksAtom = atom((get) =>
	get(allTasksAtom).filter((todo) => todo.status === "in-progress"),
);

export const doneTasksAtom = atom((get) =>
	get(allTasksAtom).filter(
		(todo) => todo.status === "done" || todo.status === "cancelled",
	),
);

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

if (process.env.NODE_ENV !== "production") {
	animeAtom.debugLabel = "anime";
	allTasksAtom.debugLabel = "tasks";
}
