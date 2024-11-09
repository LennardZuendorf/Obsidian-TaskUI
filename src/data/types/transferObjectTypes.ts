import { taskType } from "./taskType";

/**
 * taskTransferObject interface for task operations, used to define the structure of a task transfer object used calls against the providers.
 * This object contains a single taskType object.
 * For error handling, the status field is used to indicate success or failure. If the status is false, an error occurred.
 */
export type taskTransferObject = {
	status: boolean;
	task?: taskType;
	lineString?: string;
};

/**
 * tasksTransferObject interface for tasks operations, used to define the structure of a tasks transfer object used calls against the providers.
 * This object contains an array of taskType objects.
 * For error handling, the status field is used to indicate success or failure. If the status is false, an error occurred.
 */
export type tasksTransferObject = {
	status: boolean;
	tasks?: taskType[];
};
