import type { Column, SortingState, Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ChevronDown,
	ChevronRight,
	ChevronsUpDown,
} from "lucide-react";
import React, { useCallback } from "react";
import type { Task } from "@/data/types/tasks";
import { formatDate } from "@/data/utils/dateUtils";
import { Badge } from "@/ui/base/Badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/ui/base/Table";
import { SettingsButton } from "@/ui/components/task/SettingsButton";
import type { TabViewProps } from "@/ui/components/TaskView";
import { getColumnDisplay } from "@/ui/lib/config/column";
import { getMatchingDisplay } from "@/ui/lib/config/utils";
import { cn } from "@/ui/utils";
import { TabView } from "./TabView";

// Sortable header component
function SortableHeader<TData extends Task>({
	column,
	table,
	grouping,
}: {
	column: Column<TData>;
	table: TanstackTable<TData>;
	grouping: string[];
}) {
	const displayInfo = getColumnDisplay(column.id);
	const IconComponent = displayInfo.icon;
	const sorting = table.getState().sorting;
	const activeGroupId = grouping[0];

	// Check if this column is the active group column
	const isGroupColumn = activeGroupId === column.id;

	// Find sort state for this column
	const sortEntry = sorting.find((s) => s.id === column.id);
	const isSorted = !!sortEntry;
	const isDesc = sortEntry?.desc;

	const handleClick = useCallback(() => {
		if (!column.getCanSort()) return;

		// If this is the group column, don't allow manual sort changes
		if (isGroupColumn) return;

		const currentSorting = table.getState().sorting;
		let newSortState: SortingState = [];

		if (activeGroupId) {
			// Grouping is active: preserve group sort as sorting[0]
			const groupSortEntry = currentSorting.find((s) => s.id === activeGroupId);
			if (!groupSortEntry) {
				table.setSorting([]);
				return;
			}
			newSortState.push(groupSortEntry);

			// Manage secondary sort (sorting[1])
			const currentSecondarySort =
				currentSorting.length > 1 &&
				currentSorting[0]?.id === activeGroupId
					? currentSorting[1]
					: undefined;

			if (currentSecondarySort?.id === column.id) {
				// Clicking current secondary sort
				if (!currentSecondarySort.desc) {
					// was asc, now desc
					newSortState.push({
						id: column.id,
						desc: true,
					});
				} // else was desc, now clear secondary
			} else {
				// New or different secondary sort
				newSortState.push({
					id: column.id,
					desc: false,
				});
			}
		} else {
			// No grouping: manage primary sort (sorting[0])
			const currentPrimarySort = currentSorting[0];
			if (currentPrimarySort?.id === column.id) {
				// Clicking current primary
				if (!currentPrimarySort.desc) {
					newSortState = [
						{
							id: column.id,
							desc: true,
						},
					];
				} // else was desc, now clear primary (newSortState remains [])
			} else {
				// New or different primary sort
				newSortState = [
					{
						id: column.id,
						desc: false,
					},
				];
			}
		}

		table.setSorting(newSortState.slice(0, 2)); // Ensure max 2 sorts
	}, [column, table, activeGroupId, isGroupColumn]);

	return (
		<div
			className={cn(
				"flex items-center gap-2",
				column.getCanSort() && !isGroupColumn && "cursor-pointer select-none hover:text-foreground",
			)}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			role={column.getCanSort() && !isGroupColumn ? "button" : undefined}
			tabIndex={column.getCanSort() && !isGroupColumn ? 0 : undefined}
		>
			{IconComponent && <IconComponent className="h-4 w-4" />}
			<span>{displayInfo.label}</span>
			{column.getCanSort() && !isGroupColumn && (
				isSorted ? (
					isDesc ? (
						<ArrowDown className="h-4 w-4" />
					) : (
						<ArrowUp className="h-4 w-4" />
					)
				) : (
					<ChevronsUpDown className="h-4 w-4 opacity-30" />
				)
			)}
		</div>
	);
}

