import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { MainView, VIEW_TYPE_MAIN } from "./MainView";
import { loggerUtil } from "./utils/loggerUtil";
import { checkRequiredPlugins } from "./utils/pluginCheckUtil";

/**
 * Main Plugin Class of the Shards Task UI Plugin
 * As defined by obsidian, this extends the generic Plugin class from obsidian.
 * This class is the entry point of the config.
 * @extends Plugin from "obsidian"
 */
export default class ShardsTaskUIPlugin extends Plugin {
	/**
	 * Initializes the plugin when it's loaded by Obsidian.
	 * This method registers the main view and adds a ribbon icon to activate it.
	 *
	 * @remarks
	 * This method is called automatically by Obsidian when the plugin is loaded.
	 * It sets up the necessary components for the plugin to function within the Obsidian environment.
	 *
	 * @returns {Promise<void>} A promise that resolves when the plugin has finished loading.
	 */
	async onload(): Promise<void> {
		// Register the Main Tab View
		this.registerView(VIEW_TYPE_MAIN, (leaf) => new MainView(leaf));

		// Add Ribbon Icons to Activate the Views
		this.addRibbonIcon("layout", "Activate Main Tab View", () => {
			this.activateMainTabView();
		});
	}

	/**
	 * Detaches the Main Tab View from the Obsidian workspace.
	 * This function is called when the plugin is unloaded.
	 * @returns {Promise<void>} A promise that resolves when the Main Tab View is detached.
	 */
	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_MAIN);
	}

	/**
	 * Activates the Main Tab View in the Obsidian workspace.
	 * This function checks for required plugins, creates or reveals the Main Tab View,
	 * and provides notifications for missing required or optional plugins.
	 * @returns {Promise<void>} A promise that resolves when the Main Tab View is activated or appropriate notifications are shown.
	 */
	async activateMainTabView(): Promise<void> {
		const { workspace } = this.app;
		const requiredPluginIds = ["obsidian-tasks-config", "dataview"];

		const {
			requiredPluginsEnabled,
			optionalPluginsEnabled,
			missingRequiredPlugins,
			missingOptionalPlugins,
		} = checkRequiredPlugins(requiredPluginIds);

		if (requiredPluginsEnabled) {
			let leaf: WorkspaceLeaf | null = null;
			const leaves = workspace.getLeavesOfType(VIEW_TYPE_MAIN);

			if (leaves.length > 0) {
				leaf = leaves[0];
				await workspace.revealLeaf(leaf);
			} else {
				leaf = workspace.getLeaf(false);

				if (leaf) {
					await leaf.setViewState({
						type: VIEW_TYPE_MAIN,
						active: true,
					});
				}
			}
		} else {
			new Notice(
				`The following required plugins are missing or not enabled: ${missingRequiredPlugins.join(", ")}\n\nYou won't be able to use TaskUI without it!`,
			);
			loggerUtil.error(
				"Some required plugins are missing or not enabled.",
			);
		}

		if (!optionalPluginsEnabled) {
			new Notice(
				`For the best experience, I suggest installing the following optional plugins: ${missingOptionalPlugins.join(", ")}\n\n`,
			);
			loggerUtil.info("Some optional plugins are not installed.");
		}
	}
}
