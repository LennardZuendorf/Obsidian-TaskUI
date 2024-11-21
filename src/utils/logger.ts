import pino from "pino";

/**
 * Logger instance powered by pino. It logs to the console with pretty-printed output.
 */
export const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});
