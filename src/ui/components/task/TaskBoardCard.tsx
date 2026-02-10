import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/data/types/tasks";
import { Badge } from "@/ui/base/Badge";
import { Card } from "@/ui/base/Card";
import { PriorityStatusCommand } from "./PriorityStatusCheckbox";
import { SettingsButton } from "./SettingsButton";
import { DateDisplay } from "./DateDisplay";
import { PriorityFlags } from "@/ui/lib/components/PriorityFlags";
import { cn } from "@/ui/utils";

export interface TaskBoardCardProps {
	task: Task;
	onEditTask: (task: Task) => void;
	onDeleteTask: (task: Task) => void;
	onUpdateTask: (task: Task) => void;
}

/**
 * TaskBoardCard - Compact card for Kanban board view
 * - Draggable via DnD Kit
 * - Opens modal on click (no inline edit mode)
 * - Includes status menu, priority flags, dates, and tags
 */
export const TaskBoardCard: React.FC<TaskBoardCardProps> = ({
	task,
	onEditTask,
	onDeleteTask,
	onUpdateTask,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
	});

	const [hasDragged, setHasDragged] = React.useState(false);

	// Handle card click to open modal
	const handleCardClick = (e: React.MouseEvent) => {
		// Don't open modal if we just finished dragging
		if (hasDragged || isDragging) {
			setHasDragged(false);
			return;
		}
		onEditTask(task);
	};

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition || "transform 200ms ease",
		opacity: isDragging ? 0.3 : 1,
		cursor: isDragging ? "grabbing" : "grab",
		borderColor: 'var(--background-primary)',
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"group border-2 transition-all cursor-pointer mb-2 shadow-md",
				isDragging && "ring-2 ring-accent shadow-lg"
			)}
			onClick={handleCardClick}
			onMouseDown={() => setHasDragged(false)}
			onMouseMove={() => {
				if (isDragging) setHasDragged(true);
			}}
			{...attributes}
			{...listeners}
		>
			<div className="flex flex-col gap-1.5 p-2.5">
				{/* Row 1: Status + Title + Priority + More Button */}
				<div className="flex items-center gap-1.5">
					<div
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
						onMouseMove={(e) => e.stopPropagation()}
					>
						<PriorityStatusCommand
							status={task.status}
							priority={task.priority}
							onStatusChange={(status) => onUpdateTask({ ...task, status })}
							onPriorityChange={(priority) => onUpdateTask({ ...task, priority })}
						/>
					</div>
					<span
						className={cn(
							"text-sm text-primary-foreground flex-1 min-w-0 line-clamp-2",
							task.status === TaskStatus.DONE && "line-through opacity-60"
						)}
					>
						{task.description}
					</span>
					{task.priority && (
						<div className="flex-shrink-0">
							<PriorityFlags priority={task.priority} size="sm" />
						</div>
					)}
					<div
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
						onMouseMove={(e) => e.stopPropagation()}
						className="flex-shrink-0"
					>
						<SettingsButton
							onViewDetails={() => onEditTask(task)}
							onDelete={() => onDeleteTask(task)}
						/>
					</div>
				</div>

				{/* Row 2: Dates (compact, inline) */}
				{(task.dueDate || task.scheduledDate) && (
					<div className="flex items-center gap-3 pl-7 text-xs">
						{task.dueDate && <DateDisplay date={task.dueDate} label="Due" showIcon={true} />}
						{task.scheduledDate && (
							<DateDisplay date={task.scheduledDate} label="Scheduled" showIcon={true} />
						)}
					</div>
				)}

				{/* Row 3: Tags */}
				{task.tags && task.tags.length > 0 && (
					<div className="flex flex-wrap items-center gap-1 pl-7">
						{task.tags.map((tag: string, index: number) => (
							<Badge key={index} variant="accent" size="sm">
								{tag}
							</Badge>
						))}
					</div>
				)}
			</div>
		</Card>
	);
};

