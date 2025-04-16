import { EventEmitter } from "events";
import { Task } from "../data/types/tasks";
import { InternalApiService } from "../api/internalApiService";
import { App } from "obsidian";
import _ from "lodash";
import { storeOperation } from "../data/types/operations";

export class TaskSyncService {
	private eventEmitter = new EventEmitter();
	private internalApiService;
	private localTasks: Task[] = [];

	constructor(app: App, initialTasks?: Task[]) {
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

	private remoteUpdateHandler(remoteTasks: Task[]) {
		if (!_.isEqual(this.localTasks, remoteTasks)) {
			this.localTasks = remoteTasks;
			this.eventEmitter.emit("tasksUpdated", {
				operation: storeOperation.REPLACE,
				tasks: remoteTasks,
			});
		}
	}

	public localUpdateHandler(localUpdates: Task[]) {
		// Handle local updates if needed
	}

	public on(eventName: string, listener: (...args: any[]) => void) {
		this.eventEmitter.on(eventName, listener);
	}

	public emit(eventName: string, ...args: any[]) {
		this.eventEmitter.emit(eventName, ...args);
	}
}
