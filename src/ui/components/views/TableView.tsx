import type { Column, SortingState, Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowDown,
	ArrowUp,
	ChevronDown,
	ChevronRight,
	ChevronsUpDown,
} from "lucide-react";
import React, { useCallback } from "react";
import type { Task } from "@/data/types/tasks";
import { Badge } from "@/ui/base/Badge";
import { Button } from "@/ui/base/Button";
import { logger } from "@/utils/logger";
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
				"flex items-center gap-2 w-full",
				column.getCanSort() && !isGroupColumn && "cursor-pointer select-none hover:opacity-80",
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
			{IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
			<span className="flex-1">{displayInfo.label}</span>
			{column.getCanSort() && (
				isGroupColumn ? (
					// Group column shows sort state but is not clickable
					isSorted ? (
						isDesc ? (
							<ArrowDown className="h-4 w-4 opacity-70" />
						) : (
							<ArrowUp className="h-4 w-4 opacity-70" />
						)
					) : null
				) : (
					// Non-group columns show sortable indicator
					isSorted ? (
						isDesc ? (
							<ArrowDown className="h-4 w-4" />
						) : (
							<ArrowUp className="h-4 w-4" />
						)
					) : (
						<ChevronsUpDown className="h-4 w-4 opacity-50" />
					)
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

	// Helper function for group display - get value from first row in group like BoardView
	const getGroupDisplay = useCallback(
		(row: ReturnType<typeof table.getRowModel>["rows"][0], groupingKey: string) => {
			try {
				// Get the value from the grouped row's leaf rows (actual tasks)
				let groupValue;
				
				// Get first leaf row (actual task) and access the property directly from original data
				const leafRows = row.getLeafRows();
				if (leafRows && leafRows.length > 0) {
					const firstTask = leafRows[0].original as Task;
					// Access the property directly from the task object
					groupValue = firstTask[groupingKey as keyof Task];
					
					logger.trace(
						"[TableView] getGroupDisplay - groupingKey:",
						groupingKey,
						"groupValue from original:",
						groupValue,
						"row.id:",
						row.id,
					);
				} else {
					// Fallback to getting it from the grouped row
					groupValue = row.getValue(groupingKey);
					logger.trace(
						"[TableView] getGroupDisplay - groupingKey:",
						groupingKey,
						"groupValue from row.getValue:",
						groupValue,
					);
				}
				
				if (
					groupingKey === "priority" ||
					groupingKey === "status" ||
					groupingKey === "scheduledDate" ||
					groupingKey === "dueDate"
				) {
					const display = getMatchingDisplay(groupValue as string);
					logger.trace(
						"[TableView] getGroupDisplay result - label:",
						display.label,
						"for groupingKey:",
						groupingKey,
					);
					return display;
				}
			} catch (error) {
				logger.error(
					"[TableView] Error getting group display",
					"groupingKey:",
					groupingKey,
					error,
				);
			}
			
			// Fallback
			const leafRows = row.getLeafRows();
			if (leafRows && leafRows.length > 0) {
				const firstTask = leafRows[0].original as Task;
				const value = firstTask[groupingKey as keyof Task];
				return {
					label: String(value) || "Other",
					icon: () => null,
					className: "text-muted-foreground",
				};
			}
			
			return {
				label: "Other",
				icon: () => null,
				className: "text-muted-foreground",
			};
		},
		[],
	);

	if (!rows?.length) {
		return (
			<TabView id="table-view-wrapper" className="flex-1">
				<div className="p-3 h-full flex flex-col">
					<div className="rounded-lg border border-border overflow-hidden bg-card">
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
				</div>
			</TabView>
		);
	}

	return (
		<TabView id="table-view-wrapper">
			<div className="p-3 h-full flex flex-col">
				<div className="rounded-lg border border-border overflow-hidden bg-card flex-1 flex flex-col">
					<Table>
						<TableHeader className="bg-primary rounded-t-lg">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead 
											key={header.id} 
											style={{ 
												width: header.column.id === "description" ? undefined : `${header.getSize()}px`,
												maxWidth: header.column.id === "description" ? "400px" : undefined,
											}}
											className={cn(
												"text-primary-foreground border-r border-border last:border-r-0",
												header.column.id === "description" && "min-w-[200px]"
											)}
										>
											{header.isPlaceholder ? null : (
												<SortableHeader
													column={header.column}
													table={table}
													grouping={grouping}
												/>
											)}
										</TableHead>
									))}
									{/* Extra header for options */}
									<TableHead 
										key="options-header" 
										className="text-primary-foreground"
										style={{ width: "1%" }}
									>
										Options
									</TableHead>
								</TableRow>
							))}
						</TableHeader>
					<TableBody>
						{rows
							.filter((row) => {
								// When grouping is enabled, only render top-level rows (depth 0)
								// to avoid rendering leaf rows that are already shown in expanded groups
								// When no grouping, all rows are top-level
								return grouping.length === 0 || row.depth === 0;
							})
							.map((row) => {
							if (row.getIsGrouped()) {
								const groupDisplay = getGroupDisplay(row, grouping[0]);
								const IconComponent = groupDisplay.icon;
								const isExpanded = row.getIsExpanded();

								return (
									<React.Fragment key={row.id}>
										{/* Group Header Row */}
										<TableRow>
											<TableCell
												colSpan={table.getVisibleLeafColumns().length + 1}
												className="bg-secondary border-b border-border p-0"
											>
												<div className="flex items-center w-full gap-2 p-3">
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 p-0 flex-shrink-0"
														onClick={(e) => {
															e.stopPropagation();
															row.toggleExpanded();
														}}
													>
														{isExpanded ? (
															<ChevronDown className="h-4 w-4" />
														) : (
															<ChevronRight className="h-4 w-4" />
														)}
													</Button>
													<span className="font-medium truncate">
														<p className={groupDisplay.className}>
															{groupDisplay.label}
														</p>
													</span>
													{row.subRows && (
														<span className="text-muted-foreground ml-auto">
															({row.subRows.length} {row.subRows.length > 1 ? "items" : "item"})
														</span>
													)}
												</div>
											</TableCell>
										</TableRow>
										
										{/* Expanded Group Content - Render subRows explicitly */}
										{isExpanded && row.subRows && row.subRows.map((subRow) => (
											<TableRow key={subRow.id}>
												{subRow.getVisibleCells().map((cell) => {
													// Status/Priority cells - use badges like TaskListCard
													if (cell.column.id === "status" || cell.column.id === "priority") {
														const value = cell.getValue() as string;
														const display = getMatchingDisplay(value);
														const IconComponent = display.icon;

														return (
															<TableCell 
																key={cell.id} 
																className="border-r border-border last:border-r-0"
															>
																<Badge
																	variant="secondary"
																	className={cn("text-xs", display.className)}
																	icon={IconComponent ? <IconComponent className="h-3 w-3" /> : undefined}
																>
																	{display.label}
																</Badge>
															</TableCell>
														);
													}

													// Tags cells
													if (cell.column.id === "tags") {
														const tags = cell.getValue<string[] | undefined>();
														return (
															<TableCell 
																key={cell.id}
																className="border-r border-border last:border-r-0"
															>
																<div className="flex flex-wrap gap-1">
																	{tags?.map((tag) => (
																		<Badge
																			key={tag}
																			variant="accent"
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

													// Date cells - format as dd.MM.yyyy
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
															<TableCell 
																key={cell.id}
																className="border-r border-border last:border-r-0"
															>
																{date && !isNaN(date.getTime())
																	? format(date, "dd.MM.yyyy")
																	: "—"}
															</TableCell>
														);
													}

													// Description cells - should fill available space but not too much
													if (cell.column.id === "description") {
														return (
															<TableCell 
																key={cell.id} 
																className="truncate border-r border-border last:border-r-0 min-w-[200px]"
																style={{ maxWidth: "400px" }}
															>
																{cell.getValue<string>()}
															</TableCell>
														);
													}

													// Default cell rendering
													return (
														<TableCell 
															key={cell.id}
															className="border-r border-border last:border-r-0"
														>
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</TableCell>
													);
												})}
												{/* Extra cell for options */}
												<TableCell key="options-cell" className="text-right" style={{ width: "1%" }}>
													<div className="flex justify-end">
														<SettingsButton
															onViewDetails={() => handleEditTask(subRow.original)}
															onDelete={() => handleDeleteTask(subRow.original)}
														/>
													</div>
												</TableCell>
											</TableRow>
										))}
									</React.Fragment>
								);
							} else {
								return (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => {
											// Status/Priority cells - use badges like TaskListCard
											if (cell.column.id === "status" || cell.column.id === "priority") {
												const value = cell.getValue() as string;
												const display = getMatchingDisplay(value);
												const IconComponent = display.icon;

												return (
													<TableCell 
														key={cell.id} 
														className="border-r border-border last:border-r-0"
													>
														<Badge
															variant="secondary"
															className={cn("text-xs", display.className)}
															icon={IconComponent ? <IconComponent className="h-3 w-3" /> : undefined}
														>
															{display.label}
														</Badge>
													</TableCell>
												);
											}

											// Tags cells
											if (cell.column.id === "tags") {
												const tags = cell.getValue<string[] | undefined>();
												return (
													<TableCell 
														key={cell.id}
														className="border-r border-border last:border-r-0"
													>
														<div className="flex flex-wrap gap-1">
															{tags?.map((tag) => (
																<Badge
																	key={tag}
																	variant="accent"
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

											// Date cells - format as dd.MM.yyyy
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
													<TableCell 
														key={cell.id}
														className="border-r border-border last:border-r-0"
													>
														{date && !isNaN(date.getTime())
															? format(date, "dd.MM.yyyy")
															: "—"}
													</TableCell>
												);
											}

											// Description cells - should fill available space but not too much
											if (cell.column.id === "description") {
												return (
													<TableCell 
														key={cell.id} 
														className="truncate border-r border-border last:border-r-0 min-w-[200px]"
														style={{ maxWidth: "400px" }}
													>
														{cell.getValue<string>()}
													</TableCell>
												);
											}

											// Default cell rendering
											return (
												<TableCell 
													key={cell.id}
													className="border-r border-border last:border-r-0"
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											);
										})}
										{/* Extra cell for options */}
										<TableCell key="options-cell" className="text-right" style={{ width: "1%" }}>
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
			</div>
		</TabView>
	);
}
