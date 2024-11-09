// src/api/pluginApiProvider.ts
import { getAPI } from "obsidian-dataview";
import { loggerUtil } from "../utils/loggerUtil";

export class DataviewApiProvider {
	/**
	 * Fetches the Dataview API via the Obsidian App.
	 * @returns The Dataview API.
	 */
	public getDvApi() {
		try {
			return getAPI();
		} catch (error) {
			loggerUtil.error("Error fetching dataview API: " + error.message);
			return null;
		}
	}

	private getTasks() {}

	private getTask(path: string) {}

	private listenForTaskChanges() {}
}
