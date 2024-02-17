import { createLogger, format, transports } from "winston";
import path from "path";
import util from "util";
import https from "https";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type LogRequest = {
	url: string;
	method: string;
	headers: any;
	data: any;
	httpsAgent?: https.Agent;
};

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

export const customLogger = createLogger({
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
		format.printf((info) => {
			return `Health Check Detail: \n ${JSON.stringify(info, null, 2)}`;
		})
	),
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.printf((info) => {
					return `${info.timestamp} | ${info.level}: ${info.message.description}`;
				})
			),
		}),
		new transports.File({
			filename: path.join(__dirname, "../logs/server.jsonl"),
			format: format.combine(format.json()),
		}),
		new transports.File({
			filename: path.join(__dirname, "../logs/server.log"),
		}),
	],
});

export const createLogObject = (
	description: string,
	request?: any,
	response?: any,
	stack?: string
) => {
	let logRequest = null;
	if (request) {
		logRequest = {
			url: request.url,
			method: request.method,
			headers: request.headers,
			body: request.data,
		};
	}

	let logResponse = null;
	if (response) {
		logResponse = {
			status: response.status,
			headers: response.headers,
			body: response.data,
		};
	}
	return {
		description,
		request: logRequest,
		response: logResponse,
		stack: stack,
	};
};

export function logError({
	message,
	request,
	response,
	stack,
}: {
	message: string;
	request?: any;
	response?: any;
	stack?: string;
}) {
	customLogger.error(createLogObject(message, request, response, stack));
}

export function logInfo({
	message,
	request,
	response,
	stack,
}: {
	message: string;
	request?: any;
	response?: any;
	stack?: string;
}) {
	customLogger.info(createLogObject(message, request, response, stack));
}

export function logWarn({
	message,
	request,
	response,
	stack,
}: {
	message: string;
	request?: any;
	response?: any;
	stack?: string;
}) {
	customLogger.warn(createLogObject(message, request, response, stack));
}

// serverLogger.info("This is info");
// let err = new Error("this is error logger");
// serverLogger.error({ message: err.message, stack: err.stack });
