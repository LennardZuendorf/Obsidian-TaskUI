import {
	ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getSortedRowModel,
	GroupingState,
	Row,
	SortingFn,
	useReactTable,
} from "@tanstack/react-table";
import { useAtom, useAtomValue } from "jotai";
import {
	ArrowDown,
	ArrowUp,
	Calendar,
	Check,
	ChevronDown,
	ChevronRight,
	ChevronsUpDown,
	KanbanSquare,
	LayoutGrid,
	ListCollapseIcon,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { Notice, type App } from "obsidian";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./base/Table";

import type {
	CellContext,
	Column,
	OnChangeFn,
	SortingState,
} from "@tanstack/react-table";
import {
	changeTasksAtom,
	expandedAtom,
	groupingAtom,
	sortingAtom,
} from "../data/taskAtoms";
import { storeOperation as str } from "../data/types/operations";
import type { Task } from "../data/types/tasks";
import { TaskPriority, TaskStatus } from "../data/types/tasks";
import type { TaskUpdate } from "../service/taskSyncService";
import { logger } from "../utils/logger";
import { Button } from "./base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "./base/Command";
import { Input } from "./base/Input";
import { Popover, PopoverContent, PopoverTrigger } from "./base/Popover";
import { ScrollArea, ScrollBar } from "./base/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./base/Tabs";
import { TaskModal } from "./components/shared/TaskModal";
import { cn } from "./utils";

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

const contentAreaBaseClass =
	" flex-grow overflow-auto border-t border-l border-r border-b border-border rounded-md";

interface TaskUIManagerProps {
	app: App;
	changeTasks: (update: TaskUpdate) => void; // Pass the changeTasks setter function
}

// --- Custom Sorting Functions ---

// Define Priority Order (Highest first)
const priorityOrder: TaskPriority[] = [
	TaskPriority.HIGHEST,
	TaskPriority.HIGH,
	TaskPriority.MEDIUM,
	TaskPriority.LOW,
	TaskPriority.LOWEST,
];

// Custom sorting function for priority
const prioritySortingFn: SortingFn<Task> = (
	rkA: Row<Task>,
	rkB: Row<Task>,
	columnId: string,
): number => {
	const priorityA = rkA.getValue<TaskPriority | null | undefined>(columnId);
	const priorityB = rkB.getValue<TaskPriority | null | undefined>(columnId);

	// Corrected variable names and refined logic
	const isADefined = priorityA != null;
	const isBDefined = priorityB != null;

	// Handle cases where one or both are null/undefined by returning early
	if (isADefined && !isBDefined) return -1; // A defined, B undefined -> A comes first
	if (!isADefined && isBDefined) return 1; // A undefined, B defined -> B comes first
	if (!isADefined && !isBDefined) return 0; // Both undefined -> equal

	// If we reach here, TypeScript knows both are defined (TaskPriority)
	// Use type assertion `as TaskPriority` instead of `!`
	const indexA = priorityOrder.indexOf(priorityA as TaskPriority);
	const indexB = priorityOrder.indexOf(priorityB as TaskPriority);

	// Lower index means higher priority (comes first)
	return indexA - indexB;
};

// Define Status Order (Active first)
const statusOrder: TaskStatus[] = [
	TaskStatus.TODO,
	TaskStatus.IN_PROGRESS,
	TaskStatus.DONE,
	TaskStatus.CANCELLED,
];

// Custom sorting function for status
const statusSortingFn: SortingFn<Task> = (
	rkA: Row<Task>,
	rkB: Row<Task>,
	columnId: string,
): number => {
	const statusA = rkA.getValue<TaskStatus>(columnId);
	const statusB = rkB.getValue<TaskStatus>(columnId);

	const indexA = statusOrder.indexOf(statusA ?? TaskStatus.TODO); // Default unknowns to Todo
	const indexB = statusOrder.indexOf(statusB ?? TaskStatus.TODO);

	// Lower index means higher priority in this order (comes first)
	return indexA - indexB;
};

// --- End Custom Sorting Functions ---

// Minimal TanStack Table column definitions for Task
const taskTableColumns = [
	{
		accessorKey: "description",
		header: "Description",
		cell: (info: CellContext<Task, unknown>) => info.getValue(),
		enableSorting: false,
		enableGlobalFilter: true,
	},
	{
		accessorKey: "tags",
		header: "Tags",
		cell: (info: CellContext<Task, unknown>) =>
			Array.isArray(info.getValue())
				? (info.getValue() as string[]).join(", ")
				: "",
		enableSorting: false,
		enableColumnFilter: true,
		enableGlobalFilter: false,
	},
	{
		accessorKey: "status",
		header: ({ column }: { column: Column<Task, unknown> }) => (
			<button
				type="button"
				className="flex items-center space-x-1 hover:underline"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				<span>Status</span>
				{column.getIsSorted() === "desc" ? (
					<ArrowDown className="h-3 w-3" />
				) : column.getIsSorted() === "asc" ? (
					<ArrowUp className="h-3 w-3" />
				) : (
					<ChevronsUpDown className="h-3 w-3 opacity-50" />
				)}
			</button>
		),
		cell: (info: CellContext<Task, unknown>) => info.getValue(),
		sortingFn: statusSortingFn,
		enableSorting: true,
		enableColumnFilter: true,
		enableGrouping: true,
		meta: { label: "Status" },
		enableGlobalFilter: false,
	},
	{
		accessorKey: "priority",
		header: ({ column }: { column: Column<Task, unknown> }) => (
			<button
				type="button"
				className="flex items-center space-x-1 hover:underline"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				<span>Priority</span>
				{column.getIsSorted() === "desc" ? (
					<ArrowDown className="h-3 w-3" />
				) : column.getIsSorted() === "asc" ? (
					<ArrowUp className="h-3 w-3" />
				) : (
					<ChevronsUpDown className="h-3 w-3 opacity-50" />
				)}
			</button>
		),
		cell: (info: CellContext<Task, unknown>) => info.getValue(),
		sortingFn: prioritySortingFn,
		enableSorting: true,
		enableColumnFilter: true,
		enableGrouping: true,
		meta: { label: "Priority" },
		enableGlobalFilter: false,
	},
	{
		accessorKey: "scheduledDate",
		header: ({ column }: { column: Column<Task, unknown> }) => (
			<button
				type="button"
				className="flex items-center space-x-1 hover:underline"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				<span>Scheduled</span>
				{column.getIsSorted() === "desc" ? (
					<ArrowDown className="h-3 w-3" />
				) : column.getIsSorted() === "asc" ? (
					<ArrowUp className="h-3 w-3" />
				) : (
					<ChevronsUpDown className="h-3 w-3 opacity-50" />
				)}
			</button>
		),
		cell: (info: CellContext<Task, unknown>) =>
			info.getValue() ? String(info.getValue()) : "",
		enableSorting: true,
		enableColumnFilter: true,
		meta: { label: "Scheduled" },
		enableGlobalFilter: false,
	},
	{
		accessorKey: "dueDate",
		header: ({ column }: { column: Column<Task, unknown> }) => (
			<button
				type="button"
				className="flex items-center space-x-1 hover:underline"
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === "asc")
				}
			>
				<span>Due</span>
				{column.getIsSorted() === "desc" ? (
					<ArrowDown className="h-3 w-3" />
				) : column.getIsSorted() === "asc" ? (
					<ArrowUp className="h-3 w-3" />
				) : (
					<ChevronsUpDown className="h-3 w-3 opacity-50" />
				)}
			</button>
		),
		cell: (info: CellContext<Task, unknown>) =>
			info.getValue() ? String(info.getValue()) : "",
		enableSorting: true,
		enableColumnFilter: true,
		meta: { label: "Due" },
		enableGlobalFilter: false,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: function ActionsCell({ row, table }: CellContext<Task, unknown>) {
			const task = row.original as Task;
			const { app, changeTasks } = table.options.meta as {
				app: App;
				changeTasks: (update: TaskUpdate) => void;
			};

			const handleEditClick = () => {
				if (!app) {
					logger.error(
						"[TaskUIManager] App context not available for edit action.",
					);
					new Notice("Cannot edit task: App context unavailable.");
					return;
				}
				logger.trace("[TaskUIManager] Edit button clicked for task:", {
					task,
				});

				new TaskModal(
					app,
					(updatedTask: Task | null) => {
						if (updatedTask) {
							logger.trace(
								"[TaskUIManager] TaskModal closed with updated task",
								{
									task: updatedTask,
								},
							);
							const update: TaskUpdate = {
								operation: str.LOCAL_UPDATE,
								tasks: [updatedTask],
								source: "local" as const,
								timestamp: Date.now(),
							};
							logger.trace(
								"[TaskUIManager] Calling changeTasks with LOCAL_UPDATE",
								{ update },
							);
							changeTasks(update);
							new Notice(
								`Task "${updatedTask.description.substring(0, 20)}..." updated.`,
							);
						} else {
							logger.trace(
								"[TaskUIManager] TaskModal closed without updating.",
							);
						}
					},
					task,
				).open();
			};

			// Function to handle delete click
			const handleDeleteClick = () => {
				logger.trace(
					"[TaskUIManager] Delete button clicked for task:",
					{ task },
				);
				// Optional: Add a confirmation dialog here for safety
				// e.g., if (confirm(`Are you sure you want to delete "${task.description}"?`)) { ... }
				const update: TaskUpdate = {
					operation: str.LOCAL_DELETE,
					tasks: [task], // Pass the task to be marked for deletion
					source: "local" as const,
					timestamp: Date.now(),
				};
				logger.trace(
					"[TaskUIManager] Calling changeTasks with LOCAL_DELETE",
					{ update },
				);
				changeTasks(update);
				new Notice(
					`Task "${task.description.substring(0, 20)}..." marked for deletion.`,
				);
			};

			return (
				// Align content (including button group) to the right
				<div className="flex justify-end">
					{/* Group buttons together */}
					<div className="flex space-x-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleEditClick}
							className="h-7 px-2 text-muted-foreground hover:text-foreground"
							aria-label="Edit Task"
						>
							<Pencil className="h-4 w-4" />
						</Button>
						{/* Delete Button */}
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDeleteClick}
							className="h-7 px-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
							aria-label="Delete Task"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			);
		},
		enableSorting: false,
		enableGrouping: false,
		enableColumnFilter: false,
		enableGlobalFilter: false,
		size: 50,
	},
];

