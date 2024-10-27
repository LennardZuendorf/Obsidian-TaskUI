import React, { useEffect } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "./appContext";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import { Button } from "@//base/Button";
import { Bell, Settings } from "lucide-react";
import { KanbanSquare, List } from "lucide-react";
import { useAtom } from "jotai";
import { mdTaskService } from "./data/mdTaskProvider";
import { allTasksAtom } from "./data/taskAtoms";
import KanbanBoard from "@//BoardView";
import TaskList from "@//ListView";
import { logger } from "./utils/logger";
import { DevTools } from "jotai-devtools";

export const VIEW_TYPE_MAIN = "react-view";

const TaskUIApp: React.FC = () => {
	const dvTaskService = new mdTaskService();

	const [, setAllTasks] = useAtom(allTasksAtom);

	useEffect(() => {
		const fetchTasks = async () => {
			const tasks = dvTaskService.getTasks();
			setAllTasks(tasks);
		};
		fetchTasks().then(() =>
			logger.info(`Tasks fetched and saved into state.`),
		);
	}, []);

	return (
		<div>
			<Tabs defaultValue="all" className="w-full h-full">
				<div className="flex items-center max-w-full justify-between bg-transparent">
					<TabsList className="flex grow max-w-full space-x-2 bg-transparent">
						<TabsTrigger
							value="list"
							className="font-black grow"
							asChild
						>
							<Button variant="outline">
								<List />
								List
							</Button>
						</TabsTrigger>
						<TabsTrigger
							value="board"
							className="font-black grow"
							asChild
						>
							<Button variant="outline">
								<KanbanSquare />
								Board
							</Button>
						</TabsTrigger>
						<div className="flex items-center space-x-0.5">
							<Button variant="ghost" size="icon">
								<Bell className="h-5 w-5" />
								<span className="sr-only">Notifications</span>
							</Button>
							<TabsTrigger
								value="settings"
								className="font-black grow"
								asChild
							>
								<Button variant="ghost" size="icon">
									<Settings className="h-5 w-5" />
									<span className="sr-only">Settings</span>
								</Button>
							</TabsTrigger>
						</div>
					</TabsList>
				</div>
				<TabsContent value="list">
					<TaskList />
				</TabsContent>
				<TabsContent value="board">
					<KanbanBoard />
				</TabsContent>
				<TabsContent value="settings">
					<DevTools />
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

	async onunload() {
		this.root?.unmount();
	}
}
