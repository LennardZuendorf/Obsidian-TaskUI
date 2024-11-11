import type {taskSource } from "../data/types/taskTypes";
import type { App } from "obsidian";
import { ApiService } from "../api/apiService";

/**
 * This service provides methods to listen for task-related events and handle changes
 * to the task state from both external and internal sources.
 */
export class TaskQueryService {
	private readonly app: App;
	private readonly service: ApiService;

	/**
	 * Constructs an instance of the TaskQueryService.
	 *
	 * @param obsidianApp - The Obsidian application instance required to initialize the service.
	 */
	constructor(obsidianApp: App) {
		this.app = obsidianApp;
		this.service = new ApiService(this.app);
	}

	/**
	 * Sets up a listener for task-related events from a specified source (or all sources).
	 *
	 * @param source - An optional parameter specifying the source of tasks to listen for.
	 *                 If not provided, the listener will be set up for all available sources.
	 *
	 * @returns This function does not return a value.
	 */
	public taskListener(source?: taskSource): void {}

	/**
	 * Handles changes to the internal task state that originate from external sources.
	 * This function is responsible for processing and updating the task state based on
	 * external inputs received through the task listener.
	 *
	 * @remarks
	 * This function is intended to ensure that the internal task state remains consistent
	 * with changes detected from external sources.
	 */
	public externalTaskChangeHandler(): void {}

	/**
	 * Handles changes to the internal task state that are coming from the React app itself.
	 * This function propagates changes to the external data sources via the API service.
	 *
	 * @remarks
	 * This function is intended to synchronize the internal task state with external systems
	 * by utilizing the API service to ensure consistency across different data sources.
	 */
	public internalTaskChangeHandler() {}
}
