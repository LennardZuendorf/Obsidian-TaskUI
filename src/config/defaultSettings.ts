export type appSettings = {
	defaultPath: string;
	defaultHeading: string;
	todoistApiKey?: string;
};

export const defaultSettings: appSettings = {
	defaultPath: "Tasks.md",
	defaultHeading: "# Tasks",
};
