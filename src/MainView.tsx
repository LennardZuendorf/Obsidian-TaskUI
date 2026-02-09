import { getDefaultStore, useAtom } from "jotai";
import { observe } from "jotai-effect";
import { App, ItemView, Notice, WorkspaceLeaf } from "obsidian";
import React, { useCallback, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import {
	baseTasksAtom,
	unsyncedTasksAtom,
	updateTaskAtom,
} from "@/data/taskAtoms";
import { TaskWithMetadata } from "@/data/types/tasks";
import { createRemoteUpdate } from "@/data/utils/taskUpdateHelpers";
import { TaskService as CrudService } from "@/service/taskService";
import { TaskSyncService, TaskUpdate } from "@/service/taskSyncService";
import "@/styles.css";
import { ErrorView } from "@/ui/components/ErrorView";
import { LoadingScreen } from "@/ui/components/LoadingScreen";
import { TaskView } from "@/ui/components/TaskView";
import { showNotice } from "@/ui/lib/obsidian/notice";
import { AppContext, useApp } from "@/utils/context";
import { getErrorMessage } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";
import type TaskUIPlugin from "./main";

export const VIEW_TYPE_MAIN = "react-view";

const AppController: React.FC = () => {
	const [, updateTaskState] = useAtom(updateTaskAtom);
	const app = useApp();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [crudService, setCrudService] = useState<CrudService | null>(null);

	const reloadTasks = useCallback(async () => {
		try {
			if (!crudService) {
				throw new Error("CRUD service is not initialized");
			}
			const response = await crudService.loadTasks();
			if (response.status && response.tasks) {
				const update = createRemoteUpdate(response.tasks);
				updateTaskState(update);
				logger.debug("Tasks fetched and state updated successfully.");
			} else {
				logger.error("Error fetching tasks from the API.");
			}
		} catch (err) {
			const errorMessage = getErrorMessage(err);
			logger.error(`Error fetching tasks: ${errorMessage}`);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}

		if (!error) {
			showNotice("<span>Tasks loaded successfully!</span>");
		} else {
			showNotice(`<span>Error loading tasks: ${error}</span>`, false, 5);
		}
	}, [crudService, updateTaskState, setError, setIsLoading, error]);

	useEffect(() => {
		const handleTasksUpdate = (event: CustomEvent) => {
			const update = event.detail as TaskUpdate;
			updateTaskState(update);
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
	}, [updateTaskState]);

	useEffect(() => {
		try {
			if (!app) throw new Error("App context is not available");
			const service = new CrudService(app);
			setCrudService(service);
			logger.debug("TaskUI: Loaded app and CRUD service successfully.");
		} catch (err) {
			const errorMessage = getErrorMessage(err);
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
	}, [crudService, reloadTasks]);

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-background">
				<ErrorView message={error} />
			</div>
		);
	}

	if (isLoading) {
		return <LoadingScreen message="Initializing App - Loading Tasks..." />;
	}

	return <TaskView app={app as App} changeTasks={updateTaskState} />;
};

export class MainView extends ItemView {
	root: Root | null = null;
	plugin: TaskUIPlugin;
	private taskSync: TaskSyncService | null = null;
	private cleanup: (() => void) | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: TaskUIPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_MAIN;
	}

	getIcon() {
		return "file-check";
	}

	getDisplayText() {
		return "TaskUI Task View";
	}

	async onOpen() {
		try {
			if (!this.app) {
				throw new Error("App is not available");
			}

			this.taskSync = new TaskSyncService(this.app);

			let syncTimeout: NodeJS.Timeout | null = null;

			const unobserve = observe((get) => {
				const unsyncedTasks = get(unsyncedTasksAtom);
				const tasksWithMeta = get(baseTasksAtom) as TaskWithMetadata[];

				if (syncTimeout) {
					clearTimeout(syncTimeout);
				}

				syncTimeout = setTimeout(async () => {
					for (const unsyncedTask of unsyncedTasks) {
						const taskWithMeta = tasksWithMeta.find(
							(t: TaskWithMetadata) => t.task.id === unsyncedTask.id,
						);

						if (taskWithMeta && this.taskSync) {
							try {
								await this.taskSync.handleLocalChange(taskWithMeta);
							} catch (error) {
								const errorMessage = getErrorMessage(error);
								logger.error(`Failed to sync task: ${errorMessage}`);
								// Don't show notice for every retry failure to avoid spamming
								if (
									taskWithMeta.metadata.retryCount &&
									taskWithMeta.metadata.retryCount >= 3
								) {
									new Notice(`Failed to sync task: ${errorMessage}`);
								}
							}
						}
					}
				}, 500); // 500ms debounce
			}, getDefaultStore());

			this.cleanup = () => {
				if (syncTimeout) {
					clearTimeout(syncTimeout);
					syncTimeout = null;
				}
				unobserve();
			};

			this.root = createRoot(this.containerEl.children[1]);
			this.root.render(
				<React.StrictMode>
					<AppContext.Provider value={this.app}>
						<AppController />
					</AppContext.Provider>
				</React.StrictMode>,
			);

			logger.debug("MainView: Rendered successfully with sync effect.");
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			logger.error(`Error in onOpen: ${errorMessage}`);
			this.containerEl.children[1].innerHTML = `<div class="error-notice">Failed to initialize TaskUI view: ${errorMessage}</div>`;
		}
	}

	async onClose() {
		this.performCleanup();
	}

	async onunload() {
		this.performCleanup();
	}

	private performCleanup() {
		if (this.cleanup) {
			this.cleanup();
			this.cleanup = null;
		}
		if (this.taskSync) {
			this.taskSync.cleanup();
			this.taskSync = null;
		}
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
