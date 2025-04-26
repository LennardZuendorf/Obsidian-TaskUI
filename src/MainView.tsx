import { Button } from "@//base/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import KanbanBoard from "@//BoardView";
import { ErrorView } from "@//ErrorView";
import TaskList from "@//ListView";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import { observe } from "jotai-effect";
import {
	Bug,
	KanbanSquare,
	List,
	Loader2,
	Plus,
	RefreshCw,
} from "lucide-react";
import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import React, { useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import { SettingsContext, appSettings } from "./config/settings";
import {
	baseTasksAtom,
	changeTasksAtom,
	debugStateAtom,
	unsyncedTasksAtom,
} from "./data/taskAtoms";
import { storeOperation as str } from "./data/types/operations";
import { Task, TaskWithMetadata } from "./data/types/tasks";
import { TaskService as CrudService } from "./service/taskService";
import { TaskSyncService, TaskUpdate } from "./service/taskSyncService";
import "./styles.css";
import { TaskModal } from "./ui/components/TaskModal";
import { showNotice } from "./ui/utils/notice";
import { AppContext, useApp } from "./utils/context";
import { logger } from "./utils/logger";

export const VIEW_TYPE_MAIN = "react-view";

interface TaskUIAppProps {
	onTasksUpdate: (update: TaskUpdate) => void;
}

const LoadingScreen: React.FC = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="flex flex-col items-center space-y-4">
			<Loader2 className="h-8 w-8 animate-spin text-accent" />
			<p className="text-sm text-muted-foreground">
				Initializing App - Loading Tasks...
			</p>
		</div>
	</div>
);

