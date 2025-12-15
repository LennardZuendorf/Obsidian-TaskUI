import type { Row } from "@tanstack/react-table";
import React, { useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Edit, Trash } from "lucide-react";
import { Task, TaskStatus, TaskPriority, TaskMetadata } from "@/data/types/tasks";
import { Badge } from "@/ui/base/Badge";
import { Button } from "@/ui/base/Button";
import { Card } from "@/ui/base/Card";
import { DescInput } from "@/ui/components/forms/fields/DescInput";
import { DatePickerInput } from "@/ui/components/forms/fields/DatePickerInput";
import { PriorityStatusCheckbox } from "./PriorityStatusCheckbox";
import { SettingsButton } from "./SettingsButton";
import { DateDisplay } from "./DateDisplay";
import { getPriorityDisplayConfig, getPriorityDisplay } from "@/ui/lib/config/priority";
import { getStatusDisplayConfig, getStatusDisplay } from "@/ui/lib/config/status";
import { EnumIconButton } from "@/ui/components/forms/fields/EnumSelect";
import { PriorityFlags } from "@/ui/lib/components/PriorityFlags";
import { updateTaskMetadataAtom, availableTagsAtom } from "@/data/taskAtoms";
import { TagInput, type Tag } from "@/ui/components/forms/fields/TagInput";
import { cn } from "@/ui/utils";

const TaskListCard = ({
	DtableRow,
	onEditTask,
	onUpdateTask,
	onDeleteTask,
}: TaskRowProps) => {
	const task = DtableRow.original;
	const updateTaskMetadata = useSetAtom(updateTaskMetadataAtom);
	const availableTags = useAtomValue(availableTagsAtom);

	const [isEditMode, setIsEditMode] = React.useState(false);
	const [editDescription, setEditDescription] = React.useState(task.description);
	const [editStatus, setEditStatus] = React.useState(task.status);
	const [editPriority, setEditPriority] = React.useState(task.priority);
	const [editDueDate, setEditDueDate] = React.useState(task.dueDate);
	const [editScheduledDate, setEditScheduledDate] = React.useState(
		task.scheduledDate,
	);
	// Instead of tagmento, we just use array of Tag for TagInput
	const [editTags, setEditTags] = React.useState<Tag[]>(
		(task.tags || []).map((text) => ({
			id: text,
			text,
		}))
	);
	const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(null);
	const [hasEnoughSpace, setHasEnoughSpace] = React.useState(true);
	const rowRef = useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const taskId = task.id;
		if (taskId) {
			updateTaskMetadata({
				taskId,
				metadataUpdates: { isEditing: isEditMode },
			});
		}
	// We assume updateTaskMetadata is referentially stable (from jotai)
	// Add task.id as dependency in case the row changes to a different task
	}, [isEditMode, task.id, updateTaskMetadata]);

	// Update local state when task changes
	React.useEffect(() => {
		setEditDescription(task.description);
		setEditStatus(task.status);
		setEditPriority(task.priority);
		setEditDueDate(task.dueDate);
		setEditScheduledDate(task.scheduledDate);
		setEditTags((task.tags || []).map((text) => ({ id: text, text })));
	}, [task]);

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

	const handleSave = () => {
		const newTags = editTags.map((tag) => tag.text);
		onUpdateTask({
			...task,
			description: editDescription,
			status: editStatus,
			priority: editPriority,
			dueDate: editDueDate,
			scheduledDate: editScheduledDate,
			tags: newTags,
		});
		setIsEditMode(false);
	};

	const handleCancel = () => {
		setEditDescription(task.description);
		setEditStatus(task.status);
		setEditPriority(task.priority);
		setEditDueDate(task.dueDate);
		setEditScheduledDate(task.scheduledDate);
		setEditTags((task.tags || []).map((text) => ({ id: text, text })));
		setIsEditMode(false);
	};

	const handleDelete = () => {
		onDeleteTask(task);
		setIsEditMode(false);
	};

	if (isEditMode) {
		const statusDisplay = getStatusDisplay(editStatus);
		const priorityDisplay = getPriorityDisplay(editPriority);
		
		return (
			<Card className="border w-full transition-all">
				<div className="flex flex-col gap-3 px-3 py-3">
					{/* Row 1: Status, Priority, Title, Tags */}
					<div className="flex items-start gap-2 flex-row flex-wrap">
						{/* Status Icon Button */}
						<div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Status
							</label>
							<EnumIconButton
								value={editStatus}
								onChange={setEditStatus}
								options={getStatusDisplayConfig()}
								size="icon"
								iconSize="h-4 w-4"
								variant="outline"
								className="flex-shrink-0 px-2"
								ariaLabel={`Status: ${statusDisplay.label}. Click to change status.`}
							/>
						</div>

						{/* Priority Icon Button */}
						<div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Priority
							</label>
							<EnumIconButton
								value={editPriority}
								onChange={setEditPriority}
								options={getPriorityDisplayConfig()}
								size="icon"
								iconSize="h-4 w-4"
								variant="outline"
								className="flex-shrink-0 px-2"
								ariaLabel={`Priority: ${priorityDisplay.label}. Click to change priority.`}
							/>
						</div>

						{/* Description Input */}
						<DescInput
							value={editDescription}
							onChange={setEditDescription}
							showLabel={true}
							variant="compact"
							autoFocus
						/>

						{/* Tags Input */}
						<div className="flex flex-col min-w-20 flex-shrink-0 max-w-100">
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Tags
							</label>
							<TagInput
								tags={editTags}
								setTags={setEditTags}
								activeTagIndex={activeTagIndex}
								setActiveTagIndex={setActiveTagIndex}
								placeholder="Add Tags..."
								className="w-full"
							/>
						</div>
					</div>

					{/* Separator */}
					<div className="border-t border-border" />

					{/* Row 3: Date Inputs + Cancel/Save Buttons */}
					<div className="flex flex-row items-end justify-between gap-3">	

						<div className="flex flex-row  gap-2 items-start ">
							{/* Due Date Input */}
							<DatePickerInput
								label="Due Date"
								value={editDueDate || undefined}
								onChange={(date) => setEditDueDate(date || null)}
								wrapperClassName="flex-1"
							/>

							{/* Scheduled Date Input */}
							<DatePickerInput
								label="Scheduled"
								value={editScheduledDate || undefined}
								onChange={(date) => setEditScheduledDate(date || null)}
								wrapperClassName="flex-1"
							/>
						</div>

						{/* Spacer */}
						<div className="flex-1" />

						<div className="flex flex-row items-center gap-2">
							<Button size="iconsm" onClick={handleDelete}>
								<Trash className="h-4 w-4 text-destructive" />
							</Button>

							<Button size="sm" variant="outline" onClick={handleCancel}>
								Cancel
							</Button>

							{/* Save Button */}
							<Button size="sm" onClick={handleSave}>
								Save
							</Button>
						</div>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card
			className="group border hover:ring-1 hover:ring-hover transition-all w-full cursor-pointer"
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
							<PriorityStatusCheckbox
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

interface TaskRowProps {
	DtableRow: Row<Task>;
	onEditTask: (task: Task) => void; // opens modal
	onDeleteTask: (task: Task) => void;
	onUpdateTask: (task: Task) => void;
}

export { TaskListCard };
