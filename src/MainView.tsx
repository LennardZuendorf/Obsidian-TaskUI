import { getDefaultStore, useAtom } from "jotai";
import { observe } from "jotai-effect";
import { Loader2 } from "lucide-react";
import { App, ItemView, Notice, WorkspaceLeaf } from "obsidian";
import React, { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { appSettings, SettingsContext } from "./config/settings";
import {
	baseTasksAtom,
	changeTasksAtom,
	unsyncedTasksAtom,
} from "./data/taskAtoms";
import { storeOperation as str } from "./data/types/operations";
import { TaskWithMetadata } from "./data/types/tasks";
import { TaskService as CrudService } from "./service/taskService";
import { TaskSyncService, TaskUpdate } from "./service/taskSyncService";
import "./styles.css";
import { ErrorView } from "./ui/components/ErrorView";
import { TaskView } from "./ui/components/TaskView";
import { showNotice } from "./ui/lib/notice";
import { AppContext, useApp } from "./utils/context";
import { logger } from "./utils/logger";

export const VIEW_TYPE_MAIN = "react-view";

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

const AppController: React.FC = () => {
	const [, changeTasksState] = useAtom(changeTasksAtom);
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
				const update: TaskUpdate = {
					operation: str.REMOTE_UPDATE,
					tasks: response.tasks,
					source: "remote" as const,
					timestamp: Date.now(),
				};
				changeTasksState(update);
				logger.debug("Tasks fetched and state updated successfully.");
			} else {
				logger.error("Error fetching tasks from the API.");
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			logger.error(`Error fetching tasks: ${errorMessage}`);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}

		if (!error) {
			showNotice("<span>Tasks loaded successfully!</span>");
		} else {
			showNotice(`<span>Error loading tasks: ${error}</span>`, 5000);
		}
	}

	useEffect(() => {
		const handleTasksUpdate = (event: CustomEvent) => {
			const update = event.detail as TaskUpdate;
			changeTasksState(update);
		};

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
	}, [changeTasksState]);

	useEffect(() => {
		try {
			if (!app) throw new Error("App context is not available");
			const service = new CrudService(app);
			setCrudService(service);
			logger.debug("TaskUI: Loaded app and CRUD service successfully.");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			setError(errorMessage);
			logger.error(`Error initializing CRUD service: ${errorMessage}`);
			setIsLoading(false);
		}
	}, [app]);

	useEffect(() => {
		if (crudService) {
			const timer = setTimeout(() => {
				reloadTasks();
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [crudService]);

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

	return <TaskView app={app as App} changeTasks={changeTasksState} />;
};

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

	async onOpen() {
		try {
			if (!this.app) {
				throw new Error("App is not available");
			}

			this.taskSync = new TaskSyncService(this.app);

			const unobserve = observe((get) => {
				const unsyncedTasks = get(unsyncedTasksAtom);
				const tasksWithMeta = get(baseTasksAtom) as TaskWithMetadata[];

				unsyncedTasks.forEach(async (unsyncedTask) => {
					const taskWithMeta = tasksWithMeta.find(
						(t: TaskWithMetadata) => t.task.id === unsyncedTask.id,
					);
					if (taskWithMeta && this.taskSync) {
						try {
							await this.taskSync.handleLocalChange(taskWithMeta);
						} catch (error) {
							const errorMessage =
								error instanceof Error ? error.message : String(error);
							logger.error(`Failed to sync task: ${errorMessage}`);
							new Notice(`Failed to sync task: ${errorMessage}`);
						}
					}
				});
			}, getDefaultStore());

			this.cleanup = unobserve;

			this.root = createRoot(this.containerEl.children[1]);
			this.root.render(
				<React.StrictMode>
					<AppContext.Provider value={this.app}>
						<SettingsContext.Provider value={this.settings}>
							<AppController />
						</SettingsContext.Provider>
					</AppContext.Provider>
				</React.StrictMode>,
			);

			logger.debug("MainView: Rendered successfully with sync effect.");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.error(`Error in onOpen: ${errorMessage}`);
			this.containerEl.children[1].innerHTML = `<div class="error-notice">Failed to initialize TaskUI view: ${errorMessage}</div>`;
		}
	}

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

	async onunload() {
		if (this.cleanup) {
			this.cleanup();
		}
		this.root?.unmount();
	}
}