const TaskUIManager: React.FC<TaskUIManagerProps> = ({ app, changeTasks }) => {
	const tasks = useAtomValue(changeTasksAtom);
	const [sorting, setSorting] = useAtom(sortingAtom);
	const [grouping, setGrouping] = useAtom(groupingAtom);
	const [expanded, setExpanded] = useAtom(expandedAtom);
	const [globalFilter, setGlobalFilter] = useState("");
	logger.trace(
		{ sorting, grouping, expanded, globalFilter },
		"TaskUIManager: Current view states on render",
	);

	const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
		const newSortingState =
			typeof updater === "function" ? updater(sorting) : updater;
		logger.trace(
			{ prev: sorting, next: newSortingState },
			"TaskUIManager: Updating persistent sorting state",
		);
		setSorting(newSortingState);
	};

	const handleGroupingChange: OnChangeFn<GroupingState> = (updater) => {
		const newGroupingState =
			typeof updater === "function" ? updater(grouping) : updater;
		logger.trace(
			{ prev: grouping, next: newGroupingState },
			"TaskUIManager: Updating persistent grouping state",
		);
		setGrouping(newGroupingState);
	};

	const handleExpandedChange: OnChangeFn<ExpandedState> = (updater) => {
		const newExpandedState =
			typeof updater === "function" ? updater(expanded) : updater;
		logger.trace(
			{ prev: expanded, next: newExpandedState },
			"TaskUIManager: Updating persistent expanded state",
		);
		setExpanded(newExpandedState);
	};

	const table = useReactTable({
		data: tasks,
		columns: taskTableColumns,
		state: {
			sorting,
			globalFilter,
			grouping,
			expanded,
		},
		meta: {
			app,
			changeTasks,
		},
		onSortingChange: handleSortingChange,
		onGlobalFilterChange: setGlobalFilter,
		onGroupingChange: handleGroupingChange,
		onExpandedChange: handleExpandedChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		autoResetExpanded: false,
	});

	const sortableColumns = taskTableColumns.filter(
		(col) => col.enableSorting && col.meta?.label,
	);

	function createTask() {
		if (!app) {
			logger.error(
				"[TaskUIManager] App context not available for createTask.",
			);
			new Notice("Cannot create task: App context unavailable.");
			return;
		}
		new TaskModal(app, (newTask: Task | null) => {
			if (newTask) {
				logger.trace("[TaskUIManager] TaskModal closed with new task", {
					task: newTask,
				});
				const update: TaskUpdate = {
					operation: str.LOCAL_ADD,
					tasks: [newTask],
					source: "local" as const,
					timestamp: Date.now(),
				};
				logger.trace(
					"[TaskUIManager] Calling changeTasksAtom with LOCAL_ADD",
					{ update },
				);
				changeTasks(update);
				new Notice(
					`Task "${newTask.description.substring(0, 20)}..." added.`,
				);
			} else {
				logger.trace(
					"[TaskUIManager] TaskModal closed without creating a task.",
				);
			}
		}).open();
	}

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

				<div className="flex items-center space-x-2 py-2 sm:py-0 sm:ms-auto shrink-0">
					<Input
						placeholder="Filter tasks..."
						value={globalFilter ?? ""}
						onChange={(event) => {
							const newValue = event.target.value;
							setGlobalFilter(newValue);
							logger.trace(
								{ globalFilter: newValue },
								"TaskUIManager: Global filter changed",
							);
						}}
						className="h-9 max-w-sm"
					/>

					<Popover>
						<PopoverTrigger asChild>
							<Button size="sm" className="h-9 gap-1">
								<LayoutGrid className="h-4 w-4" />
								<span className="text-sm">Group By</span>
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandList>
									<CommandGroup heading="Group by">
										<CommandItem
											onSelect={() =>
												setGrouping(["status"])
											}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													grouping[0] === "status"
														? "opacity-100"
														: "opacity-0",
												)}
											/>
											Status
										</CommandItem>
										<CommandItem
											onSelect={() =>
												setGrouping(["priority"])
											}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													grouping[0] === "priority"
														? "opacity-100"
														: "opacity-0",
												)}
											/>
											Priority
										</CommandItem>
										<CommandItem
											onSelect={() => setGrouping([])}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													grouping.length === 0
														? "opacity-100"
														: "opacity-0",
												)}
											/>
											None
										</CommandItem>
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<Button size="sm" className="h-9 gap-1">
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
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandList>
									<CommandGroup heading="Sort by">
										{sortableColumns.map((col) => {
											const columnId =
												col.accessorKey as string;
											const columnLabel = col.meta?.label;
											if (!columnLabel) return null;

											const currentSort = sorting[0];
											const isCurrentlySorted =
												currentSort?.id === columnId;
											const isDesc =
												isCurrentlySorted &&
												!!currentSort.desc;

											const handleSelect = () => {
												if (!isCurrentlySorted) {
													setSorting([
														{
															id: columnId,
															desc: false,
														},
													]);
												} else if (!isDesc) {
													setSorting([
														{
															id: columnId,
															desc: true,
														},
													]);
												} else {
													setSorting([]);
												}
											};

											return (
												<CommandItem
													key={columnId}
													onSelect={handleSelect}
												>
													{isCurrentlySorted ? (
														isDesc ? (
															<ArrowDown className="mr-2 h-4 w-4" />
														) : (
															<ArrowUp className="mr-2 h-4 w-4" />
														)
													) : (
														<ChevronsUpDown className="mr-2 h-4 w-4 opacity-30" />
													)}
													{columnLabel}
												</CommandItem>
											);
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<Button
						variant="default"
						size="sm"
						className="h-9 gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
						onClick={createTask}
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
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => {
							if (row.getIsGrouped()) {
								return (
									<TableRow key={row.id}>
										<TableCell
											colSpan={
												table.getAllLeafColumns().length
											}
										>
											<button
												type="button"
												onClick={row.getToggleExpandedHandler()}
												style={{ cursor: "pointer" }}
												className="flex items-center space-x-1"
											>
												{row.getIsExpanded() ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
												<span>
													{row.getValue(
														grouping[0] as string,
													)}{" "}
													({row.subRows.length})
												</span>
											</button>
										</TableCell>
									</TableRow>
								);
							} else {
								return (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								);
							}
						})}
					</TableBody>
				</Table>
			</TabsContent>
			<TabsContent
				value="overview"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				{/* Placeholder */}
			</TabsContent>
			<TabsContent
				value="board"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				{/* Placeholder - <BoardView table={table} /> */}
			</TabsContent>
			<TabsContent
				value="calendar"
				className={cn(
					contentAreaBaseClass,
					"data-[state=active]:block",
				)}
			>
				{/* Placeholder */}
			</TabsContent>
		</Tabs>
	);
};

export default TaskUIManager;
