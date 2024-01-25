import { Endpoint } from "./endpoint";
import { HealthCheckTask } from "./healthCheckTask";
import { Config } from "./strategies/strategyFactory";
import { logger } from "./logger";

export class Service {
	private tasks: HealthCheckTask[];

	constructor(endpointsConfig: Config[]) {
		logger.info("Generating Health Check Tasks From Config File...");

		this.tasks = endpointsConfig.map((config, id) => {
			logger.info(`Generating Health Check Task ${id + 1}...`);
			const endpoint = new Endpoint(config);
			const task = new HealthCheckTask(endpoint, config.schedule);
			return task;
		});
	}

	startHealthChecks() {
		logger.info("Start All Health Check Tasks...");
		this.tasks.forEach((task) => task.start());
	}

	stopHealthChecks() {
		logger.info("Stop All Health Check Tasks...");
		this.tasks.forEach((task) => task.stop());
	}
}
