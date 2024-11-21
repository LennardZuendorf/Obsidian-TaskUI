import { tasksObject, taskObject } from "../data/types/transferObjectTypes";
import { task } from "../data/types/tasks";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksObject>;
	createTask(
		task: task,
		filePath: string,
		heading: string,
	): Promise<taskObject>;
	editTask(newTask: task, oldTask: task): Promise<taskObject>;
	deleteTask(task: task): Promise<taskObject>;
	on(event: string, callback: (data: any) => void): void;
	emit(event: string, data: any): void;
}
