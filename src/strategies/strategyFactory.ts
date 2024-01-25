import { EventStreamStrategy } from "./eventStreamStrategy";
import { HttpStrategy } from "./httpStrategy";
import { WebSocketStrategy } from "./webSocketStrategy";

export interface Config {
	type: string;
	url: string;
	schedule: string;
	method?: string;
	headers?: Record<string, string>;
	body?: any;
}

export interface Strategy {
	checkHealth(): Promise<boolean>;
}

export class StrategyFactory {
	static createStrategy(config: Config) {
		switch (config.type) {
			case "http":
				return new HttpStrategy(config);
			case "websocket":
				return new WebSocketStrategy(config);
			case "eventstream":
				return new EventStreamStrategy(config);
			default:
				throw new Error(`Unsupported strategy type: ${config.type}`);
		}
	}
}
