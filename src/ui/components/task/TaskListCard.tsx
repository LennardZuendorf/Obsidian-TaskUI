import type { Row } from "@tanstack/react-table";
import React, { useRef } from "react";
import { Edit } from "lucide-react";
import { Task, TaskStatus } from "@/data/types/tasks";
import { Badge } from "@/ui/base/Badge";
import { Button } from "@/ui/base/Button";
import { Card } from "@/ui/base/Card";
import { PriorityStatusCommand } from "./PriorityStatusCheckbox";
import { SettingsButton } from "./SettingsButton";
import { DateDisplay } from "./DateDisplay";
import { PriorityFlags } from "@/ui/lib/components/PriorityFlags";
import TaskForm, { TaskFormInline } from "@/ui/components/forms/TaskForm";
import { cn } from "@/ui/utils";

const TaskListCard = <TData extends Task = Task>({
	DtableRow,
	onEditTask,
	onUpdateTask,
	onDeleteTask,
}: TaskRowProps<TData>) => {
	const task = DtableRow.original;

	const [isEditMode, setIsEditMode] = React.useState(false);
	const [hasEnoughSpace, setHasEnoughSpace] = React.useState(true);
	const rowRef = useRef<HTMLDivElement>(null);

	// Check if there's enough space for tags in the same row
	React.useEffect(() => {
		const checkSpace = () => {
			if (!rowRef.current || isEditMode) {
				setHasEnoughSpace(true);
				return;
			}
			const row = rowRef.current;
			const titleEl = row.querySelector('[data-title]') as HTMLElement;
			const tagsEl = row.querySelector('[data-tags]') as HTMLElement;
			if (!titleEl || !tagsEl) {
				setHasEnoughSpace(true);
				return;
			}

			const titleWidth = titleEl.clientWidth;
			const tagsWidth = tagsEl.clientWidth;
			const availableWidth = row.clientWidth;
			const idealTagsWidth = (availableWidth - 120) * (1 / 3);
			const usedWidth = titleWidth + tagsWidth + 120; // +120 for buttons/margins

			setHasEnoughSpace(
				usedWidth <= availableWidth && tagsWidth <= idealTagsWidth * 1.2,
			);
		};

		checkSpace();
		window.addEventListener("resize", checkSpace);
		return () => window.removeEventListener("resize", checkSpace);
	}, [task.tags, task.description, isEditMode]);

	const handleSave = (updatedTask: Task) => {
		onUpdateTask(updatedTask);
		setIsEditMode(false);
	};

	const handleCancel = () => {
		setIsEditMode(false);
	};

	const handleDelete = (taskToDelete: Task) => {
		onDeleteTask(taskToDelete);
		setIsEditMode(false);
	};

	const hasDates = task.dueDate || task.scheduledDate;

	if (isEditMode) {
		return (
			<Card 
				className="border-2 w-full transition-all shadow-md"
				style={{ borderColor: 'var(--background-primary)' }}
			>
				<TaskForm
					variant="inline"
					initialTask={task}
					onSubmit={handleSave}
					onCancel={handleCancel}
					onDelete={handleDelete}
				/>
			</Card>
		);
	}

	// Single row layout when no dates
	if (!hasDates) {
		return (
			<Card
				className="group border-2 hover:ring-1 hover:ring-hover transition-all w-full cursor-pointer shadow-md"
				style={{ borderColor: 'var(--background-primary)' }}
				onClick={() => onEditTask(task)}
			>
			<div className="flex items-center gap-2 px-3 py-2">
				{/* Status */}
				<div onClick={(e) => e.stopPropagation()}>
					<PriorityStatusCommand
						status={task.status}
						priority={task.priority}
						onStatusChange={(status) => onUpdateTask({ ...task, status })}
						onPriorityChange={(priority) => onUpdateTask({ ...task, priority })}
					/>
				</div>

				{/* Title + Priority Flags grouped together */}
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<span
						data-title
						className={cn(
							"text-primary-foreground flex-shrink truncate",
							task.status === TaskStatus.DONE && "line-through opacity-60"
						)}
					>
						{task.description}
					</span>

					{/* Priority Flags */}
					<div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
						<PriorityFlags priority={task.priority} size="md" />
					</div>
				</div>

				{/* Tags */}
				{task.tags && task.tags.length > 0 && (
					<div className="flex items-center gap-1 flex-shrink-0">
						{task.tags.map((tag: string, index: number) => (
							<Badge key={index} variant="accent" size="sm">
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Edit button */}
				<Button
					variant="outline"
					size="iconsm"
					onClick={(e) => {
						e.stopPropagation();
						setIsEditMode(true);
					}}
					className="flex-shrink-0"
					aria-label="Quick Edit"
				>
					<Edit className="h-4 w-4" />
				</Button>

				{/* More button */}
				<div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
					<SettingsButton
						onViewDetails={() => onEditTask(task)}
						onDelete={() => onDeleteTask(task)}
					/>
				</div>
			</div>
			</Card>
		);
	}

	// Multi-row layout when dates exist
	return (
		<Card
			className="group border-2 hover:ring-1 hover:ring-hover transition-all w-full cursor-pointer"
			style={{ borderColor: 'var(--background-primary)' }}
			onClick={() => onEditTask(task)}
		>
			<div className="flex flex-col gap-2 px-3 py-2">
				{/* Row 1: Status, Title, Priority Flags -(gap)-> Tags (if space), More Button */}
				<div ref={rowRef} className="flex items-center gap-2">
					{/* Left side: Status + Title + Priority Flags - takes 2/3 when tags visible */}
					<div
						className={cn(
							"flex items-center gap-2 min-w-0",
							hasEnoughSpace && task.tags && task.tags.length > 0
								? "flex-[2]"
								: "flex-1"
						)}
					>
						<div onClick={(e) => e.stopPropagation()}>
							<PriorityStatusCommand
								status={task.status}
								priority={task.priority}
								onStatusChange={(status) => onUpdateTask({ ...task, status })}
								onPriorityChange={(priority) => onUpdateTask({ ...task, priority })}
							/>
						</div>

						{/* Title - make it as short as possible, strikethrough when done */}
						<span
							data-title
							className={cn(
								"text-primary-foreground flex-shrink truncate",
								task.status === TaskStatus.DONE && "line-through opacity-60"
							)}
						>
							{task.description}
						</span>

						{/* Priority Flags */}
						<div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
							<PriorityFlags priority={task.priority} size="md" />
						</div>
					</div>

					{/* Right side: Tags (if space allows) - takes 1/3 when visible */}
					{hasEnoughSpace && task.tags && task.tags.length > 0 && (
						<div
							data-tags
							className="flex items-center gap-1 flex-[1] min-w-0 justify-end"
						>
							{task.tags.map((tag: string, index: number) => (
								<Badge key={index} variant="accent" size="sm">
									{tag}
								</Badge>
							))}
						</div>
					)}

					{/* More button */}
					<div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
						<SettingsButton
							onViewDetails={() => onEditTask(task)}
							onDelete={() => onDeleteTask(task)}
						/>
					</div>
				</div>

				{/* Row 2: Tags subrow (when not enough space) */}
				{!hasEnoughSpace && task.tags && task.tags.length > 0 && (
					<div className="flex items-center gap-2 pl-12">
						{task.tags.map((tag: string, index: number) => (
							<Badge key={index} variant="accent" className="text-xs px-1.5 py-0">
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Row 3: Dates + Edit Button */}
				<div className="flex items-center pl-12 gap-4">
					{/* Dates always get their own div, preserves spacing */}
					<div className="flex items-center gap-4 text-sm flex-1">
						{task.dueDate && <DateDisplay date={task.dueDate} label="Due" />}
						{task.scheduledDate && (
							<DateDisplay date={task.scheduledDate} label="Scheduled" />
						)}
					</div>

					{/* Edit button always at far right */}
					<Button
						variant="outline"
						size="iconsm"
						onClick={(e) => {
							e.stopPropagation();
							setIsEditMode(true);
						}}
						className="flex-shrink-0"
						aria-label="Quick Edit"
					>
						<Edit className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</Card>
	);
};

interface TaskRowProps<TData extends Task = Task> {
	DtableRow: Row<TData>;
	onEditTask: (task: Task) => void; // opens modal
	onDeleteTask: (task: Task) => void;
	onUpdateTask: (task: Task) => void;
}

export { TaskListCard };
