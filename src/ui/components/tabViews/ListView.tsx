import type { Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { DataTablePagination } from "@/ui/components/custom/dtable/DTablePagination";
import { EnumDisplayConfig } from "@/ui/lib/displayConfig/displayConfigTypes";
import { getMatchingDisplay } from "@/ui/lib/displayConfig/utils";
import { cn } from "@/ui/utils";
import type { Task, TaskPriority, TaskStatus } from "../../../data/types/tasks";
import { logger } from "../../../utils/logger";
import { Button } from "../../base/Button";
import { TaskCard } from "../shared/TaskCard";
import type { TabViewProps } from "../TaskView";

// Helper function to render the "No tasks found" message
function NoTasksMessage() {
	return (
		<div className="text-center py-10 border rounded-md mt-4">
			<p className="text-muted-foreground">No tasks found.</p>
		</div>
	);
}

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
	function getGroupDisplay(
		row: Row<TData>,
		groupingKey: string,
	): EnumDisplayConfig {
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
	}

	if (!rows?.length) {
		return <NoTasksMessage />;
	}

	return (
		<div className="overflow-auto p-2 align-center justify-items-center w-full">
			<div className="flex flex-col justify-center px-6 w-full space-y-3">
				{rows.map((row: Row<TData>) => {
					if (grouping.length > 0 && row.getIsGrouped()) {
						const groupDisplay = getGroupDisplay(row, grouping[0]);
						return (
							<div key={`group-${row.id}`} className="space-y-1">
								<div
									className={cn(
										"flex items-center gap-2 p-3 rounded-lg cursor-pointer sticky top-0 z-10",
										row.subRows && row.subRows.length > 0 && "bg-primary",
									)}
								>
									<div
										className="flex items-center w-full space-x-2"
										onClick={() => row.toggleExpanded()}
									>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 p-0 flex-shrink-0"
											onClick={(e) => {
												e.stopPropagation();
												row.toggleExpanded();
											}}
										>
											{row.getIsExpanded() ? (
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
												({row.subRows.length} items)
											</span>
										)}
									</div>
									<Button
										variant="outline"
										disabled={true}
										onClick={handleCreateTask}
									>
										<Plus className="h-4 w-4" />
										<span className="text-sm">Add Task</span>
									</Button>
								</div>
							</div>
						);
					} else {
						return (
							<div
								key={`task-${row.id}`}
								className={cn(grouping.length > 0 && "pl-4")}
							>
								<TaskCard
									DtableRow={row as unknown as Row<Task>}
									onEditTask={handleEditTask}
									onDeleteTask={handleDeleteTask}
									onUpdateTask={(taskFromCard) =>
										handleUpdateTask(taskFromCard as unknown as TData)
									}
								/>
							</div>
						);
					}
				})}
			</div>
			<div className="flex justify-end pt-4">
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}
