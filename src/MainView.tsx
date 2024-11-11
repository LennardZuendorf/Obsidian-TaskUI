import React, { useEffect, useState } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext, useApp } from "./utils/contextUtil";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import { Button } from "@//base/Button";
import { Bell, Settings } from "lucide-react";
import { KanbanSquare, List } from "lucide-react";
import { useAtom } from "jotai";
import { TaskQueryService } from "./service/queryService";
import { TaskEditService } from "./service/editService";
import { allTasksAtom } from "./data/atoms";
import KanbanBoard from "@//BoardView";
import TaskList from "@//ListView";
import { loggerUtil as logger } from "./utils/loggerUtil";
import { DevTools } from "jotai-devtools";
import { Card, CardContent, CardFooter, CardHeader } from "@//base/Card";

/**
 * The view type for the main view of the Task UI Plugin. Needs to be defined for obsidian to recognize the view.
 */
export const VIEW_TYPE_MAIN = "react-view";

/**
 * Main React Component for the Task UI Plugin, which is the entry point for the config.
 * This component fetches all tasks via the TaskQueryService and saves them into the allTasksAtom.
 * @returns The main React component for the Task UI Plugin.
 */
const TaskUIApp: React.FC = () => {
	// Setting up app from context.
	const app = useApp();

	// Defining services managed via state and error state for initialization errors.
	const [queryService, setQueryService] = useState<TaskQueryService | null>(
		null,
	);
	const [editService, setEditService] = useState<TaskEditService | null>(
		null,
	);
	const [error, setError] = useState<Error | null>(null);

	// Defining state for tasks managed via jotai atoms.
	const [allTasks, setAllTasks] = useAtom(allTasksAtom);

	// Setup services on initial load.
	useEffect(() => {
		const setupServices = async () => {
			try {
				if (!queryService || !editService) {
					if (!app) {
						throw new Error("App not available");
					}
					const queryServiceInstance = new TaskQueryService(app);
					const editServiceInstance = new TaskEditService(app);
					setQueryService(queryServiceInstance);
					setEditService(editServiceInstance);
				}
			} catch (error) {
				setError(
					new Error(
						"Failed to initialize services: " + error.message,
					),
				);
			}
		};
		setupServices().then(() =>
			logger.info("TasksUI: Finished service setup"),
		);
	}, [app, queryService, editService]);

	// Fetch tasks on initial load.
	useEffect(() => {
		const fetchTasks = async () => {
			if (queryService) {
				try {
					const tasks = await queryService.getTasks();
					setAllTasks(tasks || []);
				} catch (error) {
					setError(new Error("Failed to fetch tasks"));
				}
			}
		};

		fetchTasks().then(() =>
			logger.info("TasksUI: Finished initial task fetch"),
		);
	}, [queryService, setAllTasks]);

	// If there is no queryService, editService, or allTasks, return a loading screen. If there is an error, return an error screen.
	if (!queryService || !editService || !allTasks || error) {
		return (
			<section className="flex flex-col items-center gap-2 sm:gap-4 lg:gap-8 py-4 h-full w-full">
				<div>
					<Card className="border-0">
						<CardHeader className="justify-end">
							{error
								? "Error During Initialization"
								: "Loading..."}
						</CardHeader>
						<CardContent className="justify-start">
							{error ? (
								<span>
									Error during initialization: {error.message}
									Try reloading the plugin or Obsidian.
								</span>
							) : (
								<span>The Task UI Plugin is loading...</span>
							)}
						</CardContent>
						{error && (
							<CardFooter>
								Please reach out to the creator via GitHub if
								this error persists.
							</CardFooter>
						)}
					</Card>
				</div>
			</section>
		);
	}

	// Returns the main component, which displays the list and board view of the tasks. Also includes a config view.
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

/**
 * Main View for the Task UI Plugin. This is the entry point for the config and is registered in the main.ts file.
 * @extends ItemView from "obsidian" to create a new view in the Obsidian workspace.
 * Itself
 */
export class MainView extends ItemView {
	root: Root | null = null;

	/**
	 * Constructor for the Main View of the Task UI Plugin.
	 * @param leaf
	 */
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	/**
	 * Gets the view type of the Main View of the Task UI Plugin.
	 */
	getViewType() {
		return VIEW_TYPE_MAIN;
	}

	/**
	 * Gets the display text of the Main View of the Task UI Plugin.
	 */
	getDisplayText() {
		return "TaskUI";
	}

	/**
	 * Renders the Main View of the Task UI Plugin.
	 */
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

	/**
	 * Unmounts the Main View of the Task UI Plugin on close.
	 */
	async onClose() {
		this.root?.unmount();
	}

	/**
	 * Unmounts the Main View of the Task UI Plugin on unload.
	 */
	async onunload() {
		this.root?.unmount();
	}
}
