import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { Trash } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { format } from "date-fns";
import { useSettings } from "../../../config/settings";
import {
	availableTagsAtom,
	updateTaskMetadataAtom,
	updateTaskAtom,
} from "@/data/taskAtoms";
import { TaskBuilder } from "@/data/taskBuilder";
import {
	Task,
	TaskPriority,
	TaskSource,
	TaskStatus,
} from "@/data/types/tasks";
import {
	getPriorityDisplay,
	getPriorityLabels,
	getPriorityDisplayConfig,
	priorityEnumToString,
	priorityStringToEnum,
} from "@/ui/lib/config/priority";
import {
	getStatusDisplay,
	getStatusLabels,
	getStatusDisplayConfig,
	statusEnumToString,
	statusStringToEnum,
} from "@/ui/lib/config/status";
import { logger } from "@/utils/logger";
import { Alert } from "@/ui/base/Alert";
import { Button } from "@/ui/base/Button";
import { DatePickerInput } from "./fields/DatePickerInput";
import { DescInput } from "./fields/DescInput";
import { EnumIconSelect, EnumIconButton } from "./fields/EnumSelect";
import { TagInput, type Tag } from "@/ui/components/forms/fields/TagInput";
import { taskFormSchema, type TaskFormValues } from "./TaskFormSchema";

/**
 * Helper function to convert Tag[] (from TagInput) to string[] (for form)
 */
function tagsToStringArray(tags: Tag[]): string[] {
	return tags.map((tag) => tag.text);
}

/**
 * Helper function to convert string[] (from form) to Tag[] (for TagInput)
 */
function stringArrayToTags(tags: string[]): Tag[] {
	return tags.map((text) => ({
		id: text,
		text,
	}));
}

/**
 * Helper function to get default form values from an initial task.
 */
function getDefaultFormValues(
	initialTask: Task | null | undefined,
	statusLabels: string[],
	priorityLabels: string[],
): TaskFormValues {
	return {
		description: initialTask?.description || "",
		status: initialTask
			? (statusEnumToString[initialTask.status] ?? statusLabels[0])
			: statusLabels[0],
		priority: initialTask
			? (priorityEnumToString[initialTask.priority] ?? priorityLabels[2])
			: priorityLabels[2],
		tags:
			initialTask?.tags?.map((tag) =>
				tag.startsWith("#") ? tag.slice(1) : tag,
			) || [],
		dueDate: initialTask?.dueDate ?? null,
		scheduledDate: initialTask?.scheduledDate ?? null,
	};
}

export interface TaskFormProps {
	initialTask?: Task | null;
	onSubmit: (task: Task) => void;
	onCancel?: () => void;
	onDelete?: (task: Task) => void;
	variant?: "full" | "inline";
	onUpdateMetadata?: (isEditing: boolean) => void;
}

// ============================================================================
// UNIFIED TASK FORM COMPONENT
// ============================================================================

