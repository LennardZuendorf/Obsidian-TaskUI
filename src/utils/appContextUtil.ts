import { useContext, createContext } from "react";
import { App } from "obsidian";

/**
 * Context to provide the Obsidian App to all components. This is necessary so the obsidian API can be used in the components easily.
 */
export const AppContextUtil = createContext<App | undefined>(undefined);

/**
 * Hook to get the Obsidian App from the context.
 * @returns The Obsidian App
 */
export const useApp = (): App | undefined => {
	return useContext(AppContextUtil);
};
