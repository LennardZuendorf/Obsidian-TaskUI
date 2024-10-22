import React from "react";
import { ItemView, WorkspaceLeaf, Plugin } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "./context";
import "./styles.css";

export const VIEW_TYPE_MAIN = "react-view";

interface AppProps {
	plugin?: Plugin;
}

const TaskUIApp: React.FC<AppProps> = ({ plugin }) => {
	return (
		<div>
			<h1 className="underline">Main Task List</h1>
		</div>
	);
};

export class MainView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_MAIN;
	}

	getDisplayText() {
		return "Shards | TaskUI";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<React.StrictMode>
					<TaskUIApp />
				</React.StrictMode>
			</AppContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}

export default TaskUIApp;
