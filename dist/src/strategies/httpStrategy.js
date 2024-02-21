import { createLogError, createLogRequest, createLogResponse, logger, } from "./../logger.js";
import axios from "axios";
import https from "https";
import { Notifier } from "../notifier.js";
export class HttpStrategy {
    constructor(config) {
        this.url = config.url;
        this.method = config.method || "GET";
        this.headers = config.headers || {};
        this.body = config.body || {};
        this.validator = config.validator || null;
    }
    notifyFailure(message) {
        const notifier = Notifier.getInstance();
        notifier.notifyChat(message);
    }
    isHttpsError(err) {
        return (err.message.includes("SSL certificate") ||
            err.code === "CERT_HAS_EXPIRED" ||
            err.message.includes("wrong version number"));
    }
    handleError(request, err, isHttps = false) {
        if (err.response) {
            return this.handleResponse(request, err.response, isHttps);
        }
        let message;
        if (err.request) {
            message = `Request made but no response for ${this.method} ${request.url}`;
        }
        else {
            message = `Health check failed with internal error ${err.message}`;
        }
        logger.error(message, { request: createLogRequest(request), error: createLogError(err) });
        this.notifyFailure(`Health check failed for ${this.method} ${request.url}`);
        return "unhealthy";
    }
    isJSON(obj) {
        try {
            JSON.stringify(obj);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    handleResponse(request, response, isHttps = false) {
        if (response.status === 404) {
            let message = `Health check failed with 404 for ${this.method} ${request.url}`;
            logger.error(message, {
                request: createLogRequest(request),
                response: createLogResponse(response),
            });
            return "unhealthy";
        }
        if (response.status < 200 && response.status >= 300 && request.method.toUpperCase() !== "GET") {
            if (!this.isJSON(response.data)) {
                let message = `Response is not JSON for ${this.method} ${request.url}`;
                logger.error(message, {
                    request: createLogRequest(request),
                    response: createLogResponse(response),
                });
                return "unhealthy";
            }
        }
        if (this.validator && !this.validator(response.data)) {
            let message = `Validator failed for ${request.url}`;
            logger.error(message, {
                request: createLogRequest(request),
                response: createLogResponse(response),
            });
            return "unhealthy";
        }
        let message = `Health check for ${this.method} ${request.url}  ${response.status} is successful`;
        isHttps ? logger.info(message) : logger.warn(message, { request, response });
        return isHttps ? "healthy" : "https expire";
    }
    checkHealth() {
        let httpsRequest = {
            url: this.url,
            method: this.method,
            headers: this.headers,
            data: this.body,
            httpsAgent: HttpStrategy.agent,
        };
        return axios(httpsRequest)
            .then((res) => {
            return this.handleResponse(httpsRequest, res, true);
        })
            .catch((err) => {
            let httpRequest = {
                url: this.url.replace("https", "http"),
                method: this.method,
                headers: this.headers,
                data: this.body,
            };
            if (this.isHttpsError(err)) {
                return axios(httpRequest)
                    .then((res) => {
                    return this.handleResponse(httpRequest, res, false);
                })
                    .catch((err) => {
                    return this.handleError(httpRequest, err, false);
                });
            }
            return this.handleError(httpsRequest, err, true);
        });
    }
}
HttpStrategy.agent = new https.Agent({ rejectUnauthorized: false });
