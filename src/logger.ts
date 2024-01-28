import { createLogger, format, transports } from "winston";
import path from "path";
import util from "util";

const customTimeFormat = format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" });
const customServerLoggerFormat = format.combine(
	customTimeFormat,
	format.printf(({ timestamp, level, message }) => {
		return `${timestamp} | ${level}: ${message}`;
	})
);
const customErrorLoggerFormat = format.combine(
	customTimeFormat,
	format.errors({ stack: true }),
	format.printf(({ timestamp, level, message, obj, stack }) => {
		let logMessage = `${timestamp} | ${level}: ${message}`;
		if (obj) {
			logMessage += `\nobj: ${util.inspect(obj, {
				compact: false,
				depth: null,
			})}`;
		}
		if (stack) {
			logMessage += `\nStack Trace: ${stack}`;
		}
		logMessage += "\n";
		return logMessage;
	})
);

// serverLogger.info({message: "..."})
export const logger = createLogger({
	transports: [
		new transports.File({
			level: "info",
			filename: path.join(__dirname, "../logs/server.log"),
			format: format.combine(customServerLoggerFormat),
		}),
		new transports.File({
			level: "info",
			filename: path.join(__dirname, "../logs/server.jsonl"),
			format: format.combine(customServerLoggerFormat, format.json()),
		}),
		new transports.Console({
			format: customServerLoggerFormat,
		}),
		new transports.File({
			level: "error",
			filename: path.join(__dirname, "../logs/error.log"),
			format: customErrorLoggerFormat,
		}),
	],
});

// serverLogger.info("This is info");
// let err = new Error("this is error logger");
// serverLogger.error({ message: err.message, stack: err.stack });