export function TableView<TData extends Task>({
	table,
	handleEditTask,
	handleDeleteTask,
	handleUpdateTask,
	handleCreateTask,
}: TabViewProps<TData>) {
	const grouping = table.getState().grouping;
	const rows = table.getRowModel().rows;

	// Helper function for group display
	const getGroupDisplay = useCallback(
		(row: ReturnType<typeof table.getRowModel>["rows"][0], groupingKey: string) => {
			try {
				const groupValue = row.getValue(groupingKey) as string | null | undefined;
				if (
					groupingKey === "priority" ||
					groupingKey === "status" ||
					groupingKey === "scheduledDate" ||
					groupingKey === "dueDate"
				) {
					return getMatchingDisplay(groupValue as string);
				}
			} catch (error) {
				// Fallback to default
			}
			return {
				label: String(row.getValue(groupingKey)) || "Other",
				icon: () => null,
				className: "text-muted-foreground",
			};
		},
		[],
	);

	if (!rows?.length) {
		return (
			<TabView id="table-view-wrapper" className="flex-1">
				<div className="mx-4 lg:mx-6 rounded-lg border bg-card">
					<Table>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length + 1}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</TabView>
		);
	}

	return (
		<TabView id="table-view-wrapper">
			<div className="mx-4 lg:mx-6 rounded-lg border bg-card">
				<Table>
					<TableHeader className="bg-muted/50">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} style={{ width: header.getSize() }}>
										{header.isPlaceholder ? null : (
											<SortableHeader
												column={header.column}
												table={table}
												grouping={grouping}
											/>
										)}
									</TableHead>
								))}
								{/* Extra header for actions */}
								<TableHead key="actions-header">Actions</TableHead>
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{rows.map((row) => {
							if (row.getIsGrouped()) {
								const groupDisplay = getGroupDisplay(row, grouping[0]);
								const IconComponent = groupDisplay.icon;

								return (
									<TableRow key={row.id}>
										<TableCell
											colSpan={table.getVisibleLeafColumns().length + 1}
											className="border-l-4 border-primary pl-2 bg-muted/50"
										>
											<button
												type="button"
												onClick={row.getToggleExpandedHandler()}
												className="flex items-center space-x-2 cursor-pointer"
											>
												{row.getIsExpanded() ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
												{IconComponent && <IconComponent className="h-4 w-4" />}
												<span className={cn("font-semibold", groupDisplay.className)}>
													{groupDisplay.label}
												</span>
												<span className="text-xs text-muted-foreground">
													({row.subRows.length}{" "}
													{row.subRows.length === 1 ? "item" : "items"})
												</span>
											</button>
										</TableCell>
									</TableRow>
								);
							} else {
								return (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => {
											// Status/Priority cells
											if (cell.column.id === "status" || cell.column.id === "priority") {
												const value = cell.getValue() as string;
												const display = getMatchingDisplay(value);
												const IconComponent = display.icon;

												return (
													<TableCell key={cell.id}>
														<div className="flex items-center gap-2">
															{IconComponent && (
																<IconComponent className="h-4 w-4" />
															)}
															<span className={display.className}>{display.label}</span>
														</div>
													</TableCell>
												);
											}

											// Tags cells
											if (cell.column.id === "tags") {
												const tags = cell.getValue<string[] | undefined>();
												return (
													<TableCell key={cell.id}>
														<div className="flex flex-wrap gap-1">
															{tags?.map((tag) => (
																<Badge
																	key={tag}
																	variant="secondary"
																	size="sm"
																	className="text-xs"
																>
																	{tag}
																</Badge>
															))}
														</div>
													</TableCell>
												);
											}

											// Date cells
											if (
												cell.column.id === "scheduledDate" ||
												cell.column.id === "dueDate"
											) {
												const dateValue = cell.getValue<Date | string | null | undefined>();
												let date: Date | null = null;
												if (dateValue instanceof Date) {
													date = dateValue;
												} else if (typeof dateValue === "string") {
													date = new Date(dateValue);
												}
												return (
													<TableCell key={cell.id}>
														{date && !isNaN(date.getTime())
															? formatDate(date)
															: "—"}
													</TableCell>
												);
											}

											// Description cells
											if (cell.column.id === "description") {
												return (
													<TableCell key={cell.id} className="max-w-md truncate">
														{cell.getValue<string>()}
													</TableCell>
												);
											}

											// Default cell rendering
											return (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											);
										})}
										{/* Extra cell for actions */}
										<TableCell key="actions-cell" className="text-right">
											<div className="flex justify-end">
												<SettingsButton
													onViewDetails={() => handleEditTask(row.original)}
													onDelete={() => handleDeleteTask(row.original)}
												/>
											</div>
										</TableCell>
									</TableRow>
								);
							}
						})}
					</TableBody>
				</Table>
			</div>
		</TabView>
	);
}
