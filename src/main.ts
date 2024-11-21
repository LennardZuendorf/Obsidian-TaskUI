import { Plugin, WorkspaceLeaf } from "obsidian";
import { MainView, VIEW_TYPE_MAIN } from "./MainView";
import { logger } from "./utils/logger";

//TODO: Add plugin check and notice again.
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