const TaskUIApp: React.FC<TaskUIAppProps> = ({ onTasksUpdate }) => {
	const [error, setError] = useState<string | null>(null);
	const [crudService, setCrudService] = useState<CrudService | null>(null);
	const [, changeTasks] = useAtom(changeTasksAtom);
	const debugState = useAtomValue(debugStateAtom);
	const app = useApp();
	const [isLoading, setIsLoading] = useState(true);

	async function reloadTasks() {
		try {
			if (!crudService) {
				throw new Error("CRUD service is not initialized");
			}
			const response = await crudService.loadTasks();
			if (response.status && response.tasks) {
				const update = {
					operation: str.REMOTE_UPDATE,
					tasks: response.tasks,
					source: "remote" as const,
					timestamp: Date.now(),
				};
				changeTasks(update);
				onTasksUpdate(update);
				logger.debug("Tasks fetched and state updated successfully.");
			} else {
				logger.error("Error fetching tasks from the API.");
			}
		} catch (error) {
			logger.error(`Error fetching tasks: ${error.message}`);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}

		showNotice("<span>Tasks loaded successfully!</span>");
	}

	async function resetTasks() {
		try {
			const update = {
				operation: str.RESET,
				tasks: [],
				source: "local" as const,
				timestamp: Date.now(),
			};
			changeTasks(update);
			logger.debug("Tasks reset and state cleared successfully.");
		} catch (error) {
			logger.error(`Error fetching tasks: ${error.message}`);
			setError(error.message);
		}
		showNotice("<span>Tasks cleared successfully!</span>");
	}

	async function createTask() {
		if (!app) {
			logger.error(
				"[MainView] App context not available for createTask.",
			);
			new Notice("Cannot create task: App context unavailable.");
			return;
		}

		// Open the TaskModal for creating a new task (pass null as initialTask)
		// Constructor: (app, onSubmitCallback, initialTask?)
		new TaskModal(
			app,
			(newTask: Task | null) => {
				// This callback receives the fully built Task object from TaskForm/TaskModal
				if (newTask) {
					logger.info(
						"[MainView] TaskModal closed with new task:",
						newTask,
					);
					// Dispatch LOCAL_ADD to update UI state immediately
					// The effect observer will handle calling the sync service.
					changeTasks({
						operation: str.LOCAL_ADD,
						tasks: [newTask],
						source: "local" as const,
						timestamp: Date.now(),
					});
					// Optional notice
					new Notice(
						`Task "${newTask.description.substring(0, 20)}..." added.`,
					);
				} else {
					logger.info(
						"[MainView] TaskModal closed without creating a task.",
					);
					// new Notice(`Task creation cancelled.`); // Optional notice
				}
			},
			undefined,
		) // Pass undefined for optional initialTask
			.open(); // Call open() to display the modal
	}

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

	useEffect(() => {
		try {
			if (!app) throw new Error("App context is not available");
			const service = new CrudService(app);
			setCrudService(service);
			logger.debug("TaskUI: Loaded app and CRUD service successfully.");
		} catch (err) {
			setError(err.message);
			logger.error(`Error initializing CRUD service: ${err.message}`);
		}
	}, [app]);

	useEffect(() => {
		if (crudService) {
			// Initial delay for dataview plugin initialization
			const timer = setTimeout(() => {
				reloadTasks();
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [crudService]);

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<ErrorView message={error} />
			</div>
		);
	}

	if (isLoading) {
		return <LoadingScreen />;
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
								onClick={reloadTasks}
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
					<div className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">
								Jotai Debug View
							</h3>
							<Button
								variant="destructive"
								onClick={() => {
									resetTasks();
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
				</TabsContent>
			</Tabs>
		</div>
	);
};

/**
 * Main view component for the task management UI.
 * Implements Jotai effect-based sync system and handles task updates.
 */
export class MainView extends ItemView {
	root: Root | null = null;
	settings: appSettings;
	private taskSync: TaskSyncService | null = null;
	private cleanup: (() => void) | null = null;

	constructor(leaf: WorkspaceLeaf, settings: appSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return VIEW_TYPE_MAIN;
	}

	getDisplayText() {
		return "TaskUI";
	}

	/**
	 * Initializes the view and sets up the sync system.
	 * Creates an effect observer to watch for task changes and handle sync operations.
	 */
	async onOpen() {
		try {
			if (!this.app) {
				throw new Error("App is not available");
			}

			// Initialize TaskSyncService first
			this.taskSync = new TaskSyncService(this.app);

			// Set up the effect observer for unsynced tasks
			const unobserve = observe((get) => {
				const unsyncedTasks = get(unsyncedTasksAtom);
				const tasksWithMeta = get(baseTasksAtom) as TaskWithMetadata[];

				// Process each unsynced task
				unsyncedTasks.forEach(async (unsyncedTask) => {
					const taskWithMeta = tasksWithMeta.find(
						(t: TaskWithMetadata) => t.task.id === unsyncedTask.id,
					);
					if (taskWithMeta && this.taskSync) {
						try {
							await this.taskSync.handleLocalChange(taskWithMeta);
						} catch (error) {
							logger.error(
								`Failed to sync task: ${error.message}`,
							);
							new Notice(`Failed to sync task: ${error.message}`);
						}
					}
				});
			}, getDefaultStore());

			// Store unobserve function for cleanup
			this.cleanup = unobserve;

			// Create root and render the app
			this.root = createRoot(this.containerEl.children[1]);
			this.root.render(
				<React.StrictMode>
					<AppContext.Provider value={this.app}>
						<SettingsContext.Provider value={this.settings}>
							<TaskUIApp
								onTasksUpdate={(update) => {
									// The sync is now handled by the effect
									logger.debug(
										"Task update received:",
										update,
									);
								}}
							/>
						</SettingsContext.Provider>
					</AppContext.Provider>
				</React.StrictMode>,
			);

			logger.debug("MainView: Rendered successfully with sync effect.");
		} catch (error) {
			logger.error(`Error in onOpen: ${error.message}`);
		}
	}

	/**
	 * Cleans up resources when the view is closed.
	 * Removes effect observers and sync service.
	 */
	async onClose() {
		if (this.cleanup) {
			this.cleanup();
		}
		if (this.taskSync) {
			this.taskSync.cleanup();
		}
		this.taskSync = null;
		this.root?.unmount();
	}

	/**
	 * Handles final cleanup when the plugin is unloaded.
	 */
	async onunload() {
		if (this.cleanup) {
			this.cleanup();
		}
		this.root?.unmount();
	}
}
