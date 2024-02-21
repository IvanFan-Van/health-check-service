import { EventStreamStrategy } from "./strategies/eventStreamStrategy.js";
import { HttpStrategy } from "./strategies/httpStrategy.js";
import { WebSocketStrategy } from "./strategies/webSocketStrategy.js";
export class Endpoint {
    constructor(config) {
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
    checkHealth() {
        return this.strategy
            .checkHealth()
            .then((status) => {
            this.status = status;
            return this.status;
        })
            .catch((err) => {
            throw new Error(err.message + "\n" + `Endpoint: ${this.url} failed to check health`);
        });
    }
}
