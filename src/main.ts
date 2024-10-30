// Description: Main Plugin File for the Obsidian Plugin
import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { MainView, VIEW_TYPE_MAIN } from "./MainView";
import { logger } from "./utils/logger";
import { pluginChecker } from "./utils/pluginChecker";

export default class ShardsTaskUIPlugin extends Plugin {
	async onload() {
		// Register the Main Tab View
		this.registerView(VIEW_TYPE_MAIN, (leaf) => new MainView(leaf));

		// Add Ribbon Icons to Activate the Views
		this.addRibbonIcon("layout", "Activate Main Tab View", () => {
			this.activateMainTabView();
		});
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_MAIN);
	}

	// Method to activate the Main Tab View
	async activateMainTabView() {
		const { workspace } = this.app;
		const requiredPluginIds = ["obsidian-tasks-plugin", "dataview"];

		logger.info("Shards: Activating Main Tab View");
		const { allPluginsEnabled, missingPlugins } =
			pluginChecker(requiredPluginIds);

		if (allPluginsEnabled) {
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
		} else {
			new Notice(
				`The following required plugins are missing or not enabled: ${missingPlugins.join(", ")}\n\nYou won't be able to use Shards without it!`,
			);
			logger.warn(
				"Shards: Some required plugins are missing or not enabled.",
			);
		}
	}
}
