import * as React from "react";
import {
	todoTasksAtom,
	inProgressTasksAtom,
	doneTasksAtom,
} from "../data/atoms";
import { TaskColumn } from "./components/TaskColumn";

/**
 * Kanban board component to display tasks in a kanban board view.
 * This component is used to display tasks in a kanban board view with columns for to do, in progress, and done tasks.
 * Which are filtered based on the task status and the atoms provided.
 */
export default function KanbanBoard() {
	return (
		<div className="kanban-board">
			<div className="p-4 min-h-screen w-full">
				<div className="justify-between w-full">
					<h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
				</div>
				<div className="grid grid-cols-3 space-x-4">
					<TaskColumn
						title="To Do"
						atom={todoTasksAtom}
						id={"todo"}
						className="flex-1"
					/>
					<TaskColumn
						title="In Progress"
						atom={inProgressTasksAtom}
						id={"in-progress"}
						className="flex-1"
					/>
					<TaskColumn
						title="Archive"
						atom={doneTasksAtom}
						id={"archive"}
						className="flex-1"
					/>
				</div>
			</div>
		</div>
	);
}
