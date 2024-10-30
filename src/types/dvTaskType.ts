/**
 * Type definition for a task type returned from the data view plugin.
 * This type represents the structure of a task as provided by the data view plugin,
 * including metadata such as tags, status, and scheduling information.
 */
export type dvTaskType = {
	symbol: string;
	link: {
		path: string;
		embed: boolean;
		type: string;
	};
	section: {
		path: string;
		embed: boolean;
		type: string;
	};
	text: string;
	tags: string[];
	line: number;
	lineCount: number;
	list: number;
	outlinks: string[];
	path: string;
	children: string[];
	task: boolean;
	annotated: boolean;
	position: {
		start: {
			line: number;
			col: number;
			offset: number;
		};
		end: {
			line: number;
			col: number;
			offset: number;
		};
	};
	subtasks: dvTaskType[];
	real: boolean;
	header: {
		path: string;
		embed: boolean;
		type: string;
	};
	id: string;
	priority: string;
	start: string;
	scheduled: string;
	due: string;
	status: string;
	checked: boolean;
	completed: boolean;
	fullyCompleted: boolean;
};
