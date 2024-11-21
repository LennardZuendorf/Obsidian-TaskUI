import { EventEmitter } from "events";
import { task } from "../data/types/tasks";
import { InternalApiService } from "../api/internalApiService";
import { App } from "obsidian";
import _ from "lodash";

export class TaskSyncService {
	private eventEmitter = new EventEmitter();
	private internalApiService;
	private localTasks: task[] = [];

	constructor(app: App, initialTasks?: task[]) {
		this.internalApiService = new InternalApiService(app);
		if (initialTasks) this.localTasks = initialTasks;
		this.setupListeners();
	}

	private setupListeners() {
		this.internalApiService.on(
			"tasksFetched",
			this.remoteUpdateHandler.bind(this),
		);
	}

	private remoteUpdateHandler(remoteTasks: task[]) {
		const { mergedTasks } = this.mergeTasks(this.localTasks, remoteTasks);

		if (!_.isEqual(this.localTasks, mergedTasks)) {
			this.localTasks = mergedTasks;
			this.eventEmitter.emit("tasksUpdated", mergedTasks);
		}
	}

	private mergeTasks(localTasks: task[], remoteTasks: task[]) {
		const conflicts: { localTask: task; remoteTask: task }[] = [];

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

	public localUpdateHandler(localUpdates: task[]) {}

	public on(eventName: string, listener: (...args: any[]) => void) {
		this.eventEmitter.on(eventName, listener);
	}
}
