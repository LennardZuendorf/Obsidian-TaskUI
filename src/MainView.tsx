import React, { useEffect, useState } from "react";
import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext, useApp } from "./utils/context";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import { Button } from "@//base/Button";
import { Plus, RefreshCw, Bug } from "lucide-react";
import { KanbanSquare, List } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { TaskService as CrudService } from "./service/taskService";
import {
	changeTasksAtom,
	debugStateAtom,
	resetStateAtom,
} from "./data/taskAtoms";
import KanbanBoard from "@//BoardView";
import TaskList from "@//ListView";
import { ErrorView } from "@//ErrorView";
import { logger as logger } from "./utils/logger";
import { SettingsContext } from "./config/settings";
import { showNotice } from "./ui/utils/notice";
import { TaskModal } from "./ui/components/TaskModal";
import { useSettings } from "./config/settings";
import { storeOperation as str } from "./data/types/operations";

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

const TaskUIApp: React.FC = () => {
	const [error, setError] = useState<string | null>(null); // State for error message
	const [crudService, setCrudService] = useState<CrudService | null>(null);
	const [, changeTasks] = useAtom(changeTasksAtom);
	const app = useApp();
	const settings = useSettings();

	async function fetchTasks() {
		try {
			if (!crudService) {
				throw new Error("CRUD service is not initialized");
			}
			const response = await crudService.loadTasks();
			if (response.status && response.tasks) {
				changeTasks({ operation: str.REPLACE, tasks: response.tasks });
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
		new TaskModal(this.app, (task) => {
			if (task) {
				crudService?.createTask(
					task,
					settings?.defaultHeading || "# Tasks",
				);
				changeTasks({ operation: str.ADD, tasks: [task] });
				new Notice(`Task updated successfully!`);
			} else {
				new Notice(`Task update was unsuccessful!`);
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
	}, []); // Add app as a dependency

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	settings: any;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<SettingsContext.Provider value={this.settings}>
				<AppContext.Provider value={this.app}>
					<React.StrictMode>
						<TaskUIApp />
					</React.StrictMode>
				</AppContext.Provider>
			</SettingsContext.Provider>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}

	async onunload() {
		this.root?.unmount();
	}
}
