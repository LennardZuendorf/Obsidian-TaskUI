import { App, TAbstractFile, TFile } from "obsidian";
import { logger } from "../../utils/logger";

/**
 * Helper function for multi-stage line lookup.
 */
function findTaskLineIndex(lines: string[], lineToFind: string): number {
	let taskLineIndex = -1;
	logger.debug(`[findTaskLineIndex] Attempting to find line: "${lineToFind}"`);

	// Attempt 1: Exact match (useful if raw line was passed)
	taskLineIndex = lines.findIndex((line) => line === lineToFind);
	if (taskLineIndex !== -1) {
		logger.debug(
			`[findTaskLineIndex] Found via exact match at index: ${taskLineIndex}`,
		);
		return taskLineIndex; // Found!
	}
	logger.debug(`[findTaskLineIndex] Exact match failed.`);

	// Attempt 2: Regex ID match
	const idMatch = lineToFind.match(/\[id::\s*([\w-]+)\]/);
	if (idMatch && idMatch[1]) {
		const taskId = idMatch[1];
		// Correct escaping for RegExp constructor string
		const idRegex = new RegExp(`\\[id::\\s*${taskId}\\]`);
		taskLineIndex = lines.findIndex((line) => idRegex.test(line));
		if (taskLineIndex !== -1) {
			logger.debug(
				`[findTaskLineIndex] Found via ID match (${taskId}) at index: ${taskLineIndex}`,
			);
			return taskLineIndex; // Found!
		}
		logger.debug(`[findTaskLineIndex] ID match failed for ID: ${taskId}`);
	} else {
		logger.debug(
			`[findTaskLineIndex] ID match failed (no ID found in lineToFind).`,
		);
	}

	// Attempt 3: Full string trimmed match, ignoring leading task markers
	const taskMarkerRegex = /^\s*-\s*\[.?\]\s*/;
	taskLineIndex = lines.findIndex((line) => {
		const cleanLine = line.replace(taskMarkerRegex, "").trim();
		const cleanLineToFind = lineToFind.replace(taskMarkerRegex, "").trim();
		return cleanLine === cleanLineToFind;
	});

	if (taskLineIndex !== -1) {
		logger.debug(
			`[findTaskLineIndex] Found via trimmed match at index: ${taskLineIndex}`,
		);
	} else {
		logger.debug(`[findTaskLineIndex] Trimmed match failed. Line not found.`);
	}

	// Return index (or -1 if not found)
	return taskLineIndex;
}

/**
 * ObsidianApiProvider class provides methods for creating, updating, and deleting tasks via the Obsidian API.
 */
export class ObsidianApiProvider {
	private readonly obsidianApp: App;

	/**
	 * Constructs an instance of the Obsidian API Provider.
	 *
	 * @throws Will throw an error if the Obsidian App is not available.
	 */
	constructor(app: App) {
		try {
			this.obsidianApp = app;
		} catch (error) {
			const errorMsg = `Obsidian App not available: ${error.message}`;
			logger.error(errorMsg);
			throw new Error(errorMsg);
		}
	}

	/**
	 * Adds a task line string to a markdown file under the given path and heading.
	 * If the file does not exist, it will be created with the heading and task line.
	 *
	 * @param lineString
	 * @param filePath
	 * @param mdHeading
	 *
	 * @returns A promise that resolves to a taskTransferObject indicating the success or failure of the operation.
	 */
	public async createTask(
		lineString: string,
		filePath: string,
		mdHeading: string,
	): Promise<string | null> {
		try {
			const fileExists = await this.checkFileExists(filePath.toString());

			if (!fileExists) {
				const initialContent = `${mdHeading}\n${lineString}`;
				const created = await this.createFile(filePath, initialContent);
				if (!created) {
					const errorMsg = `Failed to create file at path: ${filePath}`;
					logger.error(errorMsg);
					return null;
				}
				// Optionally return the created task
				return lineString;
			} else {
				// File exists, proceed to add task line under heading
				try {
					const file = this.obsidianApp.vault.getFileByPath(filePath);

					if (!file) {
						const errorMsg = `Could not find file at path: ${filePath}`;
						logger.error(errorMsg);
						return null;
					}

					const content = await this.obsidianApp.vault.read(file);
					const lines = content.split("\n");
					let headingIndex = lines.findIndex(
						(currentLine) => currentLine.trim() === mdHeading.trim(),
					);

					// If heading can't be found, add the heading at the end
					if (headingIndex === -1) {
						lines.push(mdHeading);
						headingIndex = lines.length - 1;
					}

					// Add the task line after the heading
					lines.splice(headingIndex + 1, 0, lineString);
					await this.obsidianApp.vault.modify(file, lines.join("\n"));

					return lineString;
				} catch (e: unknown) {
					const errorMsg = `Error fetching file at path: ${filePath} with error: ${e instanceof Error ? e.message : String(e)}`;
					logger.error(errorMsg);
					return null;
				}
			}
		} catch (e: unknown) {
			const errorMsg = `Error while trying to add a new task: ${e instanceof Error ? e.message : String(e)}`;
			logger.error(errorMsg);
			return null;
		}
	}

