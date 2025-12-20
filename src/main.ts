import "./styles.css";
import { use } from "@ophidian/core";
import { Plugin, WorkspaceLeaf } from "obsidian";
import { AppSettingsTab } from "./config/settings";
import { MainView, VIEW_TYPE_MAIN } from "./MainView";
import { SettingsService } from "./service/SettingsService";
import { logger } from "./utils/logger";

export default class ShardsPlugin extends Plugin {
	// @ts-expect-error - Ophidian type compatibility issue with Obsidian versions
	use = use.plugin(this);
	settingsService = this.use(SettingsService);

	async onload() {
		// Settings are automatically loaded via SettingsService

		// Register the Main Tab View
		this.registerView(VIEW_TYPE_MAIN, (leaf) => new MainView(leaf, this));

		// Add Ribbon Icons to Activate the Views
		this.addRibbonIcon("file-check", "Open Shards", () => {
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

		logger.trace("Shards: Activating Main Tab View");
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MAIN);

		if (leaves.length > 0) {
			leaf = leaves[0];
			await workspace.revealLeaf(leaf);
			logger.trace("Shards: Switched to existing main tab leaf.");
		} else {
			leaf = workspace.getLeaf(false);

			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_MAIN,
					active: true,
				});
			}
			logger.trace("Shards: Created new main tab leaf.");
		}
	}
}
