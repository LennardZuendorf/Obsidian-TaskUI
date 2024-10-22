import React from "react";
import TaskCard from "./TaskCard";

const Column = ({ title, tasks }) => {
	return (
		<div className="w-80 bg-gray-100 p-4 rounded">
			<h2 className="text-xl font-bold mb-4">{title}</h2>
			{tasks.map((task) => (
				<TaskCard key={task.title} task={task} />
			))}
		</div>
	);
};

export default Column;
