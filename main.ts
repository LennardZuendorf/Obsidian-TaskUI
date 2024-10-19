// Description: Main Plugin File for the Obsidian Plugin
import { Plugin, WorkspaceLeaf } from "obsidian";
import { MainView, VIEW_TYPE_MAIN } from "src/MainView";

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

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MAIN);

		if (leaves.length > 0) {
			leaf = leaves[0];
			await workspace.revealLeaf(leaf);
			console.log("Main Tab View Activated");
		} else {
			leaf = workspace.getLeaf(false);

			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_MAIN, active: true });
			}
		}
	}
}
