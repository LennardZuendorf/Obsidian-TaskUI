import { logger } from "./logger";

export function checkPlugins(requiredPluginIds: string[]) {
	const missingOrNotEnabledPlugins: string[] = [];

	requiredPluginIds.forEach((pluginId) => {
		if (!this.app.plugins.enabledPlugins.has(pluginId)) {
			if (this.app.plugins.plugins[pluginId]) {
				missingOrNotEnabledPlugins.push(pluginId);
				logger.warn(`${pluginId} is installed, but not enabled.`);
			} else {
				missingOrNotEnabledPlugins.push(pluginId);
				logger.warn(`${pluginId} is not installed.`);
			}
		}
	});

	const allPluginsEnabled = true; //missingOrNotEnabledPlugins.length === 0;
	return {
		allPluginsEnabled,
		missingPlugins: missingOrNotEnabledPlugins,
	};
}
