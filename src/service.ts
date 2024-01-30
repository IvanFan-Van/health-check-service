import { ConfigValidator } from "./configValidator";
import { HealthCheckTask } from "./healthCheckTask";
import Config from "./interfaces/config";
import ServiceConfig from "./interfaces/serviceConfig";
import ServiceInterface from "./interfaces/Service";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Service class is responsible for generating health check tasks from config file
 * and manage the tasks.
 *
 */
export class Service implements ServiceInterface {
	public id: string;
	public tasks: HealthCheckTask[];
	public name: string;

	constructor(serviceConfig: ServiceConfig) {
		logger.info(
			`Generating Health Check Tasks for ${serviceConfig.serviceName}...`
		);
		logger.info(`Expected ${serviceConfig.configs.length} tasks`);
		this.id = uuidv4();
		this.name = serviceConfig.serviceName;
		this.tasks = serviceConfig.configs
			.map((config, id) => {
				logger.info(
					`Generating Health Check Task ${id + 1} type: ${config.type} ...`
				);
				try {
					ConfigValidator.validate(config);
				} catch (err: any) {
					logger.error({
						message: err.message,
						obj: config,
					});
					return null;
				}
				const task = new HealthCheckTask(config, config.schedule);
				return task;
			})
			.filter((task) => task !== null) as HealthCheckTask[];
		this.startHealthChecks();
	}

	getTasks() {
		return this.tasks.map((task) => task.toJSON());
	}

	getTask(id: string) {
		return this.tasks.find((task) => task.id === id);
	}

	createTask(config: Config) {
		try {
			ConfigValidator.validate(config);
		} catch (err: any) {
			logger.error({
				message: err.message,
				obj: config,
			});
		}
		let task = new HealthCheckTask(config, config.schedule);
		this.tasks.push(task);
		task.start();
		return task;
	}

	/**
	 * Start all health check tasks
	 */
	startHealthChecks() {
		logger.info("Start All Health Check Tasks...");
		this.tasks.forEach((task) => task.start());
	}

	/**
	 * Stop all health check tasks
	 */
	stopHealthChecks() {
		logger.info("Stop All Health Check Tasks...");
		this.tasks.forEach((task) => task.stop());
	}

	updateTask(id: string, config: Config) {
		let index = this.tasks.findIndex((task) => task.id === id);
		if (index > -1) {
			this.tasks[index].stop();
			const newTask = new HealthCheckTask(config, config.schedule);
			newTask.start();
			this.tasks[index] = newTask;
			return newTask;
		} else {
			throw new Error("Task not found");
		}
	}

	deleteTask(id: string) {
		let index = this.tasks.findIndex((task) => task.id === id);
		if (index > -1) {
			this.tasks[index].stop();
			let deletedTask = this.tasks[index];
			this.tasks.splice(index, 1);
			return deletedTask;
		}
	}

	getAllStatus() {
		return this.tasks.map((task) => {
			return {
				id: task.id,
				status: task.getStatus(),
			};
		});
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			tasks: this.tasks.map((task) => task.toJSON()),
		};
	}
}
