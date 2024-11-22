import { tasksObject, taskObject } from "../../data/types/transferObjects";
import { task } from "../../data/types/tasks";

export interface ApiService {
	/**
	 * Retrieves a list of tasks from a specified file.
	 *
	 * @param filePath - The optional path to the file from which to retrieve tasks. If not provided, a default location is used.
	 * @returns A promise that resolves to a tasksObject containing the list of tasks.
	 */
	getTasks(filePath?: string): Promise<tasksObject>;

	/**
	 * Creates a new task in a specified file under a given heading.
	 *
	 * @param task - The task object containing details of the task to be created.
	 * @param filePath - The path to the file where the task should be created.
	 * @param heading - The heading under which the task should be created.
	 * @returns A promise that resolves to a taskObject representing the created task.
	 */
	createTask(
		task: task,
		filePath: string,
		heading: string,
	): Promise<taskObject>;

	/**
	 * Edits an existing task by replacing it with a new task.
	 *
	 * @param newTask - The task object containing the updated details of the task.
	 * @param oldTask - The task object representing the task to be replaced.
	 * @returns A promise that resolves to a taskObject representing the edited task.
	 */
	editTask(newTask: task, oldTask: task): Promise<taskObject>;

	/**
	 * Deletes a specified task.
	 *
	 * @param task - The task object representing the task to be deleted.
	 * @returns A promise that resolves to a taskObject representing the deleted task.
	 */
	deleteTask(task: task): Promise<taskObject>;

	/**
	 * Registers an event listener for a specified event.
	 *
	 * @param event - The name of the event to listen for.
	 * @param callback - The function to be called when the event is emitted, receiving the event data as an argument.
	 */
	on(event: string, callback: (data: any) => void): void;

	/**
	 * Emits a specified event with associated data.
	 *
	 * @param event - The name of the event to emit.
	 * @param data - The data to be passed along with the event.
	 */
	emit(event: string, data: any): void;
}
