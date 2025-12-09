import type { Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import React from "react";
import { Task } from "../../../data/types/tasks";
import { formatDate } from "../../../data/utils/dateUtils";
import { Badge } from "../../base/Badge";
import { Button } from "../../base/Button";
import { Card, CardContent } from "../../base/Card";
import { DescInput } from "./typeSelects/DescInput";
import { PrioritySelect } from "./typeSelects/PrioritySelect";
import { StatusSelect } from "./typeSelects/StatusSelect";
import { DateSelect } from "./typeSelects/DateSelect";

const TaskCard = ({
	DtableRow,
	onEditTask,
	onUpdateTask,
	onDeleteTask,
}: TaskRowProps) => {
	const task = DtableRow.original;
	const scheduledDateFormatted = formatDate(task.scheduledDate);

	return (
		<Card className="overflow-hidden w-full">
			<CardContent className="p-4">
				{/* Row 1: Status, Title, Tags */}
				<div className="flex flex-row items-center justify-between gap-2">
					{/* Status, Title, Tags */}
					<div className="flex flex-grow items-center justify-start gap-4 ">
						<StatusSelect
							value={task.status}
							onChange={(status) =>
								onUpdateTask({ ...task, status })
							}
						/>

						<DescInput
							disabled={true}
							value={task.description}
							onChange={(desc) =>
								onUpdateTask({ ...task, description: desc })
							}
							className="w-full h-full"
						/>
					</div>

					{/* Tags on the right */}
					<div className="flex flex-grow flex-wrap justify-end">
						{task.tags && task.tags.length > 0 ? (
							<div className="flex flex-wrap gap-2 justify-end">
								{task.tags.map((tag: string, index: number) => (
									<Badge
										key={index}
										variant="accent"
										className="text-xs"
									>
										{tag}
									</Badge>
								))}
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
								onUpdateTask({ ...task, priority })
							}
							className="w-[120px]"
						/>
					</div>

					{/* Dates in the middle */}
					<div className="flex items-center gap-4 ml-4">
						{task.dueDate && (
							<DateSelect
								value={task.dueDate}
								type="dueDate"
								onChange={(date: Date) =>
									onUpdateTask({ ...task, dueDate: date })
								}
							/>
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
						<Button size="sm" onClick={() => onEditTask(task)}>
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>

						<Button
							size="sm"
							variant="destructive"
							onClick={() => onDeleteTask(task.id)}
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
							aria-label="Delete Task"
						>
							<Trash2 className="h-4 w-4 text-destructive" />
							Delete
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

interface TaskRowProps {
	DtableRow: Row<Task>;
	onEditTask: (task: Task) => void;
	onDeleteTask: (taskId: string) => void;
	onUpdateTask: (task: Task) => void;
}

export { TaskCard };
