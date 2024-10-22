// TaskCard.jsx
import React from "react";
import { Task } from "../../types/Task";

interface TaskCardProps {
	task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
	return (
		<div className="bg-white p-4 rounded shadow mb-4">
			<div className="flex items-start">json.stringify(task)</div>
		</div>
	);
};

export default TaskCard;
