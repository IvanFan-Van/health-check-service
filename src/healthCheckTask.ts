import { Endpoint } from "./endpoint";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import Config from "./interfaces/config";

/**
 * HealthCheckTask class is responsible for Controlling health check task: start & stop
 */
export class HealthCheckTask {
	public endpoint: Endpoint;
	public schedule: string;
	public task: cron.ScheduledTask;
	public id: string;

	constructor(config: Config, schedule: string) {
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

	start(): void {
		this.task.start();
	}

	stop(): void {
		this.task.stop();
	}

	getStatus(): string {
		return this.endpoint.status;
	}
}
