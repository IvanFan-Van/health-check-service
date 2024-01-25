import { Config, Strategy } from "./strategyFactory";
import WebSocket from "ws";

export class WebSocketStrategy implements Strategy {
	private config: Config;
	constructor(config: Config) {
		this.config = config;
	}

	checkHealth(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(this.config.url);
			ws.on("open", () => {
				resolve(true);
				ws.close();
			});
			ws.on("error", () => resolve(false));
		});
	}
}
