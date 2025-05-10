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
import { Task, TaskPriority, TaskStatus } from "../../../../data/types/tasks";
import type { TaskUpdate } from "../../../../service/taskSyncService";
import { dateToDateCategory } from "../../../../ui/lib/displayConfig/dateDisplayConfig";
import { getOrderedTaskPriorities } from "../../../../ui/lib/displayConfig/priorityDisplayConfig";
import { getOrderedTaskStatuses } from "../../../../ui/lib/displayConfig/statusDisplayConfig";
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

// Custom sorting function for priority
const prioritySortingFn: SortingFn<Task> = (
	rkA: Row<Task>,
	rkB: Row<Task>,
	columnId: string,
): number => {
	const priorityA = rkA.getValue<TaskPriority | null | undefined>(columnId);
	const priorityB = rkB.getValue<TaskPriority | null | undefined>(columnId);

	const isADefined = priorityA != null;
	const isBDefined = priorityB != null;

	if (isADefined && !isBDefined) return -1;
	if (!isADefined && isBDefined) return 1;
	if (!isADefined && !isBDefined) return 0;

	// Get the ordered list of priorities
	const orderedPriorities = getOrderedTaskPriorities();
	const indexA = orderedPriorities.indexOf(priorityA as TaskPriority);
	const indexB = orderedPriorities.indexOf(priorityB as TaskPriority);

	return indexA - indexB;
};

// Custom sorting function for status
const statusSortingFn: SortingFn<Task> = (
	rkA: Row<Task>,
	rkB: Row<Task>,
	columnId: string,
): number => {
	const statusA = rkA.getValue<TaskStatus>(columnId);
	const statusB = rkB.getValue<TaskStatus>(columnId);

	// Get the ordered list of statuses
	const orderedStatuses = getOrderedTaskStatuses();
	const indexA = orderedStatuses.indexOf(statusA ?? TaskStatus.TODO);
	const indexB = orderedStatuses.indexOf(statusB ?? TaskStatus.TODO);

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
	return category === filterValue;
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
			const category = dateToDateCategory(
				row.scheduledDate ? new Date(row.scheduledDate) : null,
			);
			return category;
		},
		header: () => "Sched Cat",
		cell: (info) => info.getValue(),
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
			const category = dateToDateCategory(
				row.dueDate ? new Date(row.dueDate) : null,
			);
			return category;
		},
		header: () => "Due Cat",
		cell: (info) => info.getValue(),
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
