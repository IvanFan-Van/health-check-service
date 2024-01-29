import { HealthCheckTask } from "../healthCheckTask";

export default interface Service {
	id: string;
	name: string;
	tasks: HealthCheckTask[];
}
