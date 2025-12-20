import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Row, Table as TanstackTable, GroupingState } from "@tanstack/react-table";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Task, TaskStatus } from "@/data/types/tasks";
import { TaskBoardCard } from "@/ui/components/task/TaskBoardCard";
import { getStatusDisplay } from "@/ui/lib/config/status";
import { getMatchingDisplay } from "@/ui/lib/config/utils";
import { cn } from "@/ui/utils";
import { Badge } from "@/ui/base/Badge";
import { Button } from "@/ui/base/Button";

export interface KanbanColumnProps<TData extends Task = Task> {
	status: TaskStatus;
	tasks: Row<TData>[];
	table: TanstackTable<TData>;
	handleEditTask: (task: Task) => void;
	handleDeleteTask: (task: Task) => void;
	handleUpdateTask: (task: Task) => void;
	grouping: GroupingState;
	isCollapsed?: boolean;
	onToggleCollapse?: () => void;
	isDragging?: boolean;
}

/**
 * KanbanColumn - Represents a single status column in the Kanban board
 * - Droppable area for tasks
 * - Displays status header with count
 * - Supports grouping within the column
 */
export const KanbanColumn = <TData extends Task = Task>({
	status,
	tasks,
	table,
	handleEditTask,
	handleDeleteTask,
	handleUpdateTask,
	grouping,
	isCollapsed = false,
	onToggleCollapse,
	isDragging = false,
}: KanbanColumnProps<TData>) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${status}`,
	});

	const statusDisplay = getStatusDisplay(status);
	const StatusIcon = statusDisplay.icon;
	const taskIds = tasks.map((row) => row.original.id);

	// Group tasks if grouping is enabled
	const groupedTasks = React.useMemo(() => {
		if (!grouping || grouping.length === 0) {
			return [{ groupKey: null, tasks }];
		}

		const groups = new Map<string, Row<TData>[]>();
		for (const row of tasks) {
			const groupKey = grouping.map((col) => String(row.getValue(col))).join("-");
			if (!groups.has(groupKey)) {
				groups.set(groupKey, []);
			}
			groups.get(groupKey)?.push(row);
		}

		return Array.from(groups.entries()).map(([groupKey, groupTasks]) => ({
			groupKey,
			tasks: groupTasks,
		}));
	}, [tasks, grouping]);

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex bg-secondary rounded-md transition-all duration-200 shadow-sm outline-none",
				isCollapsed 
					? "min-w-[48px] max-w-[48px] flex-shrink-0 flex-row" 
					: "flex-1 min-w-[280px] max-w-[400px] flex-col",
				isOver && "border-2 border-accent"
			)}
		>
		{/* Collapsed Column Layout */}
		{isCollapsed ? (
			<div className="flex flex-col items-stretch w-full h-full bg-primary rounded-md overflow-hidden shadow-sm">
				{/* Vertical content */}
				<div className="flex flex-col items-center justify-start py-3 px-1 flex-1 gap-3 cursor-pointer hover:bg-primary-foreground/10 transition-all"
					onClick={onToggleCollapse}
				>
					{/* Expand button */}
					<Button
						variant="ghost"
						size="iconsm"
						className="flex-shrink-0 p-0 h-5 w-5 text-primary-foreground hover:bg-primary-foreground/10"
						onClick={(e) => {
							e.stopPropagation();
							onToggleCollapse?.();
						}}
					>
						<ChevronRight className="h-3.5 w-3.5" />
					</Button>
					
					{/* Status icon */}
					<StatusIcon className={cn("h-5 w-5 flex-shrink-0 text-primary-foreground", statusDisplay.iconClassName)} />
					
					{/* Rotated text - writing from bottom to top */}
					<div className="flex-1 flex items-center justify-center min-h-[120px]">
						<span 
							className="font-semibold text-sm text-primary-foreground whitespace-nowrap"
							style={{ 
								writingMode: 'vertical-rl',
								transform: 'rotate(180deg)',
							}}
						>
							{statusDisplay.label}
						</span>
					</div>
					
					{/* Task count badge */}
					<Badge variant="outline" size="sm" className="flex-shrink-0 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
						{tasks.length}
					</Badge>
				</div>
			</div>
		) : (
				<>
					{/* Column Header - Expanded */}
					<div className={cn(
						"flex items-center gap-2 px-4 py-3 bg-primary rounded-t-md transition-all cursor-pointer outline-none",
						isOver && "shadow-lg"
					)}
					onClick={onToggleCollapse}
					>
						<Button
							variant="ghost"
							size="iconsm"
							className="flex-shrink-0 p-0 h-4 w-4 text-primary-foreground hover:bg-primary-foreground/10"
							onClick={(e) => {
								e.stopPropagation();
								onToggleCollapse?.();
							}}
						>
							<ChevronDown className="h-3 w-3" />
						</Button>
						<StatusIcon className={cn("h-4 w-4 text-primary-foreground", statusDisplay.iconClassName)} />
						<span className="font-semibold text-sm text-primary-foreground">
							{statusDisplay.label}
						</span>
						<Badge variant="outline" size="sm" className="ml-auto bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
							{tasks.length}
						</Badge>
					</div>
				</>
			)}

		{/* Column Content - Scrollable (hidden when collapsed) */}
		{!isCollapsed && (
			<div className="flex-1 flex flex-col overflow-y-auto p-2 min-h-[200px] rounded-b-md">
				{/* Drop Area - Visible during active drag at top, highlighted when hovering */}
				{isDragging && (
					<div className={cn(
						"mb-2 rounded-md border-2 border-dashed transition-all flex-shrink-0",
						"flex items-center justify-center min-h-[80px]",
						"animate-in fade-in-0 slide-in-from-top-2 duration-200",
						isOver 
							? "border-accent bg-accent/10 text-accent" 
							: "border-muted-foreground/30 text-muted-foreground"
					)}>
						<div className="flex flex-col items-center gap-1">
							<span className={cn(
								"text-sm font-medium transition-all",
								isOver ? "text-accent" : "text-muted-foreground"
							)}>
								Drop To Move
							</span>
							<span className="text-xs opacity-75">to {statusDisplay.label}</span>
						</div>
					</div>
				)}

				{tasks.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
						<span>No tasks</span>
					</div>
				) : (
					<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
						{groupedTasks.map(({ groupKey, tasks: groupTasks }) => (
							<div key={groupKey || "ungrouped"}>
								{/* Group Header (if grouping is enabled) */}
								{groupKey && grouping.length > 0 && (
									<div className="flex items-center gap-1.5 mb-1.5 px-1.5 py-0.5">
										{grouping.map((col, idx) => {
											const value = groupTasks[0]?.getValue(col);
											const display = getMatchingDisplay(value as string);
											const Icon = display?.icon;

											return (
												<div key={col} className="flex items-center gap-1">
													{Icon && (
														<Icon
															className={cn("h-3.5 w-3.5", display?.iconClassName)}
														/>
													)}
													<span className="text-xs font-medium text-muted-foreground">
														{display?.label || String(value)}
													</span>
													{idx < grouping.length - 1 && (
														<span className="text-muted-foreground mx-0.5">•</span>
													)}
												</div>
											);
										})}
									</div>
								)}

								{/* Tasks in this group */}
								{groupTasks.map((row) => (
									<TaskBoardCard
										key={row.original.id}
										task={row.original}
										onEditTask={handleEditTask}
										onDeleteTask={handleDeleteTask}
										onUpdateTask={handleUpdateTask}
									/>
								))}
							</div>
						))}
					</SortableContext>
				)}
				</div>
			)}
		</div>
	);
};

