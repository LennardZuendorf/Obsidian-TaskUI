import { atomWithStorage } from "jotai/utils";
import { appSettings, defaultSettings } from "@/config/defaultSettings";

/**
 * Persistent Jotai atom for settings
 * - Handles initially-not-loaded settings
 * - Accessible everywhere (React components, services, outside React)
 * - Synced with Ophidian's reactive settings via SettingsService
 */
export const settingsAtom = atomWithStorage<appSettings>(
	"taskui-settings",
	defaultSettings,
);
