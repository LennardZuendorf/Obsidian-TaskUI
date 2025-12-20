import { Service, useSettings } from "@ophidian/core";
import { getDefaultStore } from "jotai";
import { appSettings, defaultSettings } from "@/config/defaultSettings";
import { settingsAtom } from "@/data/settingsAtom";
import { logger } from "@/utils/logger";

/**
 * SettingsService bridges Ophidian's reactive settings with Jotai state
 * - Ophidian handles persistence to disk via SettingsService
 * - Jotai provides reactive state accessible everywhere
 * - Automatic sync: Ophidian → Jotai (via each callback)
 */
export class SettingsService extends Service {
	private ophidianSettings = useSettings<appSettings>(
		this,
		defaultSettings,
		// each callback: runs whenever settings change
		(settings) => {
			logger.debug(
				"SettingsService: Ophidian settings changed, syncing to Jotai",
				settings,
			);
			// Sync Ophidian settings → Jotai atom
			this.store.set(settingsAtom, settings);
		},
	);
	private store = getDefaultStore();
	private unsubscribe: (() => void) | null = null;

	onload() {
		logger.debug("SettingsService: onload", {
			current: this.ophidianSettings.current,
			jotaiValue: this.store.get(settingsAtom),
		});

		// Sync Jotai → Ophidian when atom changes (from React components)
		this.unsubscribe = this.store.sub(settingsAtom, () => {
			const jotaiSettings = this.store.get(settingsAtom);
			const currentOphidian = this.ophidianSettings.current;

			logger.debug("SettingsService: Jotai atom changed", {
				jotaiSettings,
				currentOphidian,
			});

			// Only update if different to avoid infinite loops
			if (JSON.stringify(jotaiSettings) !== JSON.stringify(currentOphidian)) {
				logger.debug("SettingsService: Syncing Jotai → Ophidian");
				this.ophidianSettings.update(() => jotaiSettings);
			}
		});
	}

	onunload() {
		logger.debug("SettingsService: onunload");
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
	}

	// Expose current settings for direct access (e.g., settings tab)
	get current(): appSettings {
		return this.ophidianSettings.current;
	}

	// Update settings (triggers persistence)
	async update(
		updater: (settings: appSettings) => appSettings | void,
	): Promise<appSettings> {
		logger.debug("SettingsService: update() called");
		const result = await this.ophidianSettings.update(updater);
		logger.debug("SettingsService: update() completed", result);
		return result;
	}
}
