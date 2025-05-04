import {
	ColumnDef,
	ColumnFiltersState,
	ExpandedState,
	FilterFn,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	GroupingState,
	OnChangeFn,
	Row,
	SortingFn,
	SortingState,
	Table as TanstackTable,
	useReactTable,
} from "@tanstack/react-table";
import { useAtom, useAtomValue } from "jotai";
import { type App } from "obsidian";
import React, { useState } from "react";
import {
	changeTasksAtom,
	expandedAtom,
	groupingAtom,
	paginationAtom,
	sortingAtom,
} from "../../../../data/taskAtoms";
import { getDateCategory } from "../../../../data/types/dateCategories";
import { Task, TaskPriority, TaskStatus } from "../../../../data/types/tasks";
import type { TaskUpdate } from "../../../../service/taskSyncService";
import { logger } from "../../../../utils/logger";

// Define column visibility as a simple Record type
type ColumnVisibility = Record<string, boolean>;

// Props interface for the hook - Add action handlers
interface UseDTableProps {
	app: App;
	changeTasks: (update: TaskUpdate) => void;
	handleEditTask?: (task: Task) => void;
	handleDeleteTask?: (task: Task) => void;
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

// Define a type-safe filter function for status
const statusFilterFn: FilterFn<Task> = (row, columnId, filterValue) => {
	const status = row.getValue(columnId) as TaskStatus;
	return status === filterValue;
};

// Define a type-safe filter function for priority
const priorityFilterFn: FilterFn<Task> = (row, columnId, filterValue) => {
	const priority = row.getValue(columnId) as TaskPriority;
	return priority === filterValue;
};

// Define a type-safe filter function for date categories
const categoryFilterFn: FilterFn<Task> = (row, columnId, filterValue) => {
	const category = row.getValue(columnId) as string;
	const passes = category === filterValue;
	// Log filter execution details
	// console.log(`Filtering ${columnId}: Row ${row.id} category='${category}', FilterValue='${filterValue}', Passes=${passes}`);
	return passes;
};

// Initial column visibility state - initially hide categories
const initialColumnVisibility: ColumnVisibility = {
	scheduledDateCategory: false,
	dueDateCategory: false,
};

// Minimal TanStack Table column definitions for Task
const taskTableColumns: ColumnDef<Task>[] = [
	{
		accessorKey: "description",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		enableSorting: false,
		enableGrouping: false,
		enableColumnFilter: false,
		meta: { headerLabel: "Description" },
	},
	{
		accessorKey: "tags",
		header: ({ column }) => column.id,
		cell: (info) => {
			const tags = info.getValue<string[] | undefined>();
			return Array.isArray(tags) ? tags : [];
		},
		enableSorting: false,
		enableGrouping: false,
		enableColumnFilter: false,
		meta: { headerLabel: "Tags" },
	},
	{
		accessorKey: "status",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: statusSortingFn,
		filterFn: statusFilterFn,
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: true,
		meta: { headerLabel: "Status" },
	},
	{
		accessorKey: "priority",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: prioritySortingFn,
		filterFn: priorityFilterFn,
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: true,
		meta: { headerLabel: "Priority" },
	},
	{
		id: "scheduledDateCategory",
		accessorFn: (row) => {
			const category = getDateCategory(
				row.scheduledDate ? new Date(row.scheduledDate) : null,
			);
			// console.log(`Scheduled category for task ${row.id}: ${category}`);
			return category;
		},
		header: () => "Sched Cat", // Add simple header for visibility
		cell: (info) => info.getValue(), // Add cell renderer to display value
		meta: { headerLabel: "Scheduled Category" },
		filterFn: categoryFilterFn,
		enableGrouping: true,
		enableSorting: false,
		enableColumnFilter: true,
	},
	{
		accessorKey: "scheduledDate",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: "datetime",
		enableGrouping: false,
		enableSorting: true,
		enableColumnFilter: false,
		meta: { headerLabel: "Scheduled" },
	},
	{
		id: "dueDateCategory",
		accessorFn: (row) => {
			const category = getDateCategory(
				row.dueDate ? new Date(row.dueDate) : null,
			);
			// console.log(`Due category for task ${row.id}: ${category}`);
			return category;
		},
		header: () => "Due Cat", // Add simple header for visibility
		cell: (info) => info.getValue(), // Add cell renderer to display value
		meta: { headerLabel: "Due Category" },
		filterFn: categoryFilterFn,
		enableGrouping: true,
		enableSorting: false,
		enableColumnFilter: true,
	},
	{
		accessorKey: "dueDate",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: "datetime",
		enableGrouping: false,
		enableSorting: true,
		enableColumnFilter: false,
		meta: { headerLabel: "Due" },
	},
];

// Rename the component function to useDTable
export function useDTable({
	app,
	changeTasks,
}: UseDTableProps): TanstackTable<Task> {
	const tasks = useAtomValue(changeTasksAtom);
	const [sorting, setSorting] = useAtom(sortingAtom);
	const [grouping, setGrouping] = useAtom(groupingAtom);
	const [expanded, setExpanded] = useAtom(expandedAtom);
	const [pagination, setPagination] = useAtom(paginationAtom);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
		initialColumnVisibility,
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	logger.trace(
		{
			sorting,
			grouping,
			expanded,
			globalFilter,
			columnVisibility,
			columnFilters,
			pagination,
		},
		"useDTable: Current view states on hook execution",
	);

	const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
		const newSortingState =
			typeof updater === "function" ? updater(sorting) : updater;
		logger.trace(
			{ prev: sorting, next: newSortingState },
			"useDTable: Updating persistent sorting state",
		);
		setSorting(newSortingState);
	};

	const handleGroupingChange: OnChangeFn<GroupingState> = (updater) => {
		const newGroupingState =
			typeof updater === "function" ? updater(grouping) : updater;
		logger.trace(
			{ prev: grouping, next: newGroupingState },
			"useDTable: Updating persistent grouping state",
		);
		setGrouping(newGroupingState);
	};

	const handleExpandedChange: OnChangeFn<ExpandedState> = (updater) => {
		const newExpandedState =
			typeof updater === "function" ? updater(expanded) : updater;
		logger.trace(
			{ prev: expanded, next: newExpandedState },
			"useDTable: Updating persistent expanded state",
		);
		setExpanded(newExpandedState);
	};

	const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
		updater,
	) => {
		const newFilters =
			typeof updater === "function" ? updater(columnFilters) : updater;
		logger.trace(
			{ prev: columnFilters, next: newFilters },
			"useDTable: Updating column filters state",
		);
		setColumnFilters(newFilters);
	};

	const pageCount = React.useMemo(
		() => Math.ceil(tasks.length / pagination.pageSize),
		[tasks.length, pagination.pageSize],
	);

	const table = useReactTable({
		data: tasks,
		columns: taskTableColumns,
		state: {
			sorting,
			globalFilter,
			grouping,
			expanded,
			columnVisibility,
			columnFilters,
			pagination,
		},
		meta: {
			app,
			changeTasks,
		},
		onSortingChange: handleSortingChange,
		onGlobalFilterChange: setGlobalFilter,
		onGroupingChange: handleGroupingChange,
		onExpandedChange: handleExpandedChange,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: handleColumnFiltersChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		enableColumnResizing: false,
		autoResetExpanded: false,
		manualPagination: true,
		pageCount: pageCount,
		onPaginationChange: setPagination,
		filterFns: {
			status: statusFilterFn,
			priority: priorityFilterFn,
			category: categoryFilterFn,
		},
		sortingFns: {
			priority: prioritySortingFn,
			status: statusSortingFn,
		},
	});

	return table;
}
