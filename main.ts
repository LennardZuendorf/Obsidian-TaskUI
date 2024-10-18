// src/main.ts
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TaskUIView, VIEW_TYPE_TASKUI } from 'src/views/TaskUIView';

export default class ShardsTaskUIPlugin extends Plugin {
	async onload() {

		// Register the Main Tab View
		this.registerView(VIEW_TYPE_TASKUI, (leaf) => new TaskUIView(leaf));

		// Add Ribbon Icons to Activate the Views
		this.addRibbonIcon('layout', 'Activate Main Tab View', () => {
			this.activateMainTabView();
		});
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TASKUI);
	}

	// Method to activate the Main Tab View
	async activateMainTabView() {
		const {workspace} = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TASKUI);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf(false);

			if (leaf) {
				await leaf.setViewState({type: VIEW_TYPE_TASKUI, active: true});
			}
		}
	}
}
