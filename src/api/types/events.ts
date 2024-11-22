import { task } from "../../data/types/tasks";

/**
 * Represents the internal API events and their associated data types.
 *
 * @property tasksFetched - An array of task objects that have been fetched.
 *                          This event is triggered when tasks are successfully retrieved.
 */
export type InternalApiEvents = {
	tasksFetched: task[];
};
