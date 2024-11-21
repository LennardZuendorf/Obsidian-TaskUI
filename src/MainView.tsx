import React from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext, useApp } from "./utils/context";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import { Button } from "@//base/Button";
import { Bell, RefreshCw, Settings } from "lucide-react";
import { KanbanSquare, List } from "lucide-react";
import { useAtom } from "jotai";
import { TaskService as CrudService } from "./service/taskService";
import { allTasksAtom } from "./data/atoms";
import KanbanBoard from "@//BoardView";
import TaskList from "@//ListView";
import { logger as logger } from "./utils/logger";
import { DevTools } from "jotai-devtools";

export const VIEW_TYPE_MAIN = "react-view";

const TaskUIApp: React.FC = () => {
	const app = useApp();
	if (!app) {
		const msg =
			"No app context available. This is a fatal error, aborting.";
		logger.error(msg);
		return (
			<div>
				<span>
					Error during initialization: {msg}
					Try reloading the plugin or Obsidian.
				</span>
			</div>
		);
	}

	const crudService = new CrudService(app);

	const [, setAllTasks] = useAtom(allTasksAtom);

	async function loadTasks(): Promise<boolean> {
		try {
			const response = await crudService.loadTasks();
			setAllTasks(response.tasks ? response.tasks : []);
			logger.info("Tasks loaded successfully.");
			return true;
		} catch (error) {
			logger.error("Error fetching tasks:", error);
			return false;
		}
	}

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
							<Button
								variant="ghost"
								size="icon"
								onClick={() => loadTasks()}
							>
								<RefreshCw className="h-5 w-5" />
								<span className="sr-only">Reload Tasks</span>
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
		return "TaskUI";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<React.StrictMode>
					<div>Test Test</div>
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
