import { Endpoint } from "./endpoint";
import cron from "node-cron";
import { logger } from "./logger";

export class HealthCheckTask {
	private endpoint: Endpoint;
	private schedule: string;
	private task: cron.ScheduledTask;

	constructor(endpoint: Endpoint, schedule: string) {
		this.endpoint = endpoint;
		this.schedule = schedule;
		this.task = cron.schedule(this.schedule, () => {
			this.endpoint.checkHealth().then((isHealthy) => {
				logger.info(
					`Endpoint ${this.endpoint.url} is ${
						isHealthy ? "healthy" : "not healthy"
					}`
				);
			});
		});
	}

	start(): void {
		this.task.start();
	}

	stop(): void {
		this.task.stop();
	}
}
