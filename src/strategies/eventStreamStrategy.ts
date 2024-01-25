import { Config } from "./strategyFactory";
import EventSource from "eventsource";
import { Strategy } from "./strategyFactory";

export class EventStreamStrategy implements Strategy {
	private config: Config;

	constructor(config: Config) {
		this.config = config;
	}

	checkHealth(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const es = new EventSource(this.config.url);
			let isHealthy = false;
			const timeout = setTimeout(() => {
				if (!isHealthy) {
					resolve(false);
				}
				es.close();
			}, 5000);
			es.onmessage = () => {
				isHealthy = true;
				resolve(true);
				clearTimeout(timeout);
				es.close();
			};
		});
	}
}
