import { getAPI, STask } from "obsidian-dataview";
import { loggerUtil } from "../../utils/loggerUtil";

import type { STask as dvTaskType, DataviewApi } from "obsidian-dataview";

export type { dvTaskType };

/**
 * DataviewApiProvider class provides methods for interacting with the Dataview API, this includes the ability to get multiple tasks from a path.
 */
export class DataviewApiProvider {
	private readonly dvApi: DataviewApi;

	/**
	 * Constructs an instance of the Dataview API Provider.
	 * Initializes the Dataview API for interacting with Obsidian's data.
	 *
	 * @throws Will throw an error if the Dataview API or Obsidian App is not available.
	 */
	constructor() {
		try {
			this.dvApi = getAPI();
		} catch (error) {
			loggerUtil.error("Error fetching dataview API: " + error.message);
			throw new Error("Dataview API not available");
		}
	}

	/**
	 * Retrieves all tasks from the Dataview API for a specified path.
	 *
	 * @param path - The path to the file from which to retrieve tasks.
	 *               If an empty string is provided, tasks from all files are retrieved.
	 * @returns A promise that resolves to an array of `STask` objects if successful,
	 *          or `null` if an error occurs during retrieval.
	 */
	public async getTasks(path = ""): Promise<STask[] | null> {
		try {
			return this.dvApi.pages(path).file.tasks;
		} catch (error) {
			loggerUtil.error("Error fetching tasks: " + error.message);
			return null;
		}
	}
}
