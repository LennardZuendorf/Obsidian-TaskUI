import type { Task } from "../../../../data/types/tasks";
import type { TabViewProps } from "../TaskView";

export function ListView<TData extends Task>({
	table,
	handleEditTask,
	handleDeleteTask,
	handleTaskStatusChange,
}: TabViewProps<TData>) {
	return (
		<>
			<div className="p-4 text-center text-muted-foreground">
				List View Placeholder
				{/* Temporary: Display row count */}
				<p className="text-xs mt-2">
					(Tasks count: {table.getRowModel().rows.length})
				</p>
			</div>
		</>
	);
}
