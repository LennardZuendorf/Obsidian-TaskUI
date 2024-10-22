import { useContext, createContext } from "react";
import { App } from "obsidian";

export const AppContext = createContext<App | undefined>(undefined);

export const useApp = (): App | undefined => {
	return useContext(AppContext);
};
