import { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import TaskUIApp from "../components/TaskUIApp";

export const VIEW_TYPE_TASKUI = 'react-view';

export class TaskUIView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_TASKUI;
	}

	getDisplayText() {
		return 'React View';
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<TaskUIApp />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
