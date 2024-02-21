import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const customLogger = createLogger({
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }), format.printf((info) => {
        return `Health Check Detail: \n ${JSON.stringify(info, null, 2)}`;
    })),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.printf((info) => {
                return `${info.timestamp} [${info.level}]: ${info.message.description}`;
            })),
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
export const createLogObject = (description, request, response, stack) => {
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
        };
    }
    return {
        description,
        request: logRequest,
        response: logResponse,
        stack: stack,
    };
};
export function logError({ message, request, response, stack, }) {
    customLogger.error(createLogObject(message, request, response, stack));
}
export function logInfo({ message, request, response, stack, }) {
    customLogger.info(createLogObject(message, request, response, stack));
}
export function logWarn({ message, request, response, stack, }) {
    customLogger.warn(createLogObject(message, request, response, stack));
}
export const logger = createLogger({
    format: format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.printf((info) => {
                return `${info.timestamp} [${info.level}]: ${info.message}`;
            })),
        }),
        new transports.File({
            filename: "error.log",
            level: "warn",
            dirname: "logs",
            format: format.prettyPrint(),
        }),
    ],
});
export function createLogRequest(request) {
    return {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.data,
    };
}
export function createLogResponse(response) {
    return {
        status: response.status,
        headers: response.headers,
        body: response.data,
    };
}
export function createLogError(error) {
    return {
        message: error.message,
        stack: error.stack,
        errors: error.errors,
    };
}
