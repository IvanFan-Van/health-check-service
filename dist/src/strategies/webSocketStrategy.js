import WebSocket from "ws";
import { Notifier } from "../notifier.js";
import { createLogError, createLogRequest, logger } from "../logger.js";
export class WebSocketStrategy {
    constructor(config) {
        this.url = config.url;
        this.data = config.body;
        this.validator = config.validator || null;
    }
    notifyFailure(message) {
        const notifier = Notifier.getInstance();
        notifier.notifyChat(message);
    }
    checkHealth() {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.url);
            ws.on("open", () => {
                ws.send(JSON.stringify(this.data));
            });
            ws.on("message", (data, isBinary) => {
                if (isBinary) {
                    logger.error(`Binary data received from WebSocket ${this.url}`);
                    resolve("unhealthy");
                }
                try {
                    const dataJson = JSON.parse(data.toString());
                    if (this.validator && this.validator(dataJson)) {
                        logger.info(`Health check for ${this.url} is Successful`, {
                            request: createLogRequest({
                                url: this.url,
                                data: this.data,
                            }),
                        });
                        resolve("healthy");
                    }
                    else {
                        let message = `Health check failed for ${this.url}`;
                        logger.error(message, { response: dataJson });
                        this.notifyFailure(message);
                        resolve("unhealthy");
                    }
                }
                catch (err) {
                    let message = `Health check failed for ${this.url} by failing to parse JSON.`;
                    logger.error(message, { error: createLogError(err) });
                    this.notifyFailure(message);
                    resolve("unhealthy");
                }
                finally {
                    ws.close();
                }
            });
            ws.on("error", (err) => {
                const message = `Health check failed for ${this.url} by failing to establish a connection.`;
                logger.error(message, { error: createLogError(err) });
                this.notifyFailure(message);
                ws.close();
                resolve("unhealthy");
            });
        });
    }
}
