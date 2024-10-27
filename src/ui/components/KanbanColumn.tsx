import { useAtom } from "jotai";
import React from "react";
import { TaskCard } from "./taskCard";
import { todoTasksAtom } from "../../data/taskAtoms";
import { cn } from "../../utils/styleUtils";
import { BackgroundContainer } from "@//components/backgroundContainer";

export const KanbanColumn = React.memo(
	(props: {
		id: string;
		title: string;
		atom: typeof todoTasksAtom;
		className: string;
	}) => {
		const [tasks] = useAtom(props.atom);

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
						<TaskCard
							key={task.id}
							taskId={task.id}
							groupAtom={props.atom}
						/>
					))}
				</div>
			</BackgroundContainer>
		);
	},
);
