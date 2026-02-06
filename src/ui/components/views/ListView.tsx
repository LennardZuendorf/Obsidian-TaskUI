import type { Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import React, { useCallback } from "react";
import { DataTablePagination } from "@/ui/components/table/DTablePagination";
import { EnumDisplayConfig } from "@/ui/lib/config/types";
import { getMatchingDisplay } from "@/ui/lib/config/utils";
import { cn } from "@/ui/utils";
import type { Task, TaskPriority, TaskStatus } from "@/data/types/tasks";
import { logger } from "@/utils/logger";
import { Button } from "@/ui/base/Button";
import { Badge } from "@/ui/base/Badge";
import { TaskListCard } from "@/ui/components/task/TaskListCard";
import type { TabViewProps } from "@/ui/components/TaskView";
import { TabView } from "./TabView";
import { ScrollArea } from "@/ui/base/ScrollArea";

const NoTasksMessage = React.memo(() => {
	return (
		<div className="text-center py-10 border rounded-md mt-4">
			<p className="text-muted-foreground">No tasks found.</p>
		</div>
	);
});

export function ListView<TData extends Task>({
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
		(row: Row<TData>, groupingKey: string): EnumDisplayConfig => {
			try {
				const groupValue = row.getValue(groupingKey) as
					| string
					| TaskPriority
					| TaskStatus;
				if (
					groupingKey === "priority" ||
					groupingKey === "status" ||
					groupingKey === "scheduledDate" ||
					groupingKey === "dueDate"
				) {
					return getMatchingDisplay(groupValue as string);
				}
			} catch (error) {
				logger.error(
					"Error getting group display for group value:",
					row.getValue(groupingKey),
					"Key:",
					groupingKey,
					error,
				);
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
			<TabView id="list-view-wrapper-empty" className="flex-1">
				<NoTasksMessage />
			</TabView>
		);
	}

	return (
		<TabView id="list-view-wrapper">
			<div className="relative flex flex-col h-full justify-between">
				<ScrollArea
					id="list-tasks-container"
					className="flex-1 h-fit"
					viewportClassName="w-full"
					viewportStyle={{ scrollSnapType: "y proximity" }}
				>
					<div className="flex flex-col gap-2 w-full">
					{rows
						.filter((row) => {
							// When grouping is enabled, only render top-level rows (depth 0)
							// to avoid rendering leaf rows that are already shown in group.subRows
							// When no grouping, all rows are top-level
							return grouping.length === 0 || row.depth === 0;
						})
						.map((row: Row<TData>) => {
							if (grouping.length > 0 && row.getIsGrouped()) {
								const groupDisplay = getGroupDisplay(row, grouping[0]);
								const GroupIcon = groupDisplay.icon;
								const isExpanded = row.getIsExpanded();

								return (
									<div
										key={`group-${row.id}`}
										className="bg-secondary rounded-md w-full"
										style={{ scrollSnapAlign: "start" }}
									>
										{/* Group Header */}
										<div
											className={cn(
												"flex items-center gap-2 px-4 py-3 bg-primary transition-all cursor-pointer sticky top-0 z-10",
												isExpanded ? "rounded-t-md" : "rounded-md",
												row.subRows && row.subRows.length > 0,
											)}
											onClick={() => row.toggleExpanded()}
										>
											<Button
												variant="ghost"
												size="iconsm"
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
											{GroupIcon && (
												<GroupIcon className={cn("h-4 w-4 text-primary-foreground", groupDisplay.iconClassName)} />
											)}
											<span className="font-semibold text-sm text-primary-foreground truncate">
												{groupDisplay.label}
											</span>
											{row.subRows && (
												<Badge variant="outline" size="sm" className="ml-auto bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
													{row.subRows.length}
												</Badge>
											)}
										</div>

										{/* Group Content */}
										{isExpanded && row.subRows && row.subRows.length > 0 && (
											<div className="!border-primary border-1 border-border border-s border-b border-e rounded-b-md p-2">
												{row.subRows.map((subRow: Row<TData>) => (
													<TaskListCard<TData>
														key={`task-${subRow.id}`}
														DtableRow={subRow}
														onEditTask={() => handleEditTask(subRow.original)}
														onDeleteTask={() => handleDeleteTask(subRow.original)}
														onUpdateTask={(taskFromCard) =>
															handleUpdateTask(taskFromCard as TData)
														}
													/>
												))}
											</div>
										)}
									</div>
								);
							} else {
								return (
									<div
										key={`task-${row.id}`}
										className="w-full"
										style={{ scrollSnapAlign: "start" }}
									>
										<TaskListCard<TData>
											DtableRow={row}
											onEditTask={() => handleEditTask(row.original)}
											onDeleteTask={() => handleDeleteTask(row.original)}
											onUpdateTask={(taskFromCard) =>
												handleUpdateTask(taskFromCard as TData)
											}
										/>
									</div>
								);
							}
						})}
					</div>
				</ScrollArea>
				{/* Blur fade overlay */}
				<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary to-transparent" />
			</div>
		</TabView>
	);
}
