import React, { useEffect } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "./utils/contextUtil";
import "./styles.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//base/Tabs";
import { Button } from "@//base/Button";
import { Bell, Settings } from "lucide-react";
import { KanbanSquare, List } from "lucide-react";
import { useAtom } from "jotai";
import { mdTaskProvider } from "./service/mdTaskProvider";
import { allTasksAtom } from "./data/taskAtoms";
import KanbanBoard from "@//BoardView";
import TaskList from "@//ListView";
import { loggerUtil } from "./utils/loggerUtil";
import { DevTools } from "jotai-devtools";

/**
 * The view type for the main view of the Task UI Plugin. Needs to be defined for obsidian to recognize the view.
 */
export const VIEW_TYPE_MAIN = "react-view";

/**
 * Main React Component for the Task UI Plugin, which is the entry point for the config.
 * This component fetches all tasks from the Dataview API and displays them in a list or board view.
 * @returns The main React component for the Task UI Plugin.
 */
const TaskUIApp: React.FC = () => {
	// Requires the mdTaskService to fetch tasks from the vault via the DataView API.
	const mdTaskService = new mdTaskProvider();

	// Fetches the allTasksAtom from the taskAtoms file. This atom stores all tasks.
	const [, setAllTasks] = useAtom(allTasksAtom);

	// Function to create a new task via the Tasks API.

	// Fetches all tasks from the DataView API and saves them into the allTasksAtom. This is done once on component mount.
	useEffect(() => {
		const fetchTasks = async () => {
			const tasksTO = await mdTaskService.getTasks();

			if (!tasksTO.status || tasksTO.tasks === undefined) {
				loggerUtil.error(`No tasks found.`);
				return;
			}
			setAllTasks(tasksTO.tasks);
		};

		fetchTasks().then(() =>
			loggerUtil.info(`Tasks fetched and saved into state.`),
		);
	}, []);

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
