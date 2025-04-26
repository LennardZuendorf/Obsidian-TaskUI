import { Button } from "@//base/Button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@//base/Card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@//base/Dropdown";
import { TaskModal } from "./TaskModal";
import { atom, useAtom } from "jotai";
import {
	ArrowLeftRight,
	CalendarIcon,
	CheckCircle2,
	Circle,
	Edit2Icon,
	FlagIcon,
	FolderIcon,
	PlayCircle,
	TagIcon,
	XCircle,
} from "lucide-react";
import { App, Notice } from "obsidian";
import { useMemo } from "react";
import { changeTasksAtom } from "../../data/taskAtoms";
import { storeOperation } from "../../data/types/operations";
import { Task, TaskStatus } from "../../data/types/tasks";
import { useApp } from "../../utils/context";
import { cn } from "../utils/cn";

/**
 * TaskCard component to display a single task card.
 * This component is used to display a single task card with task details and actions.
 * It uses a derived atom to get a single task by taskId. This means it's reactive and will update when the task is updated.
 */
export const TaskCard = ({ taskId }: { taskId: string }) => {
	const app = useApp();
	const taskAtom = useMemo(
		() =>
			atom(
				(get) => {
					const tasks = get(changeTasksAtom);
					return tasks.find((task) => task.id === taskId);
				},
				(get, set, update: Partial<Task> | Task) => {
					const task = get(changeTasksAtom).find(
						(task) => task.id === taskId,
					);
					const newTask =
						"id" in update ? update : { ...task, ...update };
					console.log("taskAtom setter called with update:", update);
					set(changeTasksAtom, {
						operation: storeOperation.LOCAL_UPDATE,
						tasks: [newTask],
						source: "local",
						timestamp: Date.now(),
					});
				},
			),
		[taskId],
	);

	// Set the task and updateTask function from the atom
	const [task, updateTask] = useAtom(taskAtom);

	// Conditional rendering for null task
	if (!task || !app) return null;

	async function editTask() {
		console.log("Opening edit modal for task:", task);
		new TaskModal(
			app as App,
			(updatedTask: Task) => {
				console.log("TaskModal returned updatedTask:", updatedTask);
				if (updatedTask) {
					// Update task with the LOCAL_UPDATE operation to track sync state
					console.log("Calling updateTask with:", updatedTask);
					updateTask(updatedTask);
					new Notice(`Task updated successfully!`);
				} else {
					new Notice(`Task update was unsuccessful!`);
				}
			},
			task,
		).open();
	}

	return (
		<Card
			className={cn(
				"w-full p-1 space-y-1 relative",
				task.status === TaskStatus.DONE ||
					task.status === TaskStatus.CANCELLED
					? "text-muted-foreground line-through"
					: "",
			)}
			aria-label={
				task.status === TaskStatus.DONE ||
				task.status === TaskStatus.CANCELLED
					? "This Task is Completed"
					: ""
			}
		>
			<div className="absolute top-0 right-0 p-2 space-x-1">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							aria-label="Move Task"
						>
							<ArrowLeftRight className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-48 bg-primary">
						<DropdownMenuLabel>Change Status</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className={cn(
								task.status === TaskStatus.TODO &&
									"text-muted-foreground",
							)}
							disabled={task.status === TaskStatus.TODO}
							onClick={() =>
								updateTask({ status: TaskStatus.TODO })
							}
						>
							<Circle className="mr-2 h-4 w-4" />
							To Do
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === TaskStatus.IN_PROGRESS &&
									"text-muted-foreground",
							)}
							disabled={task.status === TaskStatus.IN_PROGRESS}
							onClick={() =>
								updateTask({ status: TaskStatus.IN_PROGRESS })
							}
						>
							<PlayCircle className="mr-2 h-4 w-4" />
							In Progress
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === TaskStatus.DONE &&
									"text-muted-foreground",
							)}
							disabled={task.status === TaskStatus.DONE}
							onClick={() =>
								updateTask({ status: TaskStatus.DONE })
							}
						>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Done
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === TaskStatus.CANCELLED &&
									"text-muted-foreground",
							)}
							disabled={task.status === TaskStatus.CANCELLED}
							onClick={() =>
								updateTask({ status: TaskStatus.CANCELLED })
							}
						>
							<XCircle className="mr-2 h-4 w-4" />
							Cancelled
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{task.status != TaskStatus.DONE && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						aria-label="Edit task"
						onClick={editTask}
					>
						<Edit2Icon className="h-4 w-4" />
					</Button>
				)}
			</div>
			<CardHeader className="justify-between items-start w-10/12 grow relative">
				<CardTitle className="font-semibold text-base break-words text-wrap">
					{task.description}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-2 py-1">
				<div className="flex items-center text-xs text-gray-500 space-x-2 flex-wrap">
					{task.dueDate && (
						<div
							className={cn(
								"flex items-center space-x-1",
								task.dueDate <= new Date()
									? "text-destructive"
									: "",
							)}
						>
							<CalendarIcon
								className={cn(
									"h-3 w-3",
									task.dueDate <= new Date()
										? "text-destructive"
										: "",
								)}
							/>
							<span>{task.dueDate.toLocaleDateString()}</span>
						</div>
					)}
					<div className="flex items-center space-x-1">
						<FlagIcon
							className={cn(
								"h-3 w-3",
								task.priority === "high" ||
									task.priority === "highest"
									? "text-red-500"
									: "",
							)}
						/>
						<span
							className={
								task.priority === "high" ||
								task.priority === "highest"
									? "text-red-500"
									: ""
							}
						>
							{task.priority}
						</span>
					</div>
					<div className="flex items-center space-x-1">
						<FolderIcon className="h-3 w-3" />
						<span className="truncate max-w-[100px]">
							{task.path}
						</span>
					</div>
				</div>
			</CardContent>
			{task.tags && (
				<CardFooter className="pt-1 pb-1">
					<div className="flex flex-wrap gap-1 ">
						<TagIcon className="h-3 w-3 text-gray-500" />
						{task.tags.map((tag: string) => (
							<span
								key={tag}
								className="text-xs text-accent-background"
							>
								{tag}
							</span>
						))}
					</div>
				</CardFooter>
			)}
		</Card>
	);
};
