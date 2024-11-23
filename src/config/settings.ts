import React from "react";
import { SettingsService } from "@ophidian/core";
import { App, PluginSettingTab, Setting } from "obsidian";

export type appSettings = {
	defaultPath: string;
	defaultHeading: string;
	todoistApiKey?: string;
};

export const defaultSettings: appSettings = {
	defaultPath: "Tasks.md",
	defaultHeading: "# Tasks",
};

export class AppSettingsTab extends PluginSettingTab {
	plugin: any;

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		// Clear previous elements
		containerEl.empty();

		// Add a header
		containerEl.createEl("h2", { text: "TaskUI Plugin Settings" });

		// Default Path Setting
		new Setting(containerEl)
			.setName("Default Path")
			.setDesc("Set the default path where items will be saved.")
			.addText((text) =>
				text
					.setPlaceholder("/default/path")
					.setValue(this.plugin.settings.defaultPath)
					.onChange(async (value) => {
						this.plugin.settings.defaultPath = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		// Default Heading Setting
		new Setting(containerEl)
			.setName("Default Heading")
			.setDesc("Set the default heading to use.")
			.addText((text) =>
				text
					.setPlaceholder("My Default Heading")
					.setValue(this.plugin.settings.defaultHeading)
					.onChange(async (value) => {
						this.plugin.settings.defaultHeading = value.trim();
						await this.plugin.saveSettings();
					}),
			);
	}
}

import { useContext, createContext } from "react";

/**
 * Context to provide the Obsidian App to all components. This is necessary so the obsidian API can be used in the components easily.
 */
export const SettingsContext = createContext<appSettings | undefined>(
	undefined,
);

/**
 * Hook to get the Obsidian App from the context.
 * @returns The Obsidian App
 */
export const useSettings = (): appSettings | undefined => {
	return useContext(SettingsContext);
};
