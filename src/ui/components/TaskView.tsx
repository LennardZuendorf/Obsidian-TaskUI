import { Table as TanstackTable } from "@tanstack/react-table";
import {
	Table,
	KanbanSquare,
	ListChecks,
	Plus,
} from "lucide-react";
import { type App, Notice } from "obsidian";
import React from "react";
import { storeOperation as str } from "@/data/types/operations";
import { createLocalUpdate } from "@/data/utils/taskUpdateHelpers";
import type { Task } from "@/data/types/tasks";
import type { TaskUpdate } from "@/service/taskSyncService";
import { logger } from "@/utils/logger";
import { Button } from "@/ui/base/Button";
import { Separator } from "@/ui/base/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/base/Tabs";
import { cn } from "@/ui/utils";
import { useDTable } from "@/ui/components/table/DTable";
import { DTableFilterBy } from "./table/DTableFilterBy";
import { DTableGroupBy } from "./table/DTableGroupBy";
import { DTableSortBy } from "./table/DTableSortBy";
import { TaskModal } from "./forms/TaskModal";
import { BoardView } from "./views/BoardView";
import { ListView } from "./views/ListView";
import { TableView } from "./views/TableView";
import { titleCase } from "title-case";
import { DataTablePagination } from "./table/DTablePagination";

// Props needed by TaskView (and passed down to useDTable)
interface TaskViewProps {
	app: App;
	changeTasks: (update: TaskUpdate) => void;
}

export function TaskView({ app, changeTasks }: TaskViewProps) {
	const handleEditTask = React.useCallback(
		(task: Task) => {
			logger.trace("[TaskView] handleEditTask called", { task });
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
					logger.trace("[TaskView] TaskModal callback received", {
						updatedTask,
					});
					if (updatedTask) {
						const update = createLocalUpdate(str.LOCAL_UPDATE, [updatedTask]);
						changeTasks(update);
						logger.trace("[TaskView] Called changeTasks with UPDATE operation");
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
			const update = createLocalUpdate(str.LOCAL_DELETE, [task]);
			changeTasks(update);
			new Notice(`Task "${task.description.substring(0, 20)}..." deleted.`);
		},
		[changeTasks],
	);

	const handleUpdateTask = React.useCallback(
		(updatedTask: Task) => {
			const update = createLocalUpdate(str.LOCAL_UPDATE, [updatedTask]);
			changeTasks(update);
		},
		[changeTasks],
	);

	const table = useDTable({
		app,
	});

	// Keep createTask function here as well
	const createTask = React.useCallback(() => {
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
				const update = createLocalUpdate(str.LOCAL_ADD, [newTask]);
				logger.trace("[TaskView] Calling changeTasksAtom with LOCAL_ADD", {
					update,
				});
				changeTasks(update);
				new Notice(`Task "${newTask.description.substring(0, 20)}..." added.`);
			} else {
				logger.trace("[TaskView] TaskModal closed without creating a task.");
			}
		}).open();
	}, [app, changeTasks]);

	// 4. Render the main layout with Controls at Top, Tabs and Content Side by Side
	return (
		<div className="w-full h-full flex flex-col bg-background">
			{/* Top Controls Bar */}
			<div className="flex items-end justify-end gap-4 pb-4 shrink-0">
				{/* Group, Sort, Filter Controls */}
				<div className="flex gap-2">
					<DTableGroupBy table={table} />
					<DTableSortBy table={table} />
					<DTableFilterBy table={table} />
				</div>

				{/* Add Task Button */}
				<Button variant="accent" className="gap-1" onClick={createTask}>
					<Plus className="h-4 w-4" />
					<span className="text-sm">Add Task</span>
				</Button>
			</div>

			{/* Tabs and Content Area - Side by Side */}
			<Tabs
				defaultValue="list" // Default to List view
				className="flex-1 flex flex-row gap-4"
				activationMode="manual"
			>
				{/* Left Vertical Tabs Navigation */}
				<div className="flex flex-col gap-1">

					<div className="flex flex-col p-2">
						<span
							className={cn(
								"text-xs text-muted-foreground mb-1 ml-1",
							)}
						>
							{titleCase("Views:")}
						</span>
						<TabsList
							id="view-options-tabs"
							className="flex flex-col gap-2 h-fit rounded-lg border-none border-0 p-1"
						>
							<TabsTrigger
								value="table"
								aria-label="Switch to Table view"
								title="Table view"
							>
								<Table className="h-5 w-5" aria-hidden="true" />
								<span className="sr-only">Table</span>
							</TabsTrigger>
							<TabsTrigger
								value="list"
								aria-label="Switch to List view"
								title="List view"
							>
								<ListChecks className="h-5 w-5" aria-hidden="true" />
								<span className="sr-only">List</span>
							</TabsTrigger>
							<TabsTrigger
								value="board"
								aria-label="Switch to Board view"
								title="Board view"
								// disabled={true} // Enable when BoardView is ready
							>
								<KanbanSquare className="h-5 w-5" aria-hidden="true" />
								<span className="sr-only">Board</span>
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

				{/* Right Content Area */}
				<div id="tabs-content-container" className="flex-1 flex flex-col">
					<TabsContent
						id="table-view-content"
						value="table"
						className={cn("flex flex-col flex-1 items-center")}
					>
						<TableView
							table={table}
							handleEditTask={handleEditTask}
							handleDeleteTask={handleDeleteTask}
							handleUpdateTask={handleUpdateTask}
							handleCreateTask={createTask}
						/>
						<div className="flex justify-end">
							<DataTablePagination table={table} />
						</div>
					</TabsContent>
					<TabsContent
						id="list-view-content"
						value="list"
						className={cn("flex flex-col flex-1 items-center")}
					>
						<ListView
							table={table}
							handleEditTask={handleEditTask}
							handleDeleteTask={handleDeleteTask}
							handleUpdateTask={handleUpdateTask}
							handleCreateTask={createTask}
						/>
						<div className="flex justify-end">
							<DataTablePagination table={table} />
						</div>
					</TabsContent>
					<TabsContent
						id="board-view-content"
						value="board"
						className={cn("flex flex-col flex-1 items-center")}
					>
						<BoardView
							table={table}
							handleEditTask={handleEditTask}
							handleDeleteTask={handleDeleteTask}
							handleUpdateTask={handleUpdateTask}
							handleCreateTask={createTask}
						/>
						<div className="flex justify-end">
							<DataTablePagination table={table} />
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export interface TabViewProps<TData> {
	table: TanstackTable<TData>;
	handleEditTask: (task: Task) => void;
	handleDeleteTask: (task: Task) => void;
	handleUpdateTask: (task: Task) => void;
	handleCreateTask: () => void;
}
