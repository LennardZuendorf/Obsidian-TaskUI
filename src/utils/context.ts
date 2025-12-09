import { App } from "obsidian";
import { createContext, useContext } from "react";

/**
 * Context to provide the Obsidian App to all components. This is necessary so the obsidian API can be used in the components easily.
 */
export const AppContext = createContext<App | undefined>(undefined);

/**
 * Hook to get the Obsidian App from the context.
 * @returns The Obsidian App
 */
export const useApp = (): App | undefined => {
	return useContext(AppContext);
};
