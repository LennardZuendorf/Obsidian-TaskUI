import { atom, useAtom } from "jotai";
import { allTasksAtom } from "../../data/taskAtoms";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@//base/card";
import React, { useMemo } from "react";
import {
	CalendarIcon,
	Edit2Icon,
	TagIcon,
	FlagIcon,
	FolderIcon,
	ArrowLeftRight,
	Circle,
	PlayCircle,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { Button } from "@//base/button";
import { cn } from "../../utils/styleUtils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@//base/dropdown";
import type { taskType } from "../../types/taskType";
export const TaskCard = ({ taskId }: { taskId: string }) => {
	// 1. Create a derived atom for a single task by taskId
	const taskAtom = useMemo(
		() =>
			atom(
				// Getter: Find the task by taskId
				(get) => {
					const tasks = get(allTasksAtom);
					return tasks.find((task) => task.id === taskId);
				},
				(get, set, update: Partial<taskType>) => {
					set(allTasksAtom, (prevTasks) =>
						prevTasks.map((task) =>
							task.id === taskId ? { ...task, ...update } : task,
						),
					);
				},
			),
		[taskId],
	);

	// 2. Use the derived atom to get the single task and the setter
	const [task, updateTask] = useAtom(taskAtom);

	// 3. Conditional rendering in case the task doesn't exist
	if (!task) return null;

	return (
		<Card
			className={cn(
				"w-full p-1 space-y-1 relative",
				task.status === "done" || task.status === "cancelled"
					? "text-muted-foreground line-through"
					: "",
			)}
			aria-label={
				task.status === "done" || task.status === "cancelled"
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
								task.status === "todo" &&
									"text-muted-foreground",
							)}
							disabled={task.status === "todo"}
							onClick={() => updateTask({ status: "todo" })}
						>
							<Circle className="mr-2 h-4 w-4" />
							To Do
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === "in-progress" &&
									"text-muted-foreground",
							)}
							disabled={task.status === "in-progress"}
							onClick={() =>
								updateTask({ status: "in-progress" })
							}
						>
							<PlayCircle className="mr-2 h-4 w-4" />
							In Progress
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === "done" &&
									"text-muted-foreground",
							)}
							disabled={task.status === "done"}
							onClick={() => updateTask({ status: "done" })}
						>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Done
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(
								task.status === "cancelled" &&
									"text-muted-foreground",
							)}
							disabled={task.status === "cancelled"}
							onClick={() => updateTask({ status: "cancelled" })}
						>
							<XCircle className="mr-2 h-4 w-4" />
							Cancelled
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{task.status != "done" && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						aria-label="Edit task"
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
						{task.tags.map((tag) => (
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
