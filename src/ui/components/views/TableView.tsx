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
import { TaskPriority, TaskStatus } from "@/data/types/tasks";
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
import { EnumSelect } from "@/ui/components/forms/fields/EnumSelect";
import { SettingsButton } from "@/ui/components/task/SettingsButton";
import type { TabViewProps } from "@/ui/components/TaskView";
import { getColumnDisplay } from "@/ui/lib/config/column";
import { getPriorityDisplayConfig } from "@/ui/lib/config/priority";
import { getStatusDisplayConfig } from "@/ui/lib/config/status";
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
	if (!displayInfo) {
		return null;
	}
	const IconComponent = displayInfo?.icon;
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
				<div className="p-2 h-full flex flex-col">
					<div className="rounded-md border border-border overflow-hidden bg-card">
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
			<Table className="h-fit">
				<TableHeader className="bg-primary rounded-t-md">
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
										className="p-0 border-b border-border bg-primary"
									>
										<div
											className={cn(
												"flex items-center gap-2 px-4 py-3 bg-primary transition-all cursor-pointer border-b border-border",
												// !rounded top here!
											)}
											onClick={() => row.toggleExpanded()}
										>
											<Button
												variant="ghost"
												size="icon"
												className="flex-shrink-0 p-0 h-4 w-4 text-primary-foreground hover:bg-primary-foreground/10"
												onClick={(e) => {
													e.stopPropagation();
													row.toggleExpanded();
												}}
											>
												{isExpanded ? (
													<ChevronDown className="h-3 w-3" />
												) : (
													<ChevronRight className="h-3 w-3" />
												)}
											</Button>
											{IconComponent && (
												<IconComponent className={cn("h-4 w-4 text-primary-foreground", "iconClassName" in groupDisplay ? groupDisplay.iconClassName : undefined)} />
											)}
											<span className="font-semibold text-sm text-primary-foreground truncate">
												{groupDisplay.label}
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
										// Status cells - use EnumSelect for inline editing
										if (cell.column.id === "status") {
											const task = subRow.original as Task;
											const currentStatus = task.status as TaskStatus;

											return (
												<TableCell 
													key={cell.id} 
													className="border-r border-border last:border-r-0"
												>
													<EnumSelect<TaskStatus>
														value={currentStatus}
														onChange={(newStatus) => {
															handleUpdateTask({
																...task,
																status: newStatus,
															} as Task);
														}}
														options={getStatusDisplayConfig()}
														buttonSize="sm"
														showChevron={true}
														className="w-full"
														groupHeading="Status"
													/>
												</TableCell>
											);
										}

										// Priority cells - use EnumSelect for inline editing
										if (cell.column.id === "priority") {
											const task = subRow.original as Task;
											const currentPriority = task.priority as TaskPriority;

											return (
												<TableCell 
													key={cell.id} 
													className="border-r border-border last:border-r-0"
												>
													<EnumSelect<TaskPriority>
														value={currentPriority}
														onChange={(newPriority) => {
															handleUpdateTask({
																...task,
																priority: newPriority,
															} as Task);
														}}
														options={getPriorityDisplayConfig()}
														buttonSize="sm"
														showChevron={true}
														className="w-full"
														groupHeading="Priority"
													/>
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
														<div className="flex flex-wrap gap-2">
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
														className="border-r border-border last:border-r-0 break-words"
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
														className="border-r border-border last:border-r-0 min-w-[200px] break-words"
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
													className="border-r border-border last:border-r-0 break-words"
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											);
										})}
										{/* Extra cell for options */}
										<TableCell key="options-cell" className="text-right" style={{ width: "1%" }}>
											<SettingsButton
												variant="full"
												buttonVariant="outline"
												className="w-full"
												onViewDetails={() => handleEditTask(subRow.original)}
												onDelete={() => handleDeleteTask(subRow.original)}
											/>
										</TableCell>
									</TableRow>
								))}
							</React.Fragment>
						);
					} else {
						return (
							<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => {
								// Status cells - use EnumSelect for inline editing
								if (cell.column.id === "status") {
									const task = row.original as Task;
									const currentStatus = task.status as TaskStatus;

									return (
										<TableCell 
											key={cell.id} 
											className="border-r border-border last:border-r-0"
										>
											<EnumSelect<TaskStatus>
												value={currentStatus}
												onChange={(newStatus) => {
													handleUpdateTask({
														...task,
														status: newStatus,
													} as Task);
												}}
												options={getStatusDisplayConfig()}
												buttonSize="sm"
												buttonVariant="outline"
												showChevron={true}
												className="w-full"
											/>
										</TableCell>
									);
								}

								// Priority cells - use EnumSelect for inline editing
								if (cell.column.id === "priority") {
									const task = row.original as Task;
									const currentPriority = task.priority as TaskPriority;

									return (
										<TableCell 
											key={cell.id} 
											className="border-r border-border last:border-r-0"
										>
											<EnumSelect<TaskPriority>
												value={currentPriority}
												onChange={(newPriority) => {
													handleUpdateTask({
														...task,
														priority: newPriority,
													} as Task);
												}}
												options={getPriorityDisplayConfig()}
												buttonSize="sm"
												buttonVariant="outline"
												showChevron={true}
												className="w-full"
											/>
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
												<div className="flex flex-wrap gap-2">
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
												className="border-r border-border last:border-r-0 break-words"
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
												className="border-r border-border last:border-r-0 min-w-[200px] break-words"
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
											className="border-r border-border last:border-r-0 break-words"
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									);
								})}
								{/* Extra cell for options */}
								<TableCell key="options-cell" className="text-right" style={{ width: "1%" }}>
									<SettingsButton
										variant="full"
										buttonVariant="outline"
										className="w-full"
										onViewDetails={() => handleEditTask(row.original)}
										onDelete={() => handleDeleteTask(row.original)}
									/>
								</TableCell>
							</TableRow>
						);
					}
				})}
			</TableBody>
		</Table>	
		</TabView>
	);
}
