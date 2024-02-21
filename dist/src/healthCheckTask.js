import { Endpoint } from "./endpoint.js";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
export class HealthCheckTask {
    constructor(config, schedule) {
        this.endpoint = new Endpoint(config);
        this.schedule = schedule;
        this.id = uuidv4();
        this.task = cron.schedule(this.schedule, () => {
            this.endpoint.checkHealth();
        });
    }
    toJSON() {
        return {
            id: this.id,
            endpoint: this.endpoint,
            schedule: this.schedule,
        };
    }
    start() {
        this.task.start();
    }
    stop() {
        this.task.stop();
    }
    getStatus() {
        return this.endpoint.status;
    }
}
