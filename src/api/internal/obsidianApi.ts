// src/data/providers/ObsidianApiProvider.ts

import { App, TAbstractFile, TFile } from "obsidian";
import { taskType } from "../../data/types/taskTypes";
import { taskTransferObject } from "../../data/types/transferObjectTypes";
import { loggerUtil as logger } from "../../utils/loggerUtil";

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
		} catch (error: any) {
			logger.error(`Error fetching Obsidian API: ${error.message}`);
			throw new Error(`Obsidian API not available: ${error.message}`);
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
			const fileExists = await this.checkFileExists(filePath);

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
						(currentLine) =>
							currentLine.trim() === mdHeading.trim(),
					);

					// If heading can't be found, add the heading at the end
					if (headingIndex === -1) {
						lines.push(mdHeading);
						headingIndex = lines.length - 1;
					}

					// Add the task line after the heading
					lines.splice(headingIndex + 1, 0, mdHeading);
					await this.obsidianApp.vault.modify(file, lines.join("\n"));

					return lineString;
				} catch (error) {
					const errorMsg = `Error fetching file at path: ${filePath}`;
					logger.error(errorMsg);
					return null;
				}
			}
		} catch (error: any) {
			const errorMsg = `Error while trying to add a new task: ${error.message}`;
			logger.error(errorMsg);
			return null;
		}
	}

	/**
	 * Edits an existing task in a markdown file at the specified path.
	 *
	 *
	 * @returns A promise that resolves to a taskTransferObject indicating the success or failure of the operation.
	 * @param newLineString
	 * @param oldLineString
	 * @param path
	 */
	public async editTask(
		newLineString: string,
		oldLineString: string,
		path: string,
	): Promise<string | null> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(path) as TFile;

			if (!file) {
				const errorMsg = `Could not find file at path: ${path}`;
				logger.error(errorMsg);
				return null;
			} else {
				const content = await this.obsidianApp.vault.read(file);
				const lines = content.split("\n");

				let taskLineIndex: number | undefined = lines.findIndex(
					(line) => line.includes(oldLineString),
				);

				if (taskLineIndex === -1 || taskLineIndex === undefined) {
					const errorMsg = `Could not find task line in file: ${path}`;
					logger.error(errorMsg);
					return null;
				}

				lines.splice(taskLineIndex, 1, newLineString);
				await this.obsidianApp.vault.modify(file, lines.join("\n"));

				// Optionally, return the updated task
				return newLineString;
			}
		} catch (error: any) {
			const errorMsg = `Error editing task via Obsidian API: ${error.message}`;
			logger.error(errorMsg);
			return null;
		}
	}

	/**
	 * Deletes a task line string from a markdown file under the given path.
	 *
	 * @param lineString
	 * @param path - The file path from which the task should be deleted.
	 *
	 * @returns A promise that resolves to a taskTransferObject indicating the success or failure of the operation.
	 */
	public async deleteTask(
		lineString: string,
		path: string,
	): Promise<boolean> {
		try {
			const file = this.obsidianApp.vault.getFileByPath(path);

			if (!file) {
				const errorMsg = `Could not find file at path: ${path}`;
				logger.error(errorMsg);
				return false;
			} else {
				const content = await this.obsidianApp.vault.read(file);
				const lines = content.split("\n");

				const taskLineIndex = lines.findIndex((line) =>
					line.includes(lineString),
				);

				if (taskLineIndex === -1) {
					const errorMsg = `Could not find task line: ${lineString} in file: ${path}`;
					logger.error(errorMsg);
					return false;
				}

				lines.splice(taskLineIndex, 1);
				await this.obsidianApp.vault.modify(file, lines.join("\n"));

				// Optionally, return the deleted task's line string
				return true;
			}
		} catch (error: any) {
			const errorMsg = `Error while trying to delete a task: ${error.message}`;
			logger.error(errorMsg);
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
		} catch (error: any) {
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
		} catch (error: any) {
			logger.error(
				`Error while trying to create a file at path: ${path} - ${error.message}`,
			);
			return false;
		}
	}
}
