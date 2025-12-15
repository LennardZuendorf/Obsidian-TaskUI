import { Row, Table as TanstackTable } from "@tanstack/react-table";
import { TabView } from "./TabView";
import { cn } from "@/ui/utils";

// Define props, expecting the table instance
interface BoardViewProps<TData> {
	table: TanstackTable<TData>;
}

export function BoardView<TData>({ table }: BoardViewProps<TData>) {
	// TODO: Implement Kanban Board View Logic
	// Use table.getRowModel().rows, table.getState().grouping, etc.

	return (
		<TabView>
			<div className="flex flex-col justify-center w-full h-fit gap-2 p-4">
				Board View Placeholder
			</div>
		</TabView>
	);
}
