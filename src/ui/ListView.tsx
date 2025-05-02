import { useAtomValue } from "jotai";
import { baseTasksAtom } from "../data/taskAtoms"; // Adjust path as needed

/**
 * Task List component to display tasks in a list view.
 * Currently displays raw task data as JSON.
 * TODO: Implement the actual table view.
 */
export default function ListView() {
	const tasksWithMeta = useAtomValue(baseTasksAtom);

	return (
		<div className="flex flex-col h-full w-full p-4 bg-background">
			{/* <h1 className="text-lg font-semibold mb-4">Task List (Raw Data)</h1> */}
			<pre className="text-xs bg-secondary p-4 rounded-md overflow-auto flex-grow">
				{JSON.stringify(tasksWithMeta, null, 2)}
			</pre>
		</div>
	);
}
