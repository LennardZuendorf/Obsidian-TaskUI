import { getDefaultStore, useAtom } from "jotai";
import { observe } from "jotai-effect";
import {
	Calendar,
	ChevronDownIcon,
	Filter,
	KanbanSquare,
	LayoutGrid,
	ListCollapseIcon,
	Loader2,
	Plus,
} from "lucide-react";
import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import React, { useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import { SettingsContext, appSettings } from "./config/settings";
import {
	baseTasksAtom,
	changeTasksAtom,
	unsyncedTasksAtom,
} from "./data/taskAtoms";
import { storeOperation as str } from "./data/types/operations";
import { Task, TaskWithMetadata } from "./data/types/tasks";
import { TaskService as CrudService } from "./service/taskService";
import { TaskSyncService, TaskUpdate } from "./service/taskSyncService";
import "./styles.css";
import { Button } from "./ui/base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "./ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/base/Popover";
import { ScrollArea, ScrollBar } from "./ui/base/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/base/Tabs";
import { TaskModal } from "./ui/components/shared/TaskModal";
import { ErrorView } from "./ui/ErrorView";
import { showNotice } from "./ui/lib/notice";
import ListView from "./ui/ListView";
import { cn } from "./ui/utils";
import { AppContext, useApp } from "./utils/context";
import { logger } from "./utils/logger";

export const VIEW_TYPE_MAIN = "react-view";

interface TaskUIAppProps {
	onTasksUpdate: (update: TaskUpdate) => void;
}

// Define constant for direct TabTrigger styling
const tabTriggerClasses = cn(
	// Base layout & typography
	"inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-lg font-medium",
	"!bg-transparent !border-none text-muted-foreground !shadow-none ",
	// Hover state
	"hover:text-foreground hover:ring-2 hover:ring-hover !!hover:bg-hover",
	// Active state: different text color, bottom border effect
	"data-[state=active]:text-foreground data-[state=active]:ring-2 data-[state=active]:ring-hover  data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 !data-[state=active]:after:bg-hover",
	// Disabled state
	"disabled:pointer-events-none disabled:text-muted-foreground",
);

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
	const [, changeTasks] = useAtom(changeTasksAtom);
	const app = useApp();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [crudService, setCrudService] = useState<CrudService | null>(null);

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

	async function createTask() {
		if (!app) {
			logger.error(
				"[MainView] App context not available for createTask.",
			);
			new Notice("Cannot create task: App context unavailable.");
			return;
		}
		new TaskModal(app, (newTask: Task | null) => {
			if (newTask) {
				logger.info(
					"[MainView] TaskModal closed with new task:",
					newTask,
				);
				changeTasks({
					operation: str.LOCAL_ADD,
					tasks: [newTask],
					source: "local" as const,
					timestamp: Date.now(),
				});
				new Notice(
					`Task "${newTask.description.substring(0, 20)}..." added.`,
				);
			} else {
				logger.info(
					"[MainView] TaskModal closed without creating a task.",
				);
			}
		}).open();
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-background">
				<ErrorView message={error} />
			</div>
		);
	}

	if (isLoading) {
		return <LoadingScreen />;
	}

	const contentAreaBaseClass =
		" flex-grow overflow-auto border-t border-l border-r border-b border-border rounded-md";

	return (
		<Tabs
			defaultValue="list"
			className="w-full h-full flex flex-col bg-background"
			activationMode="manual"
		>
			<div className="flex flex-wrap items-center justify-between pt-0 gap-8 shrink-0">
				<ScrollArea className="w-full sm:w-auto">
					<TabsList className="gap-2">
						<TabsTrigger
							value="overview"
							className={tabTriggerClasses}
							disabled={true}
						>
							<LayoutGrid
								className="-ms-0.5 me-1.5 h-4 w-4"
								aria-hidden="true"
							/>
							Overview
						</TabsTrigger>
						<TabsTrigger value="list" className={tabTriggerClasses}>
							<ListCollapseIcon
								className="-ms-0.5 me-1.5 h-4 w-4"
								aria-hidden="true"
							/>
							List
						</TabsTrigger>
						<TabsTrigger
							value="board"
							className={tabTriggerClasses}
							disabled={true}
						>
							<KanbanSquare
								className="-ms-0.5 me-1.5 h-4 w-4"
								aria-hidden="true"
							/>
							Board
						</TabsTrigger>
						<TabsTrigger
							value="calendar"
							className={tabTriggerClasses}
							disabled={true}
						>
							<Calendar
								className="-ms-0.5 me-1.5 h-4 w-4"
								aria-hidden="true"
							/>
							Calendar
						</TabsTrigger>
					</TabsList>
					<ScrollBar orientation="horizontal" className="invisible" />
				</ScrollArea>

				{/* Right Side Controls Added */}
				<div className="flex items-center space-x-2 py-2 sm:py-0 sm:ms-auto shrink-0">
					{/* Filter Popover (Dummy) */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								className="h-9 gap-1"
							>
								<Filter className="h-4 w-4" />
								<span className="text-sm">Filter</span>
								<ChevronDownIcon className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandList>
									<CommandGroup heading="Dummy Filters">
										<CommandItem>Incomplete</CommandItem>
										<CommandItem>Due Today</CommandItem>
										<CommandItem>High Priority</CommandItem>
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{/* Group By Popover (Dummy) */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								className="h-9 gap-1"
							>
								{/* Need an icon for Group By - using LayoutGrid for now */}
								<LayoutGrid className="h-4 w-4" />
								<span className="text-sm">Group By</span>
								<ChevronDownIcon className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandList>
									<CommandGroup heading="Dummy Groups">
										<CommandItem>Status</CommandItem>
										<CommandItem>Priority</CommandItem>
										<CommandItem>None</CommandItem>
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{/* Sort By Popover (Dummy) */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								className="h-9 gap-1"
							>
								{/* Need an icon for Sort By - using ArrowUpDown for now */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" />
								</svg>
								<span className="text-sm">Sort By</span>
								<ChevronDownIcon className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandList>
									<CommandGroup heading="Dummy Sorts">
										<CommandItem>Priority</CommandItem>
										<CommandItem>Due Date</CommandItem>
										<CommandItem>Description</CommandItem>
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{/* Add Task Button */}
					<Button
						variant="default"
						size="sm"
						className="h-9 gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
						onClick={createTask} // Connect to the function
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm">Add Task</span>
					</Button>
				</div>
			</div>

			<TabsContent
				value="list"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				<ListView />
			</TabsContent>
			<TabsContent
				value="overview"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			></TabsContent>
			<TabsContent
				value="board"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			></TabsContent>
			<TabsContent
				value="calendar"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			></TabsContent>
		</Tabs>
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
