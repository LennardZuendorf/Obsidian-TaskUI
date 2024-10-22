import React from "react";
import Column from "./components/KanbanColumn";

export const Board = ({ tasks }) => {
	const statuses = ["To Do", "In Progress", "Done"];

	const tasksByStatus = statuses.map((status) => ({
		status,
		tasks: tasks.filter((task) => task.status === status),
	}));

	return (
		<div className="flex space-x-4 overflow-x-auto">
			{tasksByStatus.map(({ status, tasks }) => (
				<Column key={status} title={status} tasks={tasks} />
			))}
		</div>
	);
};
