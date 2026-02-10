import { atomWithStorage } from "jotai/utils";
import {
	appSettings,
	appSettingsSchema,
	defaultSettings,
} from "@/config/defaultSettings";

/**
 * Migrate old settings key to new key (one-time migration)
 * Runs before atom creation to preserve user settings across rename
 */
function migrateSettings() {
	const oldKey = "shards-settings";
	const newKey = "taskui-settings";

	try {
		// Only migrate if old key exists and new key doesn't
		const oldSettings = localStorage.getItem(oldKey);
		const newSettings = localStorage.getItem(newKey);

		if (oldSettings && !newSettings) {
			// Parse JSON
			const parsed = JSON.parse(oldSettings);

			// Validate with Zod schema
			const validated = appSettingsSchema.partial().safeParse(parsed);

			if (validated.success) {
				// Merge validated settings with defaults
				const merged: appSettings = { ...defaultSettings, ...validated.data };

				// Write to new key
				localStorage.setItem(newKey, JSON.stringify(merged));

				// Remove old key to avoid re-running migration
				localStorage.removeItem(oldKey);

				console.log(
					"Settings migrated from shards-settings to taskui-settings",
				);
			} else {
				console.error(
					"Settings validation failed during migration:",
					validated.error.errors,
				);
				console.log("Falling back to default settings");
			}
		}
	} catch (error) {
		console.error("Failed to migrate settings:", error);
		// Migration failure is non-fatal - fall back to defaults
	}
}

// Run migration before creating atom
migrateSettings();

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
