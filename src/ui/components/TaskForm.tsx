import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, addWeeks, format, parseISO } from "date-fns";
import { Tag, TagInput } from "emblor"; // <-- Import emblor components
import { useSetAtom } from "jotai"; // <-- Import useSetAtom
import { CalendarIcon } from "lucide-react"; // <-- Import ChevronDown
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { updateTaskMetadataAtom } from "../../data/taskAtoms"; // <-- Import the new atom
import { TaskBuilder } from "../../data/taskBuilder";
import {
	Task,
	TaskPriority,
	TaskSource,
	TaskStatus,
} from "../../data/types/tasks"; // Keep full Task type for props/builder
import { logger } from "../../utils/logger";
import { Button } from "../base/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../base/Form"; // Import new base form components
import { Input } from "../base/Input";
import { Separator } from "../base/Separator";
import { InlineCalendar } from "./InlineCalendar"; // <-- Import the new component
import { PrioritySelect } from "./PrioritySelect"; // <-- Import PrioritySelect
import { StatusSelect } from "./StatusSelect"; // <-- Import StatusSelect

// Define Tag schema for form validation
const TagSchema = z.object({
	id: z.string(),
	text: z.string(),
});

// Schema for the form data (subset of Task)
const formSchema = z.object({
	description: z.string().min(1, { message: "Description is required." }),
	priority: z.nativeEnum(TaskPriority), // <-- Add priority to schema
	status: z.nativeEnum(TaskStatus), // <-- Add status to schema
	tags: z.array(TagSchema).optional(), // <-- Add tags array using TagSchema
	dueDate: z.date().nullable().optional(), // <-- Add dueDate to schema
	// Add other fields here later
});

