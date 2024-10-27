"use client";
import * as React from "react";
import {
	todoTasksAtom,
	inProgressTasksAtom,
	doneTasksAtom,
} from "../data/taskAtoms";
import { KanbanColumn } from "./components/kanbanColumn";

export default function KanbanBoard() {
	return (
		<div className="kanban-board">
			<div className="p-4 min-h-screen w-full">
				<div className="justify-between w-full">
					<h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
				</div>
				<div className="grid grid-cols-3 space-x-4">
					<KanbanColumn
						title="To Do"
						atom={todoTasksAtom}
						id={"todo"}
						className="flex-1"
					/>
					<KanbanColumn
						title="In Progress"
						atom={inProgressTasksAtom}
						id={"in-progress"}
						className="flex-1"
					/>
					<KanbanColumn
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
