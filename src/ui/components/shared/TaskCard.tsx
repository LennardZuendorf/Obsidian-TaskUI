import type { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import React from "react";
import { Task } from "../../../data/types/tasks";
import { formatDate } from "../../../data/utils/dateUtils";
import { Badge } from "../../base/Badge";
import { Button } from "../../base/Button";
import { Card, CardContent } from "../../base/Card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../base/Dropdown";
import { DescInput } from "./typeSelects/descInput";
import { PrioritySelect } from "./typeSelects/prioritySelect";
import { StatusSelect } from "./typeSelects/statusSelect";

const TaskCard = ({
	row,
	onEditTask,
	onDeleteTask,
	onStatusChange,
}: TaskRowProps) => {
	const task = row.original;
	const dueDateFormatted = formatDate(task.dueDate);
	const scheduledDateFormatted = formatDate(task.scheduledDate);

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4">
				<div className="flex flex-col space-y-4">
					{/* Row 1: Status, Title, Tags */}
					<div className="flex items-start gap-3">
						{/* Status Icon Button */}
						<div className="flex-shrink-0">
							<StatusSelect
								value={task.status}
								onChange={(status) =>
									onStatusChange(task.id, status)
								}
								disabled={true}
								className="w-[120px]"
							/>
						</div>

						{/* Title in large font */}
						<div className="flex-1 min-w-0">
							<DescInput
								value={task.description}
								onChange={(desc) =>
									onEditTask({ ...task, description: desc })
								}
								disabled={true}
								className="w-full"
							/>
						</div>

						{/* Tags on the right */}
						<div className="flex-shrink-0">
							{task.tags && task.tags.length > 0 ? (
								<div className="flex flex-wrap gap-1 justify-end">
									{task.tags.map(
										(tag: string, index: number) => (
											<Badge
												key={index}
												variant="secondary"
												className="text-xs"
											>
												{tag}
											</Badge>
										),
									)}
								</div>
							) : null}
						</div>
					</div>

					{/* Row 2: Priority, Dates, Actions */}
					<div className="flex items-center gap-3 pt-2">
						{/* Priority Dropdown */}
						<div className="flex-shrink-0">
							<PrioritySelect
								value={task.priority}
								onChange={(priority) =>
									onEditTask({ ...task, priority })
								}
								disabled={true}
								className="w-[120px]"
							/>
						</div>

						{/* Dates in the middle */}
						<div className="flex items-center gap-4 ml-4">
							{task.dueDate && (
								<div className="flex items-center gap-1 text-sm">
									<span className="text-muted-foreground">
										Due:
									</span>
									<span>{dueDateFormatted}</span>
								</div>
							)}

							{task.scheduledDate && (
								<div className="flex items-center gap-1 text-sm">
									<span className="text-muted-foreground">
										Scheduled:
									</span>
									<span>{scheduledDateFormatted}</span>
								</div>
							)}
						</div>

						{/* Actions on the far right */}
						<div className="flex items-center gap-2 ml-auto">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEditTask(task)}
							>
								<Edit className="h-4 w-4 mr-1" />
								Edit
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
									>
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">
											More options
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => onDeleteTask(task.id)}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

interface TaskRowProps {
	row: Row<Task>;
	onEditTask: (task: Task) => void;
	onDeleteTask: (taskId: string) => void;
	onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

export { TaskCard };
