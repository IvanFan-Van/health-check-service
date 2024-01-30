import EventSource from "eventsource";
import Config from "../interfaces/config";
import Strategy from "../interfaces/strategy";

export class EventStreamStrategy implements Strategy {
	private url: string;

	constructor(config: Config) {
		this.url = config.url;
	}

	checkHealth(): Promise<string> {
		return new Promise((resolve, reject) => {
			const es = new EventSource(this.url);
			let isHealthy = false;
			const timeout = setTimeout(() => {
				if (!isHealthy) {
					resolve("unhealthy");
				}
				es.close();
			}, 20000);
			es.onmessage = () => {
				isHealthy = true;
				resolve("healthy");
				clearTimeout(timeout);
				es.close();
			};
		});
	}
}
