import Strategy from "./interfaces/strategy";
import Config from "./interfaces/config";
import { EventStreamStrategy } from "./strategies/eventStreamStrategy";
import { HttpStrategy } from "./strategies/httpStrategy";
import { WebSocketStrategy } from "./strategies/webSocketStrategy";

export class Endpoint {
	public url: string;
	private strategy: Strategy;
	public status: string;

	constructor(config: Config) {
		this.url = config.url;
		this.status = "unknown";
		switch (config.type) {
			case "http":
				this.strategy = new HttpStrategy(config);
				break;
			case "websocket":
				this.strategy = new WebSocketStrategy(config);
				break;
			case "eventstream":
				this.strategy = new EventStreamStrategy(config);
				break;
			default:
				throw new Error(`Unsupported strategy type: ${config.type}`);
		}
	}

	checkHealth(): Promise<string> {
		return this.strategy
			.checkHealth()
			.then((status) => {
				this.status = status;
				return this.status;
			})
			.catch((err) => {
				throw new Error(
					err.message + "\n" + `Endpoint: ${this.url} failed to check health`
				);
			});
	}
}
