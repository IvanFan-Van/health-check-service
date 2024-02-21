import EventSource from "eventsource";
import { createLogError, logger } from "../logger.js";
export class EventStreamStrategy {
    constructor(config) {
        this.url = config.url;
    }
    checkHealth() {
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(this.url);
            let answer = "";
            eventSource.addEventListener("message", (event) => {
                try {
                    var result = JSON.parse(event.data);
                    if (result.content) {
                        answer += result.content;
                    }
                }
                catch (error) {
                    logger.error(`Error parsing JSON: ${error}`, { error: createLogError(error) });
                    resolve("unhealthy");
                }
            });
            eventSource.addEventListener("error", (event) => {
                logger.error(`EventSource error: ${JSON.stringify(event)}`);
                resolve("unhealthy");
            });
            eventSource.addEventListener("close", (event) => {
                if (answer !== "") {
                    logger.info(`Health check for ${this.url} succeeded`);
                    resolve("healthy");
                }
                else {
                    logger.error(`Health check for ${this.url} failed`);
                    resolve("unhealthy");
                }
                eventSource.close();
            });
            setTimeout(() => {
                eventSource.close();
            }, 5000);
        });
    }
}
