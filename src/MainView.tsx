import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import TaskUIApp from "./components/TaskUIApp";
import { AppContext } from "./context";

export const VIEW_TYPE_MAIN = "react-view";

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
				<TaskUIApp />
			</AppContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
