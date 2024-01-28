import axios from "axios";
import Strategy from "../interfaces/strategy";
import Config from "../interfaces/config";
import { logger } from "../logger";
import https from "https";
import { Notifier } from "../notifier";

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
	handleError(err: any): "healthy" | "unhealthy" {
		// PATCH | POST | PUT | DELETE request out of 2xx, but not 404. healthy
		if (this.method !== "GET" && err.response && err.response.status !== 404) {
			// Check if the response is a JSON object
			try {
				JSON.stringify(err.response.data);
			} catch (err) {
				return "unhealthy";
			}
			logger.info(
				`Health check for ${this.method} ${this.url}  ${err.response.status} is successful`
			);
			return "healthy";
		}

		// log error
		if (err.response) {
			logger.error({
				message: `Health check failed for ${this.method} ${this.url} ${err.response.status}`,
				obj: err.response.data,
				stack: err.stack,
			});
		} else if (err.request) {
			logger.error({
				message: `Request made but no response for ${this.method} ${this.url}`,
				obj: err.request.headers,
				stack: err.stack,
			});
		} else {
			logger.error({
				message: `Health check failed with internal error ${err.message}`,
				stack: err.stack,
			});
		}

		const notifier = new Notifier("15257164640");
		notifier.init().then(() => {
			notifier.notify(`Health check failed for ${this.method} ${this.url}`);
		});
		return "unhealthy";
	}

	checkHealth(): Promise<string> {
		// Try https first
		return axios({
			url: this.url,
			method: this.method,
			headers: this.headers,
			data: this.body,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		})
			.then((res) => {
				logger.info(
					`Health check for ${this.method} ${this.url}  ${res.status} is successful`
				);
				return "healthy";
			})
			.catch((err) => {
				// https failed, try http
				if (err.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
					return axios({
						url: this.url.replace("https:", "http:"),
						method: this.method,
						headers: this.headers,
						data: this.body,
					})
						.then((res) => {
							logger.warn(
								`Health check for ${this.method} ${this.url}  ${res.status} is successful, but HTTPS certification is overdue.`
							);
							return "https expire";
						})
						.catch((err) => {
							// http failed
							return this.handleError(err);
						});
				} else {
					// https failed for other reasons, not for certification overdue
					return this.handleError(err);
				}
			});
	}
}
