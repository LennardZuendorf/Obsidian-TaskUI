import React from "react";
import {
	DndContext,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
} from "@dnd-kit/core";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { Task, TaskStatus } from "@/data/types/tasks";
import { collapsedColumnsAtom } from "@/data/taskAtoms";
import { KanbanColumn } from "./board/BoardColumn";
import { TabView } from "./TabView";
import type { TabViewProps } from "@/ui/components/TaskView";
import { getOrderedTaskStatuses } from "@/ui/lib/config/status";

const NoTasksMessage = React.memo(() => {
	return (
		<div className="text-center py-10 border rounded-md mt-4">
			<p className="text-muted-foreground">No tasks found.</p>
		</div>
	);
});

/**
 * BoardView - Kanban board view for tasks
 * - Displays tasks in columns by status
 * - Supports drag-and-drop between columns
 * - Maintains grouping, filtering, and sorting within columns
 */
export function BoardView<TData extends Task>({
	table,
	handleEditTask,
	handleDeleteTask,
	handleUpdateTask,
	handleCreateTask,
}: TabViewProps<TData>) {
	const grouping = table.getState().grouping;
	const rows = table.getRowModel().rows;

	// Track collapsed columns using persistent Jotai atom
	const [collapsedColumnsArray, setCollapsedColumnsArray] = useAtom(collapsedColumnsAtom);
	
	// Convert array to Set for easier checking
	const collapsedColumns = React.useMemo(
		() => new Set(collapsedColumnsArray),
		[collapsedColumnsArray]
	);

	const toggleColumn = (status: TaskStatus) => {
		setCollapsedColumnsArray((prev) => {
			if (prev.includes(status)) {
				return prev.filter((s) => s !== status);
			} else {
				return [...prev, status];
			}
		});
	};

	// Configure DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Require 8px movement before drag starts
			},
		})
	);

	// Handle drag end - update task status when dropped on a column
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active || !over) return;

		// Find the dragged task
		const draggedRow = rows.find((row) => row.id === active.id);
		if (!draggedRow) return;

		const originalTask = draggedRow.original;

		// Check if dropped on a column (status change)
		if (typeof over.id === "string" && over.id.startsWith("column-")) {
			const newStatus = over.id.replace("column-", "") as TaskStatus;

			// Only update if status actually changed
			if (originalTask.status !== newStatus) {
				const updatedTask = {
					...originalTask,
					status: newStatus,
				};

				// Use handleUpdateTask prop to trigger state update and API sync
				handleUpdateTask(updatedTask);
			}
		}
	};

	// Group tasks by status
	const tasksByStatus = React.useMemo(() => {
		const statusMap = new Map<TaskStatus, typeof rows>();

		// Initialize all statuses with empty arrays
		getOrderedTaskStatuses().forEach((status) => {
			statusMap.set(status, []);
		});

		// Group rows by status
		rows.forEach((row) => {
			const status = row.original.status;
			if (!statusMap.has(status)) {
				statusMap.set(status, []);
			}
			statusMap.get(status)?.push(row);
		});

		return statusMap;
	}, [rows]);

	if (!rows?.length) {
		return (
			<TabView className="flex-1">
				<NoTasksMessage />
			</TabView>
		);
	}

	return (
		<TabView id="board-view-wrapper" className="overflow-hidden">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<div id="board-columns-container" className="flex gap-4 p-3 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
					{getOrderedTaskStatuses().map((status) => (
						<KanbanColumn
							key={status}
							status={status}
							tasks={tasksByStatus.get(status) || []}
							table={table}
							handleEditTask={handleEditTask}
							handleDeleteTask={handleDeleteTask}
							handleUpdateTask={handleUpdateTask}
							grouping={grouping}
							isCollapsed={collapsedColumns.has(status)}
							onToggleCollapse={() => toggleColumn(status)}
						/>
					))}
				</div>
			</DndContext>
		</TabView>
	);
}
