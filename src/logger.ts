import { createLogger, format, transports } from "winston";
import path from "path";
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
	let logRequest;
	if (request) {
		logRequest = {
			url: request.url,
			method: request.method,
			headers: request.headers,
			body: request.data,
		};
	}

	let logResponse;
	if (response) {
		logResponse = {
			status: response.status,
			headers: response.headers,
			// body: response.data, // only for debugging
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
