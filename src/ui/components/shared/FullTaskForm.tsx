import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { Check, ChevronDownIcon, Circle } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { defaultTags } from "../../../data/defaultData";
import {
	availableTagsAtom,
	updateTaskMetadataAtom,
} from "../../../data/taskAtoms";
import { TaskBuilder } from "../../../data/taskBuilder";
import {
	Task,
	TaskPriority,
	TaskSource,
	TaskStatus,
} from "../../../data/types/tasks";
import {
	getPriorityDisplay,
	getPriorityLabels,
	priorityEnumToString,
	priorityStringToEnum,
} from "../../../ui/lib/displayConfig/priorityDisplayConfig";
import {
	getStatusDisplay,
	getStatusLabels,
	statusEnumToString,
	statusStringToEnum,
} from "../../../ui/lib/displayConfig/statusDisplayConfig";

import { logger } from "../../../utils/logger";
import { Alert } from "../../base/Alert";
import { Badge } from "../../base/Badge";
import { Button } from "../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../base/Command";
import { DateInput, Input } from "../../base/Input";
import { Popover, PopoverContent, PopoverTrigger } from "../../base/Popover";
import { cn } from "../../utils";
import { TagInput } from "./TagInput";
import { type TaskFormValues } from "./TaskFormSchema";

// Define the schema for the form validation using raw tag names
const formSchema = z.object({
	description: z.string().min(1, { message: "Description is required." }),
	status: z.enum([getStatusLabels[0], ...getStatusLabels.slice(1)]),
	priority: z.enum([getPriorityLabels[0], ...getPriorityLabels.slice(1)]),
	tags: z.array(z.string()).optional(),
	dueDate: z.date().optional(),
});

interface TaskFormProps {
	initialTask?: Task | null;
	onSubmit: (task: Task) => void;
	onCancel?: () => void;
	onDelete?: () => void;
}

