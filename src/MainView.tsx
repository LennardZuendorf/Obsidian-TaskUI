import { Button } from "@//base/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import KanbanBoard from "@//BoardView";
import { ErrorView } from "@//ErrorView";
import TaskList from "@//ListView";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Bug, KanbanSquare, List, Plus, RefreshCw } from "lucide-react";
import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import React, { useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import { SettingsContext, useSettings } from "./config/settings";
import {
	changeTasksAtom,
	debugStateAtom,
	resetStateAtom,
} from "./data/taskAtoms";
import { storeOperation as str } from "./data/types/operations";
import { TaskService as CrudService } from "./service/taskService";
import { TaskSyncService, TaskUpdate } from "./service/taskSyncService";
import "./styles.css";
import { TaskModal } from "./ui/components/TaskModal";
import { showNotice } from "./ui/utils/notice";
import { AppContext, useApp } from "./utils/context";
import { logger } from "./utils/logger";

export const VIEW_TYPE_MAIN = "react-view";

const DebugView: React.FC = () => {
	const debugState = useAtomValue(debugStateAtom);
	const resetState = useSetAtom(resetStateAtom);

	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Jotai Debug View</h3>
				<Button
					variant="destructive"
					onClick={() => {
						resetState();
						showNotice("State reset successful!");
					}}
				>
					Reset State
				</Button>
			</div>

			{Object.entries(debugState).map(([key, value]) => (
				<div key={key} className="space-y-2">
					<h4 className="font-medium text-sm text-muted-foreground">
						{key}
					</h4>
					<div className="bg-secondary p-4 rounded-md">
						<pre className="whitespace-pre-wrap overflow-x-auto">
							{JSON.stringify(value, null, 2)}
						</pre>
					</div>
				</div>
			))}
		</div>
	);
};

interface TaskUIAppProps {
	onTasksUpdate: (update: any) => void;
}

const TaskUIApp: React.FC<TaskUIAppProps> = ({ onTasksUpdate }) => {
	const [error, setError] = useState<string | null>(null);
	const [crudService, setCrudService] = useState<CrudService | null>(null);
	const [, changeTasks] = useAtom(changeTasksAtom);
	const app = useApp();
	const settings = useSettings();

	useEffect(() => {
		// Listen for updates from the sync service
		const handleTasksUpdate = (event: CustomEvent) => {
			const update = event.detail;
			changeTasks(update);
		};

		// Use the container element from the Obsidian view
		const container = document.querySelector(".workspace-leaf-content");
		container?.addEventListener(
			"tasksUpdated",
			handleTasksUpdate as EventListener,
		);

		return () => {
			container?.removeEventListener(
				"tasksUpdated",
				handleTasksUpdate as EventListener,
			);
		};
	}, [changeTasks]);

	async function fetchTasks() {
		try {
			if (!crudService) {
				throw new Error("CRUD service is not initialized");
			}
			const response = await crudService.loadTasks();
			if (response.status && response.tasks) {
				const update = {
					operation: str.REPLACE,
					tasks: response.tasks,
				};
				changeTasks(update);
				onTasksUpdate(update);
				logger.info("Tasks fetched and state updated successfully.");
			} else {
				logger.error("Error fetching tasks from the API.");
			}
		} catch (error) {
			logger.error(`Error fetching tasks: ${error.message}`);
			setError(error.message);
		}

		showNotice("<span>Tasks fetched successfully!</span>");
	}

	async function createTask() {
		if (!app) {
			throw new Error("App is not available");
		}
		new TaskModal(app, (task) => {
			if (task) {
				crudService?.createTask(
					task,
					settings?.defaultHeading || "# Tasks",
				);
				const update: TaskUpdate = {
					operation: str.ADD,
					tasks: [task],
				};
				changeTasks(update);
				new Notice(`Task created successfully!`);
			} else {
				new Notice(`Task creation was unsuccessful!`);
			}
		}).open();
	}

	useEffect(() => {
		try {
			if (!app) throw new Error("App context is not available");
			const service = new CrudService(app);
			setCrudService(service);
			logger.info("TaskUI: Loaded app and CRUD service successfully.");
		} catch (err) {
			setError(err.message);
			logger.error(`Error initializing CRUD service: ${err.message}`);
		}
	}, [app]);

	useEffect(() => {
		if (crudService) {
			fetchTasks();
		}
	}, [crudService]);

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<ErrorView message={error} />
			</div>
		);
	}

	return (
		<div>
			<Tabs defaultValue="list" className="w-full h-full">
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
						<TabsTrigger
							value="debug"
							className="font-black grow"
							asChild
						>
							<Button variant="outline">
								<Bug />
								Debug
							</Button>
						</TabsTrigger>
						<div className="flex items-center space-x-0.5">
							<Button
								variant="ghost"
								size="icon"
								onClick={createTask}
							>
								<Plus className="h-5 w-5" />
								<span className="sr-only">Add Task</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={fetchTasks}
							>
								<RefreshCw className="h-5 w-5" />
								<span className="sr-only">Reload Tasks</span>
							</Button>
						</div>
					</TabsList>
				</div>
				<TabsContent value="list">
					<TaskList />
				</TabsContent>
				<TabsContent value="board">
					<KanbanBoard />
				</TabsContent>
				<TabsContent value="debug">
					<DebugView />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export class MainView extends ItemView {
	root: Root | null = null;
	settings: any;
	private taskSync: TaskSyncService | null = null;

	constructor(leaf: WorkspaceLeaf, settings: any) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return VIEW_TYPE_MAIN;
	}

	getDisplayText() {
		return "TaskUI";
	}

	async onOpen() {
		try {
			if (!this.app) {
				throw new Error("App is not available");
			}

			// Initialize TaskSyncService first
			this.taskSync = new TaskSyncService(this.app);

			// Create root and render the app once
			this.root = createRoot(this.containerEl.children[1]);
			this.root.render(
				<React.StrictMode>
					<AppContext.Provider value={this.app}>
						<SettingsContext.Provider value={this.settings}>
							<TaskUIApp
								onTasksUpdate={(update) => {
									// Only sync to storage for local updates
									this.taskSync?.localUpdateHandler(
										update.tasks,
									);
								}}
							/>
						</SettingsContext.Provider>
					</AppContext.Provider>
				</React.StrictMode>,
			);

			logger.info("MainView: Rendered successfully.");
		} catch (error) {
			logger.error(`Error in onOpen: ${error.message}`);
		}
	}

	async onClose() {
		this.taskSync = null;
		this.root?.unmount();
	}

	async onunload() {
		this.root?.unmount();
	}
}
