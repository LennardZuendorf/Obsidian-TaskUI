import React from "react";
import { ItemView, WorkspaceLeaf, Plugin } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "./context";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";

export const VIEW_TYPE_MAIN = "react-view";

interface AppProps {
	plugin?: Plugin;
}

const TaskUIApp: React.FC<AppProps> = ({ plugin }) => {
	return (
		<div>
			<Tabs defaultValue="home" className="w-full align-middle">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="list">List</TabsTrigger>
					<TabsTrigger value="board">Board</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
				</TabsList>
				<TabsContent value={"list"}>
					<h1 className="underline">Main Task List</h1>
				</TabsContent>
				<TabsContent value={"board"}>
					<h1 className="underline">Main Task List</h1>
				</TabsContent>
				<TabsContent value={"calendar"}>
					<h1 className="underline">Main Task List</h1>
				</TabsContent>
			</Tabs>
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
