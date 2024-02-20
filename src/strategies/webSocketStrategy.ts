import Strategy from "../interfaces/strategy.js";
import Config from "../interfaces/config.js";
import WebSocket from "ws";
import { Notifier } from "../notifier.js";
import { logError, logInfo } from "../logger.js";

export class WebSocketStrategy implements Strategy {
	private url: string;
	private data: string;
	private validator: ((data: any) => boolean) | null;

	constructor(config: Config) {
		this.url = config.url;
		this.data = config.body;
		this.validator = config.validator || null;
	}

	private notifyFailure(message: string) {
		const notifier = Notifier.getInstance();
		notifier.notifyChat(message);
	}

	checkHealth(): Promise<string> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(this.url);
			ws.on("open", () => {
				ws.send(JSON.stringify(this.data));
			});

			ws.on("message", (data, isBinary) => {
				if (isBinary) {
					logError({ message: `Binary data received from WebSocket ${this.url}` });
					resolve("unhealthy");
				}

				try {
					const dataJson = JSON.parse(data.toString());
					if (this.validator && this.validator(dataJson)) {
						logInfo({
							message: `Health check for ${this.url} is Successful`,
							request: {
								url: this.url,
								data: this.data,
							},
						});
						resolve("healthy");
					} else {
						let message = `Health check failed for ${this.url}`;
						logError({ message, response: dataJson });
						this.notifyFailure(message);
						resolve("unhealthy");
					}
				} catch (err: any) {
					let message = `Health check failed for ${this.url} by failing to parse JSON.`;
					logError({ message, stack: err.stack });
					this.notifyFailure(message);
					resolve("unhealthy");
				} finally {
					ws.close();
				}
			});

			ws.on("error", (err) => {
				const message = `Health check failed for ${this.url} by failing to establish a connection.`;
				logError({ message, stack: err.stack });
				this.notifyFailure(message);
				ws.close();
				resolve("unhealthy");
			});
		});
	}
}
