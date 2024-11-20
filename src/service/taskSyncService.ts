import { EventEmitter } from "events";
import { taskType } from "../data/types/taskTypes";
import { InternalApiService } from "../api/internalApiService";
import { App } from "obsidian";
import _ from "lodash";

export class TaskSyncService {
	private eventEmitter = new EventEmitter();
	private internalApiService;
	private localTasks: taskType[] = [];

	constructor(app: App, initialTasks: taskType[]) {
		this.internalApiService = new InternalApiService(app);
		this.localTasks = initialTasks;
		this.setupListeners();
	}

	private setupListeners() {
		this.internalApiService.on(
			"tasksFetched",
			this.remoteUpdateHandler.bind(this),
		);
	}

	private remoteUpdateHandler(remoteTasks: taskType[]) {
		const { mergedTasks } = this.mergeTasks(this.localTasks, remoteTasks);

		if (!_.isEqual(this.localTasks, mergedTasks)) {
			this.localTasks = mergedTasks;
			this.eventEmitter.emit("tasksUpdated", mergedTasks);
		}
	}

	private mergeTasks(localTasks: taskType[], remoteTasks: taskType[]) {
		const conflicts: { localTask: taskType; remoteTask: taskType }[] = [];

		const mergedTasks = _.unionBy(
			localTasks,
			remoteTasks,
			(task) => task.id,
		).map((task) => {
			const localTask = _.find(localTasks, { id: task.id });
			const remoteTask = _.find(remoteTasks, { id: task.id });

			if (localTask && remoteTask && !_.isEqual(localTask, remoteTask)) {
				conflicts.push({
					localTask: localTask,
					remoteTask: remoteTask,
				});
				return localTask;
			} else {
				return task;
			}
		});

		return { mergedTasks, conflicts };
	}

	public localUpdateHandler(localUpdates: taskType[]) {}

	public on(eventName: string, listener: (...args: any[]) => void) {
		this.eventEmitter.on(eventName, listener);
	}
}