// Utility function to normalize a single tag string
const normalizeTag = (tag: string): string => {
	const trimmed = tag.trim();
	if (!trimmed) return ""; // Return empty if only whitespace
	return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const mapStringsToTags = (tagStrings: string[] | undefined | null): Tag[] => {
	if (!tagStrings) return [];
	const normalizedTags = tagStrings
		.map(normalizeTag) // Ensure format
		.filter((tag) => tag !== ""); // Remove empty tags
	// Ensure uniqueness
	const uniqueTags = Array.from(new Set(normalizedTags));
	return uniqueTags.map((tag) => ({ id: tag, text: tag }));
};

interface TaskFormProps {
	onSubmit: (task: Task) => void;
	initialTask: Task | null; // Allow null for new tasks
}

export function TaskForm({ onSubmit, initialTask }: TaskFormProps) {
	const updateTaskMetadata = useSetAtom(updateTaskMetadataAtom); // <-- Get the setter
	const taskId = initialTask?.id; // <-- Store initialTask ID

	const [emblorTags, setEmblorTags] = React.useState<Tag[]>(
		mapStringsToTags(initialTask?.tags ?? []),
	);
	// --> ADD State for active tag index <--
	const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
		null,
	);

	// 1. Define the form using useForm
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description: initialTask?.description ?? "",
			priority: initialTask?.priority ?? TaskPriority.MEDIUM, // <-- Set default priority
			status: initialTask?.status ?? TaskStatus.TODO, // <-- Set default status
			tags: mapStringsToTags(initialTask?.tags ?? []), // <-- Set default tags (mapped)
			dueDate: initialTask?.dueDate ?? null, // <-- Set default dueDate
		},
	});

	// Watch dueDate for CollapsibleTrigger
	const watchedDueDate = form.watch("dueDate");

	// 2. Define the submit handler
	function onFormSubmit(values: z.infer<typeof formSchema>) {
		// values are type-safe and validated
		logger.info("react-hook-form submitted values:", values);

		// --> ADD LOGGING HERE <--
		logger.debug(
			"[TaskForm] onFormSubmit started. initialTask:",
			JSON.stringify(initialTask, null, 2),
		);

		// Build the full Task object using TaskBuilder
		let builder: TaskBuilder;

		// Map form tags (Tag[]), normalize, filter, and ensure uniqueness
		const normalizedTags =
			values.tags
				?.map((tag) => normalizeTag(tag.text)) // Normalize text from Tag object
				.filter((tag) => tag !== "") ?? []; // Filter empty
		const uniqueTagStrings = Array.from(new Set(normalizedTags)); // Ensure uniqueness

		if (initialTask) {
			// Editing existing task
			builder = TaskBuilder.create(initialTask);
			// --> ADD LOGGING HERE <--
			logger.debug(
				"[TaskForm] Builder created for EDIT. Builder state:",
				JSON.stringify((builder as any).partialTask, null, 2),
			);
			builder.setDescription(values.description);
			builder.setPriority(values.priority);
			builder.setStatus(values.status);
			builder.setTags(uniqueTagStrings); // <-- Set normalized, unique string tags
			builder.setDueDate(values.dueDate ?? null); // <-- Set dueDate from form
		} else {
			// Creating new task
			builder = TaskBuilder.create(); // Start with builder defaults
			// --> ADD LOGGING HERE <--
			logger.debug(
				"[TaskForm] Builder created for NEW. Builder state (initial):",
				JSON.stringify((builder as any).partialTask, null, 2),
			);
			builder.setDescription(values.description);
			// Explicitly set required fields not in the form yet to default			builder.setStatus(values.status);
			builder.setPriority(values.priority);
			builder.setTags(uniqueTagStrings); // <-- Set normalized, unique string tags
			builder.setSource(TaskSource.SHARDS);
			builder.setDueDate(values.dueDate ?? null); // <-- Set dueDate from form
			logger.debug(
				"[TaskForm] Builder state for NEW (after setting defaults):",
				JSON.stringify((builder as any).partialTask, null, 2),
			);
			// Set other required fields if TaskBuilder defaults aren't sufficient
			// builder.setPath("..."); // If path is required and not defaulted
		}

		// --> ADD LOGGING HERE <--
		logger.debug(
			"[TaskForm] State BEFORE build():",
			JSON.stringify((builder as any).partialTask, null, 2),
		);

		try {
			const task = builder.build();
			logger.info("Submitting built task:", task);
			onSubmit(task); // Pass the complete Task object
		} catch (error) {
			// Log the error from builder.build() which includes validation details
			logger.error("Error building task:", error);
			// Optionally: Show error to user via form state or toast
			// form.setError("root", { type: "manual", message: `Failed to save task: ${error.message}` });
		}
	}

	// Helper function to set due date from presets
	const setDueDatePreset = (
		e: React.MouseEvent<HTMLButtonElement>,
		date: Date,
	) => {
		e.stopPropagation(); // Prevent modal closing
		form.setValue("dueDate", date, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	// Effect to manage the editing state flag
	React.useEffect(() => {
		if (taskId) {
			// Set editing flag to true when form mounts
			updateTaskMetadata({
				taskId,
				metadataUpdates: { isEditing: true },
			});

			// Cleanup function: Set editing flag to false when form unmounts
			return () => {
				updateTaskMetadata({
					taskId,
					metadataUpdates: { isEditing: false },
				});
			};
		}
		return undefined;
	}, [taskId, updateTaskMetadata]); // Depend on taskId and the setter function

	return (
		// 3. Build the form structure
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onFormSubmit)}
				className="space-y-4 p-4"
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
			>
				{/* --- Row 1: Status + Description --- */}
				<div className="flex items-center space-x-2">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormControl>
								<StatusSelect
									value={field.value}
									onChange={field.onChange}
									className="flex-shrink-0" // Prevent shrinking
								/>
							</FormControl>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem className="flex-grow">
								{" "}
								{/* Allow description to grow */}
								<FormControl>
									<Input
										placeholder="Enter task description..."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* --- Row 2: Priority + Tags --- */}
				<div className="flex items-start space-x-2">
					{" "}
					{/* items-start for alignment */}
					<FormField
						control={form.control}
						name="priority"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Priority</FormLabel>
								<FormControl>
									<PrioritySelect
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Controller
						name="tags"
						control={form.control}
						render={({ field }) => (
							<FormItem className="flex-grow">
								{" "}
								{/* Allow tags to grow */}
								<FormLabel>Tags</FormLabel>
								<FormControl>
									<TagInput
										{...field}
										placeholder="Enter Tags..."
										tags={emblorTags}
										activeTagIndex={activeTagIndex}
										setActiveTagIndex={setActiveTagIndex}
										styleClasses={{
											inlineTagsContainer:
												"border-input rounded-md bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring outline-none focus-within:ring-[3px] focus-within:ring-ring/50 p-1 gap-1",
											input: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
											tag: {
												body: " text-accent h-7 relative bg-background border-0 rounded-md font-medium text-xs ps-2 pe-7",
												closeButton:
													"bg-background absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
											},
										}}
										setTags={(newTags) => {
											const processedTags = (
												Array.isArray(newTags)
													? newTags
													: []
											)
												.map((tag) => {
													const normalizedText =
														normalizeTag(tag.text);
													return {
														id: normalizedText,
														text: normalizedText,
													};
												})
												.filter(
													(tag) => tag.text !== "",
												);
											const uniqueProcessedTags =
												Array.from(
													new Map(
														processedTags.map(
															(tag) => [
																tag.id,
																tag,
															],
														),
													).values(),
												);
											setEmblorTags(uniqueProcessedTags);
											field.onChange(uniqueProcessedTags);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* --- Separator --- */}
				<Separator className="my-4" />

				{/* --- Due Date Collapsible --- */}
				<FormField
					control={form.control}
					name="dueDate"
					render={({ field }) => (
						<>
							<FormLabel className="cursor-pointer font-normal mb-0 flex items-center">
								<CalendarIcon className="inline h-4 w-4 mr-1 text-muted-foreground" />{" "}
								{watchedDueDate
									? format(watchedDueDate, "PPP")
									: "Due Date: Not set"}
							</FormLabel>

							<FormItem className="mt-2 pl-5">
								<div className="flex items-center space-x-2">
									<FormControl>
										<InlineCalendar
											value={field.value ?? null}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormControl>
										<Input
											type="date"
											className="w-[180px]"
											value={
												field.value
													? format(
															field.value,
															"yyyy-MM-dd",
														)
													: ""
											}
											onChange={(e) => {
												const dateValue = e.target.value
													? parseISO(e.target.value)
													: null;
												if (
													dateValue &&
													!isNaN(dateValue.getTime())
												) {
													field.onChange(dateValue);
												} else if (!e.target.value) {
													field.onChange(null);
												}
											}}
											onClick={(e) => e.stopPropagation()}
											onMouseDown={(e) =>
												e.stopPropagation()
											}
										/>
									</FormControl>
								</div>
								<div className="flex space-x-2 mt-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={(e) =>
											setDueDatePreset(
												e,
												addWeeks(new Date(), 2),
											)
										}
									>
										{" "}
										In Two Weeks{" "}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={(e) =>
											setDueDatePreset(
												e,
												addMonths(new Date(), 1),
											)
										}
									>
										{" "}
										In a Month{" "}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={(e) =>
											setDueDatePreset(
												e,
												addMonths(new Date(), 3),
											)
										}
									>
										{" "}
										In 3 Months{" "}
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						</>
					)}
				/>

				<div className="flex justify-end pt-8">
					<Button type="submit" size="sm" className="mt-4 self-start">
						{form.formState.isSubmitting
							? "Saving..."
							: "Save Task"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
