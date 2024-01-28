import Strategy from "../interfaces/strategy";
import Config from "../interfaces/config";
import WebSocket from "ws";

export class WebSocketStrategy implements Strategy {
	private url: string;

	constructor(config: Config) {
		this.url = config.url;
	}

	checkHealth(): Promise<string> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(this.url);
			ws.on("open", () => {
				resolve("healthy");
				ws.close();
			});
			ws.on("error", () => resolve("unhealthy"));
		});
	}
}
