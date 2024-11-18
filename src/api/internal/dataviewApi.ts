import { getAPI, STask, DataviewApi } from "obsidian-dataview";
import { loggerUtil as logger } from "../../utils/loggerUtil";

/**
 * Represents the structure of a task as provided by the Dataview API.
 */
export type { STask as dvTaskType };

/**
 * DataviewApiProvider class provides methods for querying tasks from the Obsidian vault using the Dataview API.
 */
export class DataviewApiProvider {
	private readonly dvApi: DataviewApi;

	/**
	 * Constructs an instance of the Dataview API Provider.
	 * Initializes the Dataview API for interacting with Obsidian's data.
	 *
	 * @throws Will throw an error if the Dataview API is not available.
	 */
	constructor() {
		try {
			const api = getAPI();
			if (!api) {
				throw new Error("Dataview API returned undefined.");
			}
			this.dvApi = api;
		} catch (error) {
			logger.error(error.message);
			throw new Error(error);
		}
	}

	/**
	 * Retrieves tasks from a specific file path.
	 *
	 * @param filePath - The exact file path from which to retrieve tasks.
	 * @returns A promise that resolves to a tasksTransferObject containing the tasks or an error message.
	 */
	public async getTasksFromFile(filePath: string): Promise<STask[] | null> {
		try {
			return await this.dvApi.page(filePath).tasks();
		} catch (error) {
			logger.error(
				`Error fetching tasks from file: ${filePath} - ${error.message}`,
			);
			return null;
		}
	}

	/**
	 * Retrieves all tasks across the entire vault.
	 *
	 * @returns A promise that resolves to a tasksTransferObject containing all tasks or an error message.
	 */
	public async getAllTasks(): Promise<STask[] | null> {
		try {
			return this.dvApi.pages().tasks();
		} catch (error) {
			logger.error(`Error fetching all tasks: ${error.message}`);
			return null;
		}
	}

	/**
	 * Checks if the Dataview API is available.
	 *
	 * @returns A boolean indicating whether the Dataview API is available.
	 */
	public isDataviewApiAvailable(): boolean {
		return !!this.dvApi;
	}
}
