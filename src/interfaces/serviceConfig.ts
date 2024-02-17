import Config from "./config.js";

export default interface ServiceConfig {
	serviceName: string;
	configs: Config[];
}
