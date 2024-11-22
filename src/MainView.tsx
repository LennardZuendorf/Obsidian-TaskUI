import React, { useEffect, useState } from "react";
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
import { ErrorView } from "@//ErrorView";

export const VIEW_TYPE_MAIN = "react-view";

const TaskUIApp: React.FC = () => {
	const [error, setError] = useState<string | null>(null); // State for error message
	const [crudService, setCrudService] = useState<CrudService | null>(null);
	const [, setTasks] = useAtom(allTasksAtom);

	const app = useApp();

	useEffect(() => {
		try {
			if (!app) throw new Error("App context is not available");
			const service = new CrudService(app);
			setCrudService(service);
			logger.info("TaskUI: Loaded app and CRUD service successfully.");
		} catch (err) {
			setError(err.message);
		}
	}, [app]); // Add app as a dependency

	async function fetchTasks() {
		try {
			const response = await crudService?.loadTasks();
			if (response?.status && response.tasks) {
				setTasks(response.tasks);
				logger.info("Tasks fetched and state updated successfully.");
			} else {
				logger.error("Error fetching tasks from the API.");
			}
		} catch (error) {
			logger.error(`Error fetching tasks: ${error.message}`);
		}
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<ErrorView message={error} />
			</div>
		);
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
								onClick={fetchTasks}
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
