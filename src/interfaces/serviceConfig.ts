import Config from "./config";

export default interface ServiceConfig {
	serviceName: string;
	configs: Config[];
}
