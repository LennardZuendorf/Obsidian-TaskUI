import { getAPI, STask, DataviewApi, SMarkdownPage } from "obsidian-dataview";
import { logger } from "../../utils/logger";

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
        const api = getAPI();
        if (!api) {
            const errorMessage = "Dataview API returned undefined.";
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this.dvApi = api;
    }

    /**
     * Retrieves tasks from a specific file path.
     *
     * @param filePath - The exact file path from which to retrieve tasks.
     * @returns A promise that resolves to an array of tasks or null if an error occurs.
     */
    public async getTasksFromFile(filePath: string): Promise<STask[] | null> {
        try {
            const page = await this.dvApi.page(filePath);
            return page?.tasks() || [];
        } catch (error) {
            logger.error(`Error fetching tasks from file: ${filePath} - ${error.message}`);
            return null;
        }
    }

    /**
     * Retrieves all tasks across the entire vault.
     *
     * @returns A promise that resolves to an array of all tasks or null if an error occurs.
     */
    public async getAllTasks(): Promise<STask[] | null> {
        const tasks: STask[] = [];

        try {
            this.dvApi.pages().forEach((page: SMarkdownPage) => {
                if (page.file?.tasks) {
                    tasks.push(...page.file.tasks);
                }
            });
        } catch (error) {
            logger.error(`Error fetching all tasks: ${error.message}`);
            return null;
        }

        return tasks;
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
