import { HealthCheckTask } from "../healthCheckTask.js";

export default interface Service {
	id: string;
	name: string;
	tasks: HealthCheckTask[];
}