export default function FullTaskForm({
	onSubmit,
	initialTask,
	onCancel,
	onDelete,
}: TaskFormProps) {
	const updateTaskMetadata = useSetAtom(updateTaskMetadataAtom);
	const taskId = initialTask?.id;
	const globalAvailableTags = useAtomValue(availableTagsAtom);

	const statusLabels = getStatusLabels;
	const priorityLabels = getPriorityLabels;

	// Memoize the list of available tag names to avoid recalculating on every render
	const availableTagNames = useMemo(() => {
		const initialTags =
			initialTask?.tags?.map((t) => (t.startsWith("#") ? t.slice(1) : t)) || [];
		const globalTagNames = globalAvailableTags?.map((t) => t.label) || [];
		// Combine initial tags, global tags, and some default system tags, ensuring uniqueness
		const combined = new Set([
			...initialTags,
			...globalTagNames,
			...defaultTags, // Add some defaults
		]);
		return Array.from(combined);
	}, [globalAvailableTags, initialTask?.tags]);

	const {
		handleSubmit,
		setValue,
		watch,
		reset,
		control,
		getValues,
		formState: { errors, isDirty },
	} = useForm<TaskFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
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
			dueDate: initialTask?.dueDate || undefined,
		},
	});

	const selectedStatusLabel = watch("status");
	const selectedPriorityLabel = watch("priority");
	const selectedTags = watch("tags") || [];

	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);

	useEffect(() => {
		if (taskId) {
			updateTaskMetadata({
				taskId,
				metadataUpdates: { isEditing: true },
			});
			return () => {
				updateTaskMetadata({
					taskId,
					metadataUpdates: { isEditing: false },
				});
			};
		}
		return undefined;
	}, [taskId, updateTaskMetadata]);

	const handleTagCreate = (newTagName: string) => {
		logger.trace(
			`New tag created: ${newTagName}. Consider updating global state.`,
		);
		// Example: addNewGlobalTag({ label: newTagName, value: newTagName.toLowerCase() });
		// For now, the new tag is just available within this form instance via availableTagNames
		// If you want it reflected immediately in availableTagNames, you'd need state management here
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = getValues("tags") || [];
		setValue(
			"tags",
			currentTags.filter((tag) => tag !== tagToRemove),
			{ shouldDirty: true, shouldTouch: true },
		);
	};

	const submitForm = (data: TaskFormValues) => {
		logger.trace("FullTaskForm: Form values submitted", { data });

		const processedTags = (data.tags || []).map((tagName) =>
			tagName.startsWith("#") ? tagName : `#${tagName}`,
		);

		try {
			let builder: TaskBuilder;
			if (initialTask) {
				builder = TaskBuilder.create(initialTask);
			} else {
				builder = TaskBuilder.create();
				builder.setSource(TaskSource.SHARDS);
			}

			builder.setDescription(data.description);
			builder.setStatus(statusStringToEnum[data.status] ?? TaskStatus.TODO);
			builder.setPriority(
				priorityStringToEnum[data.priority] ?? TaskPriority.MEDIUM,
			);
			builder.setTags(processedTags);
			if (data.dueDate) {
				builder.setDueDate(data.dueDate);
			}

			const task = builder.build();
			logger.trace("FullTaskForm: Built task object", { task });
			logger.trace("FullTaskForm: Calling onSubmit prop");
			onSubmit(task);
			reset({
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
				dueDate: initialTask?.dueDate || undefined,
			});
		} catch (error) {
			logger.error("FullTaskForm: Error building task:", error);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			reset({
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
				dueDate: initialTask?.dueDate || undefined,
			});
		}
	};

	return (
		<div className="w-full mx-auto bg-card p-0">
			<form onSubmit={handleSubmit(submitForm)} className="space-y-6 p-6">
				{errors.description && (
					<Alert>
						<div className="flex flex-row space-x-1 items-center">
							<p className="font-bold"> Can't create task: </p>
							<p className="text-wrap">{errors.description.message}</p>
						</div>
					</Alert>
				)}
				<div className="flex items-end gap-3">
					<div className="flex flex-col">
						<label htmlFor="status-input" className="sr-only">
							Status
						</label>
						<Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
							<PopoverTrigger asChild>
								<Button
									aria-label={`Select the Status. Currently: ${selectedStatusLabel}`}
									variant="ghost"
									size="icon"
								>
									{(() => {
										const statusEnum = statusStringToEnum[selectedStatusLabel];
										if (!statusEnum) return <Circle className="h-4 w-4" />;
										const config = getStatusDisplay(statusEnum);
										const IconComponent = config.icon;
										return (
											<IconComponent
												className={cn("h-4 w-4", config.iconClassName)}
											/>
										);
									})()}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto">
								<Command>
									<CommandList>
										<CommandGroup>
											{statusLabels.map((statusLabel) => {
												const statusEnum = statusStringToEnum[statusLabel];
												if (!statusEnum) return null;
												const config = getStatusDisplay(statusEnum);
												const IconComponent = config.icon;
												return (
													<CommandItem
														key={statusLabel}
														value={statusLabel}
														onSelect={() => {
															setValue("status", statusLabel, {
																shouldDirty: true,
																shouldTouch: true,
															});
															setIsStatusOpen(false);
														}}
													>
														<div
															className={cn(
																"flex items-center gap-2 w-full",
																selectedStatusLabel === statusLabel
																	? "font-medium"
																	: "text-muted-foreground-foreground",
																config.className,
															)}
														>
															<IconComponent
																className={cn("h-4 w-4", config.iconClassName)}
															/>
															<span>{statusLabel}</span>
															{selectedStatusLabel === statusLabel && (
																<Check className="ml-auto h-4 w-4" />
															)}
														</div>
													</CommandItem>
												);
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="flex flex-col w-full">
						<label
							htmlFor="description-input"
							className="text-xs text-muted-foreground mb-1 ml-1"
						>
							Task Description
						</label>
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<Input
									id="description-input"
									value={field.value || ""}
									onChange={(stringValue) => field.onChange(stringValue)}
									onBlur={field.onBlur}
									ref={field.ref}
									placeholder="What needs to be done?"
									autoFocus
									className="flex flex-shrink"
									aria-label={`Set the Task Description`}
									aria-invalid={errors.description ? "true" : "false"}
								/>
							)}
						/>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2 justify-items-start">
					<div className="flex flex-col col-span-1 w-full">
						<div className="text-xs text-muted-foreground-foreground-foreground mb-1 ml-1">
							Priority
						</div>
						<Popover
							open={priorityOpen}
							onOpenChange={setPriorityOpen}
							modal={true}
						>
							<PopoverTrigger asChild className="w-full">
								<Button
									aria-haspopup="listbox"
									aria-expanded={priorityOpen}
									aria-label={`Select priority: ${selectedPriorityLabel}`}
									size="fill"
									endIcon={<ChevronDownIcon className="h-4 w-4" />}
								>
									{(() => {
										const priorityEnum =
											priorityStringToEnum[selectedPriorityLabel];
										if (!priorityEnum) return <span>Medium</span>;
										const config = getPriorityDisplay(priorityEnum);
										const IconComponent = config.icon;
										return (
											<div
												className={cn(
													"flex justify-items-start items-center",
													config.className,
												)}
											>
												<IconComponent
													className={cn(
														"inline mr-1 h-4 w-4",
														config.iconClassName,
													)}
												/>
												<span className="ml-1">{config.label}</span>
											</div>
										);
									})()}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)]">
								<Command>
									<CommandList>
										<CommandGroup>
											{priorityLabels.map((priorityLabel) => {
												const priorityEnum =
													priorityStringToEnum[priorityLabel];
												if (!priorityEnum) return null;
												const config = getPriorityDisplay(priorityEnum);
												const IconComponent = config.icon;
												return (
													<CommandItem
														key={priorityLabel}
														value={priorityLabel}
														onSelect={() => {
															setValue("priority", priorityLabel, {
																shouldDirty: true,
																shouldTouch: true,
															});
															setPriorityOpen(false);
														}}
													>
														<div className="flex items-center w-full">
															<IconComponent
																className={cn(
																	"inline mr-2 h-4 w-4",
																	config.iconClassName,
																)}
															/>
															<span className={config.className}>
																{config.label}
															</span>
															<Check
																className={cn(
																	"ml-auto h-4 w-4",
																	selectedPriorityLabel === priorityLabel
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
														</div>
													</CommandItem>
												);
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="flex flex-col col-span-1 w-full">
						<div className="text-xs text-muted-foreground mb-1 ml-1">Tags</div>
						<Controller
							name="tags"
							control={control}
							render={({ field }) => (
								<TagInput
									field={{
										...field,
										value: field.value || [],
									}}
									availableTags={availableTagNames}
									onTagCreate={handleTagCreate}
									placeholder="Add or create tags..."
								/>
							)}
						/>
						{errors.tags && (
							<p role="alert" className="text-xs text-destructive mt-1">
								{errors.tags.message}
							</p>
						)}
					</div>
				</div>

				{selectedTags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{selectedTags.map((tag) => (
							<Badge
								key={tag}
								variant="accent"
								onRemove={() => removeTag(tag)}
								removeAriaLabel={`Remove tag ${tag}`}
							>
								{tag.startsWith("#") ? tag : `#${tag}`}
							</Badge>
						))}
					</div>
				)}

				<div className="flex flex-col w-full">
					<Controller
						name="dueDate"
						control={control}
						render={({ field }) => (
							<DateInput
								label="Due Date"
								value={field.value || new Date()}
								onChange={(date: Date) => field.onChange(date)}
								validation="any"
								aria-label="Set the Task Due Date"
								placeholder="Select a due date"
							/>
						)}
					/>
				</div>

				<div className="flex flex-row justify-end pt-4 gap-2">
					<Button type="button" onClick={handleCancel} aria-label="Cancel">
						Cancel
					</Button>

					<Button
						type="submit"
						aria-label="Save task"
						onClick={handleSubmit(submitForm)}
						disabled={!isDirty && !!initialTask}
					>
						{initialTask ? "Save Changes" : "Create Task"}
					</Button>
				</div>
			</form>
		</div>
	);
}
