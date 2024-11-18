import { tasksTransferObject, taskTransferObject } from "../data/types/transferObjectTypes";
import { taskType } from "../data/types/taskTypes";

export interface ApiService {
	getTasks(filePath?: string): Promise<tasksTransferObject>;
	createTask(
		task: taskType,
		filePath: string,
		heading: string,
	): Promise<taskTransferObject>;
	editTask(newTask: taskType, oldTask: taskType): Promise<taskTransferObject>;
	deleteTask(task: taskType): Promise<taskTransferObject>;
}
