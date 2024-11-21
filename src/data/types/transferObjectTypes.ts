import { task } from "./tasks";

/**
 * taskTransferObject interface for task operations, used to define the structure of a task transfer object used calls against the providers.
 * This object contains a single taskTypes object.
 * For error handling, the status field is used to indicate success or failure. If the status is false, an error occurred.
 */
export type taskObject = {
	status: boolean;
	task?: task;
	lineString?: string;
};

/**
 * tasksTransferObject interface for tasks operations, used to define the structure of a tasks transfer object used calls against the providers.
 * This object contains an array of taskTypes objects.
 * For error handling, the status field is used to indicate success or failure. If the status is false, an error occurred.
 */
export type tasksObject = {
	status: boolean;
	tasks?: task[];
};
