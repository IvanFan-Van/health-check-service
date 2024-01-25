import axios from "axios";
import { Config, Strategy } from "./strategyFactory";

export class HttpStrategy implements Strategy {
	private config: Config;
	constructor(config: Config) {
		this.config = config;
	}

	checkHealth() {
		return axios({
			url: this.config.url,
			method: this.config.method,
			headers: this.config.headers,
			data: this.config.body,
		})
			.then((res) => {
				// console.log(res.status);
				return true;
			})
			.catch((err) => {
				if (this.config.method === "GET") {
					return false;
				}
				if (err.response) {
					if (err.response.status === 404) {
						return false;
					}
				} else {
					return false;
				}

				try {
					JSON.stringify(err.response.data);
				} catch (err) {
					return false;
				}
				return true;
			});
	}
}
