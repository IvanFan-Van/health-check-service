import { LogRequest } from "./../logger.js";
import axios, { AxiosResponse } from "axios";
import Strategy from "../interfaces/strategy.js";
import Config from "../interfaces/config.js";
import { logError, logInfo, logWarn } from "../logger.js";
import https from "https";
import { Notifier } from "../notifier.js";
export class HttpStrategy implements Strategy {
	private url: string;
	private method: string;
	private headers: Record<string, string>;
	private body: any;
	private validator: ((data: any) => boolean) | null;
	private static agent: https.Agent = new https.Agent({ rejectUnauthorized: false });

	constructor(config: Config) {
		this.url = config.url;
		this.method = config.method || "GET";
		this.headers = config.headers || {};
		this.body = config.body || {};
		this.validator = config.validator || null;
	}

	private notifyFailure(message: string) {
		const notifier = Notifier.getInstance();
		notifier.notifyChat(message);
	}

	private isHttpsError(err: any) {
		return (
			err.message.includes("SSL certificate") ||
			err.code === "CERT_HAS_EXPIRED" ||
			err.message.includes("wrong version number")
		);
	}

	// handle cases for PATCH, POST, PUT, DELETE
	private handleError(request: LogRequest, err: any, isHttps: boolean = false): string {
		// Dealing with different error cases:
		// 1) out of 2xx
		if (err.response) {
			return this.handleResponse(request, err.response, isHttps);
		}

		let message;
		// 2) no response
		if (err.request) {
			message = `Request made but no response for ${this.method} ${request.url}`;
		}
		// 3) internal error
		else {
			message = `Health check failed with internal error ${err.message}`;
		}

		logError({ message, request, stack: err.stack });
		this.notifyFailure(`Health check failed for ${this.method} ${request.url}`);
		return "unhealthy";
	}

	private isJSON(obj: any): boolean {
		try {
			JSON.stringify(obj);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Handles response from axios request
	 */
	private handleResponse(
		request: LogRequest,
		response: AxiosResponse,
		isHttps: boolean = false
	): string {
		if (response.status === 404) {
			let message = `Health check failed with 404 for ${this.method} ${request.url}`;
			logError({ message, request, response });
			return "unhealthy";
		}

		// out of 2xx && not GET
		if (response.status < 200 && response.status >= 300 && request.method.toUpperCase() !== "GET") {
			if (!this.isJSON(response.data)) {
				let message = `Response is not JSON for ${this.method} ${request.url}`;
				logError({ message, request, response });
				return "unhealthy";
			}
		}

		// validator exists && validator passed
		if (this.validator && !this.validator(response.data)) {
			let message = `Validator failed for ${request.url}`;
			logError({ message, request, response });
			return "unhealthy";
		}

		let message = `Health check for ${this.method} ${request.url}  ${response.status} is successful`;

		isHttps ? logInfo({ message, request, response }) : logWarn({ message, request, response });

		return isHttps ? "healthy" : "https expire";
	}

	checkHealth(): Promise<string> {
		// construct https Request
		let httpsRequest: LogRequest = {
			url: this.url,
			method: this.method,
			headers: this.headers,
			data: this.body,
			httpsAgent: HttpStrategy.agent,
		};
		// Try https first
		return axios(httpsRequest)
			.then((res) => {
				return this.handleResponse(httpsRequest, res, true);
			})
			.catch((err) => {
				// construct http request
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
							// http failed
							return this.handleError(httpRequest, err, false);
						});
				}
				return this.handleError(httpsRequest, err, true);
			});
	}
}
