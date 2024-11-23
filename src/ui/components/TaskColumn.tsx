import { useAtom } from "jotai";
import React from "react";
import { TaskCard } from "./TaskCard";
import { todoTasksAtom } from "../../data/taskAtoms";
import { cn } from "../utils/cn";
import { BackgroundContainer } from "@//components/BackgroundContainer";

/**
 * TaskColumn component to display a column of tasks.
 * This component is used to display a column of tasks with a title and task cards.
 * It uses an atom to get the tasks for the column. This means it's reactive and will update when the tasks in its atom are updated.
 * @param props.id The id of the column.
 * @param props.title The title of the column.
 * @param props.atom The atom to get the tasks for the column.
 * @param props.className The class name for the component.
 */
export const TaskColumn = React.memo(
	(props: {
		id: string;
		title: string;
		atom: typeof todoTasksAtom;
		className: string;
	}) => {
		// Get the tasks for the column from the atom. This will update the component when the tasks are updated and iterate over the tasks to create TaskCard components.
		const [tasks] = useAtom(props.atom);

		// Render the TaskColumn component with the title and task cards.
		return (
			<BackgroundContainer className={cn(props.className, "h-dvh")}>
				<div className="flex flex-col space-y-1.5 p-6">
					<h3 className="text-base font-semibold leading-none tracking-tight">
						{props.title}
					</h3>
					<div className="flex flex-row space-x-2">
						<p className="text-sm text-muted-foreground">
							{tasks.length}{" "}
							{tasks.length === 1 ? "task" : "tasks"}
						</p>
						{tasks.some(
							(task) =>
								task.priority === "high" ||
								task.priority === "highest",
						) && (
							<div className="flex flex-row space-x-2">
								<p>|</p>
								<p className="text-sm text-destructive">
									{
										tasks.filter(
											(task) =>
												task.priority === "high" ||
												task.priority === "highest",
										).length
									}{" "}
									higher priority
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="flex flex-col items-start p-6 pt-0 space-y-1">
					{tasks.map((task) => (
						<TaskCard key={task.id} taskId={task.id} />
					))}
				</div>
			</BackgroundContainer>
		);
	},
);
