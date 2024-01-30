import Strategy from "../interfaces/strategy";
import Config from "../interfaces/config";
import WebSocket from "ws";
import { createLogObject, customLogger } from "../logger";
import { Notifier } from "../notifier";

export class WebSocketStrategy implements Strategy {
	private url: string;

	constructor(config: Config) {
		this.url = config.url;
	}

	private notifyFailure(message: string) {
		const notifier = new Notifier("15257164640");
		notifier.init().then(() => {
			notifier.notify(message);
		});
	}

	checkHealth(): Promise<string> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(this.url);
			ws.on("open", () => {
				resolve("healthy");
				const logMessage = `Health check for ${this.url} is successful`;
				customLogger.info(logMessage);
				ws.close();
			});
			ws.on("error", (err) => {
				resolve("unhealthy");
				const logMessage = `Health check failed for ${this.url}`;
				customLogger.error(
					createLogObject(logMessage, { url: this.url }, { error: err })
				);
				this.notifyFailure(logMessage);
			});
		});
	}
}