	/**
	 * Edits an existing task line in a markdown file.
	 * @param newLineString The full string for the replacement line.
	 * @param oldLookupString The string used to find the line (raw line preferred, fallback to mapped).
	 * @param path The file path.
	 * @returns The newLineString if successful, null otherwise.
	 */
	public async editTask(
		newLineString: string,
		oldLookupString: string,
		path: string,
	): Promise<string | null> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(path) as TFile;
			if (!file) {
				logger.error(`Could not find file at path: ${path}`);
				return null;
			}

			const content = await this.obsidianApp.vault.read(file);
			const lines = content.split("\n");

			// Use helper for lookup
			const taskLineIndex = findTaskLineIndex(lines, oldLookupString);

			if (taskLineIndex === -1) {
				logger.error(
					`Could not find task line in file: ${path} using string: "${oldLookupString}" (tried exact, regex ID, and trimmed match).`,
				);
				return null;
			}

			logger.debug(
				`Found task line at index ${taskLineIndex} in ${path}. Replacing with: "${newLineString}"`,
			);
			lines.splice(taskLineIndex, 1, newLineString);
			await this.obsidianApp.vault.modify(file, lines.join("\n"));

			return newLineString; // Return the string that was written
		} catch (error) {
			logger.error(`Error editing task via Obsidian API: ${error.message}`);
			return null;
		}
	}

	/**
	 * Deletes a task line string from a markdown file.
	 * @param lineToLookup The string used to find the line to delete.
	 * @param path The file path.
	 * @returns True if successful, false otherwise.
	 */
	public async deleteTask(
		lineToLookup: string,
		path: string,
	): Promise<boolean> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(path);
			if (!file) {
				logger.error(`Could not find file at path: ${path}`);
				return false;
			}

			const content = await this.obsidianApp.vault.read(file);
			const lines = content.split("\n");

			// Use helper for lookup
			const taskLineIndex = findTaskLineIndex(lines, lineToLookup);

			if (taskLineIndex === -1) {
				logger.error(
					`Could not find task line to delete in file: ${path} using string: "${lineToLookup}" (tried exact, regex ID, and trimmed match).`,
				);
				return false;
			}

			logger.debug(
				`Found task line to delete at index ${taskLineIndex} in ${path}.`,
			);
			lines.splice(taskLineIndex, 1);
			await this.obsidianApp.vault.modify(file, lines.join("\n"));

			return true;
		} catch (error) {
			logger.error(`Error while trying to delete a task: ${error.message}`);
			return false;
		}
	}

	/**
	 * Checks if a file exists at the given path.
	 *
	 * @param path - The file path to check.
	 *
	 * @returns A promise that resolves to true if the file exists, false otherwise.
	 */
	private async checkFileExists(path: string): Promise<boolean> {
		try {
			const file = this.obsidianApp.vault.getAbstractFileByPath(path);
			return file instanceof TAbstractFile;
		} catch (error) {
			logger.error(
				`Error checking if file exists at path: ${path} - ${error.message}`,
			);
			return false;
		}
	}

	/**
	 * Creates a new file at the given path with optional content.
	 *
	 * @param path - The file path where the new file should be created.
	 * @param content - Optional content to be added to the new file.
	 *
	 * @returns A promise that resolves to true if the file was successfully created, false otherwise.
	 */
	private async createFile(path: string, content: string): Promise<boolean> {
		try {
			await this.obsidianApp.vault.create(path, content);
			return true;
		} catch (error) {
			logger.error(
				`Error while trying to create a file at path: ${path} with error ${error.message}`,
			);
			return false;
		}
	}

	async updateTaskInFile(filePath: string, task: Task): Promise<void> {
		// ... existing code ...
	}

	async processDataviewQuery(filePath: string): Promise<Task[]> {
		const tasksWithSource: Task[] = [];
		// ... existing code ...
		return tasksWithSource;
	}
}
