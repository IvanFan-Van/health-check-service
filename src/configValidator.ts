import Config from "./interfaces/config";
import { logger } from "./logger";
import cron from "node-cron";

export class ConfigValidator {
	static validate(config: Config) {
		// Check for null url
		if (!config.url) {
			throw new Error(`URL is not defined for endpoint ${config.url}`);
		}

		// Check for null schedule
		if (!config.schedule) {
			throw new Error(`Schedule is not defined for endpoint ${config.url}`);
		}

		// Check for invalid schedule
		if (!cron.validate(config.schedule)) {
			throw new Error(
				`Invalid schedule ${config.schedule} for endpoint ${config.url}`
			);
		}
	}
}
