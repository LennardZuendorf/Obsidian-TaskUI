import pino from "pino";

// Determine default level based on environment
const isDevelopment = process.env.NODE_ENV === "development";
const defaultLevel = isDevelopment ? "trace" : "info"; // Use 'trace' for dev, 'info' for prod

/**
 * Logger instance powered by pino.
 * - Logs at 'trace' level in development, 'info' in production by default.
 * - Can be overridden by the LOG_LEVEL environment variable.
 * - Uses pino-pretty for console output.
 */
export const logger = pino({
	level: process.env.LOG_LEVEL || defaultLevel, // Use dynamic default, allow override
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});
