import axios from "axios";
import Strategy from "../interfaces/strategy";
import Config from "../interfaces/config";
import { customLogger, createLogObject } from "../logger";
import https from "https";
import { Notifier } from "../notifier";
import { create } from "ts-node";

export class HttpStrategy implements Strategy {
	private url: string;
	private method: string;
	private headers: Record<string, string>;
	private body: any;

	constructor(config: Config) {
		this.url = config.url;
		this.method = config.method || "GET";
		this.headers = config.headers || {};
		this.body = config.body || {};
	}

	// handle cases for PATCH, POST, PUT, DELETE
	handleError(
		err: any,
		req: any,
		httpsFailed: boolean
	): "healthy" | "unhealthy" | "https expire" {
		// PATCH | POST | PUT | DELETE request out of 2xx, but not 404. healthy
		if (this.method !== "GET" && err.response && err.response.status !== 404) {
			// Check if the response is a JSON object
			try {
				JSON.stringify(err.response.data);
			} catch (err) {
				return "unhealthy";
			}

			if (httpsFailed) {
				customLogger.warn(
					createLogObject(
						`Health check for ${this.method} ${this.url}  ${err.response.status} is successful with http`,
						req,
						err.response
					)
				);
				return "https expire";
			} else {
				customLogger.info(
					createLogObject(
						`Health check for ${this.method} ${this.url}  ${err.response.status} is successful`,
						req,
						err.response
					)
				);
				return "healthy";
			}
		}

		// log error
		if (err.response) {
			customLogger.error(
				createLogObject(
					`Health check failed with ${err.response.status} for ${this.method} ${this.url}`,
					req,
					err.response
				)
			);
		} else if (err.request) {
			customLogger.error(
				createLogObject(
					`Request made but no response for ${this.method} ${this.url}`,
					req,
					err.stack
				)
			);
		} else {
			customLogger.error(
				createLogObject(
					`Health check failed with internal error ${err.message}`,
					err.stack
				)
			);
		}

		const notifier = new Notifier("15257164640");
		notifier.init().then(() => {
			notifier.notify(`Health check failed for ${this.method} ${this.url}`);
		});
		return "unhealthy";
	}

	checkHealth(): Promise<string> {
		let httpsRequest = {
			url: this.url,
			method: this.method,
			headers: this.headers,
			data: this.body,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		};
		// Try https first
		return axios(httpsRequest)
			.then((res) => {
				customLogger.info(
					createLogObject(
						`Health check for ${this.method} ${this.url}  ${res.status} is successful`,
						httpsRequest,
						res
					)
				);
				return "healthy";
			})
			.catch((err) => {
				// Generating http request
				let httpRequest = {
					url: this.url.replace("https", "http"),
					method: this.method,
					headers: this.headers,
					data: this.body,
				};

				if (
					err.message.includes("SSL certificate") ||
					err.code === "CERT_HAS_EXPIRED" ||
					err.message.includes("wrong version number")
				) {
					return axios(httpRequest)
						.then((res) => {
							customLogger.warn(
								createLogObject(
									`Health check for ${this.method} ${this.url}  ${res.status} is successful with http`,
									httpRequest,
									res
								)
							);
							return "https expire";
						})
						.catch((err) => {
							// http failed
							return this.handleError(err, httpRequest, true);
						});
				} else {
					return this.handleError(err, httpsRequest, false);
				}
			});
	}
}
