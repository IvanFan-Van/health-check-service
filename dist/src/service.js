import { ConfigValidator } from "./configValidator.js";
import { HealthCheckTask } from "./healthCheckTask.js";
import { logger } from "./logger.js";
import { v4 as uuidv4 } from "uuid";
export class Service {
    constructor(serviceConfig) {
        logger.info(`Generating Health Check Tasks for ${serviceConfig.serviceName}...`);
        logger.info(`Expected ${serviceConfig.configs.length} tasks`);
        this.id = uuidv4();
        this.name = serviceConfig.serviceName;
        this.tasks = serviceConfig.configs
            .map((config, id) => {
            logger.info(`Generating Health Check Task ${id + 1} type: ${config.type} ...`);
            try {
                ConfigValidator.validate(config);
            }
            catch (err) {
                logger.error(err.message, { error: err });
                return null;
            }
            const task = new HealthCheckTask(config, config.schedule);
            return task;
        })
            .filter((task) => task !== null);
        this.startHealthChecks();
    }
    getTasks() {
        return this.tasks.map((task) => task.toJSON());
    }
    getTask(id) {
        return this.tasks.find((task) => task.id === id);
    }
    createTask(config) {
        try {
            ConfigValidator.validate(config);
        }
        catch (err) {
            logger.error(err.message, { error: err, config: config });
        }
        let task = new HealthCheckTask(config, config.schedule);
        this.tasks.push(task);
        task.start();
        return task;
    }
    startHealthChecks() {
        logger.info("Start All Health Check Tasks...");
        this.tasks.forEach((task) => task.start());
    }
    stopHealthChecks() {
        logger.info("Stop All Health Check Tasks...");
        this.tasks.forEach((task) => task.stop());
    }
    updateTask(id, config) {
        let index = this.tasks.findIndex((task) => task.id === id);
        if (index > -1) {
            this.tasks[index].stop();
            const newTask = new HealthCheckTask(config, config.schedule);
            newTask.start();
            this.tasks[index] = newTask;
            return newTask;
        }
        else {
            throw new Error("Task not found");
        }
    }
    deleteTask(id) {
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
