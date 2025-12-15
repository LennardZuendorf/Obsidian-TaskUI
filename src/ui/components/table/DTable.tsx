import {
	ColumnDef,
	ColumnFiltersState,
	ExpandedState,
	FilterFn,
	GroupingState,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	OnChangeFn,
	PaginationState,
	SortingState,
	Table as TanstackTable,
	useReactTable,
} from "@tanstack/react-table";
import { useAtom, useAtomValue } from "jotai";
import { type App } from "obsidian";
import React, { useState } from "react";
import {
	updateTaskAtom,
	expandedAtom,
	groupingAtom,
	paginationAtom,
	sortingAtom,
} from "@/data/taskAtoms";
import { Task, TaskPriority, TaskStatus } from "@/data/types/tasks";
import type { TaskUpdate } from "@/service/taskSyncService";
import { dateToDateCategory } from "@/ui/lib/config/date";
import { logger } from "@/utils/logger";
import {
	sortTasksByPriority,
	sortTasksByStatus,
} from "@/utils/sorting/taskSortingFunctions";

// Define a more specific type for column meta
export interface DTableColumnMeta {
	headerLabel?: string;
}

// Define column visibility as a simple Record type
type ColumnVisibility = Record<string, boolean>;

// Props interface for the hook - Add action handlers
interface UseDTableProps {
	app: App;
	handleEditTask?: (task: Task) => void;
	handleDeleteTask?: (task: Task) => void;
}

// --- Custom Sorting Functions ---

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
	return category === filterValue;
};

// Initial column visibility state - initially hide categories
const initialColumnVisibility: ColumnVisibility = {
	scheduledDateCategory: false,
	dueDateCategory: false,
};

// Minimal TanStack Table column definitions for Task
// biome-ignore lint/suspicious/noExplicitAny: TanStack Table ColumnDef requires any for generic cell values
const taskTableColumns: ColumnDef<Task, any>[] = [
	{
		accessorKey: "description",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		enableSorting: false,
		enableGrouping: false,
		enableColumnFilter: false,
		meta: { headerLabel: "Description" } as DTableColumnMeta,
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
		meta: { headerLabel: "Tags" } as DTableColumnMeta,
	},
	{
		accessorKey: "status",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: sortTasksByStatus,
		filterFn: statusFilterFn,
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: true,
		meta: { headerLabel: "Status" } as DTableColumnMeta,
	},
	{
		accessorKey: "priority",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: sortTasksByPriority,
		filterFn: priorityFilterFn,
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: true,
		meta: { headerLabel: "Priority" } as DTableColumnMeta,
	},
	{
		id: "scheduledDateCategory",
		accessorFn: (row) => {
			const category = dateToDateCategory(
				row.scheduledDate ? new Date(row.scheduledDate) : null,
			);
			return category;
		},
		header: () => "Sched Cat",
		cell: (info) => info.getValue(),
		meta: { headerLabel: "Scheduled Category" } as DTableColumnMeta,
		filterFn: categoryFilterFn,
		enableGrouping: false,
		enableSorting: false,
		enableColumnFilter: true,
	},
	{
		accessorKey: "scheduledDate",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: "datetime",
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: false,
		meta: { headerLabel: "Scheduled" } as DTableColumnMeta,
	},
	{
		id: "dueDateCategory",
		accessorFn: (row) => {
			const category = dateToDateCategory(
				row.dueDate ? new Date(row.dueDate) : null,
			);
			return category;
		},
		header: () => "Due Cat",
		cell: (info) => info.getValue(),
		meta: { headerLabel: "Due Category" } as DTableColumnMeta,
		filterFn: categoryFilterFn,
		enableGrouping: false,
		enableSorting: false,
		enableColumnFilter: true,
	},
	{
		accessorKey: "dueDate",
		header: ({ column }) => column.id,
		cell: (info) => info.getValue(),
		sortingFn: "datetime",
		enableGrouping: true,
		enableSorting: true,
		enableColumnFilter: false,
		meta: { headerLabel: "Due" } as DTableColumnMeta,
	},
];

// Rename the component function to useDTable
export function useDTable({
	app,
}: UseDTableProps): TanstackTable<Task> {
	const tasks = useAtomValue(updateTaskAtom);
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

	const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const newPaginationState =
			typeof updater === "function" ? updater(pagination) : updater;
		logger.trace(
			{ prev: pagination, next: newPaginationState },
			"useDTable: Updating persistent pagination state",
		);
		setPagination(newPaginationState);
	};

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
		},
		onSortingChange: handleSortingChange,
		onGlobalFilterChange: setGlobalFilter,
		onGroupingChange: handleGroupingChange,
		onExpandedChange: handleExpandedChange,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: handleColumnFiltersChange,
		onPaginationChange: handlePaginationChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		enableColumnResizing: false,
		autoResetExpanded: false,
		autoResetPageIndex: false,
		filterFns: {
			status: statusFilterFn,
			priority: priorityFilterFn,
			category: categoryFilterFn,
		},
		sortingFns: {
			priority: sortTasksByPriority,
			status: sortTasksByStatus,
		},
	});

	return table;
}
