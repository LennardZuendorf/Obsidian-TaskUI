import {
	Calendar,
	KanbanSquare,
	LayoutGrid,
	ListCollapseIcon,
	Plus,
} from "lucide-react";
import { Notice, type App } from "obsidian";
import React from "react";
import { storeOperation as str } from "../../data/types/operations"; // Adjusted path
import type { Task } from "../../data/types/tasks"; // Adjusted path
import type { TaskUpdate } from "../../service/taskSyncService"; // Adjusted path
import { logger } from "../../utils/logger"; // Adjusted path
import { Button } from "../base/Button";
import { ScrollArea, ScrollBar } from "../base/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../base/Tabs";
import { cn } from "../utils"; // Adjusted path
import { useDTable } from "./custom/dtable/DTable"; // Updated import path
import { DTableFilterBy } from "./custom/dtable/DTableFilterBy"; // Adjusted path
import { DTableGroupBy } from "./custom/dtable/DTableGroupBy"; // Adjusted path
import { DTableSortBy } from "./custom/dtable/DTableSortBy"; // Adjusted path
import { TaskModal } from "./shared/TaskModal"; // Keep for Add Task
import { BoardView } from "./views/BoardView"; // Adjusted path
import { ListView } from "./views/ListView"; // Adjusted path

// Copied from DTable.tsx - TODO: Move to a shared constants file?
const tabTriggerClasses = cn(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-lg font-medium",
	"!bg-transparent !border-none text-muted-foreground !shadow-none ",
	"hover:text-foreground hover:ring-2 hover:ring-hover !!hover:bg-hover",
	"data-[state=active]:text-foreground data-[state=active]:ring-2 data-[state=active]:ring-hover  data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 !data-[state=active]:after:bg-hover",
	"disabled:pointer-events-none disabled:text-muted-foreground",
);

const contentAreaBaseClass =
	" flex-grow overflow-auto border-t border-l border-r border-b border-border rounded-md";

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
			console.log("handleDeleteTask called in TaskView for:", task); // Log entry
			console.log("Delete requested for:", task.id); // Log request
			logger.trace("[TaskView] Deleting task", { task });
			const update: TaskUpdate = {
				operation: str.LOCAL_DELETE,
				tasks: [task],
				source: "local",
				timestamp: Date.now(),
			};
			changeTasks(update);
			console.log("Called changeTasks with DELETE operation"); // Log state update call
			new Notice(
				`Task "${task.description.substring(0, 20)}..." deleted.`,
			);
		},
		[changeTasks],
	);

	// Call useDTable AFTER handlers are defined
	const table = useDTable({
		app,
		changeTasks,
	});

	// Keep createTask function here as well
	function createTask() {
		if (!app) {
			logger.error(
				"[TaskView] App context not available for createTask.",
			);
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
				logger.trace(
					"[TaskView] Calling changeTasksAtom with LOCAL_ADD",
					{ update },
				);
				changeTasks(update);
				new Notice(
					`Task "${newTask.description.substring(0, 20)}..." added.`,
				);
			} else {
				logger.trace(
					"[TaskView] TaskModal closed without creating a task.",
				);
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
			<div className="flex flex-wrap items-end justify-between pt-0 gap-8 shrink-0">
				{/* Tabs List */}
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
							className={tabTriggerClasses}
							disabled={true} // TODO: Implement Calendar
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
						<Button
							variant="accent"
							className="gap-1"
							onClick={createTask}
						>
							<Plus className="h-4 w-4" />
							<span className="text-sm">Add Task</span>
						</Button>
					</div>
				</div>
			</div>

			{/* View Content Area */}
			<TabsContent
				value="list"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:flex flex-col",
				)}
			>
				<ListView
					table={table}
					handleEditTask={handleEditTask}
					handleDeleteTask={handleDeleteTask}
				/>
			</TabsContent>
			<TabsContent
				value="board"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				<BoardView table={table as any} />
			</TabsContent>
			<TabsContent
				value="calendar"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				{/* Placeholder for Calendar View */}
				<div className="p-4 text-center text-muted-foreground">
					Calendar View Placeholder
				</div>
			</TabsContent>
			<TabsContent
				value="overview"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				{/* Placeholder for Overview View */}
				<div className="p-4 text-center text-muted-foreground">
					Overview Placeholder
				</div>
			</TabsContent>
		</Tabs>
	);
}
