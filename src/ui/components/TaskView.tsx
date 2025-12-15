import { Table as TanstackTable } from "@tanstack/react-table";
import {
	Calendar,
	KanbanSquare,
	LayoutGrid,
	ListCollapseIcon,
	Plus,
} from "lucide-react";
import { type App, Notice } from "obsidian";
import React from "react";
import { storeOperation as str } from "../../data/types/operations";
import type { Task } from "../../data/types/tasks";
import type { TaskUpdate } from "../../service/taskSyncService";
import { logger } from "../../utils/logger";
import { Button } from "../base/Button";
import { Separator } from "../base/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../base/Tabs";
import { cn } from "../utils";
import { useDTable } from "./custom/dtable/DTable";
import { DTableFilterBy } from "./custom/dtable/DTableFilterBy";
import { DTableGroupBy } from "./custom/dtable/DTableGroupBy";
import { DTableSortBy } from "./custom/dtable/DTableSortBy";
import { TaskModal } from "./shared/TaskModal";
import { BoardView } from "./tabViews/BoardView";
import { ListView } from "./tabViews/ListView";
import { TableView } from "./tabViews/TableView";

// Props needed by TaskView (and passed down to useDTable)
interface TaskViewProps {
	app: App;
	changeTasks: (update: TaskUpdate) => void;
}

export function TaskView({ app, changeTasks }: TaskViewProps) {
	const handleEditTask = React.useCallback(
		(task: Task) => {
			console.log("handleEditTask called in TaskView for:", task); // Log entry
			if (!app) {
				logger.error(
					"[TaskView] App context not available for handleEditTask.",
				);
				new Notice("Cannot edit task: App context unavailable.");
				return;
			}
			new TaskModal(
				app,
				(updatedTask: Task | null) => {
					console.log("TaskModal callback received:", updatedTask); // Log callback
					if (updatedTask) {
						const update: TaskUpdate = {
							operation: str.LOCAL_UPDATE,
							tasks: [updatedTask],
							source: "local",
							timestamp: Date.now(),
						};
						changeTasks(update);
						console.log("Called changeTasks with UPDATE operation"); // Log state update call
						new Notice(
							`Task "${updatedTask.description.substring(0, 20)}..." updated.`,
						);
					}
				},
				task,
			).open();
		},
		[app, changeTasks],
	);

	const handleDeleteTask = React.useCallback(
		(task: Task) => {
			logger.trace("[TaskView] Deleting task", { task });
			const update: TaskUpdate = {
				operation: str.LOCAL_DELETE,
				tasks: [task],
				source: "local",
				timestamp: Date.now(),
			};
			changeTasks(update);
			new Notice(`Task "${task.description.substring(0, 20)}..." deleted.`);
		},
		[changeTasks],
	);

	const handleUpdateTask = React.useCallback(
		(updatedTask: Task) => {
			const update: TaskUpdate = {
				operation: str.LOCAL_UPDATE,
				tasks: [updatedTask],
				source: "local",
				timestamp: Date.now(),
			};
			changeTasks(update);
		},
		[changeTasks],
	);

	const table = useDTable({
		app,
	});

	// Keep createTask function here as well
	function createTask() {
		if (!app) {
			logger.error("[TaskView] App context not available for createTask.");
			new Notice("Cannot create task: App context unavailable.");
			return;
		}
		new TaskModal(app, (newTask: Task | null) => {
			if (newTask) {
				logger.trace("[TaskView] TaskModal closed with new task", {
					task: newTask,
				});
				const update: TaskUpdate = {
					operation: str.LOCAL_ADD,
					tasks: [newTask],
					source: "local" as const,
					timestamp: Date.now(),
				};
				logger.trace("[TaskView] Calling changeTasksAtom with LOCAL_ADD", {
					update,
				});
				changeTasks(update);
				new Notice(`Task "${newTask.description.substring(0, 20)}..." added.`);
			} else {
				logger.trace("[TaskView] TaskModal closed without creating a task.");
			}
		}).open();
	}

	// 4. Render the main layout with Tabs, Controls, and View Content
	return (
		<Tabs
			defaultValue="list" // Default to List view
			className="w-full h-full flex flex-col bg-background"
			activationMode="manual"
		>
			{/* Top section: Tabs and Controls */}
			<div className="flex flex-wrap items-end justify-between pt-0 gap-8 shrink-0 border-none pb-4">
				{/* Tabs List */}
				<TabsList className="gap-2">
					<TabsTrigger value="table">
						<LayoutGrid className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" />
						Table
					</TabsTrigger>
					<TabsTrigger value="list">
						<ListCollapseIcon
							className="-ms-0.5 me-1.5 h-4 w-4"
							aria-hidden="true"
						/>
						List
					</TabsTrigger>
					<TabsTrigger
						value="board"
						// disabled={true} // Enable when BoardView is ready
					>
						<KanbanSquare
							className="-ms-0.5 me-1.5 h-4 w-4"
							aria-hidden="true"
						/>
						Board
					</TabsTrigger>
					<TabsTrigger
						value="calendar"
						disabled={true} // TODO: Implement Calendar
					>
						<Calendar className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" />
						Calendar
					</TabsTrigger>
				</TabsList>

				{/* Shared Controls + Add Task Button */}
				<div className="flex space-x-6 py-2 sm:py-0 sm:ms-auto shrink-0">
					{/* Group, Sort, Filter Controls */}
					<div className="flex space-x-2">
						<DTableGroupBy table={table} />
						<DTableSortBy table={table} />
						<DTableFilterBy table={table} />
					</div>

					{/* Add Task Button */}
					<div className="flex flex-col">
						{/* Invisible spacer label */}
						<span
							className="text-xs text-muted-foreground mb-1 ml-1 opacity-0"
							aria-hidden="true"
						>
							&nbsp;
						</span>
						<Button variant="accent" className="gap-1" onClick={createTask}>
							<Plus className="h-4 w-4" />
							<span className="text-sm">Add Task</span>
						</Button>
					</div>
				</div>
			</div>

			<Separator />

			{/* View Content Area */}
			<TabsContent
				value="table"
				className={cn(" w-11/12 justify-center items-center")}
			>
				<TableView
					table={table}
					handleEditTask={handleEditTask}
					handleDeleteTask={handleDeleteTask}
					handleUpdateTask={handleUpdateTask}
					handleCreateTask={createTask}
				/>
			</TabsContent>
			<TabsContent
				value="list"
				className={cn("flex flex-col w-11/12 items-center mx-auto")}
			>
				<ListView
					table={table}
					handleEditTask={handleEditTask}
					handleDeleteTask={handleDeleteTask}
					handleUpdateTask={handleUpdateTask}
					handleCreateTask={createTask}
				/>
			</TabsContent>
			<TabsContent
				value="board"
				className={cn(
					"data-[state=active]:block w-11/12 justify-center items-center",
				)}
			>
				<BoardView table={table} />
			</TabsContent>
			<TabsContent
				value="calendar"
				className={cn(
					"data-[state=active]:block w-9/10 justify-center items-center",
				)}
			>
				{/* Placeholder for Calendar View */}
				<div className="p-4 text-center text-muted-foreground">
					Calendar View Placeholder
				</div>
			</TabsContent>
		</Tabs>
	);
}

export interface TabViewProps<TData> {
	table: TanstackTable<TData>;
	handleEditTask: (task: Task) => void;
	handleDeleteTask: (task: Task) => void;
	handleUpdateTask: (task: Task) => void;
	handleCreateTask: () => void;
}
