import cron from "node-cron";
export class ConfigValidator {
    static validate(config) {
        if (!config.url) {
            throw new Error(`URL is not defined for endpoint ${config.url}`);
        }
        if (!config.schedule) {
            throw new Error(`Schedule is not defined for endpoint ${config.url}`);
        }
        if (!cron.validate(config.schedule)) {
            throw new Error(`Invalid schedule ${config.schedule} for endpoint ${config.url}`);
        }
    }
}
