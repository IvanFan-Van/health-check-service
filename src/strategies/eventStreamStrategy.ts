import EventSource from "eventsource";
import Config from "../interfaces/config.js";
import Strategy from "../interfaces/strategy.js";
import { createLogError, logError, logInfo, logger } from "../logger.js";

export class EventStreamStrategy implements Strategy {
	private url: string;

	constructor(config: Config) {
		this.url = config.url;
	}

	checkHealth(): Promise<string> {
		return new Promise((resolve, reject) => {
			const eventSource = new EventSource(this.url);
			let answer = "";

			eventSource.addEventListener("message", (event) => {
				try {
					var result = JSON.parse(event.data);
					if (result.content) {
						answer += result.content;
					}
				} catch (error: any) {
					// logError({ message: `Error parsing JSON: ${error}`, stack: error.stack });
					logger.error(`Error parsing JSON: ${error}`, { error: createLogError(error) });
					resolve("unhealthy");
				}
			});

			eventSource.addEventListener("error", (event) => {
				// logError({ message: `EventSource error: ${JSON.stringify(event)}` });
				logger.error(`EventSource error: ${JSON.stringify(event)}`);
				resolve("unhealthy");
			});

			eventSource.addEventListener("close", (event) => {
				if (answer !== "") {
					logger.info(`Health check for ${this.url} succeeded`);
					// logInfo({ message: `Health check for ${this.url} succeeded` });
					resolve("healthy");
				} else {
					// logError({ message: `Health check for ${this.url} failed` });
					logger.error(`Health check for ${this.url} failed`);
					resolve("unhealthy");
				}
				eventSource.close();
			});

			// Close the EventSource connection after 5 seconds, regardless of whether the "close" event has been fired
			setTimeout(() => {
				eventSource.close();
			}, 5000);
		});
	}
}
