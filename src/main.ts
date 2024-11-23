import { Plugin, Setting, WorkspaceLeaf } from "obsidian";
import { MainView, VIEW_TYPE_MAIN } from "./MainView";
import { logger } from "./utils/logger";
import { defaultSettings, appSettings } from "./config/settings";
import { AppSettingsTab } from "./config/settings";

export default class ShardsTaskUIPlugin extends Plugin {
	settings: appSettings;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		// @ts-ignore
		await this.loadSettings();

		// Register the Main Tab View
		this.registerView(
			VIEW_TYPE_MAIN,
			(leaf) => new MainView(leaf, this.settings),
		);

		// Add Ribbon Icons to Activate the Views
		this.addRibbonIcon("layout", "Activate Main Tab View", () => {
			this.activateMainTabView();
		});

		this.addSettingTab(new AppSettingsTab(this.app, this));
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_MAIN);
	}

	// Method to activate the Main Tab View
	async activateMainTabView() {
		const { workspace } = this.app;

		logger.info("Shards: Activating Main Tab View");
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MAIN);

		if (leaves.length > 0) {
			leaf = leaves[0];
			await workspace.revealLeaf(leaf);
			logger.info("Shards: Switched to existing main tab leaf.");
		} else {
			leaf = workspace.getLeaf(false);

			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_MAIN,
					active: true,
				});
			}
			logger.info("Shards: Created new main tab leaf.");
		}
	}
}
