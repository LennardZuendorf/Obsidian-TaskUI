import { logger } from "./logger";

/**
 * Checks for the presence and enabled status of required and optional plugins.
 *
 * @param requiredPlugins - An array of plugin IDs that are required for the application.
 * @param optionalPlugins - An array of plugin IDs that are optional for the application. Defaults to an empty array.
 *
 * @returns An object containing:
 *   - requiredPluginsEnabled: A boolean indicating if all required plugins are enabled.
 *   - optionalPluginsEnabled: A boolean indicating if all optional plugins are enabled.
 *   - missingRequiredPlugins: An array of required plugin IDs that are missing or not enabled.
 *   - missingOptionalPlugins: An array of optional plugin IDs that are missing or not enabled.
 */
export function checkRequiredPlugins(
	requiredPlugins: string[],
	optionalPlugins: string[] = [],
) {
	const missingRequiredPlugins: string[] = [];
	const missingOptionalPlugins: string[] = [];

	requiredPlugins.forEach((pluginId) => {
		if (!this.app.plugins.enabledPlugins.has(pluginId)) {
			missingRequiredPlugins.push(pluginId);
			if (this.app.plugins.plugins[pluginId]) {
				logger.warn(
					`Required plugin ${pluginId} is installed, but not enabled.`,
				);
			} else {
				logger.warn(`Required plugin ${pluginId} is not installed.`);
			}
		}
	});

	optionalPlugins.forEach((pluginId) => {
		if (!this.app.plugins.enabledPlugins.has(pluginId)) {
			missingOptionalPlugins.push(pluginId);
			if (this.app.plugins.plugins[pluginId]) {
				logger.trace(
					`Optional plugin ${pluginId} is installed, but not enabled.`,
				);
			} else {
				logger.trace(`Optional plugin ${pluginId} is not installed.`);
			}
		}
	});

	const requiredPluginsEnabled = missingRequiredPlugins.length === 0;
	const optionalPluginsEnabled = missingOptionalPlugins.length === 0;

	return {
		requiredPluginsEnabled,
		optionalPluginsEnabled,
		missingRequiredPlugins,
		missingOptionalPlugins,
	};
}
/**
 * Checks if a single required plugin is enabled using the checkRequiredPlugins functions
 * @param requiredPlugin - The ID of the plugin to check.
 * @returns A boolean value indicating whether the specified plugin is enabled.
 *          Returns true if the plugin is installed and enabled, false otherwise.
 */
export function checkSinglePlugin(requiredPlugin: string): boolean {
	const { requiredPluginsEnabled } = checkRequiredPlugins([requiredPlugin]);
	return requiredPluginsEnabled;
}