export function TaskForm({
	initialTask,
	onSubmit,
	onCancel,
	onDelete,
	variant = "full",
	onUpdateMetadata,
}: TaskFormProps) {
	const updateTaskMetadata = useSetAtom(updateTaskMetadataAtom);
	const taskId = initialTask?.id;
	const globalAvailableTags = useAtomValue(availableTagsAtom);
	const allTasks = useAtomValue(updateTaskAtom);
	const settings = useSettings();

	const statusLabels = getStatusLabels;
	const priorityLabels = getPriorityLabels;

	// Memoize the list of available tag names
	const availableTagNames = useMemo(() => {
		const initialTags =
			initialTask?.tags?.map((t) => (t.startsWith("#") ? t.slice(1) : t)) || [];
		const globalTagNames = globalAvailableTags?.map((t) => t.label) || [];
		const combined = new Set([...initialTags, ...globalTagNames]);
		return Array.from(combined);
	}, [globalAvailableTags, initialTask?.tags]);

	// Find tasks that are blocked by this task (only for full variant)
	const blockedTasks = useMemo(() => {
		if (variant !== "full" || !initialTask?.id) return [];
		return allTasks.filter((task) => task.blocks?.includes(initialTask.id));
	}, [allTasks, initialTask?.id, variant]);

	// Form setup
	const {
		handleSubmit,
		setValue,
		watch,
		reset,
		control,
		formState: { errors, isDirty, isValid },
	} = useForm<TaskFormValues>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: getDefaultFormValues(
			initialTask,
			statusLabels,
			priorityLabels,
		),
		mode: "onChange",
	});

	// Watch form values
	const selectedStatusLabel = watch("status");
	const selectedPriorityLabel = watch("priority");
	const selectedStatusEnum =
		statusStringToEnum[selectedStatusLabel] ?? TaskStatus.TODO;
	const selectedPriorityEnum =
		priorityStringToEnum[selectedPriorityLabel] ?? TaskPriority.MEDIUM;
	const selectedTags = watch("tags") || [];

	// Tag state management
	const [editTags, setEditTags] = useState<Tag[]>(
		stringArrayToTags(selectedTags),
	);
	const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

	// Update tags state when form tags change
	useEffect(() => {
		setEditTags(stringArrayToTags(selectedTags));
	}, [selectedTags]);

	// Reset form when initialTask changes
	useEffect(() => {
		const defaultValues = getDefaultFormValues(
			initialTask,
			statusLabels,
			priorityLabels,
		);
		reset(defaultValues);
		setEditTags(stringArrayToTags(defaultValues.tags || []));
	}, [initialTask, reset, statusLabels, priorityLabels]);

	// Update metadata when form is active
	useEffect(() => {
		if (taskId) {
			updateTaskMetadata({
				taskId,
				metadataUpdates: { isEditing: true },
			});
			onUpdateMetadata?.(true);
			return () => {
				updateTaskMetadata({
					taskId,
					metadataUpdates: { isEditing: false },
				});
				onUpdateMetadata?.(false);
			};
		}
		return undefined;
	}, [taskId, updateTaskMetadata, onUpdateMetadata]);

	// Display values
	const statusDisplay = getStatusDisplay(selectedStatusEnum);
	const priorityDisplay = getPriorityDisplay(selectedPriorityEnum);
	const displayPath = initialTask?.path || settings.defaultPath;

	// Handlers
	const submitForm = (data: TaskFormValues) => {
		logger.trace("TaskForm: Form values submitted", { data, variant });

		// Convert tags to task format (with # prefix)
		const processedTags = data.tags?.map((tag) =>
			tag.startsWith("#") ? tag : `#${tag}`,
		) || [];

		try {
			let builder: TaskBuilder;
			if (initialTask) {
				builder = TaskBuilder.create(initialTask);
			} else {
				builder = TaskBuilder.create();
				builder.setSource(TaskSource.TASKUI);
				builder.setPath(settings.defaultPath);
			}

			builder.setDescription(data.description);
			builder.setStatus(selectedStatusEnum ?? TaskStatus.TODO);
			builder.setPriority(selectedPriorityEnum ?? TaskPriority.MEDIUM);
			builder.setTags(processedTags);
			builder.setDueDate(data.dueDate ?? null);
			builder.setScheduledDate(data.scheduledDate ?? null);

			const task = builder.build();
			logger.trace("TaskForm: Built task object", { task });
			onSubmit(task);
			reset(getDefaultFormValues(initialTask, statusLabels, priorityLabels));
		} catch (error) {
			logger.error("TaskForm: Error building task:", error);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			const defaultValues = getDefaultFormValues(
				initialTask,
				statusLabels,
				priorityLabels,
			);
			reset(defaultValues);
			setEditTags(stringArrayToTags(defaultValues.tags || []));
		}
	};

	const handleDelete = () => {
		if (onDelete && initialTask) {
			onDelete(initialTask);
		}
	};

	// Memoize onChange handlers
	const handleStatusChange = useCallback(
		(status: TaskStatus) => {
			const label = statusEnumToString[status];
			setValue("status", label, {
				shouldDirty: true,
				shouldTouch: true,
			});
		},
		[setValue],
	);

	const handlePriorityChange = useCallback(
		(priority: TaskPriority) => {
			const label = priorityEnumToString[priority];
			setValue("priority", label, {
				shouldDirty: true,
				shouldTouch: true,
			});
		},
		[setValue],
	);

	// Render based on variant
	if (variant === "inline") {
		return (
			<form onSubmit={handleSubmit(submitForm)}>
				<div className="flex flex-col gap-3 px-3 py-3">
					{/* Validation Error Alert */}
					{errors.description && (
						<Alert>
							<div className="flex flex-row space-x-1 items-center">
								<p className="font-bold">Can't save task: </p>
								<p className="text-wrap">{errors.description.message}</p>
							</div>
						</Alert>
					)}

					{/* Row 1: Status, Priority, Title, Tags */}
					<div className="flex items-start gap-2 flex-row flex-wrap">
							{/* Status Icon Button */}
							<div
								className="flex flex-col"
								onClick={(e) => e.stopPropagation()}
							>
								<label className="text-xs text-muted-foreground mb-1 ml-1">
									Status
								</label>
								<EnumIconButton
									value={selectedStatusEnum}
									onChange={handleStatusChange}
									options={getStatusDisplayConfig()}
									size="icon"
									iconSize="h-4 w-4"
									variant="outline"
									className="flex-shrink-0 px-2"
									ariaLabel={`Status: ${statusDisplay.label}. Click to change status.`}
								/>
							</div>

							{/* Priority Icon Button */}
							<div
								className="flex flex-col"
								onClick={(e) => e.stopPropagation()}
							>
								<label className="text-xs text-muted-foreground mb-1 ml-1">
									Priority
								</label>
								<EnumIconButton
									value={selectedPriorityEnum}
									onChange={handlePriorityChange}
									options={getPriorityDisplayConfig()}
									size="icon"
									iconSize="h-4 w-4"
									variant="outline"
									className="flex-shrink-0 px-2"
									ariaLabel={`Priority: ${priorityDisplay.label}. Click to change priority.`}
								/>
							</div>

							{/* Description Input */}
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<DescInput
										value={field.value || ""}
										onChange={field.onChange}
										onBlur={field.onBlur}
										inputRef={field.ref}
										error={errors.description?.message}
										showLabel={true}
										variant="compact"
										autoFocus
									/>
								)}
							/>

							{/* Tags Input */}
							<div className="flex flex-col min-w-20 flex-shrink-0 max-w-100">
								<label className="text-xs text-muted-foreground mb-1 ml-1">
									Tags
								</label>
								<Controller
									name="tags"
									control={control}
									render={({ field }) => (
										<TagInput
											tags={editTags}
											setTags={(newTags: Tag[]) => {
												setEditTags(newTags);
												const taskTags = tagsToStringArray(newTags);
												setValue("tags", taskTags, {
													shouldDirty: true,
													shouldTouch: true,
												});
											}}
											activeTagIndex={activeTagIndex}
											setActiveTagIndex={setActiveTagIndex}
											placeholder="Add Tags..."
											className="w-full"
										/>
									)}
								/>
							</div>
						</div>

						{/* Separator */}
						<div className="border-t border-border" />

						{/* Row 3: Date Inputs + Cancel/Save Buttons */}
						<div className="flex flex-row items-end justify-between gap-3">
							<div className="flex flex-row gap-2 items-start">
								{/* Due Date Input */}
								<Controller
									name="dueDate"
									control={control}
									render={({ field }) => (
										<DatePickerInput
											label="Due Date"
											value={field.value ?? null}
											onChange={(date) => field.onChange(date ?? null)}
											wrapperClassName="flex-1"
										/>
									)}
								/>

								{/* Scheduled Date Input */}
								<Controller
									name="scheduledDate"
									control={control}
									render={({ field }) => (
										<DatePickerInput
											label="Scheduled"
											value={field.value ?? null}
											onChange={(date) => field.onChange(date ?? null)}
											wrapperClassName="flex-1"
										/>
									)}
								/>
							</div>

							{/* Spacer */}
							<div className="flex-1" />

							<div className="flex flex-row items-center gap-2">
								<Button
									type="button"
									size="iconsm"
									onClick={handleDelete}
								>
									<Trash className="h-4 w-4 text-destructive" />
								</Button>

								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={handleCancel}
								>
									Cancel
								</Button>

								<Button
									type="submit"
									size="sm"
									disabled={!isValid || (!isDirty && !!initialTask)}
									aria-label="Save task"
								>
									Save
								</Button>
							</div>
						</div>
					</div>
				</form>
		);
	}

	// Full variant
	return (
		<div className="w-full mx-auto bg-card p-0 overflow-visible">
			<form
				onSubmit={handleSubmit(submitForm)}
				className="space-y-6 p-6 overflow-visible"
			>
				{/* Validation Error Alert */}
				{errors.description && (
					<Alert>
						<div className="flex flex-row space-x-1 items-center">
							<p className="font-bold">Can't save task: </p>
							<p className="text-wrap">{errors.description.message}</p>
						</div>
					</Alert>
				)}

				{/* Section 1: Status, Priority, Title, and Tags */}
				<div className="flex flex-col gap-3">
					<div className="flex items-start gap-2 flex-row flex-wrap">
						{/* Status Icon Button */}
						<div className="flex flex-col flex-shrink-0">
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Status
							</label>
							<EnumIconSelect
								value={selectedStatusEnum}
								onChange={handleStatusChange}
								options={getStatusDisplayConfig()}
								size="icon"
								iconSize="h-4 w-4"
								variant="default"
								className="flex-shrink-0 px-2"
								groupHeading="Status"
								ariaLabel={`Status: ${statusDisplay.label}. Click to change status.`}
							/>
						</div>

						{/* Priority Icon Button */}
						<div className="flex flex-col flex-shrink-0">
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Priority
							</label>
							<EnumIconSelect
								value={selectedPriorityEnum}
								onChange={handlePriorityChange}
								options={getPriorityDisplayConfig()}
								size="icon"
								iconSize="h-4 w-4"
								variant="default"
								className="flex-shrink-0 px-2"
								groupHeading="Priority"
								ariaLabel={`Priority: ${priorityDisplay.label}. Click to change priority.`}
							/>
						</div>

						{/* Description Input */}
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<DescInput
									value={field.value || ""}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={errors.description?.message}
									showLabel={true}
									variant="compact"
									wrapperClassName="min-w-40 flex-1 basis-0"
									autoFocus
								/>
							)}
						/>

						{/* Tags Input - Full width on wrap */}
						<div className="flex flex-col w-full min-w-0 basis-full">
							<label className="text-xs text-muted-foreground mb-1 ml-1">
								Tags
							</label>
							<Controller
								name="tags"
								control={control}
								render={({ field }) => (
									<TagInput
										tags={editTags}
										setTags={(newTags: Tag[]) => {
											setEditTags(newTags);
											const taskTags = tagsToStringArray(newTags);
											setValue("tags", taskTags, {
												shouldDirty: true,
												shouldTouch: true,
											});
										}}
										activeTagIndex={activeTagIndex}
										setActiveTagIndex={setActiveTagIndex}
										placeholder="Add Tags..."
										className="w-full min-w-0"
										onBlur={field.onBlur}
									/>
								)}
							/>
						</div>
					</div>
				</div>

				{/* Separator */}
				<div className="border-t border-border" />

				{/* Section 2: Dates */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2 items-start">
						<Controller
							name="dueDate"
							control={control}
							render={({ field }) => (
								<DatePickerInput
									label="Due Date"
									className="w-full"
									value={field.value ?? null}
									onChange={(date) => field.onChange(date ?? null)}
									wrapperClassName="w-full"
								/>
							)}
						/>

						<Controller
							name="scheduledDate"
							control={control}
							render={({ field }) => (
								<DatePickerInput
									label="Scheduled"
									className="w-full"
									value={field.value ?? null}
									onChange={(date) => field.onChange(date ?? null)}
									wrapperClassName="w-full"
								/>
							)}
						/>
					</div>
				</div>

				{/* Separator */}
				<div className="border-t border-border" />

				{/* Section 3: Task Relations (Display Only) */}
				<div className="flex flex-col gap-3">
					<div className="text-sm font-medium">Task Relations</div>

					{/* Tasks Blocked by This */}
					<div className="flex flex-col gap-1 min-w-0">
						<label className="text-xs text-muted-foreground">
							Tasks Blocked by This
						</label>
						<div className="text-sm text-muted-foreground pl-2 break-words">
							{blockedTasks.length > 0 ? (
								<ul className="list-disc list-inside space-y-1">
									{blockedTasks.map((task) => (
										<li key={task.id} className="break-words">
											{task.description}
										</li>
									))}
								</ul>
							) : (
								<span className="italic">None</span>
							)}
						</div>
					</div>

					{/* Subtasks */}
					<div className="flex flex-col gap-1 min-w-0">
						<label className="text-xs text-muted-foreground">Subtasks</label>
						<div className="text-sm text-muted-foreground pl-2 break-words">
							{initialTask?.subtasks && initialTask.subtasks.length > 0 ? (
								<ul className="list-disc list-inside space-y-1">
									{initialTask.subtasks.map((subtask) => (
										<li key={subtask.id} className="break-words">
											{subtask.description}
										</li>
									))}
								</ul>
							) : (
								<span className="italic">None</span>
							)}
						</div>
					</div>
				</div>

				{/* Separator */}
				<div className="border-t border-border" />

				{/* Section 4: Metadata (Display Only) */}
				<div className="flex flex-col gap-3">
					<div className="text-sm font-medium">Metadata</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{/* Obsidian File Path */}
						<div className="flex flex-col gap-1 min-w-0">
							<label className="text-xs text-muted-foreground">File Path</label>
							<div className="text-sm text-muted-foreground pl-2 break-words">
								{displayPath}
							</div>
						</div>

						{/* Created Date */}
						<div className="flex flex-col gap-1 min-w-0">
							<label className="text-xs text-muted-foreground">
								Created Date
							</label>
							<div className="text-sm text-muted-foreground pl-2 break-words">
								{initialTask?.createdDate
									? format(initialTask.createdDate, "MMM d, yyyy")
									: "—"}
							</div>
						</div>

						{/* Symbol */}
						<div className="flex flex-col gap-1 min-w-0">
							<label className="text-xs text-muted-foreground">Symbol</label>
							<div className="text-sm text-muted-foreground pl-2 break-words">
								{initialTask?.symbol || "—"}
							</div>
						</div>
					</div>
				</div>

				{/* Separator */}
				<div className="border-t border-border" />

				{/* Section 5: Action Buttons */}
				<div className="flex flex-row justify-end pt-4 gap-2">
					{/* Delete Button - Only show when editing existing task */}
					{initialTask && onDelete && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleDelete}
							aria-label="Delete task"
						>
							<Trash className="h-4 w-4 mr-2" />
							Delete
						</Button>
					)}

					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={handleCancel}
						aria-label="Cancel"
					>
						Cancel
					</Button>

					<Button
						type="submit"
						size="sm"
						aria-label="Save task"
						disabled={!isValid || (!isDirty && !!initialTask)}
					>
						{initialTask ? "Save Changes" : "Create Task"}
					</Button>
				</div>
			</form>
		</div>
	);
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const TaskFormFull = (props: Omit<TaskFormProps, "variant">) => (
	<TaskForm {...props} variant="full" />
);

export const TaskFormInline = (
	props: Omit<TaskFormProps, "variant"> & { initialTask: Task },
) => <TaskForm {...props} variant="inline" />;

// Export for backward compatibility
export const TaskFormComponents = {
	Full: TaskFormFull,
	Inline: TaskFormInline,
};

export default TaskForm;
